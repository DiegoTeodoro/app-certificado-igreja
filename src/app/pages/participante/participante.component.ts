import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-participante',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './participante.component.html',
  styleUrl: './participante.component.scss',
})
export class ParticipanteComponent {
  form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.maxLength(150)]],
      cpf: ['', [Validators.required, Validators.maxLength(14)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      dataCadastro: ['', Validators.required], // input type="date"
      igreja: ['', [Validators.required, Validators.maxLength(150)]],
      status: ['ATIVO', Validators.required], // ATIVO | INATIVO
      observacoes: [''],

      telefone1: ['', [Validators.required, Validators.maxLength(20)]],
      telefone2: ['', [Validators.maxLength(20)]],
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('Participante cadastrado:', this.form.value);
  }

  limpar() {
    this.form.reset({
      status: 'ATIVO',
    });
  }
}
