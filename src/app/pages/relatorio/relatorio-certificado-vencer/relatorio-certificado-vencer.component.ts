import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificadoService } from '../../../../core/certificado.service';

type RelatorioItem = {
  participanteNome: string;
  curso: string;
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

  filtro = '';
  relatorio: RelatorioItem[] = [];

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  carregarRelatorio() {
  this.certificadoService.listarRelatorioVencimento().subscribe({
    next: (lista) => (this.relatorio = lista ?? []),
    error: () => alert('Erro ao carregar relatório.')
  });
}

  get relatorioFiltrado() {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.relatorio;

    return this.relatorio.filter(x =>
      (x.participanteNome ?? '').toLowerCase().includes(f) ||
      (x.curso ?? '').toLowerCase().includes(f)
    );
  }

  statusClass(status: string) {
    if (status === 'Válido') return 'ok';
    if (status === 'A vencer') return 'warn';
    return 'bad';
  }

  exportar() {
    console.log('Exportar', this.relatorioFiltrado);
  }
}