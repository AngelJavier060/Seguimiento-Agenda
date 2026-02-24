import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertaConfig, Notificacion, TelegramConfig, TelegramUserConfig } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AlertaService {
    constructor(private http: HttpClient) { }

    listarAlertas(): Observable<AlertaConfig[]> {
        return this.http.get<AlertaConfig[]>(`${environment.apiUrl}/alertas`);
    }

    actualizarAlerta(id: number, habilitada: boolean): Observable<AlertaConfig> {
        return this.http.put<AlertaConfig>(`${environment.apiUrl}/alertas/${id}`, { habilitada });
    }

    listarNotificaciones(): Observable<Notificacion[]> {
        return this.http.get<Notificacion[]>(`${environment.apiUrl}/notificaciones`);
    }
}

@Injectable({ providedIn: 'root' })
export class TelegramService {
    constructor(private http: HttpClient) { }

    getConfig(): Observable<TelegramConfig> {
        return this.http.get<TelegramConfig>(`${environment.apiUrl}/telegram/config`);
    }

    saveConfig(cfg: TelegramConfig): Observable<TelegramConfig> {
        return this.http.put<TelegramConfig>(`${environment.apiUrl}/telegram/config`, cfg);
    }

    testConexion(): Observable<{ exitoso: boolean; mensaje: string }> {
        return this.http.post<{ exitoso: boolean; mensaje: string }>(`${environment.apiUrl}/telegram/test`, {});
    }

    enviarReporte(tipo: string): Observable<{ exitoso: boolean; mensaje: string }> {
        return this.http.post<{ exitoso: boolean; mensaje: string }>(`${environment.apiUrl}/reportes/${tipo}`, {});
    }

    // Configuración de Telegram por usuario
    getUserConfigs(): Observable<TelegramUserConfig[]> {
        return this.http.get<TelegramUserConfig[]>(`${environment.apiUrl}/telegram/usuarios`);
    }

    saveUserConfig(req: { usuarioId: number; phoneNumber?: string; userOrChannel?: string; activo?: boolean }): Observable<TelegramUserConfig> {
        return this.http.post<TelegramUserConfig>(`${environment.apiUrl}/telegram/usuarios`, req);
    }

    deleteUserConfig(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/telegram/usuarios/${id}`);
    }

    updateUserActivo(id: number, activo: boolean): Observable<TelegramUserConfig> {
        return this.http.put<TelegramUserConfig>(`${environment.apiUrl}/telegram/usuarios/${id}/activo`, null, {
            params: { activo: String(activo) }
        });
    }
}
