package com.agenda.backend.service;

import com.agenda.backend.dto.ActividadRequest;
import com.agenda.backend.dto.EstadisticasResponse;
import com.agenda.backend.entity.Actividad;
import com.agenda.backend.entity.Actividad.EstadoActividad;
import com.agenda.backend.repository.ActividadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ActividadService {

    private final ActividadRepository repo;

    // ── CRUD ──────────────────────────────────────────────

    public List<Actividad> listarTodas() {
        sincronizarVencidas();
        return repo.findAll();
    }

    public Actividad obtenerPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Actividad no encontrada: " + id));
    }

    @Transactional
    public Actividad crear(ActividadRequest req) {
        Actividad a = Actividad.builder()
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .fechaLimite(req.getFechaLimite())
                .prioridad(req.getPrioridad())
                .area(req.getArea())
                .estado(calcularEstado(req.getFechaLimite(), null))
                .build();
        // Recurrencia (si viene)
        a.setRecurrente(Boolean.TRUE.equals(req.getRecurrente()));
        a.setRecDiaMes(req.getRecDiaMes());
        a.setRecUltimoDia(req.getRecUltimoDia());
        a.setRecHora(req.getRecHora());
        a.setRecMeses(req.getRecMeses());
        a.setRecGenerados(0);
        a.setRecNextGenerated(false);
        addLog(a, "Creada el " + LocalDateTime.now());
        return repo.save(a);
    }

    @Transactional
    public Actividad actualizar(Long id, ActividadRequest req) {
        Actividad a = obtenerPorId(id);
        a.setNombre(req.getNombre());
        a.setDescripcion(req.getDescripcion());
        a.setFechaLimite(req.getFechaLimite());
        a.setPrioridad(req.getPrioridad());
        a.setArea(req.getArea());
        if (a.getEstado() != EstadoActividad.done) {
            a.setEstado(calcularEstado(req.getFechaLimite(), a.getEstado()));
        }
        // Recurrencia
        a.setRecurrente(Boolean.TRUE.equals(req.getRecurrente()));
        a.setRecDiaMes(req.getRecDiaMes());
        a.setRecUltimoDia(req.getRecUltimoDia());
        a.setRecHora(req.getRecHora());
        a.setRecMeses(req.getRecMeses());
        addLog(a, "Editada el " + LocalDateTime.now());
        return repo.save(a);
    }

    @Transactional
    public Actividad completar(Long id) {
        Actividad a = obtenerPorId(id);
        a.setEstado(EstadoActividad.done);
        a.setFechaFinalizacion(LocalDateTime.now());
        addLog(a, "Completada el " + a.getFechaFinalizacion());
        repo.save(a);
        // Generar siguiente ocurrencia si aplica
        generarSiguienteOcurrencia(a, true);
        return a;
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repo.existsById(id))
            throw new NoSuchElementException("Actividad no encontrada: " + id);
        repo.deleteById(id);
    }

    // ── STATS ─────────────────────────────────────────────

    public EstadisticasResponse estadisticas() {
        sincronizarVencidas();
        long total = repo.count();
        long completadas = repo.countByEstado(EstadoActividad.done);
        long vencidas = repo.countByEstado(EstadoActividad.overdue);
        long pendientes = repo.countByEstado(EstadoActividad.pending);
        int pct = total == 0 ? 0 : (int) Math.round((double) completadas / total * 100);

        long altaPrioridad = repo.findByPrioridad(Actividad.Prioridad.alta).stream()
                .filter(a -> a.getEstado() != EstadoActividad.done).count();

        LocalDateTime now = LocalDateTime.now();
        long vencenSemana = repo.findDueBetween(now, now.plusDays(7)).size();

        int tasaVencidas = total == 0 ? 0 : (int) Math.round((double) vencidas / total * 100);

        return EstadisticasResponse.builder()
                .total(total).completadas(completadas).vencidas(vencidas)
                .pendientes(pendientes).cumplimientoPct(pct)
                .altaPrioridad(altaPrioridad).vencenEstaSemana(vencenSemana)
                .tasaVencidas(tasaVencidas).build();
    }

    // ── SCHEDULED: actualizar estados vencidos ─────────────
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void sincronizarVencidas() {
        LocalDateTime now = LocalDateTime.now();
        List<Actividad> overdue = repo.findOverdue(now);
        for (Actividad a : overdue) {
            if (a.getEstado() == EstadoActividad.done) continue;
            a.setEstado(EstadoActividad.overdue);
            addLog(a, "Vencida automáticamente el " + now);
            // Si es recurrente y aún no se generó la siguiente, generar
            if (Boolean.TRUE.equals(a.getRecurrente()) && !Boolean.TRUE.equals(a.getRecNextGenerated())) {
                generarSiguienteOcurrencia(a, false);
                a.setRecNextGenerated(true);
            }
        }
        if (!overdue.isEmpty()) repo.saveAll(overdue);
    }

    // ── HELPERS ───────────────────────────────────────────

    private EstadoActividad calcularEstado(LocalDateTime fechaLimite, EstadoActividad actual) {
        if (actual == EstadoActividad.done)
            return EstadoActividad.done;
        return fechaLimite.isBefore(LocalDateTime.now())
                ? EstadoActividad.overdue
                : EstadoActividad.pending;
    }

    // ── Recurrencia helpers ───────────────────────────────
    private void addLog(Actividad a, String msg) {
        if (a.getHistorial() != null) a.getHistorial().add(msg);
    }

    private LocalDateTime calcularSiguienteFecha(Actividad a) {
        LocalDateTime base = a.getFechaLimite() != null ? a.getFechaLimite() : LocalDateTime.now();
        LocalDateTime nextBase = base.plusMonths(1);
        YearMonth ym = YearMonth.of(nextBase.getYear(), nextBase.getMonth());
        int day;
        if (Boolean.TRUE.equals(a.getRecUltimoDia())) {
            day = ym.lengthOfMonth();
        } else {
            int d = a.getRecDiaMes() != null ? a.getRecDiaMes() : 1;
            day = Math.min(d, ym.lengthOfMonth());
        }
        LocalTime hora = a.getRecHora() != null ? a.getRecHora() : LocalTime.of(8, 0);
        return LocalDateTime.of(ym.getYear(), ym.getMonth(), day, hora.getHour(), hora.getMinute());
    }

    private void generarSiguienteOcurrencia(Actividad a, boolean porCompletar) {
        if (!Boolean.TRUE.equals(a.getRecurrente())) return;
        Integer limite = a.getRecMeses();
        int generadosPrev = a.getRecGenerados() != null ? a.getRecGenerados() : 0;
        if (limite != null && limite > 0 && generadosPrev >= limite) {
            addLog(a, "Recurrencia finalizada");
            return;
        }
        LocalDateTime siguienteFecha = calcularSiguienteFecha(a);
        Actividad b = Actividad.builder()
                .nombre(a.getNombre())
                .descripcion(a.getDescripcion())
                .fechaLimite(siguienteFecha)
                .prioridad(a.getPrioridad())
                .area(a.getArea())
                .estado(EstadoActividad.pending)
                .build();
        // Copiar configuración de recurrencia
        b.setRecurrente(true);
        b.setRecDiaMes(a.getRecDiaMes());
        b.setRecUltimoDia(a.getRecUltimoDia());
        b.setRecHora(a.getRecHora());
        b.setRecMeses(a.getRecMeses());
        b.setRecGenerados(generadosPrev + 1);
        b.setRecNextGenerated(false);
        addLog(a, "Generada automáticamente la siguiente ocurrencia #" + (generadosPrev + 1) + " para el " + siguienteFecha);
        addLog(b, "Ocurrencia #" + (generadosPrev + 1) + " creada a partir de tarea previa");
        repo.save(b);
        a.setRecNextGenerated(true);
    }
}
