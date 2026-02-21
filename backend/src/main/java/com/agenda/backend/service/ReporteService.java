package com.agenda.backend.service;

import com.agenda.backend.dto.EstadisticasResponse;
import com.agenda.backend.entity.Actividad;
import com.agenda.backend.entity.AlertaConfig.TipoAlerta;
import com.agenda.backend.repository.ActividadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteService {

    private final ActividadService actividadService;
    private final ActividadRepository actividadRepo;
    private final TelegramService telegramService;
    private final AlertaConfigService alertaConfigService;

    // ── DIARIO: cada día a las 7:00 AM ────────────────────
    @Scheduled(cron = "0 0 7 * * *")
    public void envioDiario() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.REPORTE_DIARIO))
            return;
        telegramService.enviarMensaje(generarReporteDiario(), "📅 Reporte Diario");
    }

    // ── SEMANAL: cada Lunes a las 8:00 AM ─────────────────
    @Scheduled(cron = "0 0 8 * * MON")
    public void envioSemanal() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.REPORTE_SEMANAL))
            return;
        telegramService.enviarMensaje(generarReporteSemanal(), "📋 Reporte Semanal");
    }

    // ── MENSUAL: primer día de cada mes ───────────────────
    @Scheduled(cron = "0 0 8 1 * *")
    public void envioMensual() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.REPORTE_MENSUAL))
            return;
        telegramService.enviarMensaje(generarReporteMensual(), "📈 Reporte Mensual");
    }

    // ── ALERTAS: cada hora, revisa vencimientos ────────────
    @Scheduled(fixedDelay = 3_600_000)
    public void alertasVencimiento() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.ALERTA_PROXIMA))
            return;
        LocalDateTime in24h = LocalDateTime.now().plusHours(24);
        LocalDateTime now = LocalDateTime.now();
        List<Actividad> proximas = actividadRepo.findDueBetween(now, in24h);
        proximas.forEach(a -> {
            String msg = String.format(
                    "⚠️ <b>Tarea próxima a vencer</b>\n📌 %s\n📅 %s\n🏷️ Área: %s",
                    a.getNombre(),
                    a.getFechaLimite().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    a.getArea());
            telegramService.enviarMensaje(msg, "⚠️ Alerta Próxima");
        });
    }

    // ── ENVÍO MANUAL ──────────────────────────────────────
    public boolean enviarManual(String tipo) {
        String msg = switch (tipo) {
            case "daily" -> generarReporteDiario();
            case "weekly" -> generarReporteSemanal();
            case "monthly" -> generarReporteMensual();
            default -> throw new IllegalArgumentException("Tipo inválido: " + tipo);
        };
        String label = switch (tipo) {
            case "daily" -> "📅 Reporte Diario";
            case "weekly" -> "📋 Reporte Semanal";
            case "monthly" -> "📈 Reporte Mensual";
            default -> tipo;
        };
        return telegramService.enviarMensaje(msg, label);
    }

    // ── BUILDERS ──────────────────────────────────────────
    private String generarReporteDiario() {
        EstadisticasResponse stats = actividadService.estadisticas();
        return String.format("""
                📅 <b>REPORTE DIARIO — Agenda de Cumplimiento</b>
                ──────────────────────────────
                ✅ Completadas: <b>%d</b>
                ⏳ Pendientes: <b>%d</b>
                🚨 Vencidas: <b>%d</b>
                📊 Cumplimiento: <b>%d%%</b>
                ──────────────────────────────
                🗓️ %s
                """,
                stats.getCompletadas(), stats.getPendientes(),
                stats.getVencidas(), stats.getCumplimientoPct(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
    }

    private String generarReporteSemanal() {
        EstadisticasResponse stats = actividadService.estadisticas();
        return String.format("""
                📋 <b>REPORTE SEMANAL — Agenda de Cumplimiento</b>
                ──────────────────────────────
                📌 Total de tareas: <b>%d</b>
                ✅ Completadas: <b>%d</b>
                🔴 Alta prioridad pendientes: <b>%d</b>
                📅 Vencen esta semana: <b>%d</b>
                📊 Cumplimiento: <b>%d%%</b>
                🚨 Tasa de vencidas: <b>%d%%</b>
                """,
                stats.getTotal(), stats.getCompletadas(),
                stats.getAltaPrioridad(), stats.getVencenEstaSemana(),
                stats.getCumplimientoPct(), stats.getTasaVencidas());
    }

    private String generarReporteMensual() {
        EstadisticasResponse stats = actividadService.estadisticas();
        return String.format("""
                📈 <b>REPORTE MENSUAL — Agenda de Cumplimiento</b>
                ──────────────────────────────
                📌 Total del mes: <b>%d</b>
                ✅ Tasa de éxito: <b>%d%%</b>
                🚨 Tasa de vencidas: <b>%d%%</b>
                🔴 Alta prioridad pendientes: <b>%d</b>
                📊 Estado general: <b>%s</b>
                """,
                stats.getTotal(), stats.getCumplimientoPct(),
                stats.getTasaVencidas(), stats.getAltaPrioridad(),
                stats.getCumplimientoPct() >= 80 ? "🟢 Excelente"
                        : stats.getCumplimientoPct() >= 50 ? "🟡 Regular" : "🔴 Crítico");
    }
}
