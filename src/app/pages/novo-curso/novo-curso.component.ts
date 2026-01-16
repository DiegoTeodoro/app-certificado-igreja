import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-novo-curso',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './novo-curso.component.html',
  styleUrl: './novo-curso.component.scss',
})
export class NovoCursoComponent {

  form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      codigoCurso: ['', Validators.required],
      nomeCurso: ['', Validators.required],
      instrutor: ['', Validators.required],
      descricao: [''],
      cargaHoraria: [null, [Validators.required, Validators.min(1)]],
      validadeCertificado: [null, [Validators.required, Validators.min(1)]],
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('Curso cadastrado:', this.form.value);
  }

  limpar() {
    this.form.reset();
  }
}
