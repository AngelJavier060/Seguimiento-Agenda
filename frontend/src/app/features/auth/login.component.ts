import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-[var(--bg-deep)] text-slate-100 p-4">
    <div class="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-white/5 p-6 shadow-2xl">
      <div class="flex items-center gap-2 mb-6">
        <div class="bg-[var(--accent-emerald)] p-1.5 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-xl">vpn_lock</span>
        </div>
        <h1 class="text-xl font-extrabold tracking-tight">Acceso a Intranet</h1>
      </div>

      <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Usuario o Correo</label>
          <input name="usernameOrEmail" [(ngModel)]="usernameOrEmail" required type="text" class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-emerald)]" placeholder="ej: Javier o usuario@dominio.com"/>
        </div>
        <div>
          <label class="block text-sm mb-1">Contraseña</label>
          <input name="password" [(ngModel)]="password" required type="password" class="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-emerald)]" placeholder="••••••••"/>
        </div>

        <button [disabled]="loading || !f.valid" class="w-full bg-[var(--accent-emerald)] hover:brightness-110 text-white px-4 py-3 rounded-xl font-bold transition">
          <span class="material-symbols-outlined align-middle mr-1" *ngIf="!loading">login</span>
          <span *ngIf="loading" class="material-symbols-outlined align-middle mr-1 animate-spin">progress_activity</span>
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="text-xs text-gray-400 mt-4 text-center">
        ¿Volver al inicio público?
        <a routerLink="/landing" class="text-white underline underline-offset-4 hover:no-underline">Landing</a>
      </p>

      <p *ngIf="error" class="text-sm text-red-400 mt-3">{{ error }}</p>
    </div>
  </div>
  `
})
export class LoginComponent {
  usernameOrEmail = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.usernameOrEmail, this.password).subscribe({
      next: () => {
        const admin = this.auth.isAdmin();
        // Admin a configuración, usuario a agenda
        this.router.navigate([admin ? '/admin/config' : '/agenda']);
      },
      error: (e) => {
        this.error = 'Credenciales inválidas';
        this.loading = false;
      }
    });
  }
}
