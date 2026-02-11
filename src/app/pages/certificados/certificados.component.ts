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

  buscarParticipante() {
    const nome = this.participanteNomeBusca.trim();
    if (nome.length < 2) return;

    this.participanteService.buscarPorNome(nome).subscribe({
      next: (p) => {
        this.participante.nome = p.nomeCompleto;
        this.participante.iniciais = this.getIniciais(p.nomeCompleto);

        this.certificadoService.listarPorParticipante(p.codigo).subscribe({
          next: (lista) => (this.certificados = lista),
          error: () => alert('Erro ao carregar certificados.')
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

  exportar() { console.log('Exportar', this.certificados); }
  novoCertificado() { console.log('Novo certificado'); }
}
