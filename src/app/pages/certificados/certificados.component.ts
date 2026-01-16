import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type StatusCertificado = 'Válido' | 'Vencido' | 'A vencer';

interface Certificado {// ex: "NR-10"
  curso: string;
  descricao: string;
  instrutor: string;
  dataRealizacao: string;   // dd/MM/yyyy (exibição)
  dataVencimento: string;   // dd/MM/yyyy (exibição)
  status: StatusCertificado;
}

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificados.component.html',
  styleUrl: './certificados.component.scss'
})
export class CertificadosComponent {
  participante = {
    nome: 'Paulo Roberto Rodrigues Santos',
    iniciais: 'PR'
  };

  termo = '';

  // Exemplo (substitua pelo seu retorno da API)
  certificados: Certificado[] = [
    {
      
      curso: 'NR 10',
      descricao: 'Treinamento obrigatório para eletricidade (NR-10).',
      instrutor: 'Everton',
      dataRealizacao: '11/05/2025',
      dataVencimento: '11/05/2026',
      status: 'Válido'
    },
    {
      
      curso: 'NR 6',
      descricao: 'Uso e conservação de EPIs.',
      instrutor: 'Everton',
      dataRealizacao: '11/05/2025',
      dataVencimento: '11/05/2026',
      status: 'Válido'
    },
    {
     
      curso: 'NR-35',
      descricao: 'Procedimentos e segurança para altura.',
      instrutor: 'Everton',
      dataRealizacao: '11/05/2025',
      dataVencimento: '11/05/2026',
      status: 'Válido'
    }
  ];

  get certificadosFiltrados(): Certificado[] {
    const t = this.termo.trim().toLowerCase();
    if (!t) return this.certificados;

    return this.certificados.filter(c => {
      const alvo =
        ` ${c.curso} ${c.descricao} ${c.instrutor} ${c.dataRealizacao} ${c.dataVencimento} ${c.status}`
          .toLowerCase();
      return alvo.includes(t);
    });
  }
  statusClass(status: StatusCertificado) {
  if (status === 'Válido') return 'ok';
  if (status === 'A vencer') return 'warn';
  return 'bad';
}

  novoCertificado() {
    // navegue/abra modal conforme seu fluxo
    console.log('Novo certificado');
  }

  editarParticipante() {
    console.log('Editar participante');
  }

  exportar() {
    // aqui você pode gerar CSV/PDF
    console.log('Exportar', this.certificadosFiltrados);
  }
}
