import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ParticipanteRelatorioItem, ParticipanteService } from '../../../../core/participante.service';

@Component({
  selector: 'app-relatorio-participantes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,DatePipe],
  templateUrl: './relatorio-participantes.component.html',
  styleUrl: './relatorio-participantes.component.scss',
})
export class RelatorioParticipantesComponent implements OnInit, OnDestroy {
  form; // ✅ declara aqui

  carregando = false;
  participantes: ParticipanteRelatorioItem[] = [];
  erro: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private participanteService: ParticipanteService
  ) {
    // ✅ inicializa aqui (fb já existe)
    this.form = this.fb.group({
      nome: this.fb.control<string>(''),
    });
  }

  ngOnInit(): void {
    this.form.get('nome')!.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((nome) => {
          this.carregando = true;
          this.erro = null;
          return this.participanteService.listarRelatorio((nome ?? '').trim());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lista) => {
          this.participantes = lista;
          this.carregando = false;
        },
        error: (e) => {
          this.erro = e?.message ?? 'Erro ao carregar participantes.';
          this.participantes = [];
          this.carregando = false;
        }
      });
  }

  limparBusca() {
    this.form.patchValue({ nome: '' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
