import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParticipanteRelatorioItem } from './participante.service';

export interface LancamentoCreateRequest {
  curso_id: number;
  participante_codigo: number;
  instrutor: string;
  data_realizacao: string;  // "YYYY-MM-DD"
  data_vencimento: string;  // "YYYY-MM-DD"
  descricao?: string | null;
}

export interface LancamentoAnexo {
  id: number;
  nomeOriginal: string;
  nomeArquivo: string;
  mimeType: string;
  caminho: string;
  uploadedAt: string;
}

export interface LancamentoCreateResponse {
  codigo: number;
  message: string;
}

export interface LancamentoListItem {
  codigo: number;
  cursoId: number;
  nomeCurso: string;
  participanteCodigo: number;
  participanteNome: string;
  instrutor: string;
  dataRealizacao: string;
  dataVencimento: string;
  descricao?: string | null;
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
  
  buscarPorId(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${codigo}`);
  }

  deletar(codigo: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${codigo}`);
  }

 listar(q: string = ''): Observable<LancamentoListItem[]> {
  return this.http.get<LancamentoListItem[]>(this.apiUrl, {
    params: { q }
  });
}

atualizar(codigo: number, payload: Partial<LancamentoCreateRequest> & { usuario_login?: string }): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${codigo}`, payload);
}
  uploadAnexos(lancamentoCodigo: number, formData: FormData) {
  return this.http.post(
    `${this.apiUrl}/${lancamentoCodigo}/anexos`,
    formData
  );
}
listarAnexos(lancamentoCodigo: number): Observable<LancamentoAnexo[]> {
  return this.http.get<LancamentoAnexo[]>(
    `${this.apiUrl}/${lancamentoCodigo}/anexos`
  );
}

urlVisualizarAnexo(id: number): string {
  return `${this.baseUrl}/api/anexos/${id}/visualizar`;
}

urlDownloadAnexo(id: number): string {
  return `${this.baseUrl}/api/anexos/${id}/download`;
}

substituirAnexo(id: number, arquivo: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', arquivo);

  return this.http.put(
    `${this.baseUrl}/api/anexos/${id}/substituir`,
    formData
  );
}
deletarAnexo(id: number): Observable<any> {
  return this.http.delete<any>(
    `${this.baseUrl}/api/anexos/${id}`
  );
}
}
