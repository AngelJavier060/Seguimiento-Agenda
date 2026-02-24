import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, filter, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'ADMIN' | 'USER';
export interface AuthUser {
  username: string;
  email: string;
  role: UserRole;
  nombre?: string;
  apellido?: string;
}

interface StoredAuth {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly userSig = signal<AuthUser | null>(null);
  private token: string | null = null;
  private inactivityTimer: any = null;
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000;
  private readonly initializedSubject = new BehaviorSubject<boolean>(false);
  
  initialized$ = this.initializedSubject.asObservable();

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
    this.restoreSession();
    this.setupInactivityTracking();
    this.setupStorageSync();
  }

  private restoreSession() {
    const token = localStorage.getItem(this.tokenKey);
    const storedUser = this.getStoredUser();
    if (token && storedUser) {
      this.token = token;
      this.userSig.set(storedUser);
      this.initializedSubject.next(true);
      this.me().subscribe({
        next: (u) => {
          this.userSig.set(u);
          this.saveUser(u);
        },
        error: (err) => {
          if (err?.status === 401) {
            this.logout();
          }
        }
      });
    } else {
      this.initializedSubject.next(true);
    }
  }

  private setupInactivityTracking() {
    if (typeof window === 'undefined') return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const resetTimer = () => {
      if (this.isLoggedIn()) {
        this.resetInactivityTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    this.resetInactivityTimer();
  }

  private setupStorageSync() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event: StorageEvent) => {
      // Solo reaccionar a cambios relacionados con autenticación
      if (event.key && event.key !== this.tokenKey && event.key !== this.userKey) return;

      const newToken = localStorage.getItem(this.tokenKey);
      const newUser = this.getStoredUser();

      // Sincronizar el estado local con lo que haya en localStorage
      this.token = newToken;
      this.userSig.set(newUser);

      // Si otra pestaña cerró sesión (token o usuario nulos),
      // redirigir suavemente a login, sin volver a tocar localStorage
      if (!newToken || !newUser) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    });
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      if (this.isLoggedIn()) {
        this.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }, this.INACTIVITY_TIMEOUT);
  }

  login(usernameOrEmail: string, password: string) {
    return this.http.post<{ token: string; username: string; email: string; role: UserRole; nombre?: string; apellido?: string }>(`${this.api}/login`, {
      usernameOrEmail,
      password,
    }).pipe(
      tap(res => {
        localStorage.clear();
        const user = { username: res.username, email: res.email, role: res.role, nombre: res.nombre, apellido: res.apellido };
        this.token = res.token;
        this.setToken(res.token);
        this.saveUser(user);
        this.userSig.set(user);
        this.resetInactivityTimer();
      })
    );
  }

  me() {
    return this.http.get<AuthUser>(`${this.api}/me`).pipe(
      tap(u => {
        this.userSig.set(u);
        this.saveUser(u);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token = null;
    this.userSig.set(null);
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  waitForInitialization(): Observable<boolean> {
    return this.initialized$.pipe(
      filter(initialized => initialized),
      take(1)
    );
  }

  getToken(): string | null {
    return this.token;
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  private saveUser(user: AuthUser) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getStoredUser(): AuthUser | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }
}
