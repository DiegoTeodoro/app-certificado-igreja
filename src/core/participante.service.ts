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

export interface ParticipanteRelatorioItem {
  codigo: number;
  nomeCompleto: string;
  cpf?: string | null;
  email?: string | null;
  igreja: string;
  dataCadastro: string; // YYYY-MM-DD
  status: StatusParticipante;
  telefone1?: string | null;
  telefone2?: string | null;
  observacoes?: string | null;
}

export interface ParticipanteRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  igreja: string;
  dataCadastro: string; // "YYYY-MM-DD"
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
  private readonly relatorioUrl = 'http://localhost:3000/api/relatorios/participantes';

  constructor(private http: HttpClient) {}

  /** POST /api/participantes */
  create(payload: ParticipanteRequest): Observable<ParticipanteResponse> {
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

  /** GET /api/participantes?q= */
  listar(q: string): Observable<ParticipanteListItem[]> {
    return this.http.get<ParticipanteListItem[]>(
      `${this.baseUrl}?q=${encodeURIComponent(q)}`
    );
  }

  /** GET /api/participantes/buscar?nome= */
  buscarPorNome(nome: string): Observable<ParticipanteBuscaResponse> {
    return this.http.get<ParticipanteBuscaResponse>(
      `${this.baseUrl}/buscar`,
      { params: { nome } }
    );
  }

  /** ✅ GET /api/relatorios/participantes?nome=  (sem LIMIT) */
  listarRelatorio(nome: string): Observable<ParticipanteRelatorioItem[]> {
    return this.http.get<ParticipanteRelatorioItem[]>(
      this.relatorioUrl,
      { params: { nome } }
    );
  }

  private handleError(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const apiMsg =
        (err.error && (err.error.message || err.error.mensagem)) ||
        'Erro ao salvar participante.';

      return throwError(() => new Error(apiMsg));
    }

    return throwError(() => new Error('Erro inesperado.'));
  }
}
