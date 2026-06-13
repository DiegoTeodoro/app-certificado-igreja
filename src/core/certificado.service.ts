import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type StatusCertificado = 'Válido' | 'Vencido' | 'A vencer';

export interface CertificadoDto {
  curso: string;
  descricao: string;
  instrutor: string;
  data_realizacao: string; // "YYYY-MM-DD"
  data_vencimento: string; // "YYYY-MM-DD"
  status: StatusCertificado;
}

@Injectable({ providedIn: 'root' })
export class CertificadoService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

listarPorParticipante(participanteCodigo: number): Observable<CertificadoDto[]> {
    return this.http.get<CertificadoDto[]>(
      `${this.baseUrl}/api/certificados`,
      { params: { participante_codigo: participanteCodigo } }
    );
  }

  listarRelatorioVencimento(igreja: string = '', status: string = '') {
  console.log('Filtro enviado:', { igreja, status });

  return this.http.get<any[]>(
    `${this.baseUrl}/api/relatorios/certificados-vencimento`,
    {
      params: {
        igreja,
        status
      }
    }
  );
}
}
