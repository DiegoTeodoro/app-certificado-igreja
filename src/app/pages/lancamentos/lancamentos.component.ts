import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LancamentoService, LancamentoCreateRequest, LancamentoAnexo } from '../../../core/lancamento.service';
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
  mostrarErro = false;
  mensagemErro = '';

  arquivoSelecionado: File | null = null;
  arquivosSelecionados: File[] = [];
  mensagemSucesso = false;

  // ✅ autocomplete cursos
  mostrarListaCursos = false;
  cursosFiltrados: CursoListItem[] = [];
  mostrarAlert = false;
  private alertTimer: any;

  mostrarListaParticipantes = false;
  participantesFiltrados: ParticipanteListItem[] = [];
  lancamentoEditandoCodigo: number | null = null;
anexosLancamento: LancamentoAnexo[] = [];
  constructor(
    private fb: FormBuilder,
    private lancamentoService: LancamentoService,
    private cursoService: CursoService,
    private participanteService: ParticipanteService,
    private snackBar: MatSnackBar,
    

  ) {
    this.form = this.fb.group({
  cursoId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
  nomeCurso: this.fb.control<string>('', { validators: [Validators.required] }),

  validadeCertificado: this.fb.control<number | null>(null),

  participanteCodigo: this.fb.control<number | null>(null, { validators: [Validators.required] }),
  participanteNome: this.fb.control<string>('', { validators: [Validators.required] }),

  instrutor: this.fb.control<string>('', { validators: [Validators.required] }),
  descricao: this.fb.control<string>(''),

  dataRealizacao: this.fb.control<string>('', { validators: [Validators.required] }),
  dataVencimento: this.fb.control<string>('', { validators: [Validators.required] }),

  anexo: this.fb.control<File | null>(null),
});
this.form.get('dataRealizacao')!.valueChanges.subscribe(() => {
  this.calcularDataVencimento();
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
     //this.form.patchValue({ cursoId: null }, { emitEvent: false });

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
      //this.form.patchValue({ participanteCodigo: null }, { emitEvent: false });

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

const state = history.state;

if (state?.lancamento) {
 
  const l = state.lancamento;

  this.lancamentoEditandoCodigo = l.codigo;

  this.form.patchValue({
    
    cursoId: l.cursoId,
    nomeCurso: l.nomeCurso,
    participanteCodigo: l.participanteCodigo,
    participanteNome: l.participanteNome,
    instrutor: l.instrutor,
    dataRealizacao: l.dataRealizacao?.substring(0, 10),
    dataVencimento: l.dataVencimento?.substring(0, 10),
    descricao: l.descricao || ''
  }, { emitEvent: false });
   this.carregarAnexosLancamento(l.codigo);
}
  }
  
  selecionarParticipante(p: ParticipanteListItem) {
  
  this.form.patchValue(
  {
    participanteCodigo: p.codigo,
    participanteNome: p.nomeCompleto
  },
  
  {
    emitEvent: false
  }
 
);

  this.mostrarListaParticipantes = false;
}

fecharListaParticipantesComDelay() {
  setTimeout(() => {
    this.mostrarListaParticipantes = false;
  }, 150);
}


  // ✅ Método para selecionar curso
  selecionarCurso(curso: CursoListItem) {
  this.form.patchValue(
    {
      cursoId: curso.id,
      nomeCurso: curso.nome_curso,
      validadeCertificado: curso.validadeCertificado
    },
    { emitEvent: false }
  );

  this.mostrarListaCursos = false;

  this.calcularDataVencimento();
}

    onFileSelected(event: Event) {
     const input = event.target as HTMLInputElement;
    this.arquivosSelecionados = Array.from(input.files ?? []);
    this.form.patchValue({
      anexo: this.arquivosSelecionados.length > 0
        ? this.arquivosSelecionados[0]
        : null
    });
    }

 salvar() {
 if (this.form.invalid) {
  this.form.markAllAsTouched();

  this.mensagemErro = 'Preencha todos os campos obrigatórios.';
  this.mostrarErroAlert();
  return;
}

  const cursoId = this.form.value.cursoId;
  const participanteCodigo = this.form.value.participanteCodigo;

  if (!cursoId) {
  this.mensagemErro = 'Selecione um curso da lista.';
  this.mostrarErroAlert();
  return;
}

if (!participanteCodigo) {
  this.mensagemErro = 'Selecione um participante da lista.';
  this.mostrarErroAlert();
  return;
}

  const payload: LancamentoCreateRequest = {
    curso_id: Number(cursoId),
    participante_codigo: Number(participanteCodigo),
    instrutor: this.form.value.instrutor!,
    data_realizacao: this.form.value.dataRealizacao!,
    data_vencimento: this.form.value.dataVencimento!,
    descricao: this.form.value.descricao ?? null,
  };
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || '{}');

if (this.lancamentoEditandoCodigo) {
  this.lancamentoService.atualizar(this.lancamentoEditandoCodigo, {
    ...payload,
    usuario_login: usuario?.login || ''
  }).subscribe({
    next: () => {
  if (this.arquivosSelecionados.length > 0 && this.lancamentoEditandoCodigo) {
    const fd = new FormData();

    this.arquivosSelecionados.forEach((arquivo) => {
      fd.append('files', arquivo);
    });

    this.lancamentoService.uploadAnexos(this.lancamentoEditandoCodigo, fd).subscribe({
      next: () => {
        this.mostrarAlertSucesso();
        this.limpar();
      },
      error: () => {
        this.mensagemErro = 'Lançamento atualizado, mas erro ao enviar anexos.';
        this.mostrarErroAlert();
      }
    });

    return;
  }

  this.mostrarAlertSucesso();
  this.limpar();
},
    error: (err) => {
      this.mensagemErro = err?.error?.message || 'Erro ao atualizar lançamento.';
      this.mostrarErroAlert();
    }
  });

  return;
}

  this.lancamentoService.criarLancamento(payload).subscribe({
    next: (resp) => {
      const lancamentoCodigo = resp.codigo;

      // ✅ se tem anexo, envia e só depois mostra sucesso
      if (this.arquivosSelecionados.length > 0) {
        const fd = new FormData();

        this.arquivosSelecionados.forEach((arquivo) => {
          fd.append('files', arquivo);
        });

        this.lancamentoService.uploadAnexos(lancamentoCodigo, fd).subscribe({
          next: () => {
            this.mostrarAlertSucesso(); // ✅ aqui
            this.limpar();
          },
          error: (err) => {
            this.showError(err?.error?.message ?? 'Erro ao enviar anexo.');
          }
        });
        return;
      }

      // ✅ sem anexo
      this.mostrarAlertSucesso(); // ✅ aqui
      this.limpar();
    },
    error: (err) => {
  this.mensagemErro =
    err?.error?.message || 'Erro ao salvar lançamento.';

  this.mostrarErroAlert();
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

fecharAlert() {
  this.mostrarAlert = false;
  if (this.alertTimer) clearTimeout(this.alertTimer);
}

private mostrarAlertSucesso() {
  this.mostrarAlert = true;

  if (this.alertTimer) clearTimeout(this.alertTimer);
  this.alertTimer = setTimeout(() => {
    this.mostrarAlert = false;
  }, 3000);
}


  fecharListaCursosComDelay() {
  setTimeout(() => {
    this.mostrarListaCursos = false;
  }, 150);
}

    limpar() {
    this.form.reset();
    this.arquivosSelecionados = [];
    this.arquivoSelecionado = null;
    this.cursosFiltrados = [];
    this.participantesFiltrados = [];
    this.mostrarListaCursos = false;
    this.mostrarListaParticipantes = false;
    this.anexosLancamento = [];
    this.lancamentoEditandoCodigo = null;
  }

  onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const novosArquivos = Array.from(input.files ?? []);

  this.arquivosSelecionados = [
    ...this.arquivosSelecionados,
    ...novosArquivos
  ];

  this.form.patchValue({
    anexo: this.arquivosSelecionados.length > 0
      ? this.arquivosSelecionados[0]
      : null
  });

  input.value = '';
}

removerArquivoSelecionado(index: number): void {
  this.arquivosSelecionados.splice(index, 1);

  this.form.patchValue({
    anexo: this.arquivosSelecionados.length > 0
      ? this.arquivosSelecionados[0]
      : null
  });
}

  private mostrarErroAlert() {
  this.mostrarErro = true;

  if (this.alertTimer) clearTimeout(this.alertTimer);

  this.alertTimer = setTimeout(() => {
    this.mostrarErro = false;
  }, 3000);
}
calcularDataVencimento(): void {
  const dataRealizacao = this.form.controls.dataRealizacao.value;
  const validadeMeses = this.form.controls.validadeCertificado.value;

  console.log('Data:', dataRealizacao);
  console.log('Validade:', validadeMeses);

  if (!dataRealizacao || !validadeMeses) {
    return;
  }

  const [ano, mes, dia] = dataRealizacao.split('-').map(Number);

  const data = new Date(ano, mes - 1, dia);
  data.setMonth(data.getMonth() + Number(validadeMeses));

  const anoFinal = data.getFullYear();
  const mesFinal = String(data.getMonth() + 1).padStart(2, '0');
  const diaFinal = String(data.getDate()).padStart(2, '0');

  this.form.controls.dataVencimento.setValue(
    `${anoFinal}-${mesFinal}-${diaFinal}`,
    { emitEvent: false }
  );
}
carregarAnexosLancamento(codigo: number): void {
  this.lancamentoService.listarAnexos(codigo).subscribe({
    next: (anexos) => {
      this.anexosLancamento = anexos;
    },
    error: () => {
      this.anexosLancamento = [];
    }
  });
}

visualizarAnexo(id: number): void {
  window.open(this.lancamentoService.urlVisualizarAnexo(id), '_blank');
}

baixarAnexo(id: number): void {
  window.open(this.lancamentoService.urlDownloadAnexo(id), '_blank');
}

substituirAnexo(event: Event, anexoId: number): void {
  const input = event.target as HTMLInputElement;
  const arquivo = input.files?.[0];

  if (!arquivo) return;

  this.lancamentoService.substituirAnexo(anexoId, arquivo).subscribe({
    next: () => {
      alert('Anexo substituído com sucesso.');

      if (this.lancamentoEditandoCodigo) {
        this.carregarAnexosLancamento(this.lancamentoEditandoCodigo);
      }
    },
    error: () => {
      alert('Erro ao substituir anexo.');
    }
  });
}
    deletarAnexo(id: number): void {
  if (!confirm('Deseja realmente excluir este anexo?')) {
    return;
  }

  this.lancamentoService.deletarAnexo(id).subscribe({
    next: () => {
      if (this.lancamentoEditandoCodigo) {
        this.carregarAnexosLancamento(this.lancamentoEditandoCodigo);
      }
      alert('Anexo excluído com sucesso.');
    },
    error: () => {
      alert('Erro ao excluir o anexo.');
    }
  });

}
}
