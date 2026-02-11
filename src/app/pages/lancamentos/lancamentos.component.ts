import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LancamentoService, LancamentoCreateRequest } from '../../../core/lancamento.service';
import { CursoService, CursoListItem } from '../../../core/curso.service';
import { ParticipanteListItem, ParticipanteService } from '../../../core/participante.service';

import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './lancamentos.component.html',
  styleUrl: './lancamentos.component.scss'
})
export class LancamentosComponent {
  form;

  arquivoSelecionado: File | null = null;
  arquivosSelecionados: File[] = [];
  mensagemSucesso = false;

  // ✅ autocomplete cursos
  mostrarListaCursos = false;
  cursosFiltrados: CursoListItem[] = [];
  mostrarAlert = false;
  mostrarListaParticipantes = false;
  participantesFiltrados: ParticipanteListItem[] = [];

  constructor(
    private fb: FormBuilder,
    private lancamentoService: LancamentoService,
    private cursoService: CursoService,
    private participanteService: ParticipanteService,
    private snackBar: MatSnackBar

  ) {
    this.form = this.fb.group({
  cursoId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
  nomeCurso: this.fb.control<string>('', { validators: [Validators.required] }),

  // ✅ participante (FK + nome)
  participanteCodigo: this.fb.control<number | null>(null, { validators: [Validators.required] }),
  participanteNome: this.fb.control<string>('', { validators: [Validators.required] }),

  instrutor: this.fb.control<string>('', { validators: [Validators.required] }),
  descricao: this.fb.control<string>(''),

  dataRealizacao: this.fb.control<string>('', { validators: [Validators.required] }),
  dataVencimento: this.fb.control<string>('', { validators: [Validators.required] }),

  anexo: this.fb.control<File | null>(null),
});

    // ✅ Listener do autocomplete no campo nomeCurso
   this.form.get('nomeCurso')!.valueChanges
  .pipe(
    map((v) => (v ?? '').toString()),   // ✅ aqui resolve null
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((texto: string) => {
      const q = texto.trim();

      // ✅ se a pessoa alterou o texto manualmente, invalida o cursoId anterior
      this.form.patchValue({ cursoId: null }, { emitEvent: false });

      if (q.length < 2) {
        this.cursosFiltrados = [];
        this.mostrarListaCursos = false;
        return of([]);
      }

      return this.cursoService.listar(q);
    })
  )
  .subscribe((lista) => {
    this.cursosFiltrados = lista;
    this.mostrarListaCursos = lista.length > 0;
  });

  this.form.get('participanteNome')!.valueChanges
  .pipe(
    map((v) => (v ?? '').toString()),
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((texto: string) => {
      const q = texto.trim();

      // ✅ se a pessoa alterou o texto manualmente, invalida o participanteCodigo anterior
      this.form.patchValue({ participanteCodigo: null }, { emitEvent: false });

      if (q.length < 2) {
        this.participantesFiltrados = [];
        this.mostrarListaParticipantes = false;
        return of([]);
      }

      return this.participanteService.listar(q);
    })
  )
  .subscribe((lista) => {
    this.participantesFiltrados = lista;
    this.mostrarListaParticipantes = lista.length > 0;
  });


  }
  
  selecionarParticipante(p: ParticipanteListItem) {
  this.form.patchValue({
    participanteCodigo: p.codigo,
    participanteNome: p.nomeCompleto
  });

  this.mostrarListaParticipantes = false;
}

fecharListaParticipantesComDelay() {
  setTimeout(() => {
    this.mostrarListaParticipantes = false;
  }, 150);
}


  // ✅ Método para selecionar curso
  selecionarCurso(curso: CursoListItem) {
    this.form.patchValue({
      cursoId: curso.id,
      nomeCurso: curso.nome_curso
    });

    this.mostrarListaCursos = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.arquivoSelecionado = file;
    this.form.patchValue({ anexo: file });
  }

 salvar() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const cursoId = this.form.value.cursoId;
  const participanteCodigo = this.form.value.participanteCodigo;

  if (!cursoId) { this.showError('Selecione um curso da lista.'); return; }
  if (!participanteCodigo) { this.showError('Selecione um participante da lista.'); return; }

  const payload: LancamentoCreateRequest = {
    curso_id: Number(cursoId),
    participante_codigo: Number(participanteCodigo),
    instrutor: this.form.value.instrutor!,
    data_realizacao: this.form.value.dataRealizacao!,
    data_vencimento: this.form.value.dataVencimento!,
    descricao: this.form.value.descricao ?? null,
  };

  this.lancamentoService.criarLancamento(payload).subscribe({
    next: (resp) => {
      const lancamentoCodigo = resp.codigo;

      // ✅ se tem anexo, envia e só depois mostra sucesso
      if (this.arquivoSelecionado) {
        const fd = new FormData();
        fd.append('file', this.arquivoSelecionado);

        this.lancamentoService.uploadAnexo(lancamentoCodigo, fd).subscribe({
          next: () => {
            this.showSuccess('Lançamento salvo com sucesso!');
            this.limpar();
          },
          error: (err) => {
            this.showError(err?.error?.message ?? 'Erro ao enviar anexo.');
          }
        });
        return;
      }

      // ✅ sem anexo
      this.showSuccess('Lançamento salvo com sucesso!');
      this.limpar();
    },
    error: (err) => {
      this.showError(err?.error?.message ?? 'Erro ao salvar lançamento.');
    }
  });
}


private showSuccess(msg: string) {
  this.snackBar.open(msg, 'Fechar', {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  });
}

private showError(msg: string) {
  this.snackBar.open(msg, 'Fechar', {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  });
}


  fecharListaCursosComDelay() {
  setTimeout(() => {
    this.mostrarListaCursos = false;
  }, 150);
}

  limpar() {
    this.form.reset();
    this.arquivoSelecionado = null;
    this.cursosFiltrados = [];
    this.mostrarListaCursos = false;
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.arquivosSelecionados = Array.from(input.files ?? []);
  }
}
