import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

export type UserRole = 'ADMIN' | 'USER';
export interface AuthUser {
  username: string;
  email: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userSig = signal<AuthUser | null>(null);

  user = computed(() => this.userSig());
  isLoggedIn = computed(() => !!this.userSig());
  isAdmin = computed(() => this.userSig()?.role === 'ADMIN');

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
    return this.http.post<{ token: string; username: string; email: string; role: UserRole }>(`${this.api}/login`, {
      usernameOrEmail,
      password,
    }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.userSig.set({ username: res.username, email: res.email, role: res.role });
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
