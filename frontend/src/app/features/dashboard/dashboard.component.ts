import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../core/services/actividad.service';
import { ToastService } from '../../core/services/toast.service';
import { Actividad, Estadisticas } from '../../core/models/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="topbar">
      <h1>Dashboard de <span>Cumplimiento</span></h1>
      <div class="topbar-right">
        <button class="btn btn-ghost btn-sm" (click)="load()">↻ Actualizar</button>
      </div>
    </header>
    <main class="main">
      <div class="stats-row">
        <div class="stat-card green">
          <div class="stat-label">Total Tareas</div>
          <div class="stat-value green">{{ stats()?.total ?? 0 }}</div>
          <div class="stat-sub">registradas en el sistema</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-label">Esta Semana</div>
          <div class="stat-value blue">{{ stats()?.vencenEstaSemana ?? 0 }}</div>
          <div class="stat-sub">vencen próximos 7 días</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">Alta Prioridad</div>
          <div class="stat-value amber">{{ stats()?.altaPrioridad ?? 0 }}</div>
          <div class="stat-sub">sin completar</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">Tasa de Vencidas</div>
          <div class="stat-value red">{{ stats()?.tasaVencidas ?? 0 }}%</div>
          <div class="stat-sub">del total</div>
        </div>
      </div>

      <div class="dash-grid">
        <!-- Por Prioridad -->
        <div class="progress-section" style="margin-bottom:0">
          <div class="progress-header" style="margin-bottom:12px">
            <div class="progress-title" style="font-size:16px">Por Prioridad</div>
          </div>
          @for (p of priorities; track p.key) {
            <div style="margin-bottom:14px">
              <div class="breakdown-label">
                <span>{{ p.label }}</span>
                <span style="font-family:'JetBrains Mono',monospace;color:var(--muted)">{{ count(p.key) }} tareas</span>
              </div>
              <div class="progress-bar" style="height:6px">
                <div class="breakdown-bar-fill" [style.background]="p.color" [style.width.%]="pct(count(p.key))"></div>
              </div>
            </div>
          }
        </div>
        <!-- Por Estado -->
        <div class="progress-section" style="margin-bottom:0">
          <div class="progress-header" style="margin-bottom:12px">
            <div class="progress-title" style="font-size:16px">Por Estado</div>
          </div>
          @for (s of statuses; track s.key) {
            <div style="margin-bottom:14px">
              <div class="breakdown-label">
                <span>{{ s.label }}</span>
                <span style="font-family:'JetBrains Mono',monospace;color:var(--muted)">{{ statusCount(s.key) }} ({{ pct(statusCount(s.key)) }}%)</span>
              </div>
              <div class="progress-bar" style="height:6px">
                <div class="breakdown-bar-fill" [style.background]="s.color" [style.width.%]="pct(statusCount(s.key))"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Attention list -->
      <div class="task-section">
        <div class="task-section-header">
          <span class="task-section-title">⚠️ Tareas que necesitan atención</span>
        </div>
        <table>
          <thead><tr><th>ACTIVIDAD</th><th>PRIORIDAD</th><th>FECHA LÍMITE</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
          <tbody>
            @if (attentionTasks().length === 0) {
              <tr><td colspan="5"><div class="empty-state"><div class="icon">🎉</div><p>Sin tareas urgentes. ¡Todo bajo control!</p></div></td></tr>
            }
            @for (t of attentionTasks(); track t.id) {
              <tr>
                <td><div class="task-name">{{ t.nombre }}</div></td>
                <td><div class="priority" [class]="t.prioridad">{{ prioLabel(t.prioridad) }}</div></td>
                <td><div class="due-date" [class]="t.estado === 'overdue' ? 'overdue' : 'soon'">{{ fmt(t.fechaLimite) }}</div></td>
                <td><span class="badge" [class]="t.estado === 'overdue' ? 'badge-red' : 'badge-amber'">{{ t.estado === 'overdue' ? 'Vencida' : 'Pendiente' }}</span></td>
                <td><button class="action-btn complete" (click)="completar(t.id)">✅</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </main>
  `
})
export class DashboardComponent implements OnInit {
    tasks = signal<Actividad[]>([]);
    stats = signal<Estadisticas | null>(null);

    priorities = [
        { key: 'alta', label: '🔴 Alta', color: 'var(--danger)' },
        { key: 'media', label: '🟡 Media', color: 'var(--accent2)' },
        { key: 'baja', label: '🟢 Baja', color: 'var(--accent)' }
    ];
    statuses = [
        { key: 'done', label: '✅ Completadas', color: 'var(--accent)' },
        { key: 'pending', label: '⏳ Pendientes', color: 'var(--accent2)' },
        { key: 'overdue', label: '🚨 Vencidas', color: 'var(--danger)' }
    ];

    attentionTasks = () => this.tasks().filter(t => {
        if (t.estado === 'done') return false;
        const days = Math.ceil((new Date(t.fechaLimite).getTime() - Date.now()) / 86400000);
        return t.estado === 'overdue' || days <= 3;
    });

    constructor(private svc: ActividadService, private toast: ToastService) { }
    ngOnInit() { this.load(); }
    load() {
        this.svc.listar().subscribe(t => this.tasks.set(t));
        this.svc.estadisticas().subscribe(s => this.stats.set(s));
    }
    completar(id: number) {
        this.svc.completar(id).subscribe({ next: () => { this.load(); this.toast.show('✅ Completada', 'success'); }, error: () => this.toast.show('Error', 'error') });
    }
    count(p: string) { return this.tasks().filter(t => t.prioridad === p).length; }
    statusCount(s: string) { return this.tasks().filter(t => t.estado === s).length; }
    pct(n: number) { const total = this.stats()?.total ?? 0; return total ? Math.round(n / total * 100) : 0; }
    fmt(dt: string) { return new Date(dt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    prioLabel(p: string) { const m: Record<string, string> = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' }; return m[p] || p; }
}
