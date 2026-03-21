import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParticipanteService, ParticipanteRequest } from '../../../core/participante.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-participante',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './participante.component.html',
  styleUrl: './participante.component.scss',
})
export class ParticipanteComponent implements OnDestroy {
  form;

  mostrarAlert = false;
  private alertTimer: any;
  mostrarErro = false;
  mensagemErro = '';

  constructor(
    private fb: FormBuilder,
    private participanteService: ParticipanteService
  ) {
    this.form = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.maxLength(150)]],
      cpf: ['', [Validators.maxLength(14)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],

      dataCadastro: ['', Validators.required],
      igreja: ['', [Validators.required, Validators.maxLength(150)]],
      status: ['ATIVO', Validators.required],

      observacoes: [''],
      telefone1: ['', [Validators.maxLength(20)]],
      telefone2: ['', [Validators.maxLength(20)]],
    });

    const hoje = new Date().toISOString().slice(0, 10);
    this.form.patchValue({ dataCadastro: hoje });
  }

  salvar() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();

    this.mensagemErro = 'Preencha todos os campos obrigatórios.';
    this.mostrarErroAlert();

    return;
  }

  const payload = this.form.value as ParticipanteRequest;

  this.participanteService.create(payload).subscribe({
    next: (res) => {
      this.mostrarAlertSucesso();
      this.limpar();
    },
    error: (e) => {
      this.mensagemErro = 'Erro ao salvar participante.';
      this.mostrarErroAlert();
    },
  });
}

private mostrarErroAlert() {
  this.mostrarErro = true;

  if (this.alertTimer) clearTimeout(this.alertTimer);

  this.alertTimer = setTimeout(() => {
    this.mostrarErro = false;
  }, 3000);
}
  private mostrarAlertSucesso() {
    this.mostrarAlert = true;

    // evita timers acumulados se salvar várias vezes
    if (this.alertTimer) clearTimeout(this.alertTimer);

    // some sozinho após 3s (opcional)
    this.alertTimer = setTimeout(() => {
      this.mostrarAlert = false;
    }, 3000);
  }

  fecharAlert() {
    this.mostrarAlert = false;
    if (this.alertTimer) clearTimeout(this.alertTimer);
  }

  limpar() {
    const hoje = new Date().toISOString().slice(0, 10);
    this.form.reset({ status: 'ATIVO', dataCadastro: hoje });
  }

  ngOnDestroy(): void {
    if (this.alertTimer) clearTimeout(this.alertTimer);
  }
}
