import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative">
      <!-- Top bar with Intranet button -->
      <div class="sticky top-0 z-20 -mx-6 sm:-mx-8 md:-mx-10 px-6 sm:px-8 md:px-10 py-4 bg-[var(--bg-deep)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-deep)]/60 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-white">
          Información del Sistema
        </h2>
        <div class="relative" (click)="$event.stopPropagation()">
          <button (click)="toggleIntranet()" class="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-white/5 hover:bg-white/10 transition text-white/90">
            <span class="material-symbols-outlined text-[var(--accent-emerald)]">account_tree</span>
            <span class="font-semibold">Intranet</span>
            <span class="material-symbols-outlined text-white/60 group-hover:text-white transition -mr-1" [class.rotate-180]="intranetOpen">expand_more</span>
          </button>
          <div *ngIf="intranetOpen" class="absolute right-0 mt-2 w-60 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] shadow-xl overflow-hidden">
            <a routerLink="/dashboard" (click)="closeIntranet()" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-gray-300">
              <span class="material-symbols-outlined text-[var(--accent-emerald)]">admin_panel_settings</span>
              <div>
                <p class="font-semibold text-white">Administrador</p>
                <p class="text-xs text-gray-500">Gestión total del sistema</p>
              </div>
            </a>
            <div class="h-px bg-[var(--border-subtle)]"></div>
            <a routerLink="/agenda" (click)="closeIntranet()" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-gray-300">
              <span class="material-symbols-outlined text-blue-400">person</span>
              <div>
                <p class="font-semibold text-white">Usuarios</p>
                <p class="text-xs text-gray-500">Acceso a actividades</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Hero -->
      <div class="px-6 sm:px-8 md:px-10 pt-8 pb-4">
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 sm:p-8">
          <div class="max-w-4xl">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Agenda de Cumplimiento
            </h1>
            <p class="mt-3 text-base sm:text-lg text-gray-400">
              Plataforma integral para <span class="text-white">recordatorios</span>, <span class="text-white">avisos y alertas</span>,
              <span class="text-white">seguimiento de actividades</span> y <span class="text-white">mejora continua</span> del desempeño.
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="rounded-xl border border-[var(--border-subtle)] bg-white/[0.04] p-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[var(--accent-emerald)]">notifications_active</span>
                <p class="font-semibold text-white">Recordatorios</p>
              </div>
              <p class="mt-2 text-sm text-gray-400">Alertas proactivas para que nada se te pase.</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-white/[0.04] p-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-amber-400">warning</span>
                <p class="font-semibold text-white">Avisos y alertas</p>
              </div>
              <p class="mt-2 text-sm text-gray-400">Notificaciones según prioridad y vencimiento.</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-white/[0.04] p-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-sky-400">checklist_rtl</span>
                <p class="font-semibold text-white">Seguimiento</p>
              </div>
              <p class="mt-2 text-sm text-gray-400">Evolución por estado, área y categoría.</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-white/[0.04] p-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-pink-400">trending_up</span>
                <p class="font-semibold text-white">Mejora continua</p>
              </div>
              <p class="mt-2 text-sm text-gray-400">Indicadores y acciones para optimizar tu desempeño.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin & Usuario modules -->
      <div class="px-6 sm:px-8 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-white/[0.04] p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-[var(--accent-emerald)]">shield_person</span>
            <h3 class="text-xl font-bold text-white">Módulo Administrador</h3>
          </div>
          <ul class="space-y-3 text-gray-300">
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-[var(--accent-emerald)]">group_add</span><span>Gestión de usuarios: crear, asignar permisos, otorgar o restringir acceso.</span></li>
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-[var(--accent-emerald)]">settings_applications</span><span>Configuración general del sistema (uso exclusivo del Administrador).</span></li>
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-[var(--accent-emerald)]">category</span><span>Configuración dinámica de <b>Área</b> y <b>Categoría</b> (Trabajo, Personal, Sistema, Otros...).</span></li>
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-[var(--accent-emerald)]">auto_awesome</span><span>Adaptable sin cambios técnicos complejos.</span></li>
          </ul>
        </div>
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-white/[0.04] p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-sky-400">person</span>
            <h3 class="text-xl font-bold text-white">Módulo Usuario</h3>
          </div>
          <ul class="space-y-3 text-gray-300">
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-sky-400">note_add</span><span>Ingresar actividades pendientes.</span></li>
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-sky-400">edit</span><span>Editar únicamente sus propias actividades.</span></li>
            <li class="flex items-start gap-3"><span class="material-symbols-outlined text-sky-400">block</span><span>Sin permiso para eliminar ni acceder a configuraciones generales.</span></li>
          </ul>
        </div>
      </div>

      <!-- Gestión de tiempos y alertas -->
      <div class="px-6 sm:px-8 md:px-10 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-white/[0.04] p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-amber-400">update</span>
            <h3 class="text-xl font-bold text-white">Tareas de largo plazo</h3>
          </div>
          <p class="text-gray-300">Tareas rutinarias o periódicas con generación de alertas programadas y recordatorios anticipados.
          Se puede configurar la anticipación (por ejemplo, 7/3/1 días antes).</p>
        </div>
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-white/[0.04] p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-pink-400">flash_on</span>
            <h3 class="text-xl font-bold text-white">Tareas de corto plazo</h3>
          </div>
          <p class="text-gray-300">Acciones inmediatas (por ejemplo, de una hora). El sistema evalúa si requiere alertas instantáneas o
          notificaciones activas según la ventana de tiempo configurada.</p>
        </div>
      </div>

      <!-- Interactive gallery (images/illustrations) -->
      <div class="px-6 sm:px-8 md:px-10 mt-6">
        <h3 class="text-lg font-semibold text-white mb-3">Vistas Interactivas</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button type="button" *ngFor="let v of views; let i = index" (click)="openModal(i)" class="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white/[0.04] aspect-video">
            <div class="absolute inset-0 bg-gradient-to-br" [ngClass]="v.bg"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <span class="material-symbols-outlined text-white/90 text-4xl block mb-2">{{ v.icon }}</span>
                <p class="text-white font-semibold text-lg">{{ v.title }}</p>
                <p class="text-gray-200/80 text-sm">{{ v.subtitle }}</p>
              </div>
            </div>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
          </button>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <div *ngIf="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div class="relative w-full max-w-4xl">
          <div class="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-white/[0.04]">
            <div class="relative aspect-video">
              <div class="absolute inset-0 bg-gradient-to-br" [ngClass]="views[selectedIndex].bg"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <span class="material-symbols-outlined text-white/90 text-5xl block mb-2">{{ views[selectedIndex].icon }}</span>
                  <p class="text-white font-semibold text-2xl">{{ views[selectedIndex].title }}</p>
                  <p class="text-gray-200/80 mt-1">{{ views[selectedIndex].subtitle }}</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-soft)]">
              <p class="text-gray-400 text-sm">Vista demostrativa. Reemplazable por capturas o ilustraciones reales.</p>
              <button (click)="closeModal()" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-white/90 hover:bg-white/10">
                <span class="material-symbols-outlined">close</span>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class InfoComponent {
  intranetOpen = false;
  modalOpen = false;
  selectedIndex = 0;

  views = [
    { title: 'Panel de Agenda', subtitle: 'Tareas por prioridad y estado', icon: 'calendar_month', bg: 'from-[var(--accent-emerald)]/50 to-sky-500/40' },
    { title: 'Dashboard de Indicadores', subtitle: 'KPIs y tendencias', icon: 'insights', bg: 'from-indigo-500/50 to-fuchsia-500/40' },
    { title: 'Alertas y Notificaciones', subtitle: 'Eventos críticos y próximos vencimientos', icon: 'notifications', bg: 'from-amber-400/50 to-rose-500/40' },
  ];

  @HostListener('document:click') onDocClick() {
    this.intranetOpen = false;
  }

  toggleIntranet() {
    this.intranetOpen = !this.intranetOpen;
  }

  closeIntranet() {
    this.intranetOpen = false;
  }

  openModal(index: number) {
    this.selectedIndex = index;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }
}
