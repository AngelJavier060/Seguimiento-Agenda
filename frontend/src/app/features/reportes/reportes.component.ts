import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TelegramService } from '../../core/services/alerta.service';
import { ActividadService } from '../../core/services/actividad.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { TelegramConfig, Estadisticas } from '../../core/models/models';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <header class="topbar">
      <h1>Reportes <span>Automáticos</span></h1>
    </header>
    <main class="main">
      <div class="reports-grid">
        <div class="report-card">
          <h3>📅 Reporte Diario</h3>
          <p>Se envía todos los días a las <strong>7:00 AM</strong> con las tareas del día y el avance.</p>
          <div class="report-preview">📅 <span class="hl">REPORTE DIARIO</span>
──────────────────
✅ Completadas: <span class="hl">{{ stats()?.completadas ?? 0 }}</span>
⏳ Pendientes: <span class="hl2">{{ stats()?.pendientes ?? 0 }}</span>
🚨 Vencidas: <span class="hl3">{{ stats()?.vencidas ?? 0 }}</span>
📊 Cumplimiento: <span class="hl">{{ stats()?.cumplimientoPct ?? 0 }}%</span></div>
          <button class="btn btn-ghost btn-sm" (click)="enviar('daily')">📤 Enviar ahora a Telegram</button>
        </div>
        <div class="report-card">
          <h3>📋 Reporte Semanal</h3>
          <p>Se envía cada <strong>Lunes a las 8:00 AM</strong> con el resumen de la semana.</p>
          <div class="report-preview">📋 <span class="hl">REPORTE SEMANAL</span>
──────────────────
📌 Total: <span class="hl">{{ stats()?.total ?? 0 }}</span> actividades
✅ Completadas: <span class="hl">{{ stats()?.completadas ?? 0 }}</span>
🔴 Alta prioridad: <span class="hl3">{{ stats()?.altaPrioridad ?? 0 }}</span>
📅 Vencen semana: <span class="hl2">{{ stats()?.vencenEstaSemana ?? 0 }}</span>
📊 Cumplimiento: <span class="hl">{{ stats()?.cumplimientoPct ?? 0 }}%</span></div>
          <button class="btn btn-ghost btn-sm" (click)="enviar('weekly')">📤 Enviar ahora a Telegram</button>
        </div>
        <div class="report-card">
          <h3>📈 Reporte Mensual</h3>
          <p>Se envía el <strong>primer día de cada mes</strong> con estadísticas completas.</p>
          <div class="report-preview">📈 <span class="hl">REPORTE MENSUAL</span>
──────────────────
📌 Total mes: <span class="hl">{{ stats()?.total ?? 0 }}</span>
✅ Tasa éxito: <span class="hl">{{ stats()?.cumplimientoPct ?? 0 }}%</span>
🚨 Tasa vencidas: <span class="hl3">{{ stats()?.tasaVencidas ?? 0 }}%</span>
🔴 Alta prioridad: <span class="hl3">{{ stats()?.altaPrioridad ?? 0 }}</span></div>
          <button class="btn btn-ghost btn-sm" (click)="enviar('monthly')">📤 Enviar ahora a Telegram</button>
        </div>
      </div>

      <!-- Telegram Config -->
      <div class="progress-section">
        <div class="progress-header" style="margin-bottom:0">
          <div class="progress-title">Configuración de Telegram</div>
        </div>
        @if (config()) {
          <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group" style="margin:0">
              <label>Chat ID de Telegram</label>
              <input class="form-control" type="text" [(ngModel)]="config()!.chatId" placeholder="Ej: @usuario o 123456789">
            </div>
            <div class="form-group" style="margin:0">
              <label>Token del Bot</label>
              <input class="form-control" type="password" [(ngModel)]="config()!.botToken" placeholder="Token de @BotFather">
            </div>
          </div>
          <div style="margin-top:16px; display:flex; align-items:center; gap:12px">
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="config()!.activo">
              <span class="toggle-slider"></span>
            </label>
            <span style="font-size:13px;color:var(--muted)">Integración activa</span>
          </div>
          <div style="margin-top:16px;display:flex;gap:10px">
            <button class="btn btn-primary btn-sm" (click)="guardarConfig()">Guardar configuración</button>
            <button class="btn btn-ghost btn-sm" (click)="testConexion()">🔗 Probar conexión</button>
          </div>
        }
      </div>
    </main>
  `
})
export class ReportesComponent implements OnInit {
    stats = signal<Estadisticas | null>(null);
    config = signal<TelegramConfig | null>(null);

    constructor(
        private telegram: TelegramService,
        private actSvc: ActividadService,
        private toast: ToastService,
        private auth: AuthService
    ) { }

    ngOnInit() {
        this.actSvc.estadisticas().subscribe(s => this.stats.set(s));
        if (this.auth.isAdmin()) {
            this.telegram.getConfig().subscribe(c => this.config.set(c));
        }
    }

    enviar(tipo: string) {
        this.telegram.enviarReporte(tipo).subscribe({
            next: r => this.toast.show(r.mensaje, r.exitoso ? 'success' : 'warning'),
            error: () => this.toast.show('Error al enviar reporte', 'error')
        });
    }

    guardarConfig() {
        const c = this.config();
        if (!c) return;
        this.telegram.saveConfig(c).subscribe({
            next: saved => { this.config.set(saved); this.toast.show('⚙️ Configuración guardada', 'success'); },
            error: () => this.toast.show('Error al guardar', 'error')
        });
    }

    testConexion() {
        this.telegram.testConexion().subscribe({
            next: r => this.toast.show(r.mensaje, r.exitoso ? 'success' : 'error'),
            error: () => this.toast.show('❌ Error de conexión con Telegram', 'error')
        });
    }
}
