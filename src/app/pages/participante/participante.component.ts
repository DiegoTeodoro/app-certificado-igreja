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
      return;
    }

    const payload = this.form.value as ParticipanteRequest;

    this.participanteService.create(payload).subscribe({
      next: (res) => {
        console.log('Salvo!', res);

        this.mostrarAlertSucesso(); // ✅ aqui ativa o alert custom
        this.limpar();
      },
      error: (e) => {
        console.error(e);
        // se quiser, depois a gente cria um alert de erro também
        alert(e?.message ?? 'Erro ao salvar participante.');
      },
    });
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
