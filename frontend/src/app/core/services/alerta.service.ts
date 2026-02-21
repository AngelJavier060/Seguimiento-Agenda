import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertaConfig, Notificacion, TelegramConfig } from '../models/models';

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
}
