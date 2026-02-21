import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadService } from '../../core/services/actividad.service';
import { ToastService } from '../../core/services/toast.service';
import { Actividad, ActividadRequest, Estadisticas } from '../../core/models/models';

@Component({
    selector: 'app-agenda',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- TOPBAR -->
    <header class="topbar">
      <h1>Agenda de <span>Actividades</span></h1>
      <div class="topbar-right">
        <span class="today-date">{{ todayStr }}</span>
        <button class="btn btn-primary" (click)="openModal()">+ Nueva Actividad</button>
      </div>
    </header>

    <!-- MAIN -->
    <main class="main">
      <!-- STATS -->
      <div class="stats-row">
        <div class="stat-card green">
          <div class="stat-label">Completadas</div>
          <div class="stat-value green">{{ stats()?.completadas ?? 0 }}</div>
          <div class="stat-sub">actividades terminadas</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">Pendientes</div>
          <div class="stat-value amber">{{ stats()?.pendientes ?? 0 }}</div>
          <div class="stat-sub">por completar</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">Vencidas</div>
          <div class="stat-value red">{{ stats()?.vencidas ?? 0 }}</div>
          <div class="stat-sub">requieren atención</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-label">Cumplimiento</div>
          <div class="stat-value blue">{{ stats()?.cumplimientoPct ?? 0 }}%</div>
          <div class="stat-sub">del total de tareas</div>
        </div>
      </div>

      <!-- PROGRESS -->
      <div class="progress-section">
        <div class="progress-header">
          <div class="progress-title">Progreso General del Mes</div>
          <div class="progress-pct">{{ stats()?.cumplimientoPct ?? 0 }}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="stats()?.cumplimientoPct ?? 0"></div>
        </div>
        <div class="progress-legend">
          <div class="leg"><div class="leg-dot" style="background:var(--accent)"></div> Completadas</div>
          <div class="leg"><div class="leg-dot" style="background:var(--accent2)"></div> Pendientes</div>
          <div class="leg"><div class="leg-dot" style="background:var(--danger)"></div> Vencidas</div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="filters">
        <button class="filter-btn" [class.active]="currentFilter === 'all'" (click)="setFilter('all')">Todas</button>
        <button class="filter-btn" [class.active]="currentFilter === 'pending'" (click)="setFilter('pending')">⏳ Pendientes</button>
        <button class="filter-btn amber" [class.active]="currentFilter === 'overdue'" (click)="setFilter('overdue')">⚠️ Vencidas</button>
        <button class="filter-btn" [class.active]="currentFilter === 'done'" (click)="setFilter('done')">✅ Completadas</button>
        <input class="search-input" type="text" placeholder="🔍 Buscar actividad..." [(ngModel)]="searchTerm">
        <select class="sort-select" [(ngModel)]="sortBy">
          <option value="date">Ordenar: Fecha límite</option>
          <option value="priority">Ordenar: Prioridad</option>
          <option value="name">Ordenar: Nombre</option>
        </select>
      </div>

      <!-- TABLE -->
      <div class="task-section">
        <div class="task-section-header">
          <span class="task-section-title">Lista de Actividades</span>
          <span class="task-count">{{ filteredTasks().length }} de {{ tasks().length }} tareas</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ACTIVIDAD</th><th>ÁREA</th><th>PRIORIDAD</th>
              <th>FECHA LÍMITE</th><th>ESTADO</th><th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredTasks().length === 0) {
              <tr><td colspan="6">
                <div class="empty-state"><div class="icon">📭</div><p>No hay actividades para mostrar</p></div>
              </td></tr>
            }
            @for (t of filteredTasks(); track t.id) {
              <tr class="task-row">
                <td>
                  <div class="task-name" [class.strikethrough]="t.estado === 'done'">
                    {{ t.nombre }}
                    <div class="sub">{{ t.descripcion }}</div>
                  </div>
                </td>
                <td><span class="inline-badge">{{ t.area }}</span></td>
                <td><div class="priority" [class]="t.prioridad">{{ prioridadLabel(t.prioridad) }}</div></td>
                <td><div class="due-date" [class]="dueDateClass(t)">{{ formatDate(t.fechaLimite) }}{{ dueDateSuffix(t) }}</div></td>
                <td><span class="badge" [class]="badgeClass(t.estado)">{{ estadoLabel(t.estado) }}</span></td>
                <td>
                  <div class="actions">
                    @if (t.estado !== 'done') {
                      <button class="action-btn complete" (click)="completar(t.id)" title="Marcar completada">✅</button>
                    }
                    <button class="action-btn" (click)="editTask(t)" title="Editar">✏️</button>
                    <button class="action-btn delete" (click)="eliminar(t.id)" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </main>

    <!-- MODAL -->
    <div class="modal-overlay" [class.open]="modalOpen" (click)="onOverlayClick($event)">
      <div class="modal">
        <h2>{{ editingId ? 'Editar Actividad' : 'Nueva Actividad' }}</h2>
        <div class="form-group">
          <label>Nombre de la Actividad *</label>
          <input class="form-control" type="text" [(ngModel)]="form.nombre" placeholder="Ej: Entregar informe Q1">
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <input class="form-control" type="text" [(ngModel)]="form.descripcion" placeholder="Notas adicionales...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha Límite *</label>
            <input class="form-control" type="datetime-local" [(ngModel)]="form.fechaLimite">
          </div>
          <div class="form-group">
            <label>Prioridad</label>
            <select class="form-control" [(ngModel)]="form.prioridad">
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Media</option>
              <option value="baja">🟢 Baja</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Área / Categoría</label>
          <select class="form-control" [(ngModel)]="form.area">
            <option>Trabajo</option><option>Personal</option><option>Proyectos</option>
            <option>Reuniones</option><option>Finanzas</option><option>Otro</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="guardar()">Guardar Actividad</button>
        </div>
      </div>
    </div>
  `
})
export class AgendaComponent implements OnInit {
    tasks = signal<Actividad[]>([]);
    stats = signal<Estadisticas | null>(null);

    currentFilter = 'all';
    searchTerm = '';
    sortBy = 'date';
    modalOpen = false;
    editingId: number | null = null;
    form: ActividadRequest & { descripcion?: string } = this.emptyForm();

    get todayStr() {
        return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    filteredTasks = computed(() => {
        let list = this.tasks();
        if (this.currentFilter !== 'all') list = list.filter(t => t.estado === this.currentFilter);
        if (this.searchTerm) {
            const s = this.searchTerm.toLowerCase();
            list = list.filter(t => t.nombre.toLowerCase().includes(s) || t.area.toLowerCase().includes(s));
        }
        const ord: Record<string, number> = { alta: 0, media: 1, baja: 2 };
        switch (this.sortBy) {
            case 'date': return [...list].sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());
            case 'priority': return [...list].sort((a, b) => ord[a.prioridad] - ord[b.prioridad]);
            case 'name': return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
            default: return list;
        }
    });

    constructor(private svc: ActividadService, private toast: ToastService) { }

    ngOnInit() { this.load(); }

    load() {
        this.svc.listar().subscribe(t => this.tasks.set(t));
        this.svc.estadisticas().subscribe(s => this.stats.set(s));
    }

    setFilter(f: string) { this.currentFilter = f; }

    completar(id: number) {
        this.svc.completar(id).subscribe({ next: () => { this.load(); this.toast.show('✅ Actividad completada', 'success'); }, error: () => this.toast.show('Error al completar', 'error') });
    }

    eliminar(id: number) {
        this.svc.eliminar(id).subscribe({ next: () => { this.load(); this.toast.show('🗑️ Actividad eliminada', 'error'); }, error: () => this.toast.show('Error al eliminar', 'error') });
    }

    editTask(t: Actividad) {
        this.editingId = t.id;
        this.form = { nombre: t.nombre, descripcion: t.descripcion || '', fechaLimite: t.fechaLimite.substring(0, 16), prioridad: t.prioridad, area: t.area };
        this.modalOpen = true;
    }

    openModal() { this.editingId = null; this.form = this.emptyForm(); this.modalOpen = true; }
    closeModal() { this.modalOpen = false; }
    onOverlayClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal(); }

    guardar() {
        if (!this.form.nombre.trim() || !this.form.fechaLimite) {
            this.toast.show('⚠️ Completa los campos obligatorios', 'warning'); return;
        }
        const req: ActividadRequest = { ...this.form };
        const obs = this.editingId ? this.svc.actualizar(this.editingId, req) : this.svc.crear(req);
        obs.subscribe({
            next: () => { this.closeModal(); this.load(); this.toast.show(this.editingId ? '✏️ Actividad actualizada' : '✅ Actividad creada', 'success'); },
            error: () => this.toast.show('Error al guardar', 'error')
        });
    }

    emptyForm(): ActividadRequest {
        const now = new Date(); now.setHours(now.getHours() + 1, 0, 0, 0);
        return { nombre: '', descripcion: '', fechaLimite: now.toISOString().substring(0, 16), prioridad: 'media', area: 'Trabajo' };
    }

    formatDate(dt: string) {
        return new Date(dt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    daysUntil(dt: string) {
        return Math.ceil((new Date(dt).getTime() - Date.now()) / 86400000);
    }

    dueDateClass(t: Actividad) {
        if (t.estado === 'overdue') return 'overdue';
        const d = this.daysUntil(t.fechaLimite);
        if (d <= 3) return 'soon';
        return 'ok';
    }

    dueDateSuffix(t: Actividad) {
        if (t.estado === 'overdue') return ` (${Math.abs(this.daysUntil(t.fechaLimite))}d vencida)`;
        const d = this.daysUntil(t.fechaLimite);
        if (d <= 0) return ' (hoy)';
        if (d <= 3) return ` (${d}d)`;
        return '';
    }

    prioridadLabel(p: string) {
        const m: Record<string, string> = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' };
        return m[p] || p;
    }

    badgeClass(estado: string) {
        const m: Record<string, string> = { done: 'badge-green', pending: 'badge-amber', overdue: 'badge-red' };
        return m[estado] || 'badge-gray';
    }

    estadoLabel(estado: string) {
        const m: Record<string, string> = { done: 'Completada', pending: 'Pendiente', overdue: 'Vencida' };
        return m[estado] || estado;
    }
}
