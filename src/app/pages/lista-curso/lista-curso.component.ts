import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { CursoRelatorioItem, CursoService } from '../../../core/curso.service';

@Component({
  selector: 'app-lista-curso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-curso.component.html',
  styleUrl: './lista-curso.component.scss',
})
export class ListaCursoComponent implements OnInit, OnDestroy {
  form;
  carregando = false;
  cursos: CursoRelatorioItem[] = [];
  erro: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private router: Router
  ) {
    this.form = this.fb.group({
      q: this.fb.control<string>(''),
    });
  }

  ngOnInit(): void {
    this.form.get('q')!.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          this.carregando = true;
          this.erro = null;
          return this.cursoService.listarRelatorio((q ?? '').trim());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lista) => {
          this.cursos = lista;
          this.carregando = false;
        },
        error: (e) => {
          this.erro = e?.message ?? 'Erro ao carregar cursos.';
          this.cursos = [];
          this.carregando = false;
        }
      });
  }

  novoCurso() {
    this.router.navigate(['/novo-curso']);
  }

  editar(id: number) {
    this.router.navigate(['/novo-curso', id]); // vai abrir o form em modo edição
  }

  deletar(id: number) {
    const ok = confirm('Deseja realmente excluir este curso?');
    if (!ok) return;

    this.cursoService.deletar(id).subscribe({
      next: () => {
        // recarrega
        const q = (this.form.value.q ?? '').trim();
        this.cursoService.listarRelatorio(q).subscribe(lista => this.cursos = lista);
      },
      error: (e) => alert(e?.message ?? 'Erro ao deletar.')
    });
  }

  limparBusca() {
    this.form.patchValue({ q: '' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
