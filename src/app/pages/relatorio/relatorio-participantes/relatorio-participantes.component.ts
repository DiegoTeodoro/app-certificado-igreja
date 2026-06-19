import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ParticipanteService, ParticipanteRelatorioItem} from '../../../../core/participante.service';

@Component({
  selector: 'app-relatorio-participantes',
  standalone: true,
 imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './relatorio-participantes.component.html',
  styleUrl: './relatorio-participantes.component.scss'
})
export class RelatorioParticipantesComponent implements OnInit {

  form;
  participantes: ParticipanteRelatorioItem[] = [];
  menuImprimirAberto = false;

  itensPorPagina = 10;
  paginaAtual = 1;
  opcoesPaginacao = [10, 25, 50, 100];

  constructor(
    private fb: FormBuilder,
    private participanteService: ParticipanteService
  ) {
    this.form = this.fb.group({
      igreja: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  carregarRelatorio(): void {
    const igreja = this.form.controls.igreja.value || '';
    const status = this.form.controls.status.value || '';

    this.participanteService
      .listarRelatorioParticipantes(igreja, status)
      .subscribe({
        next: (dados) => {
            this.participantes = dados;
            this.paginaAtual = 1;
        },
        error: (erro) => {
          console.error('Erro ao carregar relatório de participantes', erro);
        }
      });
  }

  limpar(): void {
    this.form.reset({
      igreja: '',
      status: ''
    });

    this.carregarRelatorio();
  }

  alternarMenuImprimir(): void {
    this.menuImprimirAberto = !this.menuImprimirAberto;
  }

 
  exportarExcel(): void {
    this.menuImprimirAberto = false;

    const linhas = this.participantes.map(p => ({
      Nome: p.nomeCompleto,
      //CPF: p.cpf || '',
      //Email: p.email || '',
      Igreja: p.igreja,
      'Data Cadastro': p.dataCadastro,
      Status: p.status
    }));

    const cabecalho = Object.keys(linhas[0] || {
      Nome: '',
      CPF: '',
      //Email: '',
      Igreja: '',
      'Data Cadastro': '',
      Status: ''
    });

    const csv = [
      cabecalho.join(';'),
      ...linhas.map(l => cabecalho.map(c => `"${(l as any)[c]}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'relatorio-participantes.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ATIVO':
        return 'ok';
      case 'INATIVO':
        return 'bad';
      default:
        return '';
    }
  }
  get totalRegistros(): number {
  return this.participantes.length;
}

get totalPaginas(): number {
  return Math.ceil(this.totalRegistros / this.itensPorPagina) || 1;
}

get participantesPaginados(): ParticipanteRelatorioItem[] {
  const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
  const fim = inicio + this.itensPorPagina;

  return this.participantes.slice(inicio, fim);
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

  const linhas = this.participantes.map(p => `
    <tr>
      <td>${p.nomeCompleto || ''}</td>
      <td>${p.igreja || ''}</td>
      <td>${this.formatarData(p.dataCadastro)}</td>
      <td>${p.status || ''}</td>
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
          Relatório - Participantes Lista de participantes cadastrados
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Igreja</th>
              <th>Data Cadastro</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${linhas}
          </tbody>
        </table>

        <div class="footer">
          Total no relatório: ${this.participantes.length}
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