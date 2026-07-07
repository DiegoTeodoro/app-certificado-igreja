import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificadoService, CertificadoDto, StatusCertificado } from '../../../core/certificado.service';
import { ParticipanteService } from '../../../core/participante.service';

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './certificados.component.html',
  styleUrl: './certificados.component.scss'
})
export class CertificadosComponent {
  private certificadoService = inject(CertificadoService);
  private participanteService = inject(ParticipanteService);

  participante = { nome: '', iniciais: '' };
  participanteNomeBusca = '';

  certificados: CertificadoDto[] = [];
  menuExportarAberto = false;

  buscarParticipante() {
  const nome = this.participanteNomeBusca.trim();

  if (nome.length < 2) {
    alert('Digite pelo menos 2 letras do nome.');
    return;
  }

  this.participanteService.buscarPorNome(nome).subscribe({
    next: (p) => {
      this.participante.nome = p.nomeCompleto;
      this.participante.iniciais = this.getIniciais(p.nomeCompleto);

      this.certificadoService.listarPorParticipante(p.codigo).subscribe({
        next: (lista) => {
          this.certificados = lista ?? [];

          this.certificados.forEach(certificado => {
            this.certificadoService
              .listarAnexos(certificado.lancamentoCodigo)
              .subscribe({
                next: (anexos) => {
                  certificado.anexos = anexos;
                }
              });
          });
        },
        error: () => {
          this.certificados = [];
          alert('Erro ao carregar certificados.');
        }
      });
    },
    error: (err) => {
      this.participante = { nome: '', iniciais: '' };
      this.certificados = [];
      alert(err?.error?.message ?? 'Participante não encontrado.');
    }
  });
}

  private getIniciais(nome: string): string {
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    const a = parts[0][0] ?? '';
    const b = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (a + b).toUpperCase();
  }

  statusClass(status: StatusCertificado) {
    if (status === 'Válido') return 'ok';
    if (status === 'A vencer') return 'warn';
    return 'bad';
  }

 alternarMenuExportar(): void {
  this.menuExportarAberto = !this.menuExportarAberto;
}

exportarExcel(): void {

  if (this.certificados.length === 0) {
  alert('Nenhum certificado para exportar.');
  return;
}
  this.menuExportarAberto = false;

  const linhas = this.certificados.map(c => ({
    Curso: c.curso,
    Descricao: c.descricao || '',
    Instrutor: c.instrutor || '',
    'Data Realizacao': this.formatarData(c.data_realizacao),
    'Data Vencimento': this.formatarData(c.data_vencimento),
    Status: c.status
  }));

  const cabecalho = Object.keys(linhas[0] || {
    Curso: '',
    Descricao: '',
    Instrutor: '',
    'Data Realizacao': '',
    'Data Vencimento': '',
    Status: ''
  });

  const csv = [
    cabecalho.join(';'),
    ...linhas.map(l =>
      cabecalho.map(c => `"${(l as any)[c] ?? ''}"`).join(';')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], {
  type: 'text/csv;charset=utf-8;'
});

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'certificados.csv';
  a.click();

  window.URL.revokeObjectURL(url);
}

imprimirPdf(): void {
  if (this.certificados.length === 0) {
  alert('Nenhum certificado para imprimir.');
  return;
}
  this.menuExportarAberto = false;

  const linhas = this.certificados.map(c => `
    <tr>
      <td>${c.curso || ''}</td>
      <td>${c.descricao || ''}</td>
      <td>${c.instrutor || ''}</td>
      <td>${this.formatarData(c.data_realizacao)}</td>
      <td>${this.formatarData(c.data_vencimento)}</td>
      <td>${c.status || ''}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            padding: 30px 40px;
          }

          .header {
            text-align: center;
            margin-bottom: 12px;
          }

          .header h1 {
            font-size: 24px;
            margin: 0 0 10px;
            font-weight: 500;
          }

          .linha {
            border-top: 2px solid #000;
            margin: 10px 0;
          }

          .cidade {
            font-size: 22px;
            margin: 10px 0;
          }

          .titulo-relatorio {
            width: 100%;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0 20px 0;
          }

          .participante {
            font-size: 14px;
            margin-bottom: 12px;
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11px;
          }

          th {
            text-align: left;
            border-bottom: 2px solid #000;
            padding: 8px 6px;
          }

          td {
            border-bottom: 1px solid #999;
            padding: 7px 6px;
          }

          .footer {
            margin-top: 15px;
            font-size: 12px;
          }

          @media print {
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>Congregação Cristã No Brasil</h1>
          <div class="linha"></div>
          <div class="cidade">Uberlandia - MG</div>
          <div class="linha"></div>
        </div>

        <div class="titulo-relatorio">
          Certificados
        </div>

        <div class="participante">
          Participante: ${this.participante.nome || ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Descrição</th>
              <th>Instrutor</th>
              <th>Data Realização</th>
              <th>Data Vencimento</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${linhas}
          </tbody>
        </table>

        <div class="footer">
          Total de certificados: ${this.certificados.length}
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');

  if (janela) {
    janela.document.open();
    janela.document.write(html);
    janela.document.close();

    janela.onload = () => {
      janela.print();
      janela.close();
    };
  }
}

formatarData(data: string | Date): string {
  if (!data) return '';

  const d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}
  novoCertificado() { console.log('Novo certificado');
    
   }
   visualizarAnexo(id: number): void {
  window.open(this.certificadoService.urlVisualizarAnexo(id), '_blank');
}

baixarAnexo(id: number): void {
  window.open(this.certificadoService.urlDownloadAnexo(id), '_blank');
}

substituirAnexo(event: Event, anexoId: number): void {
  const input = event.target as HTMLInputElement;
  const arquivo = input.files?.[0];

  if (!arquivo) return;

  this.certificadoService.substituirAnexo(anexoId, arquivo).subscribe({
    next: () => {
      alert('Anexo substituído com sucesso.');
      this.buscarParticipante();
    },
    error: () => {
      alert('Erro ao substituir anexo.');
    }
  });
}
}
