import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Actividad, ActividadRequest, Estadisticas } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ActividadService {
    private url = `${environment.apiUrl}/actividades`;

    constructor(private http: HttpClient) { }

    /** Listar actividades del usuario autenticado */
    listar(): Observable<Actividad[]> {
        return this.http.get<Actividad[]>(this.url);
    }

    /** Admin: listar TODAS las actividades de todos los usuarios */
    listarTodas(): Observable<Actividad[]> {
        return this.http.get<Actividad[]>(`${this.url}/todas`);
    }

    /** Stats del usuario autenticado */
    estadisticas(): Observable<Estadisticas> {
        return this.http.get<Estadisticas>(`${this.url}/stats`);
    }

    /** Admin: stats globales */
    estadisticasGlobales(): Observable<Estadisticas> {
        return this.http.get<Estadisticas>(`${this.url}/stats/todas`);
    }

    /** Exportar actividades del usuario autenticado filtradas por estado en Excel */
    exportarExcel(estado: 'all'|'done'|'pending') {
        return this.http.get(`${this.url}/export/excel`, { responseType: 'blob', params: { estado } });
    }

    /** Exportar actividades del usuario autenticado filtradas por estado en PDF */
    exportarPdf(estado: 'all'|'done'|'pending') {
        return this.http.get(`${this.url}/export/pdf`, { responseType: 'blob', params: { estado } });
    }

    crear(req: ActividadRequest): Observable<Actividad> {
        return this.http.post<Actividad>(this.url, req);
    }

    actualizar(id: number, req: ActividadRequest): Observable<Actividad> {
        return this.http.put<Actividad>(`${this.url}/${id}`, req);
    }

    completar(id: number): Observable<Actividad> {
        return this.http.put<Actividad>(`${this.url}/${id}/completar`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}
