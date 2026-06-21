import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export type StatusUsuario = 'ATIVO' | 'INATIVO';

export interface UsuarioRequest {
  login: string;
  senha: string;
  status: StatusUsuario;
}

export interface UsuarioResponse {
  id: number;
  message: string;
}

export interface UsuarioListItem {
  id: number;
  login: string;
  senha: string;
  status: StatusUsuario;
  dataCadastro: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly baseUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  cadastrar(payload: UsuarioRequest): Observable<UsuarioResponse> {
    const body: UsuarioRequest = {
      login: payload.login.trim(),
      senha: payload.senha.trim(),
      status: payload.status
    };

    return this.http.post<UsuarioResponse>(this.baseUrl, body)
      .pipe(catchError((err) => this.handleError(err)));
  }

  listar(): Observable<UsuarioListItem[]> {
    return this.http.get<UsuarioListItem[]>(this.baseUrl)
      .pipe(catchError((err) => this.handleError(err)));
  }

  private handleError(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const msg =
        err.error?.message ||
        err.error?.mensagem ||
        'Erro ao processar usuário.';

      return throwError(() => new Error(msg));
    }

    return throwError(() => new Error('Erro inesperado.'));
  }
  
  atualizar(id: number, payload: UsuarioRequest) {
  return this.http.put<UsuarioResponse>(
    `${this.baseUrl}/${id}`,
    payload
  );
}
}