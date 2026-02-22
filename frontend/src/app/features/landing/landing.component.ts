import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
    <!-- Header -->
    <header class="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <div class="bg-primary p-1.5 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-xl">query_stats</span>
            </div>
            <span class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Improvements Solutions</span>
          </div>

          <nav class="hidden md:flex space-x-8">
            <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="#">Soluciones</a>
            <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="#">Precios</a>
            <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" routerLink="/info">Recursos</a>
            <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="#">Contacto</a>
          </nav>

          <div class="relative" (click)="$event.stopPropagation()">
            <button (click)="toggleIntranet()" class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
              <span class="material-symbols-outlined text-[20px]">vpn_lock</span>
              <span>Intranet</span>
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div *ngIf="intranetOpen" class="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 dark:divide-slate-800">
              <div class="py-1">
                <a routerLink="/login" (click)="closeIntranet()" class="flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span class="material-symbols-outlined mr-3 text-primary" style="font-variation-settings: 'FILL' 1;">shield_person</span>
                  <div class="flex flex-col">
                    <span class="font-bold">Administrador</span>
                    <span class="text-xs text-slate-500">Gestión de sistema</span>
                  </div>
                </a>
                <a routerLink="/login" (click)="closeIntranet()" class="flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span class="material-symbols-outlined mr-3 text-primary">person</span>
                  <div class="flex flex-col">
                    <span class="font-bold">Usuarios</span>
                    <span class="text-xs text-slate-500">Panel de actividades</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-grow">
      <!-- Hero -->
      <section class="relative py-20 lg:py-32 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="max-w-2xl">
              <div class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 mb-6">Nuevas actualizaciones disponibles v2.4</div>
              <h1 class="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6">Optimiza tu rendimiento y toma el control de tus actividades</h1>
              <p class="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">Una plataforma profesional diseñada para el seguimiento preciso, alertas inteligentes y la mejora continua de tus procesos corporativos. Todo en un solo lugar con Improvements Solutions.</p>
              <div class="flex flex-wrap gap-4">
                <a routerLink="/agenda" class="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                  Comenzar ahora
                  <span class="material-symbols-outlined">arrow_forward</span>
                </a>
                <a routerLink="/dashboard" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  Ver Demo
                </a>
              </div>
            </div>
            <div class="relative">
              <div class="absolute -top-12 -left-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
              <div class="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/40 rounded-full blur-3xl opacity-20"></div>
              <div class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC72CqtIgQHRmAVlxiO8xqyKcNi1grypOZWOR_VSdjIHIC3uiox_u1y0_VzPp0nS8NehyaJBAOHuhpI6JukNUSa9xm4QKl9Fi_y9QfF5nA38k1uWBoT5XIXTh9VXJzvlCqS6vLYN4AFTKlHMJiqYMqZfSlrvm4-iD6PUL2vfGI5xb95XRJmUJJplTafHUoA7YN97Ki8TItL8gnghkmpulJhizJ0b_-Xfb_uRNlaojlT1v2Mhrmmxh-R4P-5j6x8MTPQJvopeV6UuJTJ" alt="Plataforma de análisis" class="w-full h-auto object-cover"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Solutions -->
      <section class="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-primary font-bold tracking-wider uppercase text-sm mb-3">Soluciones Inteligentes</h2>
            <h3 class="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Herramientas diseñadas para equipos de alto desempeño</h3>
            <p class="text-slate-600 dark:text-slate-400">Nuestra suite incluye todo lo necesario para monitorear, alertar y mejorar la eficiencia operativa de tu organización.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span class="material-symbols-outlined text-primary group-hover:text-white text-3xl">event_upcoming</span>
              </div>
              <h4 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Recordatorios</h4>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Nunca pierdas una fecha límite con nuestro sistema de notificaciones inteligentes y programables.</p>
            </div>

            <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span class="material-symbols-outlined text-primary group-hover:text-white text-3xl">notification_important</span>
              </div>
              <h4 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Avisos y Alertas</h4>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Recibe alertas críticas en tiempo real a través de múltiples canales ante cualquier eventualidad del sistema.</p>
            </div>

            <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span class="material-symbols-outlined text-primary group-hover:text-white text-3xl">analytics</span>
              </div>
              <h4 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Seguimiento de Actividades</h4>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Monitorea el progreso de cada actividad con registros detallados y trazabilidad completa de acciones.</p>
            </div>

            <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span class="material-symbols-outlined text-primary group-hover:text-white text-3xl">trending_up</span>
              </div>
              <h4 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Mejora Continua</h4>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Analiza KPIs históricos para identificar cuellos de botella y optimizar el rendimiento de tu equipo.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Visuals & bullets -->
      <section class="py-20 bg-white dark:bg-background-dark">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="w-full lg:w-1/2 order-2 lg:order-1">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-4">
                  <div class="rounded-2xl overflow-hidden shadow-lg h-64">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoInyOL2z_3qTLXJEcFd7Wtj0YqFQcScclBu7HoBBMn6UASnNEPeQ3QZ30GrpRGsGIKJE2LTmVqlx3azWCP_4S7y3BxKM7dJdEe6lFRl_xeqlrN_RJpEXhBLUXunxhACuNe4SJ5WtnPN3ovOOuIABkcRshPB-WJCPbJoaS34Fi2zwuviAWQ2_f4WURqgXGbmfDdDk0wekYUmF0KhDsCfAkz6_Z6TkuRn7lIHbsGu86piPcwebsb6D18Zh2EzRIBUYv-BOqMqsDGRPq" alt="Tech Pattern 1" class="w-full h-full object-cover"/>
                  </div>
                  <div class="rounded-2xl overflow-hidden shadow-lg h-48 bg-primary/20 p-8 flex flex-col justify-end">
                    <span class="text-4xl font-extrabold text-primary">99.9%</span>
                    <span class="text-slate-600 font-medium">Uptime del sistema</span>
                  </div>
                </div>
                <div class="space-y-4 mt-8">
                  <div class="rounded-2xl overflow-hidden shadow-lg h-48 bg-slate-900 p-8 flex flex-col justify-end">
                    <span class="text-4xl font-extrabold text-white">+5k</span>
                    <span class="text-slate-300 font-medium">Usuarios activos</span>
                  </div>
                  <div class="rounded-2xl overflow-hidden shadow-lg h-64">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYGot2-B0q-i10JPVVYu0_IXkpb4eP7I7Mn2XQlK8qgqoeOPCs6er9jzTXa9ipE1E6Cwk7KWphu7CGMTliQ-Tf4rnLQIe5XJHkSfDqRbFb8-Slh0g2isYZRdZq4PFqubd9uuNTBWKwtZ8dKAlc8zq0zN0zlf6Hl4olJ0TJ7LysThK-wWT5fNCoxQUo9RCUUAJy_qi8RB9u8lIA0ZUXfBK8NCxOYexmZMNUFbrOQe654HX76A5ZwQ40zl7bLmtdFebO_HM-Pf8VerGL" alt="Colaboración" class="w-full h-full object-cover"/>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full lg:w-1/2 order-1 lg:order-2">
              <h3 class="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Visualiza el éxito de tus operaciones</h3>
              <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">Nuestra interfaz intuitiva permite que tanto administradores como usuarios finales puedan operar sin fricciones, asegurando una adopción rápida en toda la compañía.</p>
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-primary font-bold">check_circle</span>
                  <span class="font-medium text-slate-700 dark:text-slate-200">Seguridad de grado empresarial para tus datos</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-primary font-bold">check_circle</span>
                  <span class="font-medium text-slate-700 dark:text-slate-200">Personalización completa de alertas por departamento</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-primary font-bold">check_circle</span>
                  <span class="font-medium text-slate-700 dark:text-slate-200">API robusta para integración con sistemas existentes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-8">
          <div class="flex items-center gap-2">
            <div class="bg-slate-200 dark:bg-slate-800 p-1.5 rounded flex items-center justify-center">
              <span class="material-symbols-outlined text-slate-700 dark:text-slate-400 text-sm">query_stats</span>
            </div>
            <span class="font-bold text-slate-900 dark:text-white">Improvements Solutions</span>
          </div>
          <p class="text-slate-500 text-sm">© 2026 Improvements Solutions. Todos los derechos reservados.</p>
          <div class="flex gap-6 text-slate-500">
            <a href="#" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">public</span></a>
            <a href="#" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">shield</span></a>
            <a href="#" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">description</span></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
  `,
})
export class LandingComponent {
  intranetOpen = false;

  @HostListener('document:click') onDocClick() {
    this.intranetOpen = false;
  }

  toggleIntranet() {
    this.intranetOpen = !this.intranetOpen;
  }

  closeIntranet() {
    this.intranetOpen = false;
  }
}
