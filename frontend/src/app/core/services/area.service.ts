import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AreaCategoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private api = `${environment.apiUrl}/areas`;
  constructor(private http: HttpClient) {}

  listar(): Observable<AreaCategoria[]> { return this.http.get<AreaCategoria[]>(this.api); }
  crear(nombre: string): Observable<AreaCategoria> { return this.http.post<AreaCategoria>(this.api, { nombre }); }
  actualizar(id: number, nombre: string): Observable<AreaCategoria> { return this.http.put<AreaCategoria>(`${this.api}/${id}`, { nombre }); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
