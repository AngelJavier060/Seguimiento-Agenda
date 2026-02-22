import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

export type UserRole = 'ADMIN' | 'USER';
export interface AuthUser {
  username: string;
  email: string;
  role: UserRole;
  nombre?: string;
  apellido?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userSig = signal<AuthUser | null>(null);

  user = computed(() => this.userSig());
  isLoggedIn = computed(() => !!this.userSig());
  isAdmin = computed(() => this.userSig()?.role === 'ADMIN');

  /** Nombre completo del usuario para mostrar en la UI */
  displayName = computed(() => {
    const u = this.userSig();
    if (!u) return '';
    if (u.nombre || u.apellido) return ((u.nombre || '') + ' ' + (u.apellido || '')).trim();
    return u.username;
  });

  private api = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.me().subscribe({
        next: (u) => this.userSig.set(u),
        error: () => this.logout()
      });
    }
  }

  login(usernameOrEmail: string, password: string) {
    return this.http.post<{ token: string; username: string; email: string; role: UserRole; nombre?: string; apellido?: string }>(`${this.api}/login`, {
      usernameOrEmail,
      password,
    }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.userSig.set({ username: res.username, email: res.email, role: res.role, nombre: res.nombre, apellido: res.apellido });
      })
    );
  }

  me() {
    return this.http.get<AuthUser>(`${this.api}/me`).pipe(
      tap(u => this.userSig.set(u))
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSig.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }
}
