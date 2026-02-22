import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadService } from '../../core/services/actividad.service';
import { ToastService } from '../../core/services/toast.service';
import { Actividad, ActividadRequest, Estadisticas, AreaCategoria, AlertaConfig, Notificacion } from '../../core/models/models';
import { AreaService } from '../../core/services/area.service';
import { AlertaService, TelegramService } from '../../core/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

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
        <div class="user-info" style="display:flex;align-items:center;gap:8px;margin:0 8px;padding:4px 12px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
          <span style="font-size:18px">👤</span>
          <span style="font-size:13px;font-weight:600;color:var(--text)">{{ displayName() }}</span>
          <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:var(--accent);color:#fff">{{ userRole() }}</span>
        </div>
        <div class="theme-switcher" style="display:flex;align-items:center;gap:8px;margin:0 12px">
          <div class="theme-dot t-dark" [class.active]="currentTheme==='dark'" (click)="onSetTheme('dark')" title="Oscuro" style="width:12px;height:12px;border-radius:50%;background:#4ade80;border:2px solid #2a2f3a;cursor:pointer"></div>
          <div class="theme-dot t-light" [class.active]="currentTheme==='light'" (click)="onSetTheme('light')" title="Claro" style="width:12px;height:12px;border-radius:50%;background:#16a34a;border:2px solid #d1d5db;cursor:pointer"></div>
          <div class="theme-dot t-ocean" [class.active]="currentTheme==='ocean'" (click)="onSetTheme('ocean')" title="Océano" style="width:12px;height:12px;border-radius:50%;background:#38bdf8;border:2px solid #0f172a;cursor:pointer"></div>
          <div class="theme-dot t-corporate" [class.active]="currentTheme==='corporate'" (click)="onSetTheme('corporate')" title="Corporativo" style="width:12px;height:12px;border-radius:50%;background:#4D7C8A;border:2px solid #8FAD88;cursor:pointer"></div>
          <span id="theme-name" style="font-size:12px;color:var(--muted)">{{ themeName }}</span>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Nueva Actividad</button>
        <button class="btn btn-ghost" style="color:#ef4444;border:1px solid #ef4444;padding:6px 16px;border-radius:8px;cursor:pointer;margin-left:8px" (click)="salir()">Salir</button>
      </div>
    </header>

    <!-- MAIN -->
    <main class="main">
      <div class="filters" style="margin-bottom:12px">
        <button class="filter-btn" [class.active]="activeTab==='agenda'" (click)="goTab('agenda')">📋 Agenda</button>
        <button class="filter-btn" [class.active]="activeTab==='recurrentes'" (click)="goTab('recurrentes')">🔁 Recurrentes</button>
        <button class="filter-btn" [class.active]="activeTab==='dashboard'" (click)="goTab('dashboard')">📊 Dashboard</button>
        <button class="filter-btn" [class.active]="activeTab==='historial'" (click)="goTab('historial')">📜 Historial</button>
        <button class="filter-btn" [class.active]="activeTab==='reportes'" (click)="goTab('reportes')">📨 Reportes</button>
        <button class="filter-btn" [class.active]="activeTab==='alertas'" (click)="goTab('alertas')">🔔 Alertas</button>
      </div>
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
      <section *ngIf="activeTab==='agenda'">
      <div class="filters">
        <button class="filter-btn" [class.active]="currentFilter() === 'all'" (click)="setFilter('all')">Todas</button>
        <button class="filter-btn" [class.active]="currentFilter() === 'pending'" (click)="setFilter('pending')">⏳ Pendientes</button>
        <button class="filter-btn amber" [class.active]="currentFilter() === 'overdue'" (click)="setFilter('overdue')">⚠️ Vencidas</button>
        <button class="filter-btn" [class.active]="currentFilter() === 'done'" (click)="setFilter('done')">✅ Completadas</button>
        <select class="sort-select" [ngModel]="selectedArea()" (ngModelChange)="selectedArea.set($event)">
          <option value="all">Todas las áreas</option>
          <option *ngFor="let a of areas" [ngValue]="a.nombre">{{ a.nombre }}</option>
        </select>
        <select class="sort-select" [ngModel]="selectedPriority()" (ngModelChange)="selectedPriority.set($event)">
          <option value="all">Todas las prioridades</option>
          <option value="alta">Prioridad: Alta</option>
          <option value="media">Prioridad: Media</option>
          <option value="baja">Prioridad: Baja</option>
        </select>
        <input class="search-input" type="text" placeholder="🔍 Buscar actividad..." [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
        <select class="sort-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
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
                    @if (userRole() === 'ADMIN') {
                      <button class="action-btn delete" (click)="eliminar(t.id)" title="Eliminar">🗑️</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      </section>

      <!-- RECURRENTES TAB -->
      <section *ngIf="activeTab==='recurrentes'">
        <div class="section-card">
          <div class="section-title">🔁 Tareas Recurrentes</div>
          <div class="empty-state"><div class="icon">🔁</div><p>No hay tareas recurrentes definidas.</p></div>
        </div>
      </section>

      <!-- DASHBOARD TAB -->
      <section *ngIf="activeTab==='dashboard'">
        <div class="dash-grid">
          <div class="dash-card"><h3>Por Prioridad</h3>
            <div>
              @for (b of dashPrioridad(); track b.l) {
                <div class="bar-row"><div class="bar-row-label">{{ b.l }}</div><div class="bar-row-bar"><div class="bar-row-fill" [style.width.%]="b.pct" [style.background]="b.c"></div></div><div class="bar-row-val">{{ b.n }}</div></div>
              }
            </div>
          </div>
          <div class="dash-card"><h3>Por Estado</h3>
            <div>
              @for (b of dashEstado(); track b.l) {
                <div class="bar-row"><div class="bar-row-label">{{ b.l }}</div><div class="bar-row-bar"><div class="bar-row-fill" [style.width.%]="b.pct" [style.background]="b.c"></div></div><div class="bar-row-val">{{ b.n }}</div></div>
              }
            </div>
          </div>
          <div class="dash-card"><h3>Por Área</h3>
            <div>
              @for (b of dashArea(); track b.l) {
                <div class="bar-row"><div class="bar-row-label">{{ b.l }}</div><div class="bar-row-bar"><div class="bar-row-fill" [style.width.%]="b.pct" style="background:var(--info)"></div></div><div class="bar-row-val">{{ b.n }}</div></div>
              }
            </div>
          </div>
          <div class="dash-card"><h3>⚠️ Requieren atención</h3>
            <div class="filters" style="margin:-6px 0 8px 0">
              <select class="sort-select" [ngModel]="urgentThresholdDays()" (ngModelChange)="urgentThresholdDays.set((+$event >= 1) ? +$event : 1)">
                <option [ngValue]="1">≤ 1 día</option>
                <option [ngValue]="2">≤ 2 días</option>
                <option [ngValue]="3">≤ 3 días</option>
                <option [ngValue]="5">≤ 5 días</option>
                <option [ngValue]="7">≤ 7 días</option>
              </select>
              <select class="sort-select" [ngModel]="urgentMaxItems()" (ngModelChange)="urgentMaxItems.set((+$event >= 1) ? +$event : 1)">
                <option [ngValue]="3">Top 3</option>
                <option [ngValue]="5">Top 5</option>
                <option [ngValue]="8">Top 8</option>
                <option [ngValue]="10">Top 10</option>
              </select>
            </div>
            @if (atencionTop().length === 0) {
              <div class="empty-state"><div class="icon">✅</div><p>Sin tareas urgentes</p></div>
            }
            @for (t of atencionTop(); track t.id) {
              <div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0;gap:8px">
                <div style="min-width:0">
                  <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ t.nombre }}</div>
                  <div style="font-size:12px;color:var(--muted)">
                    <span class="inline-badge">{{ t.area }}</span>
                    <span class="time-chip">{{ t.estado==='overdue' ? 'Vencida' : ('En ' + daysUntil(t.fechaLimite) + 'd') }}</span>
                    <span class="priority" [class]="t.prioridad">{{ prioridadLabel(t.prioridad) }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- HISTORIAL TAB -->
      <section *ngIf="activeTab==='historial'">
        <div class="section-card">
          <div class="section-title">📜 Historial de Actividades</div>
          <div class="filters">
            <input class="search-input" type="text" placeholder="🔍 Buscar..." [ngModel]="histSearch()" (ngModelChange)="histSearch.set($event)">
            <select class="sort-select" [ngModel]="histEstado()" (ngModelChange)="histEstado.set($event)">
              <option value="all">Todos</option>
              <option value="done">✅ Completadas</option>
              <option value="overdue">🚨 Vencidas</option>
            </select>
          </div>
        </div>
        <div class="task-section">
          <div class="task-section-header">
            <span class="task-section-title">📜 Registro Histórico</span>
            <span class="task-count">{{ historialList().length }} registros</span>
          </div>
          <table>
            <thead>
              <tr><th>ACTIVIDAD</th><th>ÁREA</th><th>PRIORIDAD</th><th>CREADA</th><th>FECHA LÍMITE</th><th>ESTADO</th></tr>
            </thead>
            <tbody>
              @if (historialList().length === 0) {
                <tr><td colspan="6"><div class="empty-state"><div class="icon">📜</div><p>No hay registros</p></div></td></tr>
              }
              @for (t of historialList(); track t.id) {
                <tr>
                  <td><div class="task-name strikethrough">{{ t.nombre }}<div class="sub">{{ t.descripcion }}</div></div></td>
                  <td><span class="inline-badge">{{ t.area }}</span></td>
                  <td><div class="priority" [class]="t.prioridad">{{ prioridadLabel(t.prioridad) }}</div></td>
                  <td><span class="time-chip">{{ formatDate(t.fechaCreacion || t.fechaLimite) }}</span></td>
                  <td><span class="time-chip">{{ formatDate(t.fechaLimite) }}</span></td>
                  <td><span class="badge" [class]="badgeClass(t.estado)">{{ estadoLabel(t.estado) }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- REPORTES TAB -->
      <section *ngIf="activeTab==='reportes'">
        <div class="section-card" style="margin-bottom:12px">
          <div class="section-title">💬 Telegram</div>
          <p style="font-size:13px;color:var(--muted)">Configura el bot y el chat de destino en Administración.</p>
          <button class="btn btn-ghost btn-sm" (click)="goTelegramConfig()">Abrir configuración en Admin</button>
        </div>
        <div class="reports-grid">
          <div class="report-card">
            <h3>📅 Reporte Diario</h3>
            <p>Todos los días a las <strong>7:00 AM</strong> con tareas del día y avance acumulado.</p>
            <div class="report-preview">{{ previewDaily() }}</div>
            <button class="btn btn-ghost btn-sm" (click)="enviarReporte('daily')">📤 Enviar a Telegram</button>
          </div>
          <div class="report-card">
            <h3>📋 Reporte Semanal</h3>
            <p>Cada <strong>Lunes 8:00 AM</strong> con resumen de semana anterior y plan.</p>
            <div class="report-preview">{{ previewWeekly() }}</div>
            <button class="btn btn-ghost btn-sm" (click)="enviarReporte('weekly')">📤 Enviar a Telegram</button>
          </div>
          <div class="report-card">
            <h3>📈 Reporte Mensual</h3>
            <p>Día <strong>1 de cada mes</strong> con estadísticas completas.</p>
            <div class="report-preview">{{ previewMonthly() }}</div>
            <button class="btn btn-ghost btn-sm" (click)="enviarReporte('monthly')">📤 Enviar a Telegram</button>
          </div>
        </div>
      </section>

      <!-- ALERTAS TAB -->
      <section *ngIf="activeTab==='alertas'">
        <div class="section-card" style="margin-bottom:22px">
          <div class="section-title">🔔 Configuración de Alertas</div>
          @for (a of alertas; track a.id) {
            <div class="alert-item">
              <div class="alert-info"><h4>{{ a.tipo }}</h4><p>Alerta del sistema</p></div>
              <label class="toggle"><input type="checkbox" [checked]="a.habilitada" (change)="onToggleAlerta(a, $event)"><span class="tslider"></span></label>
            </div>
          }
          @if (!alertas || alertas.length===0) {
            <div class="empty-state"><div class="icon">🔔</div><p>Sin alertas configuradas</p></div>
          }
        </div>
        <div class="task-section">
          <div class="task-section-header"><span class="task-section-title">📨 Historial de Notificaciones</span></div>
          <table><thead><tr><th>TIPO</th><th>MENSAJE</th><th>DESTINATARIO</th><th>FECHA/HORA</th><th>ESTADO</th></tr></thead>
          <tbody>
            @for (n of notificaciones; track n.id) {
              <tr>
                <td style="font-size:12px">{{ n.tipo }}</td>
                <td style="font-size:12px;max-width:260px">{{ n.mensaje }}</td>
                <td style="font-family:'JetBrains Mono',monospace;font-size:11px">{{ n.destinatario }}</td>
                <td style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)">{{ n.fechaEnvio | date:'dd/MM/yyyy HH:mm' }}</td>
                <td><span class="badge b-done">✅ {{ n.estadoEnvio }}</span></td>
              </tr>
            }
            @if (!notificaciones || notificaciones.length===0) {
              <tr><td colspan="5"><div class="empty-state"><div class="icon">📭</div><p>No hay notificaciones</p></div></td></tr>
            }
          </tbody></table>
        </div>
      </section>
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
            <input class="form-control" type="datetime-local" [(ngModel)]="form.fechaLimite" [style.display]="isRecurring ? 'none' : 'block'">
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
        <div class="form-group" style="margin-top:6px;display:flex;align-items:center;gap:8px">
          <input id="f-recurring" type="checkbox" [(ngModel)]="isRecurring" (change)="onRecurringChange()">
          <label for="f-recurring">Tarea Recurrente</label>
        </div>
        <div id="rec-box" *ngIf="isRecurring" class="card" style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-top:4px;background:var(--surface)">
          <div class="form-row">
            <div class="form-group">
              <label>Día del mes</label>
              <select class="form-control" [(ngModel)]="recDay" (ngModelChange)="updateRecPreview()">
                <option [ngValue]="'ultimo'">Último día</option>
                <option *ngFor="let d of recDays" [ngValue]="d.toString()">{{ d }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input class="form-control" type="time" [(ngModel)]="recHour" (ngModelChange)="updateRecPreview()">
            </div>
            <div class="form-group">
              <label>Duración (meses)</label>
              <input class="form-control" type="number" min="0" [(ngModel)]="recMonths">
              <div class="sub">0 = sin límite</div>
            </div>
          </div>
          <div class="sub" id="rec-preview">Primera ocurrencia: <strong>{{ recPreview }}</strong></div>
        </div>
        <div class="form-group">
          <label>Área / Categoría</label>
          <select class="form-control" [(ngModel)]="form.area">
            <option *ngFor="let a of areas" [ngValue]="a.nombre">{{ a.nombre }}</option>
            <option *ngIf="areas.length===0" [ngValue]="'General'">General</option>
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
    areas: AreaCategoria[] = [];
    selectedArea = signal<string>('all');
    selectedPriority = signal<'all'|'alta'|'media'|'baja'>('all');
    activeTab: 'agenda'|'recurrentes'|'dashboard'|'historial'|'reportes'|'alertas' = 'agenda';

    currentFilter = signal<string>('all');
    searchTerm = signal<string>('');
    sortBy = signal<string>('date');
    modalOpen = false;
    editingId: number | null = null;
    form: ActividadRequest & { descripcion?: string } = this.emptyForm();
    // Alertas y notificaciones
    alertas: AlertaConfig[] = [];
    notificaciones: Notificacion[] = [];
    histSearch = signal<string>('');
    histEstado = signal<'all'|'done'|'overdue'>('all');
    urgentThresholdDays = signal<number>(3);
    urgentMaxItems = signal<number>(5);
    currentTheme: ThemeMode = 'dark';
    // Recurrencia (solo UI/cliente en Opción A)
    isRecurring = false;
    recDay: string = 'ultimo';
    recHour: string = '08:00';
    recMonths: number = 0; // 0 = sin límite
    recPreview: string = '';
    recDays: number[] = Array.from({ length: 28 }, (_, i) => i + 1);

    /** Nombre del usuario logueado */
    displayName = computed(() => this.auth.displayName());
    userRole = computed(() => this.auth.user()?.role || 'USER');

    get todayStr() {
        return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    filteredTasks = computed(() => {
        let list = this.tasks();
        const cf = this.currentFilter();
        const sa = this.selectedArea();
        const sp = this.selectedPriority();
        const st = this.searchTerm();
        const sb = this.sortBy();
        if (cf !== 'all') list = list.filter(t => t.estado === cf);
        if (sa && sa !== 'all') {
            list = list.filter(t => t.area === sa);
        }
        if (sp && sp !== 'all') {
            list = list.filter(t => t.prioridad === sp);
        }
        if (st) {
            const s = st.toLowerCase();
            list = list.filter(t => (t.nombre + ' ' + (t.descripcion || '') + ' ' + t.area).toLowerCase().includes(s));
        }
        const ord: Record<string, number> = { alta: 0, media: 1, baja: 2 };
        switch (sb) {
            case 'date': return [...list].sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());
            case 'priority': return [...list].sort((a, b) => ord[a.prioridad] - ord[b.prioridad]);
            case 'name': return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
            default: return list;
        }
    });

    constructor(
        private svc: ActividadService,
        private toast: ToastService,
        private areaSvc: AreaService,
        private alertasSvc: AlertaService,
        private tgSvc: TelegramService,
        private route: ActivatedRoute,
        private router: Router,
        private theme: ThemeService,
        private auth: AuthService,
    ) { }

    ngOnInit() {
        this.load();
        this.loadAreas();
        this.currentTheme = this.theme.getTheme();
        this.route.queryParamMap.subscribe(p => {
            const t = (p.get('tab') as any) || 'agenda';
            this.activeTab = ['agenda','recurrentes','dashboard','historial','reportes','alertas'].includes(t) ? t : 'agenda';
            if (this.activeTab === 'alertas') { this.loadAlertas(); this.loadNotificaciones(); }
        });
    }

    goTab(tab: 'agenda'|'recurrentes'|'dashboard'|'historial'|'reportes'|'alertas') {
        this.activeTab = tab;
        this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge' });
        if (tab === 'alertas') { this.loadAlertas(); this.loadNotificaciones(); }
    }

    load() {
        this.svc.listar().subscribe(t => this.tasks.set(t));
        this.svc.estadisticas().subscribe(s => this.stats.set(s));
    }
    loadAreas() {
        this.areaSvc.listar().subscribe({ next: d => {
            this.areas = d;
            if (!this.editingId && (!this.form.area || this.form.area.trim() === '')) {
                this.form.area = this.areas[0]?.nombre || 'General';
            }
        }, error: () => this.toast.show('Error cargando áreas', 'error') });
    }

    setFilter(f: string) { this.currentFilter.set(f); }

    completar(id: number) {
        this.svc.completar(id).subscribe({ next: () => { this.load(); this.toast.show('✅ Actividad completada', 'success'); }, error: () => this.toast.show('Error al completar', 'error') });
    }

    eliminar(id: number) {
        this.svc.eliminar(id).subscribe({ next: () => { this.load(); this.toast.show('🗑️ Actividad eliminada', 'error'); }, error: () => this.toast.show('Error al eliminar', 'error') });
    }

    editTask(t: Actividad) {
        this.editingId = t.id;
        this.form = { nombre: t.nombre, descripcion: t.descripcion || '', fechaLimite: t.fechaLimite.substring(0, 16), prioridad: t.prioridad, area: t.area };
        // Prefill recurrencia si aplica
        this.isRecurring = !!t.recurrente;
        if (this.isRecurring) {
            this.recDay = t.recUltimoDia ? 'ultimo' : (t.recDiaMes != null ? String(t.recDiaMes) : 'ultimo');
            this.recHour = (t.recHora ? t.recHora.substring(0,5) : '08:00');
            this.recMonths = t.recMeses ?? 0;
            this.updateRecPreview();
        } else {
            this.recDay = 'ultimo'; this.recHour = '08:00'; this.recMonths = 0; this.recPreview = '';
        }
        this.modalOpen = true;
    }

    openModal() { this.editingId = null; this.form = this.emptyForm(); this.loadAreas(); this.modalOpen = true; }
    closeModal() { this.modalOpen = false; }
    onOverlayClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal(); }

    guardar() {
        if (!this.form.nombre.trim() || !this.form.fechaLimite) {
            this.toast.show('⚠️ Completa los campos obligatorios', 'warning'); return;
        }
        if (this.isRecurring) {
            const first = this.calcFirstOccurrence(this.recDay, this.recHour);
            this.form.fechaLimite = first;
        }
        const req: ActividadRequest = { ...this.form } as any;
        if (this.isRecurring) {
            (req as any).recurrente = true;
            if (this.recDay === 'ultimo') {
                (req as any).recUltimoDia = true;
                (req as any).recDiaMes = null;
            } else {
                (req as any).recUltimoDia = false;
                (req as any).recDiaMes = parseInt(this.recDay, 10) || 1;
            }
            (req as any).recHora = (this.recHour || '08:00') + ':00';
            (req as any).recMeses = this.recMonths ?? 0;
        }
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

    // Recurrencia helpers (Opción A — sólo cliente)
    onRecurringChange() {
        if (this.isRecurring) {
            this.updateRecPreview();
        }
    }
    updateRecPreview() {
        const first = this.calcFirstOccurrence(this.recDay, this.recHour);
        this.recPreview = this.formatDate(first);
    }
    calcFirstOccurrence(recDay: string, recHour: string) {
        const now = new Date();
        const [h, m] = (recHour || '08:00').split(':').map(n => +n || 0);
        let year = now.getFullYear();
        let month = now.getMonth();
        const maxDay = new Date(year, month + 1, 0).getDate();
        let day = recDay === 'ultimo' ? maxDay : Math.min(parseInt(recDay, 10) || 1, maxDay);
        let candidate = new Date(year, month, day, h, m, 0, 0);
        if (candidate <= now) {
            month++;
            if (month > 11) { month = 0; year++; }
            const max2 = new Date(year, month + 1, 0).getDate();
            day = recDay === 'ultimo' ? max2 : Math.min(parseInt(recDay, 10) || 1, max2);
            candidate = new Date(year, month, day, h, m, 0, 0);
        }
        return candidate.toISOString().substring(0, 16);
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

    // Dashboard helpers
    dashPrioridad = computed(() => {
        const list = this.tasks();
        const total = list.length || 1;
        const map: Record<string, number> = { alta: 0, media: 0, baja: 0 };
        list.forEach(t => map[t.prioridad] = (map[t.prioridad] || 0) + 1);
        const label: Record<string, string> = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' };
        const color: Record<string, string> = { alta: 'var(--danger)', media: 'var(--accent2)', baja: 'var(--accent)' };
        return Object.entries(map).map(([k, n]) => ({ l: label[k], n, pct: Math.round(n / total * 100), c: color[k] }));
    });

    dashEstado = computed(() => {
        const list = this.tasks();
        const total = list.length || 1;
        const estados = ['pending','overdue','done'] as const;
        const label: Record<string, string> = { pending: '🔵 Pendiente', overdue: '🚨 Vencida', done: '✅ Completada' } as any;
        const color: Record<string, string> = { pending: 'var(--accent2)', overdue: 'var(--danger)', done: 'var(--accent)' } as any;
        const counts: Record<string, number> = { pending: 0, overdue: 0, done: 0 };
        list.forEach(t => counts[t.estado] = (counts[t.estado] || 0) + 1);
        return estados.map(k => ({ l: label[k], n: counts[k], pct: Math.round(counts[k] / total * 100), c: color[k] }));
    });

    dashArea = computed(() => {
        const list = this.tasks();
        const total = list.length || 1;
        const by: Record<string, number> = {};
        list.forEach(t => by[t.area] = (by[t.area] || 0) + 1);
        return Object.entries(by).map(([l, n]) => ({ l, n, pct: Math.round(n / total * 100) }));
    });

    atencionInmediata() {
        return this.tasks().filter(t => t.estado === 'overdue' || (t.estado !== 'done' && this.daysUntil(t.fechaLimite) <= this.urgentThresholdDays()));
    }
    atencionTop = computed(() => {
        const base = this.atencionInmediata();
        const score = (t: Actividad) => t.estado === 'overdue' ? -9999 : this.daysUntil(t.fechaLimite);
        return [...base].sort((a, b) => score(a) - score(b)).slice(0, this.urgentMaxItems());
    });

    // Historial helpers
    historialList = computed(() => {
        let list = this.tasks().filter(t => ['done','overdue'].includes(t.estado));
        const he = this.histEstado();
        const hs = this.histSearch();
        if (he !== 'all') list = list.filter(t => t.estado === he);
        if (hs) {
            const s = hs.toLowerCase();
            list = list.filter(t => (t.nombre + ' ' + (t.descripcion || '') + ' ' + t.area).toLowerCase().includes(s));
        }
        return list;
    });

    // Report previews
    previewDaily() {
        const s = this.stats();
        if (!s) return '—';
        return `📅 REPORTE DIARIO — ${new Date().toLocaleDateString('es-ES')}`
            + `\n──────────────────────────`
            + `\n🔄 Pendientes: ${s.pendientes}`
            + `\n✅ Completadas: ${s.completadas}`
            + `\n🚨 Vencidas: ${s.vencidas}`
            + `\n📊 Cumplimiento: ${s.cumplimientoPct}%`;
    }

    previewWeekly() {
        const s = this.stats();
        if (!s) return '—';
        const alta = this.tasks().filter(t => t.prioridad === 'alta' && t.estado !== 'done').length;
        const week = this.tasks().filter(t => { const d = this.daysUntil(t.fechaLimite); return d >= 0 && d <= 7 && t.estado !== 'done'; }).length;
        return `📋 REPORTE SEMANAL`
            + `\n──────────────────────────`
            + `\n📌 Total tareas: ${this.tasks().length}`
            + `\n✅ Completadas: ${s.completadas}`
            + `\n🔴 Alta prioridad: ${alta} pendientes`
            + `\n📅 Vencen sem: ${week}`
            + `\n📊 Tasa éxito: ${s.cumplimientoPct}%`;
    }

    previewMonthly() {
        const s = this.stats();
        if (!s) return '—';
        return `📈 REPORTE MENSUAL`
            + `\n──────────────────────────`
            + `\n📌 Total: ${this.tasks().length}`
            + `\n✅ Éxito: ${s.cumplimientoPct}%`
            + `\n🚨 Vencidas: ${s.vencidas}`;
    }

    enviarReporte(tipo: 'daily'|'weekly'|'monthly') {
        this.tgSvc.enviarReporte(tipo).subscribe({ next: r => this.toast.show(r?.mensaje || 'Reporte enviado'), error: () => this.toast.show('No se pudo enviar el reporte', 'error') });
    }

    get themeName() {
        const map: Record<ThemeMode, string> = { dark: 'Oscuro', light: 'Claro', ocean: 'Océano', corporate: 'Corporativo' };
        return map[this.currentTheme] || 'Oscuro';
    }
    onSetTheme(mode: ThemeMode) {
        this.currentTheme = mode;
        this.theme.setTheme(mode);
    }
    goTelegramConfig() {
        this.router.navigate(['/admin/config']);
    }

    // Alertas
    loadAlertas() { this.alertasSvc.listarAlertas().subscribe({ next: d => this.alertas = d, error: () => this.toast.show('Error cargando alertas', 'error') }); }
    loadNotificaciones() { this.alertasSvc.listarNotificaciones().subscribe({ next: d => this.notificaciones = d, error: () => this.toast.show('Error cargando notificaciones', 'error') }); }
    onToggleAlerta(a: AlertaConfig, ev: Event) {
        const checked = (ev.target as HTMLInputElement).checked;
        const prev = a.habilitada;
        a.habilitada = checked;
        this.alertasSvc.actualizarAlerta(a.id, checked).subscribe({ next: () => this.toast.show('Alerta actualizada'), error: () => { a.habilitada = prev; this.toast.show('No se pudo actualizar la alerta', 'error'); } });
    }

    salir() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
