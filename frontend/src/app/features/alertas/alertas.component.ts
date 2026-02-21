import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService } from '../../core/services/alerta.service';
import { ToastService } from '../../core/services/toast.service';
import { AlertaConfig, Notificacion } from '../../core/models/models';

const ALERTA_META: Record<string, { title: string; desc: string }> = {
  ALERTA_PROXIMA: { title: '⚠️ Alerta: Tarea próxima a vencer', desc: 'Notificación 24 horas antes del vencimiento de cada tarea' },
  ALERTA_VENCIDA: { title: '🚨 Alerta: Tarea vencida', desc: 'Aviso inmediato cuando una tarea supera su fecha límite sin completarse' },
  REPORTE_DIARIO: { title: '📅 Reporte diario automático', desc: 'Resumen de actividades enviado cada mañana a las 7:00 AM' },
  REPORTE_SEMANAL: { title: '📋 Reporte semanal automático', desc: 'Resumen de la semana enviado cada lunes a las 8:00 AM' },
  REPORTE_MENSUAL: { title: '📈 Reporte mensual PDF', desc: 'Estadísticas completas enviadas el primer día de cada mes' },
  RECORDATORIO_VENCIDAS: { title: '🔁 Recordatorio de vencidas', desc: 'Recordatorio diario de tareas vencidas hasta que sean completadas' }
};

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar">
      <h1>Alertas y <span>Notificaciones</span></h1>
    </header>
    <main class="main">
      <div class="progress-section" style="margin-bottom:24px">
        <div class="progress-title" style="margin-bottom:20px">Configuración de Alertas Automáticas</div>
        @for (alerta of alertas(); track alerta.id) {
          <div class="alert-config">
            <div class="alert-info">
              <h4>{{ meta(alerta.tipo).title }}</h4>
              <p>{{ meta(alerta.tipo).desc }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [checked]="alerta.habilitada" (change)="toggleAlerta(alerta)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        }
      </div>

      <!-- Notification history -->
      <div class="task-section">
        <div class="task-section-header">
          <span class="task-section-title">Historial de Notificaciones Enviadas</span>
        </div>
        <table>
          <thead><tr><th>TIPO</th><th>MENSAJE</th><th>ENVIADO A</th><th>FECHA/HORA</th><th>ESTADO</th></tr></thead>
          <tbody>
            @if (notificaciones().length === 0) {
              <tr><td colspan="5"><div class="empty-state"><div class="icon">📭</div><p>Sin notificaciones enviadas aún</p></div></td></tr>
            }
            @for (n of notificaciones(); track n.id) {
              <tr>
                <td>{{ n.tipo }}</td>
                <td style="max-width:260px;font-size:12px">{{ n.mensaje }}</td>
                <td style="font-family:'JetBrains Mono',monospace;font-size:12px">{{ n.destinatario }}</td>
                <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted)">{{ fmt(n.fechaEnvio) }}</td>
                <td><span class="badge" [class]="n.estadoEnvio && n.estadoEnvio.includes('✅') ? 'badge-green' : 'badge-red'">{{ n.estadoEnvio }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </main>
  `
})
export class AlertasComponent implements OnInit {
  alertas = signal<AlertaConfig[]>([]);
  notificaciones = signal<Notificacion[]>([]);

  constructor(private svc: AlertaService, private toast: ToastService) { }

  ngOnInit() {
    this.svc.listarAlertas().subscribe(a => this.alertas.set(a));
    this.svc.listarNotificaciones().subscribe(n => this.notificaciones.set(n));
  }

  toggleAlerta(alerta: AlertaConfig) {
    this.svc.actualizarAlerta(alerta.id, !alerta.habilitada).subscribe({
      next: updated => {
        this.alertas.update(list => list.map(a => a.id === updated.id ? updated : a));
        this.toast.show(updated.habilitada ? '🔔 Alerta activada' : '🔕 Alerta desactivada', 'success');
      },
      error: () => this.toast.show('Error al actualizar alerta', 'error')
    });
  }

  meta(tipo: string) { return ALERTA_META[tipo] || { title: tipo, desc: '' }; }

  fmt(dt: string) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
