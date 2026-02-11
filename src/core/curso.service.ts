import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ item simples para autocomplete/listagem
export type CursoListItem = {
  id: number;
  nome_curso: string;
};

// (se você quiser manter seu DTO de criação, pode ficar separado)
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

  listar(q?: string): Observable<CursoListItem[]> {
    let params = new HttpParams();

    if (q && q.trim().length > 0) {
      params = params.set('q', q.trim());
    }

    return this.http.get<CursoListItem[]>(this.apiUrl, { params });
  }

  criar(dto: CursoCreateDTO): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }
}
