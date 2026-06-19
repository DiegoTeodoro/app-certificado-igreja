import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificadoService } from '../../../../core/certificado.service';

type RelatorioItem = {
  participanteNome: string;
  curso: string;
  comum: string;
  dataVencimento: string | Date;
  status: string;
};

@Component({
  selector: 'app-relatorio-certificado-vencer',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './relatorio-certificado-vencer.component.html',
  styleUrl: './relatorio-certificado-vencer.component.scss'
})
export class RelatorioCertificadoVencerComponent implements OnInit {
  private certificadoService = inject(CertificadoService);

  itensPorPagina = 10;
  paginaAtual = 1;
  opcoesPaginacao = [10, 25, 50, 100];
  igreja = '';
  status = '';
  relatorio: RelatorioItem[] = [];
  menuImprimirAberto = false;

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  carregarRelatorio(): void {
  this.certificadoService
    .listarRelatorioVencimento(this.igreja, this.status)
    .subscribe({
      next: (lista) => {
        this.relatorio = lista ?? [];
        this.paginaAtual = 1;
      },
      error: () => alert('Erro ao carregar relatório.')
    });
}

  get totalRegistros(): number {
  return this.relatorio.length;
}

get totalPaginas(): number {
  return Math.ceil(this.totalRegistros / this.itensPorPagina) || 1;
}

get relatorioFiltrado(): RelatorioItem[] {
  const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
  const fim = inicio + this.itensPorPagina;

  return this.relatorio.slice(inicio, fim);
}

  limpar(): void {
    this.igreja = '';
    this.status = '';
    this.carregarRelatorio();
  }

  alternarMenuImprimir(): void {
    this.menuImprimirAberto = !this.menuImprimirAberto;
  }


  exportarExcel(): void {
    this.menuImprimirAberto = false;

    const linhas = this.relatorioFiltrado.map(r => ({
      Participante: r.participanteNome,
      Curso: r.curso,
      Comum: r.comum,
      'Data de vencimento': r.dataVencimento,
      Status: r.status
    }));

    const cabecalho = Object.keys(linhas[0] || {
      Participante: '',
      Curso: '',
      Comum: '',
      'Data de vencimento': '',
      Status: ''
    });

    const csv = [
      cabecalho.join(';'),
      ...linhas.map(l => cabecalho.map(c => `"${(l as any)[c] ?? ''}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'relatorio-certificados-vencimento.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  statusClass(status: string): string {
    if (status === 'Válido') return 'ok';
    if (status === 'A vencer') return 'warn';
    return 'bad';
  }
  alterarItensPorPagina(): void {
  this.paginaAtual = 1;
}

paginaAnterior(): void {
  if (this.paginaAtual > 1) {
    this.paginaAtual--;
  }
}

proximaPagina(): void {
  if (this.paginaAtual < this.totalPaginas) {
    this.paginaAtual++;
  }
}


imprimirPdf(): void {
  this.menuImprimirAberto = false;

  const linhas = this.relatorio.map(r => `
    <tr>
      <td>${r.participanteNome || ''}</td>
      <td>${r.curso || ''}</td>
      <td>${r.comum || ''}</td>
      <td>${this.formatarData(r.dataVencimento)}</td>
      <td>${r.status || ''}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            width: 90%;
            margin: 0 auto;
            padding: 30px;
          }

          .header {
            width: 100%;
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

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
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
          Relatório - Certificados a vencer
          <br>
          Lista de certificados com vencimento próximo / vencidos
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome do participante</th>
              <th>Curso</th>
              <th>Comum</th>
              <th>Data de vencimento</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${linhas}
          </tbody>
        </table>

        <div class="footer">
          Total no relatório: ${this.relatorio.length}
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
}
