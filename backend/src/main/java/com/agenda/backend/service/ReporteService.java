package com.agenda.backend.service;

import com.agenda.backend.dto.EstadisticasResponse;
import com.agenda.backend.entity.Actividad;
import com.agenda.backend.entity.AlertaConfig.TipoAlerta;
import com.agenda.backend.repository.ActividadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteService {

    private final ActividadService actividadService;
    private final ActividadRepository actividadRepo;
    private final TelegramService telegramService;
    private final AlertaConfigService alertaConfigService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ══════════════════════════════════════════════════════
    //  REPORTES AUTOMÁTICOS
    // ══════════════════════════════════════════════════════

    // ── DIARIO: cada día a las 7:00 AM ────────────────────
    @Scheduled(cron = "0 0 7 * * *")
    public void envioDiario() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.REPORTE_DIARIO))
            return;
        telegramService.enviarMensajeATodosUsuarios(generarReporteDiario(), "📅 Reporte Diario");
    }

    // ── SEMANAL: cada Lunes a las 8:00 AM ─────────────────
    @Scheduled(cron = "0 0 8 * * MON")
    public void envioSemanal() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.REPORTE_SEMANAL))
            return;
        telegramService.enviarMensajeATodosUsuarios(generarReporteSemanal(), "📋 Reporte Semanal");
    }

    // ── MENSUAL: primer día de cada mes ───────────────────
    @Scheduled(cron = "0 0 8 1 * *")
    public void envioMensual() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.REPORTE_MENSUAL))
            return;
        telegramService.enviarMensajeATodosUsuarios(generarReporteMensual(), "📈 Reporte Mensual");
    }

    // ══════════════════════════════════════════════════════
    //  SISTEMA DE ALERTAS GRADUADAS POR URGENCIA
    // ══════════════════════════════════════════════════════
    //
    //  TIER         | Tiempo restante   | Frecuencia
    //  ─────────────|───────────────────|───────────
    //  📋 Lejana    | > 7 días          | Cada 3 días
    //  ⚠️ Próxima   | 2 – 7 días        | Cada 24 horas
    //  🔶 Urgente   | 24 – 48 horas     | Cada 8 horas
    //  🚨 Crítica   | < 24 horas        | Cada 2 horas
    //
    // ══════════════════════════════════════════════════════

    @Scheduled(fixedDelay = 1_800_000) // Cada 30 minutos evalúa alertas
    @Transactional
    public void alertasGraduadas() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.ALERTA_PROXIMA))
            return;

        LocalDateTime now = LocalDateTime.now();
        List<Actividad> activas = actividadRepo.findActivasPendientes(now);

        for (Actividad a : activas) {
            long horasRestantes = ChronoUnit.HOURS.between(now, a.getFechaLimite());
            long diasRestantes = ChronoUnit.DAYS.between(now, a.getFechaLimite());

            String tier;
            String icono;
            long intervaloHoras;

            if (horasRestantes <= 24) {
                // TIER CRÍTICA: < 24 horas → cada 2 horas
                tier = "CRÍTICA";
                icono = "🚨";
                intervaloHoras = 2;
            } else if (horasRestantes <= 48) {
                // TIER URGENTE: 24-48 horas → cada 8 horas
                tier = "URGENTE";
                icono = "🔶";
                intervaloHoras = 8;
            } else if (diasRestantes <= 7) {
                // TIER PRÓXIMA: 2-7 días → cada 24 horas
                tier = "PRÓXIMA";
                icono = "⚠️";
                intervaloHoras = 24;
            } else {
                // TIER LEJANA: > 7 días → cada 3 días (72 horas)
                tier = "LEJANA";
                icono = "📋";
                intervaloHoras = 72;
            }

            // Verificar si ya pasó suficiente tiempo desde la última alerta
            if (a.getUltimaAlertaEnviada() != null) {
                long horasDesdeUltima = ChronoUnit.HOURS.between(a.getUltimaAlertaEnviada(), now);
                if (horasDesdeUltima < intervaloHoras) {
                    continue; // Aún no toca alertar
                }
            }

            // Construir mensaje con nivel de urgencia
            String tiempoRestante = diasRestantes > 0
                    ? diasRestantes + " día" + (diasRestantes != 1 ? "s" : "") + " y " + (horasRestantes % 24) + "h"
                    : horasRestantes + " hora" + (horasRestantes != 1 ? "s" : "");

            String prioridadTexto = switch (a.getPrioridad()) {
                case alta -> "🔴 Alta";
                case media -> "🟡 Media";
                case baja -> "🟢 Baja";
            };

            String msg = String.format(
                    "%s <b>Alerta %s</b>\n" +
                    "━━━━━━━━━━━━━━━━━━━━\n" +
                    "📌 <b>%s</b>\n" +
                    "⏰ Vence: %s\n" +
                    "⏳ Quedan: <b>%s</b>\n" +
                    "🏷️ Área: %s\n" +
                    "📊 Prioridad: %s\n" +
                    "━━━━━━━━━━━━━━━━━━━━\n" +
                    "🔔 Próxima alerta en %dh",
                    icono, tier,
                    a.getNombre(),
                    a.getFechaLimite().format(FMT),
                    tiempoRestante,
                    a.getArea(),
                    prioridadTexto,
                    intervaloHoras);

            Long usuarioId = a.getUsuario() != null ? a.getUsuario().getId() : null;
            boolean enviado = telegramService.enviarMensajeAUsuario(usuarioId, msg, icono + " Alerta " + tier);
            if (enviado) {
                a.setUltimaAlertaEnviada(now);
                actividadRepo.save(a);
                log.info("Alerta {} enviada para tarea '{}' ({}h restantes)", tier, a.getNombre(), horasRestantes);
            }
        }
    }

    // ══════════════════════════════════════════════════════
    //  ALERTA DE TAREAS VENCIDAS
    // ══════════════════════════════════════════════════════

    @Scheduled(cron = "0 0 9 * * *") // Cada día a las 9:00 AM
    @Transactional
    public void alertasVencidas() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.ALERTA_VENCIDA))
            return;

        List<Actividad> vencidas = actividadRepo.findVencidas();
        if (vencidas.isEmpty()) return;

        for (Actividad a : vencidas) {
            long diasVencida = ChronoUnit.DAYS.between(a.getFechaLimite(), LocalDateTime.now());

            // Solo alertar si no se alertó en las últimas 24h
            if (a.getUltimaAlertaEnviada() != null) {
                long horasDesdeUltima = ChronoUnit.HOURS.between(a.getUltimaAlertaEnviada(), LocalDateTime.now());
                if (horasDesdeUltima < 24) continue;
            }

            String msg = String.format(
                    "💀 <b>TAREA VENCIDA</b>\n" +
                    "━━━━━━━━━━━━━━━━━━━━\n" +
                    "📌 <b>%s</b>\n" +
                    "📅 Venció: %s\n" +
                    "⏰ Hace: <b>%d día%s</b>\n" +
                    "🏷️ Área: %s\n" +
                    "━━━━━━━━━━━━━━━━━━━━\n" +
                    "⚡ Requiere acción inmediata",
                    a.getNombre(),
                    a.getFechaLimite().format(FMT),
                    diasVencida, diasVencida != 1 ? "s" : "",
                    a.getArea());

            Long usuarioId = a.getUsuario() != null ? a.getUsuario().getId() : null;
            boolean enviado = telegramService.enviarMensajeAUsuario(usuarioId, msg, "💀 Tarea Vencida");
            if (enviado) {
                a.setUltimaAlertaEnviada(LocalDateTime.now());
                actividadRepo.save(a);
            }
        }
    }

    // ══════════════════════════════════════════════════════
    //  RECORDATORIO DIARIO DE VENCIDAS (resumen)
    // ══════════════════════════════════════════════════════

    @Scheduled(cron = "0 30 8 * * *") // Cada día a las 8:30 AM
    public void recordatorioVencidas() {
        if (!alertaConfigService.isHabilitada(TipoAlerta.RECORDATORIO_VENCIDAS))
            return;

        List<Actividad> vencidas = actividadRepo.findVencidas();
        if (vencidas.isEmpty()) return;

        StringBuilder sb = new StringBuilder();
        sb.append("🔁 <b>RECORDATORIO — Tareas Vencidas</b>\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━\n");
        sb.append(String.format("📊 Total vencidas: <b>%d</b>\n\n", vencidas.size()));

        int count = 0;
        for (Actividad a : vencidas) {
            if (count >= 10) {
                sb.append(String.format("\n... y %d más\n", vencidas.size() - 10));
                break;
            }
            long diasVencida = ChronoUnit.DAYS.between(a.getFechaLimite(), LocalDateTime.now());
            String prioIcon = switch (a.getPrioridad()) {
                case alta -> "🔴";
                case media -> "🟡";
                case baja -> "🟢";
            };
            sb.append(String.format("%s %s — vencida hace %dd\n", prioIcon, a.getNombre(), diasVencida));
            count++;
        }

        sb.append("\n━━━━━━━━━━━━━━━━━━━━\n");
        sb.append("⚡ Complete o reprograme estas tareas");

        telegramService.enviarMensajeATodosUsuarios(sb.toString(), "🔁 Recordatorio Vencidas");
    }

    // ══════════════════════════════════════════════════════
    //  ENVÍO MANUAL
    // ══════════════════════════════════════════════════════

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
        return telegramService.enviarMensajeATodosUsuarios(msg, label);
    }

    // ══════════════════════════════════════════════════════
    //  BUILDERS DE REPORTES
    // ══════════════════════════════════════════════════════

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
                LocalDateTime.now().format(FMT));
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
