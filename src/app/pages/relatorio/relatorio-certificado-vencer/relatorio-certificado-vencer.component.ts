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

  imprimirPdf(): void {
    this.menuImprimirAberto = false;
    window.print();
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
}