import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursoService, CursoCreateDTO } from '../../../core/curso.service';
import { FormControl, FormGroup } from '@angular/forms';

type CursoForm = {
  nomeCurso: FormControl<string>;
  dataCadastro: FormControl<string>;
  descricao: FormControl<string>;
  cargaHoraria: FormControl<number>;
  validadeCertificado: FormControl<number>;
};

@Component({
  selector: 'app-novo-curso',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './novo-curso.component.html',
  styleUrl: './novo-curso.component.scss',
})
export class NovoCursoComponent {

  form: FormGroup<CursoForm>;

  private hojeISO(): string {
  return new Date().toISOString().split('T')[0]; // yyyy-MM-dd
}


 constructor(private fb: FormBuilder, private cursoService: CursoService) {
  this.form = this.fb.group({
    nomeCurso: this.fb.nonNullable.control('', Validators.required),
    dataCadastro: this.fb.nonNullable.control(this.hojeISO(), Validators.required),
    descricao: this.fb.nonNullable.control(''),
    cargaHoraria: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    validadeCertificado: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
  });
}

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() retorna o objeto completo e tipado (sem Partial)
    const dto: CursoCreateDTO = this.form.getRawValue();

    this.cursoService.criar(dto).subscribe({
      next: (res) => {
        console.log('Salvo!', res);
        this.limpar();
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
      },
    });
  }

  limpar() {
    this.form.reset({
      nomeCurso: '',
      dataCadastro: this.hojeISO(),
      descricao: '',
      cargaHoraria: 0,
      validadeCertificado: 0
    });
  }
}
