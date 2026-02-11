import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LancamentoCreateRequest {
  curso_id: number;
  participante_codigo: number;
  instrutor: string;
  data_realizacao: string;  // "YYYY-MM-DD"
  data_vencimento: string;  // "YYYY-MM-DD"
  descricao?: string | null;
}

export interface LancamentoCreateResponse {
  codigo: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly apiUrl = `${this.baseUrl}/api/lancamentos`;

  constructor(private http: HttpClient) {}

  criarLancamento(payload: LancamentoCreateRequest): Observable<LancamentoCreateResponse> {
    return this.http.post<LancamentoCreateResponse>(this.apiUrl, payload);
  }

  // ✅ UPLOAD do anexo (multipart/form-data)
  uploadAnexo(lancamentoCodigo: number, formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${lancamentoCodigo}/anexos`,
      formData
    );
  }

  // (opcional) listar, buscar por id, etc.
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorId(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${codigo}`);
  }

  deletar(codigo: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${codigo}`);
  }

  atualizar(codigo: number, payload: Partial<LancamentoCreateRequest>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${codigo}`, payload);
  }
}
