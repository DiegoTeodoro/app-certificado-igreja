import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export type StatusParticipante = 'ATIVO' | 'INATIVO';

export interface ParticipanteListItem {
  codigo: number;
  nomeCompleto: string;
  cpf?: string | null;
}

export interface ParticipanteBuscaResponse {
  codigo: number;
  nomeCompleto: string;
}

export interface ParticipanteRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  igreja: string;
  dataCadastro: string; // "YYYY-MM-DD" (input type="date" já manda assim)
  status: StatusParticipante;
  telefone1: string;
  telefone2?: string | null;
  observacoes?: string | null;
}

export interface ParticipanteResponse {
  codigo: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipanteService {
  private readonly baseUrl = 'http://localhost:3000/api/participantes';

  constructor(private http: HttpClient) {}

  /**
   * Salva um participante no banco (POST /api/participantes)
   */
  create(payload: ParticipanteRequest): Observable<ParticipanteResponse> {
    // pequena normalização (evita salvar "" no banco)
    const body: ParticipanteRequest = {
      ...payload,
      cpf: payload.cpf?.trim(),
      email: payload.email?.trim(),
      igreja: payload.igreja?.trim(),
      nomeCompleto: payload.nomeCompleto?.trim(),
      telefone1: payload.telefone1?.trim(),
      telefone2: payload.telefone2?.trim() ? payload.telefone2.trim() : null,
      observacoes: payload.observacoes?.trim() ? payload.observacoes.trim() : null,
    };

    return this.http.post<ParticipanteResponse>(this.baseUrl, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      // Aqui você pode adaptar pro formato que sua API devolve (message, errors, etc.)
      const apiMsg =
        (err.error && (err.error.message || err.error.mensagem)) ||
        'Erro ao salvar participante.';

      return throwError(() => new Error(apiMsg));
    }

    return throwError(() => new Error('Erro inesperado.'));
  }

  listar(q: string): Observable<ParticipanteListItem[]> {
  return this.http.get<ParticipanteListItem[]>(`${this.baseUrl}?q=${encodeURIComponent(q)}`);
}

buscarPorNome(nome: string): Observable<ParticipanteBuscaResponse> {
  return this.http.get<ParticipanteBuscaResponse>(
    `${this.baseUrl}/buscar`,
    { params: { nome } }
  );
}

}
