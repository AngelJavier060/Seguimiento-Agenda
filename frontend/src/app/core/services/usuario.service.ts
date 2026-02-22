import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type UserRole = 'ADMIN' | 'USER';

export interface UsuarioDto {
  id: number;
  nombre?: string;
  apellido?: string;
  username: string;
  email: string;
  telefono?: string;
  role: UserRole;
  passwordMasked: string;
}

export interface UsuarioRequest {
  nombre?: string;
  apellido?: string;
  username: string;
  email: string;
  telefono?: string;
  role?: UserRole;
  password?: string; // optional on update
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = environment.apiUrl + '/usuarios';
  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(this.api);
  }

  crear(req: UsuarioRequest): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(this.api, req);
  }

  actualizar(id: number, req: UsuarioRequest): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.api}/${id}`, req);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
