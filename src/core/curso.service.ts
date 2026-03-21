import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ item simples para autocomplete/listagem rápida
export type CursoListItem = {
  id: number;
  nome_curso: string;
};

// ✅ item completo para relatório/lista
export type CursoRelatorioItem = {
  id: number;
  nomeCurso: string;
  dataCadastro: string; // YYYY-MM-DD
  cargaHoraria: number;
  validadeCertificado: number;
  descricao?: string | null;
};

export type CursoCreateDTO = {
  nomeCurso: string;
  dataCadastro: string; // "YYYY-MM-DD"
  cargaHoraria: number;
  validadeCertificado: number;
  descricao?: string;
};

@Injectable({ providedIn: 'root' })
export class CursoService {
  private apiUrl = 'http://localhost:3000/api/cursos';

  constructor(private http: HttpClient) {}

  /** ✅ GET /api/cursos?q=abc  (AUTOCOMPLETE - LIMIT 20) */
  listar(q: string = ''): Observable<CursoListItem[]> {
    let params = new HttpParams();

    if (q.trim().length > 0) {
      params = params.set('q', q.trim());
    }

    return this.http.get<CursoListItem[]>(this.apiUrl, { params });
  }

  /** ✅ GET /api/cursos/relatorio?q=abc  (LISTA/RELATÓRIO - sem LIMIT) */
  listarRelatorio(q: string = ''): Observable<CursoRelatorioItem[]> {
    return this.http.get<CursoRelatorioItem[]>(
      `${this.apiUrl}/relatorio`,
      { params: { q } }
    );
  }

  buscarPorId(id: number): Observable<CursoRelatorioItem> {
    return this.http.get<CursoRelatorioItem>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, dto: CursoCreateDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  criar(dto: CursoCreateDTO): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }
}
