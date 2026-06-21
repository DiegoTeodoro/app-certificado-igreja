import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  usuario: {
    id: number;
    login: string;
    status: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = 'http://localhost:3000/api/login';

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.baseUrl,
      payload
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  salvarSessao(usuario: any): void {
    localStorage.setItem(
      'usuarioLogado',
      JSON.stringify(usuario)
    );
  }

  obterUsuarioLogado(): any {
    const usuario = localStorage.getItem('usuarioLogado');

    return usuario
      ? JSON.parse(usuario)
      : null;
  }

  estaLogado(): boolean {
    return !!localStorage.getItem('usuarioLogado');
  }

  logout(): void {
    localStorage.removeItem('usuarioLogado');
  }

  private handleError(err: unknown) {

    if (err instanceof HttpErrorResponse) {

      const mensagem =
        err.error?.message ||
        'Erro ao realizar login.';

      return throwError(
        () => new Error(mensagem)
      );
    }

    return throwError(
      () => new Error('Erro inesperado.')
    );
  }
}