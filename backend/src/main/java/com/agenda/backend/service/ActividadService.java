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
        return repo.save(a);
    }

    @Transactional
    public Actividad completar(Long id) {
        Actividad a = obtenerPorId(id);
        a.setEstado(EstadoActividad.done);
        return repo.save(a);
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
        List<Actividad> overdue = repo.findOverdue(LocalDateTime.now());
        overdue.forEach(a -> a.setEstado(EstadoActividad.overdue));
        if (!overdue.isEmpty())
            repo.saveAll(overdue);
    }

    // ── HELPERS ───────────────────────────────────────────

    private EstadoActividad calcularEstado(LocalDateTime fechaLimite, EstadoActividad actual) {
        if (actual == EstadoActividad.done)
            return EstadoActividad.done;
        return fechaLimite.isBefore(LocalDateTime.now())
                ? EstadoActividad.overdue
                : EstadoActividad.pending;
    }
}
