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
export interface CertificadoDto {
  lancamentoCodigo: number;
  curso: string;
  descricao: string;
  instrutor: string;
  data_realizacao: string;
  data_vencimento: string;
  status: StatusCertificado;
  anexos?: AnexoCertificado[];
}

export interface AnexoCertificado {
  id: number;
  nomeOriginal: string;
  nomeArquivo: string;
  mimeType: string;
  caminho: string;
  uploadedAt: string;
}
@Injectable({ providedIn: 'root' })
export class CertificadoService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {

  }

listarPorParticipante(participanteCodigo: number): Observable<CertificadoDto[]> {
    return this.http.get<CertificadoDto[]>(
      `${this.baseUrl}/api/certificados`,
      { params: { participante_codigo: participanteCodigo } }
    );
  }

 listarRelatorioVencimento(
  igreja: string = '',
  status: string = '',
  curso: string = ''
) {
  console.log('Filtro enviado:', { igreja, status, curso });

  return this.http.get<any[]>(
    `${this.baseUrl}/api/relatorios/certificados-vencimento`,
    {
      params: {
        igreja,
        status,
        curso
      }
    }
  );
}
listarAnexos(lancamentoCodigo: number): Observable<AnexoCertificado[]> {
  return this.http.get<AnexoCertificado[]>(
    `${this.baseUrl}/api/lancamentos/${lancamentoCodigo}/anexos`
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
}
