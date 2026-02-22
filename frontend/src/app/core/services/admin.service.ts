import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminKpis {
  totalUsuarios: number;
  admins: number;
  usuarios: number;
  actividadesTotal: number;
  actividadesPendientes: number;
  actividadesCompletadas: number;
  actividadesVencidas: number;
  alertasTotal: number;
  alertasHabilitadas: number;
  telegramActivo: boolean;
}

export interface SystemConfig {
  id: number;
  systemName: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  kpis(): Observable<AdminKpis> {
    return this.http.get<AdminKpis>(`${this.api}/admin/kpis`);
  }

  getSystemConfig(): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.api}/system/config`);
  }

  saveSystemConfig(cfg: SystemConfig): Observable<SystemConfig> {
    return this.http.put<SystemConfig>(`${this.api}/system/config`, cfg);
  }
}
