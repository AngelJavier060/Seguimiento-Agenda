import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">

  <nav class="fixed top-0 w-full z-50 bg-[#121414]/60 backdrop-blur-3xl">
    <div class="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
      <div class="text-xl font-bold tracking-tighter text-[#e2e2e2] font-headline">
        Improvements Solutions
      </div>
      <div class="hidden md:flex space-x-8 items-center">
        <a class="font-headline tracking-tight font-semibold text-[#e2e2e2] opacity-80 hover:opacity-100 transition-opacity hover:text-[#72d6dc]" href="#">Soluciones</a>
        <a class="font-headline tracking-tight font-semibold text-[#e2e2e2] opacity-80 hover:opacity-100 transition-opacity hover:text-[#72d6dc]" href="#">Precios</a>
        <a class="font-headline tracking-tight font-semibold text-[#e2e2e2] opacity-80 hover:opacity-100 transition-opacity hover:text-[#72d6dc]" routerLink="/info">Recursos</a>
        <a class="font-headline tracking-tight font-semibold text-[#e2e2e2] opacity-80 hover:opacity-100 transition-opacity hover:text-[#72d6dc]" href="#contacto">Contacto</a>
      </div>

      <div class="flex items-center gap-4 relative" (click)="$event.stopPropagation()">
        <button (click)="toggleIntranet()" class="px-6 py-2 rounded-full font-headline font-semibold text-sm transition-transform scale-95 active:scale-90 bg-primary-container text-on-primary-container">
          Intranet
        </button>

        <div *ngIf="intranetOpen" class="absolute right-0 top-full mt-3 w-60 rounded-xl bg-surface-container-high border border-outline-variant/20 shadow-2xl overflow-hidden">
          <a routerLink="/login" (click)="closeIntranet()" class="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-highest transition-colors">
            <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">shield_person</span>
            <div class="flex flex-col">
              <span class="font-headline font-bold text-on-surface">Administrador</span>
              <span class="text-xs text-on-surface-variant">Gestión de sistema</span>
            </div>
          </a>
          <a routerLink="/login" (click)="closeIntranet()" class="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-highest transition-colors">
            <span class="material-symbols-outlined text-primary">person</span>
            <div class="flex flex-col">
              <span class="font-headline font-bold text-on-surface">Usuarios</span>
              <span class="text-xs text-on-surface-variant">Panel de actividades</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </nav>

  <main>
    <section class="relative pt-32 pb-20 overflow-hidden bg-surface">
      <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 z-10">
          <span class="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase text-primary border border-primary/20 rounded-full">
            Enterprise Efficiency
          </span>
          <h1 class="text-5xl lg:text-[3.5rem] leading-[1.1] font-headline font-extrabold tracking-tight text-on-surface mb-8">
            Optimiza tu rendimiento y <span class="hero-gradient-text">toma el control</span> de tus actividades
          </h1>
          <p class="text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            Una plataforma profesional diseñada para el seguimiento preciso, alertas inteligentes y la mejora continua de tus procesos corporativos. Todo en un solo lugar con Improvements Solutions.
          </p>
          <div class="flex flex-wrap gap-4">
            <a routerLink="/agenda" class="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/10">
              Comenzar ahora
            </a>
            <a routerLink="/dashboard" class="px-8 py-4 border border-outline-variant/40 hover:bg-surface-container-high text-on-surface font-bold rounded-full transition-all active:scale-95">
              Ver Demo
            </a>
          </div>
        </div>
        <div class="lg:col-span-5 relative">
          <div class="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
          <div class="relative aspect-square rounded-xl overflow-hidden shadow-2xl">
            <img class="w-full h-full object-cover mask-fade-bottom" alt="Modern 3D render of a minimalist glass architectural structure with sharp edges and subtle teal reflections on a dark studio background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHmD5kh9sKFLcjWw8Ov1_sFw_7aKjFFGBv_gQofwVAKRFh1oBdvk3DwOKwhMrV26boynagIyJ6iOnN_68MpPFbQ_jB2E3O742kA_XLxoG4Fn4Uhns5DtPa0LZok6wPYKNpY_OXV0Iu5wcMKmBvcphZhgxqbmgbOVfi6cMkFJwfv5lA-6pJbRpuww6JIOuUplv_HaVaMaxqMPmUqknbWLvc_O5LLg-ErM7pHv7_MHW9tMkWXYaxymqOj0dDSxUkqBZqSAoKB3ammlbQ"/>
          </div>
        </div>
      </div>
    </section>

    <section class="py-32 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-8">
        <div class="mb-20">
          <span class="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Capacidades</span>
          <h2 class="text-4xl font-headline font-extrabold text-on-surface tracking-tight max-w-2xl">
            Herramientas diseñadas para equipos de alto desempeño
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="group p-8 rounded-xl bg-surface-container-high transition-all duration-300 hover:bg-surface-container-highest hover:-translate-y-2 border border-outline-variant/10">
            <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-2xl">notifications_active</span>
            </div>
            <h3 class="text-xl font-headline font-bold text-on-surface mb-4">Recordatorios</h3>
            <p class="text-on-surface-variant leading-relaxed text-sm">
              Nunca pierdas una fecha límite con nuestro sistema de notificaciones inteligentes y programables.
            </p>
          </div>
          <div class="group p-8 rounded-xl bg-surface-container-high transition-all duration-300 hover:bg-surface-container-highest hover:-translate-y-2 border border-outline-variant/10">
            <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 class="text-xl font-headline font-bold text-on-surface mb-4">Avisos y Alertas</h3>
            <p class="text-on-surface-variant leading-relaxed text-sm">
              Recibe alertas críticas en tiempo real a través de múltiples canales ante cualquier eventualidad del sistema.
            </p>
          </div>
          <div class="group p-8 rounded-xl bg-surface-container-high transition-all duration-300 hover:bg-surface-container-highest hover:-translate-y-2 border border-outline-variant/10">
            <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-2xl">data_exploration</span>
            </div>
            <h3 class="text-xl font-headline font-bold text-on-surface mb-4">Seguimiento</h3>
            <p class="text-on-surface-variant leading-relaxed text-sm">
              Monitorea el progreso de cada actividad con registros detallados y trazabilidad completa de acciones.
            </p>
          </div>
          <div class="group p-8 rounded-xl bg-surface-container-high transition-all duration-300 hover:bg-surface-container-highest hover:-translate-y-2 border border-outline-variant/10">
            <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container-lowest text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <h3 class="text-xl font-headline font-bold text-on-surface mb-4">Mejora Continua</h3>
            <p class="text-on-surface-variant leading-relaxed text-sm">
              Analiza KPIs históricos para identificar cuellos de botella y optimizar el rendimiento de tu equipo.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-32 bg-surface">
      <div class="max-w-7xl mx-auto px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
          <div class="lg:col-span-8 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between overflow-hidden relative group">
            <div class="relative z-10">
              <h3 class="text-3xl font-headline font-bold text-on-surface mb-4">Visualización Integral</h3>
              <p class="text-on-surface-variant max-w-md">Una interfaz diseñada para la claridad absoluta, reduciendo la carga cognitiva y maximizando la toma de decisiones.</p>
            </div>
            <div class="relative mt-12 lg:mt-0 lg:absolute lg:right-0 lg:bottom-0 w-full lg:w-3/4">
              <img class="rounded-tl-xl shadow-2xl transition-transform group-hover:scale-105 duration-700" alt="High-tech data dashboard with glowing neon blue lines, minimalist graphs, and digital metrics on a dark glass surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-lTyrWCa8Q2pMTpkMgVgg3JuBlw58ZTKl4EgVclvyJtY9Uj2b2mw1c8sljzGKKi2aeqks2N_nFciR99jAPjfylxOmsjQPAQvqrjf6bZqytBsATf9fLI3AmKmIgcGhlLPpc0M7fn4lXVjynVMZsvugke-LuQ5gySR7vBPnqDt_3FqBaIw-w93ICL283qVub0YjnGo1mMR1GyFps6JMajF-eOVN0-bsGSa9QHRREhdbF4s0JbVu7aPOvvBTDtBQgB0lUERaUXYjwUmo"/>
            </div>
          </div>
          <div class="lg:col-span-4 grid grid-rows-2 gap-6">
            <div class="bg-primary-container text-on-primary-container p-8 rounded-xl flex flex-col justify-center">
              <span class="material-symbols-outlined text-4xl mb-4" style="font-variation-settings: 'FILL' 1;">verified_user</span>
              <h4 class="text-xl font-bold font-headline mb-2">Seguridad Grado Enterprise</h4>
              <p class="text-sm opacity-80">Encriptación de punto a punto y protocolos de seguridad de nivel bancario.</p>
            </div>
            <div class="bg-surface-container-high p-8 rounded-xl flex flex-col justify-center border border-outline-variant/10">
              <h4 class="text-3xl font-bold font-headline text-primary mb-1">99.9%</h4>
              <p class="text-on-surface font-semibold mb-2">Uptime Garantizado</p>
              <p class="text-on-surface-variant text-sm">Disponibilidad crítica para operaciones globales sin interrupciones.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer id="contacto" class="w-full py-12 border-t border-[#3e4949]/15 bg-[#0d0f0f]">
    <div class="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
      <div class="flex flex-col items-center md:items-start gap-4">
        <div class="text-lg font-bold text-[#e2e2e2] opacity-50 font-headline">
          Improvements Solutions
        </div>
        <p class="text-[#e2e2e2]/60 font-body text-sm text-center md:text-left">
          © 2026 Improvements Solutions. All rights reserved.
        </p>
      </div>

      <div class="flex gap-8 flex-wrap justify-center">
        <a class="text-[#e2e2e2]/60 hover:text-[#72d6dc] transition-colors font-body text-sm" href="#">Privacidad</a>
        <a class="text-[#e2e2e2]/60 hover:text-[#72d6dc] transition-colors font-body text-sm" href="#">Términos</a>
        <a class="text-[#e2e2e2]/60 hover:text-[#72d6dc] transition-colors font-body text-sm" href="#">Cookies</a>
        <a class="text-[#e2e2e2]/60 hover:text-[#72d6dc] transition-colors font-body text-sm" href="mailto:improvementsolutionsqhse&#64;gmail.com">improvementsolutionsqhse&#64;gmail.com</a>
        <a class="text-[#e2e2e2]/60 hover:text-[#72d6dc] transition-colors font-body text-sm" href="https://wa.me/593962337363" target="_blank" rel="noopener noreferrer">WhatsApp 0962337363</a>
      </div>

      <div class="flex gap-4">
        <a class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="mailto:improvementsolutionsqhse&#64;gmail.com">
          <span class="material-symbols-outlined text-xl">mail</span>
        </a>
        <a class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="https://wa.me/593962337363" target="_blank" rel="noopener noreferrer">
          <span class="material-symbols-outlined text-xl">chat</span>
        </a>
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
