import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParticipanteService, ParticipanteRequest } from '../../../core/participante.service';

@Component({
  selector: 'app-participante',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './participante.component.html',
  styleUrl: './participante.component.scss',
})
export class ParticipanteComponent {
  form;

  constructor(
    private fb: FormBuilder,
    private participanteService: ParticipanteService
    
  ) {
   this.form = this.fb.group({
  nomeCompleto: ['', [Validators.required, Validators.maxLength(150)]],
  cpf: ['', [Validators.maxLength(14)]], // sem required
  email: ['', [Validators.email, Validators.maxLength(150)]], // sem required

  dataCadastro: ['', Validators.required], // vamos auto-preencher com hoje
  igreja: ['', [Validators.required, Validators.maxLength(150)]],
  status: ['ATIVO', Validators.required],

  observacoes: [''],

  telefone1: ['', [Validators.maxLength(20)]], // sem required
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
        alert('Participante cadastrado com sucesso!');
        this.limpar();
      },
      error: (e) => {
        console.error(e);
        alert(e.message ?? 'Erro ao salvar participante.');
      },
    });
  }

 limpar() {
  const hoje = new Date().toISOString().slice(0, 10);
  this.form.reset({ status: 'ATIVO', dataCadastro: hoje });
}
}
