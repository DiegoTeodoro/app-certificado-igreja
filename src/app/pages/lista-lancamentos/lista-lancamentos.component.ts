import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { LancamentoService,LancamentoListItem} from '../../../core/lancamento.service';

@Component({
  selector: 'app-lista-lancamentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-lancamentos.component.html',
  styleUrl: './lista-lancamentos.component.scss'
})
export class ListaLancamentosComponent implements OnInit {

  form;
  lancamentos: LancamentoListItem[] = [];

  paginaAtual = 1;
  opcoesPaginacao = [10, 25, 50, 100];

  
  constructor(
    private fb: FormBuilder,
    private lancamentoService: LancamentoService,
    private router: Router
  ) {
    this.form = this.fb.group({
      q: [''],
      itensPorPagina: [10]
    });
  }

  ngOnInit(): void {
    this.carregarLancamentos();

    this.form.controls.q.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.carregarLancamentos();
      });

    this.form.controls.itensPorPagina.valueChanges
      .subscribe(() => {
        this.paginaAtual = 1;
      });
  }

  carregarLancamentos(): void {
    const q = this.form.controls.q.value || '';

    this.lancamentoService.listar(q).subscribe({
      next: (dados) => {
        this.lancamentos = dados;
        this.paginaAtual = 1;
      },
      error: (erro) => {
        console.error('Erro ao listar lançamentos', erro);
      }
    });
  }

  limpar(): void {
    this.form.reset({
      q: '',
      itensPorPagina: 10
    });

    this.carregarLancamentos();
  }

  novoLancamento(): void {
    this.router.navigate(['/lancamentos']);
  }

  editar(lancamento: LancamentoListItem): void {
    this.router.navigate(['/lancamentos'], {
      state: { lancamento }
    });
  }

  get itensPorPagina(): number {
    return Number(this.form.controls.itensPorPagina.value) || 10;
  }

  get totalRegistros(): number {
    return this.lancamentos.length;
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalRegistros / this.itensPorPagina) || 1;
  }

  get lancamentosPaginados(): LancamentoListItem[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return this.lancamentos.slice(inicio, fim);
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