import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TelegramService } from '../../core/services/alerta.service';
import { AdminService, AdminKpis, SystemConfig } from '../../core/services/admin.service';
import { UsuarioService, UsuarioDto, UsuarioRequest, UserRole } from '../../core/services/usuario.service';
import { ThemeService, type ThemeMode } from '../../core/services/theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { AreaService } from '../../core/services/area.service';
import { AreaCategoria, Actividad, Estadisticas, TelegramUserConfig } from '../../core/models/models';
import { ActividadService } from '../../core/services/actividad.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <header class="topbar" style="display:flex;justify-content:space-between;align-items:center;">
    <h1>Panel de <span>Administración</span></h1>
    <div style="display:flex;align-items:center;gap:12px;">
      <button class="btn btn-ghost" style="color:#ef4444;border:1px solid #ef4444;padding:6px 16px;border-radius:8px;cursor:pointer;" (click)="salir()">Salir</button>
    </div>
  </header>
  <main class="main">
    <div class="max-w-6xl mx-auto">
      <div class="flex gap-2 mb-4">
        <button class="btn btn-ghost" [class.nav-item]="false" [class.active]="activeTab==='inicio'" (click)="setTab('inicio')">Inicio</button>
        <button class="btn btn-ghost" [class.active]="activeTab==='actividades'" (click)="setTab('actividades')">📋 Agenda de Actividades</button>
        <button class="btn btn-ghost" [class.active]="activeTab==='login'" (click)="setTab('login')">Login</button>
        <button class="btn btn-ghost" [class.active]="activeTab==='temas'" (click)="setTab('temas')">Temas</button>
        <button class="btn btn-ghost" [class.active]="activeTab==='config'" (click)="setTab('config')">Configuración</button>
      </div>

      <!-- Inicio: KPIs -->
      <section *ngIf="activeTab==='inicio'">
        <div class="stats-row">
          <div class="stat-card blue">
            <div class="stat-label">Usuarios totales</div>
            <div class="stat-value blue">{{ kpis?.totalUsuarios ?? 0 }}</div>
            <div class="stat-sub">Admins: {{ kpis?.admins ?? 0 }} · Usuarios: {{ kpis?.usuarios ?? 0 }}</div>
          </div>
          <div class="stat-card green">
            <div class="stat-label">Actividades</div>
            <div class="stat-value green">{{ kpis?.actividadesTotal ?? 0 }}</div>
            <div class="stat-sub">Pend: {{ kpis?.actividadesPendientes ?? 0 }} · Comp: {{ kpis?.actividadesCompletadas ?? 0 }} · Venc: {{ kpis?.actividadesVencidas ?? 0 }}</div>
          </div>
          <div class="stat-card amber">
            <div class="stat-label">Alertas configuradas</div>
            <div class="stat-value amber">{{ kpis?.alertasHabilitadas ?? 0 }}/{{ kpis?.alertasTotal ?? 0 }}</div>
            <div class="stat-sub">Telegram: {{ kpis?.telegramActivo ? 'Activo' : 'Inactivo' }}</div>
          </div>
          <div class="stat-card red">
            <div class="stat-label">Seguridad</div>
            <div class="stat-value red">JWT</div>
            <div class="stat-sub">Sesiones sin estado</div>
          </div>
        </div>
      </section>

      <!-- Actividades: Vista global de todos los usuarios -->
      <section *ngIf="activeTab==='actividades'">
        <div class="stats-row" style="margin-bottom:16px">
          <div class="stat-card green">
            <div class="stat-label">Completadas</div>
            <div class="stat-value green">{{ globalStats?.completadas ?? 0 }}</div>
          </div>
          <div class="stat-card amber">
            <div class="stat-label">Pendientes</div>
            <div class="stat-value amber">{{ globalStats?.pendientes ?? 0 }}</div>
          </div>
          <div class="stat-card red">
            <div class="stat-label">Vencidas</div>
            <div class="stat-value red">{{ globalStats?.vencidas ?? 0 }}</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-label">Cumplimiento</div>
            <div class="stat-value blue">{{ globalStats?.cumplimientoPct ?? 0 }}%</div>
          </div>
        </div>
        <div class="filters" style="margin-bottom:12px">
          <input class="search-input" type="text" placeholder="🔍 Buscar actividad o usuario..." [(ngModel)]="actividadSearch" name="actividadSearch">
          <select class="sort-select" [(ngModel)]="actividadFiltroEstado" name="actividadFiltroEstado">
            <option value="all">Todos los estados</option>
            <option value="pending">⏳ Pendientes</option>
            <option value="overdue">⚠️ Vencidas</option>
            <option value="done">✅ Completadas</option>
          </select>
        </div>
        <div class="task-section">
          <div class="task-section-header">
            <span class="task-section-title">📋 Todas las Actividades</span>
            <span class="task-count">{{ filteredAllActividades().length }} de {{ allActividades.length }} tareas</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>USUARIO</th><th>ACTIVIDAD</th><th>ÁREA</th><th>PRIORIDAD</th>
                <th>FECHA LÍMITE</th><th>ESTADO</th><th style="width:100px">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredAllActividades().length === 0"><td colspan="7">
                <div class="empty-state"><div class="icon">📭</div><p>No hay actividades para mostrar</p></div>
              </td></tr>
              <tr *ngFor="let t of filteredAllActividades()">
                <td><span class="inline-badge" style="background:var(--info);color:#fff">{{ t.usuario?.nombre || t.usuario?.username || 'Sin asignar' }} {{ t.usuario?.apellido || '' }}</span></td>
                <td><div class="task-name" [class.strikethrough]="t.estado === 'done'">{{ t.nombre }}<div class="sub">{{ t.descripcion }}</div></div></td>
                <td><span class="inline-badge">{{ t.area }}</span></td>
                <td><span class="inline-badge" [ngStyle]="{'background': t.prioridad==='alta' ? '#ef4444' : t.prioridad==='media' ? '#f59e0b' : '#22c55e', 'color': '#fff'}">{{ t.prioridad }}</span></td>
                <td style="font-family:'JetBrains Mono',monospace;font-size:12px">{{ formatDate(t.fechaLimite) }}</td>
                <td><span class="badge" [ngClass]="{'badge-green': t.estado==='done', 'badge-amber': t.estado==='pending', 'badge-red': t.estado==='overdue'}">{{ estadoLabel(t.estado) }}</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar" (click)="editActividad(t)">✏️</button>
                  <button class="action-btn delete" title="Eliminar" (click)="deleteActividad(t)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Modal editar actividad -->
          <div *ngIf="editingActividad" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000" (click)="cancelEditActividad()">
            <div class="modal" style="width:480px;padding:24px;border-radius:16px" (click)="$event.stopPropagation()">
              <h2 style="margin-bottom:16px;font-size:18px">✏️ Editar Actividad</h2>
              <div style="display:grid;gap:12px">
                <div>
                  <label style="display:block;font-size:13px;margin-bottom:4px">Nombre</label>
                  <input class="form-control" [(ngModel)]="editActForm.nombre" name="editActNombre">
                </div>
                <div>
                  <label style="display:block;font-size:13px;margin-bottom:4px">Descripción</label>
                  <input class="form-control" [(ngModel)]="editActForm.descripcion" name="editActDesc">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  <div>
                    <label style="display:block;font-size:13px;margin-bottom:4px">Prioridad</label>
                    <select class="form-control" [(ngModel)]="editActForm.prioridad" name="editActPrioridad">
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:13px;margin-bottom:4px">Área</label>
                    <select class="form-control" [(ngModel)]="editActForm.area" name="editActArea">
                      <option *ngFor="let a of areas" [value]="a.nombre">{{ a.nombre }}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:13px;margin-bottom:4px">Fecha límite</label>
                  <input class="form-control" type="datetime-local" [(ngModel)]="editActForm.fechaLimite" name="editActFecha">
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
                  <button class="btn btn-ghost" (click)="cancelEditActividad()">Cancelar</button>
                  <button class="btn btn-primary" (click)="saveEditActividad()">Guardar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Login: Gestión de usuarios -->
      <section *ngIf="activeTab==='login'">
        <div class="progress-section">
          <div class="progress-header">
            <div class="progress-title">Gestión de Usuarios</div>
          </div>
          <form class="grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px" (ngSubmit)="submitUser()">
            <input class="form-control" placeholder="Nombre" [(ngModel)]="form.nombre" name="nombre">
            <input class="form-control" placeholder="Apellido" [(ngModel)]="form.apellido" name="apellido">
            <input class="form-control" placeholder="Usuario" [(ngModel)]="form.username" name="username" required>
            <input class="form-control" placeholder="Correo electrónico" [(ngModel)]="form.email" name="email" type="email" required>
            <input class="form-control" placeholder="Teléfono" [(ngModel)]="form.telefono" name="telefono">
            <select class="form-control" [(ngModel)]="form.role" name="role">
              <option [ngValue]="'USER'">USER</option>
              <option [ngValue]="'ADMIN'">ADMIN</option>
            </select>
            <input class="form-control" placeholder="Contraseña" [(ngModel)]="form.password" name="password" type="password" [required]="!editing">
            <div style="grid-column: span 5 / span 5"></div>
            <button class="btn btn-primary" type="submit">{{ editing ? 'Actualizar' : 'Crear' }}</button>
            <button class="btn btn-ghost" type="button" (click)="resetForm()" *ngIf="editing">Cancelar</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Apellido</th><th>Usuario</th><th>Contraseña</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarios">
                <td>{{ u.nombre || '—' }}</td>
                <td>{{ u.apellido || '—' }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.passwordMasked }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.telefono || '—' }}</td>
                <td><span class="inline-badge">{{ u.role }}</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar" (click)="edit(u)">✏️</button>
                  <button class="action-btn delete" title="Eliminar" (click)="remove(u)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-6">
            <div class="progress-header" style="margin-bottom:8px">
              <div class="progress-title">Configuración de Telegram por usuario</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Usuario/Canal</th>
                  <th>Estado</th>
                  <th style="width:120px"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="telegramUsers.length === 0">
                  <td colspan="5">
                    <div class="empty-state"><div class="icon">📭</div><p>Sin configuraciones de Telegram</p></div>
                  </td>
                </tr>
                <tr *ngFor="let cfg of telegramUsers">
                  <td>{{ cfg.usuarioNombre || cfg.usuarioUsername }} {{ cfg.usuarioApellido || '' }}</td>
                  <td>{{ cfg.phoneNumber || '—' }}</td>
                  <td>{{ cfg.userOrChannel || '—' }}</td>
                  <td>
                    <span class="badge" [ngClass]="{ 'badge-green': cfg.activo, 'badge-amber': !cfg.activo }">{{ cfg.activo ? 'Activo' : 'Inactivo' }}</span>
                  </td>
                  <td class="actions">
                    <button class="action-btn" title="Editar" (click)="editTelegramUserConfig(cfg); setTab('config')">✏️</button>
                    <button class="action-btn delete" title="Eliminar" (click)="deleteTelegramUserConfig(cfg)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Temas -->
      <section *ngIf="activeTab==='temas'">
        <div class="progress-section">
          <div class="progress-title" style="margin-bottom:16px">Apariencia</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
            <div (click)="setThemeTo('dark')" style="cursor:pointer;border-radius:12px;overflow:hidden;border:3px solid" [style.borderColor]="theme==='dark' ? '#4ade80' : 'var(--border)'">
              <div style="height:60px;background:linear-gradient(135deg,#0d0f14 50%,#141720 50%)"></div>
              <div style="padding:10px;text-align:center;font-size:13px;font-weight:600;background:var(--surface)">🌙 Oscuro</div>
            </div>
            <div (click)="setThemeTo('light')" style="cursor:pointer;border-radius:12px;overflow:hidden;border:3px solid" [style.borderColor]="theme==='light' ? '#16a34a' : 'var(--border)'">
              <div style="height:60px;background:linear-gradient(135deg,#f6f7f8 50%,#ffffff 50%)"></div>
              <div style="padding:10px;text-align:center;font-size:13px;font-weight:600;background:var(--surface)">☀️ Claro</div>
            </div>
            <div (click)="setThemeTo('ocean')" style="cursor:pointer;border-radius:12px;overflow:hidden;border:3px solid" [style.borderColor]="theme==='ocean' ? '#38bdf8' : 'var(--border)'">
              <div style="height:60px;background:linear-gradient(135deg,#0f172a 50%,#1e3a5f 50%)"></div>
              <div style="padding:10px;text-align:center;font-size:13px;font-weight:600;background:var(--surface)">🌊 Océano</div>
            </div>
            <div (click)="setThemeTo('corporate')" style="cursor:pointer;border-radius:12px;overflow:hidden;border:3px solid" [style.borderColor]="theme==='corporate' ? '#4D7C8A' : 'var(--border)'">
              <div style="height:60px;background:linear-gradient(135deg,#4D7C8A 33%,#7F9C96 66%,#8FAD88 100%)"></div>
              <div style="padding:10px;text-align:center;font-size:13px;font-weight:600;background:var(--surface)">🏢 Corporativo</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Configuración del sistema + Telegram -->
      <section *ngIf="activeTab==='config'">
        <div class="grid" style="display:grid;grid-template-columns:1fr;gap:16px;max-width:960px;margin:0 auto;">
          <section class="card glass-effect p-6 rounded-xl border border-[var(--border-subtle)]">
            <h2 class="text-lg font-semibold mb-2">Áreas / Categorías</h2>
            <div class="flex gap-2 mb-3">
              <input class="form-control flex-1" placeholder="Nueva área o categoría" [(ngModel)]="nuevaArea" name="nuevaArea" (keyup.enter)="agregarArea()">
              <button class="btn btn-primary" type="button" (click)="agregarArea()">Agregar</button>
            </div>
            <table>
              <thead><tr><th>Nombre</th><th style="width:80px"></th></tr></thead>
              <tbody>
                <tr *ngFor="let a of areas">
                  <td>
                    <ng-container *ngIf="editingAreaId !== a.id; else editTpl">{{ a.nombre }}</ng-container>
                    <ng-template #editTpl>
                      <input class="form-control" [(ngModel)]="editAreaName" (keyup.enter)="saveEditArea(a)">
                    </ng-template>
                  </td>
                  <td class="actions text-right">
                    <ng-container *ngIf="editingAreaId !== a.id; else editBtns">
                      <button class="action-btn" (click)="startEditArea(a)" title="Editar">✏️</button>
                      <button class="action-btn delete" (click)="eliminarArea(a.id)" title="Eliminar">🗑️</button>
                    </ng-container>
                    <ng-template #editBtns>
                      <button class="action-btn" (click)="saveEditArea(a)" title="Guardar">💾</button>
                      <button class="action-btn delete" (click)="cancelEditArea()" title="Cancelar">✖</button>
                    </ng-template>
                  </td>
                </tr>
                <tr *ngIf="areas.length===0"><td colspan="2"><div class="empty-state"><div class="icon">📭</div><p>Sin áreas</p></div></td></tr>
              </tbody>
            </table>
          </section>

          <section class="card glass-effect p-6 rounded-xl border border-[var(--border-subtle)]">
            <h2 class="text-lg font-semibold mb-2">Datos de Telegram</h2>
            <p class="text-sm text-gray-400 mb-4">Configura el bot de Telegram para el envío de reportes y notificaciones.</p>
            <form (ngSubmit)="saveTelegram()" class="space-y-3">
              <div>
                <label class="block text-sm mb-1">Bot Token</label>
                <input class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegram.botToken" name="botToken"/>
              </div>
              <div>
                <label class="block text-sm mb-1">Chat ID</label>
                <input class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegram.chatId" name="chatId"/>
              </div>
              <div class="grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                <div>
                  <label class="block text-sm mb-1">Número telefónico</label>
                  <input class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegram.phoneNumber" name="phoneNumber" placeholder="Ej: +51999999999"/>
                </div>
                <div>
                  <label class="block text-sm mb-1">Usuario o Canal de Telegram</label>
                  <input class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegram.userOrChannel" name="userOrChannel" placeholder="Ej: @mi_canal o @mi_usuario"/>
                </div>
              </div>
              <div class="flex gap-3 items-center">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" [(ngModel)]="telegram.activo" name="activo"/>
                  Activo
                </label>
                <button class="bg-[var(--accent-emerald)] text-white px-4 py-2 rounded-lg" type="submit">Guardar</button>
                <button class="bg-white/10 px-4 py-2 rounded-lg" type="button" (click)="testTelegram()">Probar</button>
              </div>
            </form>
          </section>
          <section class="card glass-effect p-6 rounded-xl border border-[var(--border-subtle)]">
            <h2 class="text-lg font-semibold mb-2">Telegram por usuario</h2>
            <p class="text-sm text-gray-400 mb-4">Asigna número y usuario/canal de Telegram a cada usuario.</p>
            <form (ngSubmit)="saveTelegramUserConfig()" class="space-y-3">
              <div class="grid" style="display:grid;grid-template-columns:2fr 1fr;gap:10px;">
                <div>
                  <label class="block text-sm mb-1">Usuario</label>
                  <select class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegramUserForm.usuarioId" name="telegramUsuarioId">
                    <option [ngValue]="null">Seleccione un usuario...</option>
                    <option *ngFor="let u of usuarios" [ngValue]="u.id">{{ u.nombre || u.username }} {{ u.apellido || '' }} ({{ u.username }})</option>
                  </select>
                </div>
                <div class="flex items-end">
                  <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" [(ngModel)]="telegramUserForm.activo" name="telegramUsuarioActivo"/>
                    Activo
                  </label>
                </div>
              </div>
              <div class="grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                <div>
                  <label class="block text-sm mb-1">Número telefónico</label>
                  <input class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegramUserForm.phoneNumber" name="telegramUsuarioPhone" placeholder="Ej: +51999999999"/>
                </div>
                <div>
                  <label class="block text-sm mb-1">Usuario o Canal de Telegram</label>
                  <input class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)]" [(ngModel)]="telegramUserForm.userOrChannel" name="telegramUsuarioChannel" placeholder="Ej: @mi_canal o @mi_usuario"/>
                </div>
              </div>
              <div class="flex gap-3 items-center">
                <button class="bg-[var(--accent-emerald)] text-white px-4 py-2 rounded-lg" type="submit">{{ telegramUserForm.id ? 'Actualizar' : 'Guardar' }}</button>
                <button class="bg-white/10 px-4 py-2 rounded-lg" type="button" (click)="clearTelegramUserForm()">Limpiar</button>
              </div>
            </form>
            <div class="mt-6">
              <h3 class="text-sm font-semibold mb-2">Configuraciones existentes</h3>
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Teléfono</th>
                    <th>Usuario/Canal</th>
                    <th>Estado</th>
                    <th style="width:120px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="telegramUsers.length === 0">
                    <td colspan="5">
                      <div class="empty-state"><div class="icon">📭</div><p>Sin configuraciones de Telegram por usuario</p></div>
                    </td>
                  </tr>
                  <tr *ngFor="let cfg of telegramUsers">
                    <td>{{ cfg.usuarioNombre || cfg.usuarioUsername }} {{ cfg.usuarioApellido || '' }}</td>
                    <td>{{ cfg.phoneNumber || '—' }}</td>
                    <td>{{ cfg.userOrChannel || '—' }}</td>
                    <td>
                      <button type="button" class="inline-badge" [ngClass]="{ 'badge-green': cfg.activo, 'badge-amber': !cfg.activo }" (click)="toggleTelegramUserActivo(cfg)">{{ cfg.activo ? 'Activo' : 'Inactivo' }}</button>
                    </td>
                    <td class="actions">
                      <button class="action-btn" title="Editar" (click)="editTelegramUserConfig(cfg)">✏️</button>
                      <button class="action-btn delete" title="Eliminar" (click)="deleteTelegramUserConfig(cfg)">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  </main>
  `
})
export class AdminConfigComponent implements OnInit {
  activeTab: 'inicio'|'login'|'temas'|'config'|'actividades' = 'inicio';

  kpis: AdminKpis | null = null;

  usuarios: UsuarioDto[] = [];
  editing = false;
  editingId: number | null = null;
  form: UsuarioRequest = { username: '', email: '', role: 'USER', password: '' };

  theme: ThemeMode = 'dark';
  sys: SystemConfig = { id: 1, systemName: '', description: '' };
  telegram: any = { botToken: '', chatId: '', activo: false };
  telegramUsers: TelegramUserConfig[] = [];
  telegramUserForm: { id: number | null; usuarioId: number | null; phoneNumber: string; userOrChannel: string; activo: boolean } = {
    id: null,
    usuarioId: null,
    phoneNumber: '',
    userOrChannel: '',
    activo: true
  };
  // Áreas / Categorías
  areas: AreaCategoria[] = [];
  nuevaArea = '';
  editingAreaId: number | null = null;
  editAreaName = '';

  // Actividades globales (admin)
  allActividades: Actividad[] = [];
  globalStats: Estadisticas | null = null;
  actividadSearch = '';
  actividadFiltroEstado = 'all';
  // Edición de actividad
  editingActividad: Actividad | null = null;
  editActForm: any = { nombre: '', descripcion: '', prioridad: 'media', area: '', fechaLimite: '' };

  constructor(
    private admin: AdminService,
    private users: UsuarioService,
    private tg: TelegramService,
    private themeSvc: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private areaSvc: AreaService,
    private auth: AuthService,
    private actividadSvc: ActividadService,
  ) {}

  ngOnInit() {
    this.loadKpis();
    this.loadUsers();
    this.loadAllActividades();
    this.theme = this.themeSvc.getTheme();
    this.admin.getSystemConfig().subscribe(cfg => this.sys = cfg);
    this.tg.getConfig().subscribe(cfg => this.telegram = cfg);
    this.loadTelegramUsers();
    this.cargarAreas();
    const qtab = this.route.snapshot.queryParamMap.get('tab') as any;
    if (qtab) this.activeTab = qtab;
    this.route.queryParamMap.subscribe(q => {
      const t = q.get('tab') as any;
      if (t && t !== this.activeTab) {
        this.activeTab = t;
        if (t === 'inicio') this.loadKpis();
        if (t === 'actividades') this.loadAllActividades();
      }
    });
  }

  setTab(tab: 'inicio'|'login'|'temas'|'config'|'actividades') {
    this.activeTab = tab;
    if (tab==='inicio') this.loadKpis();
    if (tab==='actividades') this.loadAllActividades();
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge' });
  }

  // KPIs
  loadKpis() { this.admin.kpis().subscribe({ next: d => this.kpis = d, error: err => this.toast.show(err?.error?.message || 'Error cargando KPIs', 'error') }); }

  // Usuarios
  loadUsers() { this.users.listar().subscribe({ next: d => this.usuarios = d, error: err => this.toast.show(err?.error?.message || 'Error cargando usuarios', 'error') }); }
  submitUser() {
    const payload: UsuarioRequest = { ...this.form };
    if (this.editing && this.editingId != null) {
      this.users.actualizar(this.editingId, payload).subscribe({
        next: () => { this.loadUsers(); this.loadKpis(); this.resetForm(); this.toast.show('Usuario actualizado'); },
        error: err => this.toast.show(err?.error?.message || 'No se pudo actualizar el usuario', 'error')
      });
    } else {
      this.users.crear(payload).subscribe({
        next: () => { this.loadUsers(); this.loadKpis(); this.resetForm(); this.toast.show('Usuario creado'); },
        error: err => this.toast.show(err?.error?.message || 'No se pudo crear el usuario', 'error')
      });
    }
  }
  edit(u: UsuarioDto) {
    this.editing = true; this.editingId = u.id;
    this.form = { nombre: u.nombre, apellido: u.apellido, username: u.username, email: u.email, telefono: u.telefono, role: u.role };
  }
  remove(u: UsuarioDto) {
    if (!confirm(`¿Eliminar usuario ${u.username}?`)) return;
    this.users.eliminar(u.id).subscribe({
      next: () => { this.loadUsers(); this.loadKpis(); this.toast.show('Usuario eliminado'); },
      error: err => this.toast.show(err?.error?.message || 'No se pudo eliminar el usuario', 'error')
    });
  }
  resetForm() { this.editing = false; this.editingId = null; this.form = { username: '', email: '', role: 'USER', password: '' }; }

  // Temas
  setThemeTo(mode: ThemeMode) {
    this.theme = mode;
    this.themeSvc.setTheme(mode);
  }
  toggleTheme(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    this.theme = checked ? 'light' : 'dark';
    this.themeSvc.setTheme(this.theme);
  }

  // Config
  saveSystem() { this.admin.saveSystemConfig(this.sys).subscribe({ next: cfg => { this.sys = cfg; this.toast.show('Configuración guardada'); }, error: err => this.toast.show(err?.error?.message || 'No se pudo guardar la configuración', 'error') }); }
  cargarAreas() { this.areaSvc.listar().subscribe({ next: d => this.areas = d, error: err => this.toast.show('Error cargando áreas', 'error') }); }
  agregarArea() {
    const nombre = (this.nuevaArea || '').trim();
    if (!nombre) { this.toast.show('Ingrese un nombre de área', 'warning'); return; }
    this.areaSvc.crear(nombre).subscribe({ next: a => { this.nuevaArea = ''; this.cargarAreas(); this.toast.show('Área agregada'); }, error: err => this.toast.show(err?.error?.message || 'No se pudo agregar área', 'error') });
  }
  eliminarArea(id: number) {
    if (!confirm('¿Eliminar área?')) return;
    this.areaSvc.eliminar(id).subscribe({ next: () => { this.cargarAreas(); this.toast.show('Área eliminada'); }, error: err => this.toast.show(err?.error?.message || 'No se pudo eliminar área', 'error') });
  }
  startEditArea(a: AreaCategoria) { this.editingAreaId = a.id; this.editAreaName = a.nombre; }
  cancelEditArea() { this.editingAreaId = null; this.editAreaName = ''; }
  saveEditArea(a: AreaCategoria) {
    const nombre = (this.editAreaName || '').trim();
    if (!nombre) { this.toast.show('Ingrese un nombre de área', 'warning'); return; }
    this.areaSvc.actualizar(a.id, nombre).subscribe({
      next: up => { this.toast.show('Área actualizada'); this.cancelEditArea(); this.cargarAreas(); },
      error: err => this.toast.show(err?.error?.message || 'No se pudo actualizar el área', 'error')
    });
  }

  // Telegram
  saveTelegram() { this.tg.saveConfig(this.telegram).subscribe({ next: cfg => { this.telegram = cfg; this.toast.show('Telegram guardado'); }, error: err => this.toast.show(err?.error?.message || 'No se pudo guardar Telegram', 'error') }); }
  testTelegram() { this.tg.testConexion().subscribe({ next: r => this.toast.show(r?.mensaje || 'Prueba enviada'), error: err => this.toast.show(err?.error?.message || 'No se pudo probar Telegram', 'error') }); }

  loadTelegramUsers() {
    this.tg.getUserConfigs().subscribe({
      next: d => this.telegramUsers = d,
      error: err => this.toast.show(err?.error?.message || 'Error cargando configuraciones de Telegram por usuario', 'error')
    });
  }

  clearTelegramUserForm() {
    this.telegramUserForm = { id: null, usuarioId: null, phoneNumber: '', userOrChannel: '', activo: true };
  }

  editTelegramUserConfig(cfg: TelegramUserConfig) {
    this.telegramUserForm = {
      id: cfg.id,
      usuarioId: cfg.usuarioId,
      phoneNumber: cfg.phoneNumber || '',
      userOrChannel: cfg.userOrChannel || '',
      activo: cfg.activo
    };
  }

  saveTelegramUserConfig() {
    const usuarioId = this.telegramUserForm.usuarioId;
    if (!usuarioId) {
      this.toast.show('Seleccione un usuario', 'warning');
      return;
    }
    const payload = {
      usuarioId,
      phoneNumber: (this.telegramUserForm.phoneNumber || '').trim() || undefined,
      userOrChannel: (this.telegramUserForm.userOrChannel || '').trim() || undefined,
      activo: this.telegramUserForm.activo
    };
    this.tg.saveUserConfig(payload).subscribe({
      next: () => {
        this.toast.show('Configuración de Telegram guardada');
        this.clearTelegramUserForm();
        this.loadTelegramUsers();
      },
      error: err => this.toast.show(err?.error?.message || 'No se pudo guardar la configuración de Telegram', 'error')
    });
  }

  deleteTelegramUserConfig(cfg: TelegramUserConfig) {
    if (!confirm(`¿Eliminar configuración de Telegram para ${cfg.usuarioNombre || cfg.usuarioUsername}?`)) return;
    this.tg.deleteUserConfig(cfg.id).subscribe({
      next: () => {
        this.toast.show('Configuración de Telegram eliminada');
        this.loadTelegramUsers();
        if (this.telegramUserForm.id === cfg.id) {
          this.clearTelegramUserForm();
        }
      },
      error: err => this.toast.show(err?.error?.message || 'No se pudo eliminar la configuración de Telegram', 'error')
    });
  }

  toggleTelegramUserActivo(cfg: TelegramUserConfig) {
    this.tg.updateUserActivo(cfg.id, !cfg.activo).subscribe({
      next: updated => {
        this.telegramUsers = this.telegramUsers.map(c => c.id === updated.id ? updated : c);
        if (this.telegramUserForm.id === updated.id) {
          this.telegramUserForm.activo = updated.activo;
        }
      },
      error: err => this.toast.show(err?.error?.message || 'No se pudo actualizar el estado de Telegram', 'error')
    });
  }

  // Actividades globales
  loadAllActividades() {
    this.actividadSvc.listarTodas().subscribe({ next: d => this.allActividades = d, error: () => this.toast.show('Error cargando actividades', 'error') });
    this.actividadSvc.estadisticasGlobales().subscribe({ next: s => this.globalStats = s, error: () => {} });
  }

  filteredAllActividades(): Actividad[] {
    let list = this.allActividades;
    if (this.actividadFiltroEstado !== 'all') list = list.filter(t => t.estado === this.actividadFiltroEstado);
    if (this.actividadSearch) {
      const s = this.actividadSearch.toLowerCase();
      list = list.filter(t =>
        (t.nombre + ' ' + (t.descripcion || '') + ' ' + t.area + ' ' + ((t as any).usuario?.nombre || '') + ' ' + ((t as any).usuario?.apellido || '') + ' ' + ((t as any).usuario?.username || '')).toLowerCase().includes(s)
      );
    }
    return list;
  }

  formatDate(dt: string) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  estadoLabel(estado: string) {
    const m: Record<string, string> = { done: 'Completada', pending: 'Pendiente', overdue: 'Vencida' };
    return m[estado] || estado;
  }

  // Editar actividad desde admin
  editActividad(t: Actividad) {
    this.editingActividad = t;
    // Convertir fechaLimite a formato datetime-local (YYYY-MM-DDTHH:mm)
    let fl = t.fechaLimite || '';
    if (fl && fl.length > 16) fl = fl.substring(0, 16);
    this.editActForm = {
      nombre: t.nombre,
      descripcion: t.descripcion || '',
      prioridad: t.prioridad,
      area: t.area,
      fechaLimite: fl
    };
  }

  cancelEditActividad() {
    this.editingActividad = null;
  }

  saveEditActividad() {
    if (!this.editingActividad) return;
    const id = this.editingActividad.id;
    const req: any = {
      nombre: this.editActForm.nombre,
      descripcion: this.editActForm.descripcion,
      prioridad: this.editActForm.prioridad,
      area: this.editActForm.area,
      fechaLimite: this.editActForm.fechaLimite
    };
    this.actividadSvc.actualizar(id, req).subscribe({
      next: () => {
        this.toast.show('Actividad actualizada');
        this.editingActividad = null;
        this.loadAllActividades();
      },
      error: err => this.toast.show(err?.error?.message || 'No se pudo actualizar la actividad', 'error')
    });
  }

  deleteActividad(t: Actividad) {
    const owner = t.usuario?.nombre || t.usuario?.username || 'Sin asignar';
    if (!confirm(`¿Eliminar la actividad "${t.nombre}" de ${owner}?`)) return;
    this.actividadSvc.eliminar(t.id).subscribe({
      next: () => {
        this.toast.show('Actividad eliminada');
        this.loadAllActividades();
      },
      error: err => this.toast.show(err?.error?.message || 'No se pudo eliminar la actividad', 'error')
    });
  }

  irAgenda() {
    this.router.navigate(['/agenda']);
  }

  salir() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
