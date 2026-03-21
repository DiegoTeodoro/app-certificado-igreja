import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CursoCreateDTO, CursoService } from '../../../core/curso.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './novo-curso.component.html',
  styleUrl: './novo-curso.component.scss',
})
export class NovoCursoComponent implements OnInit {
  form: FormGroup<CursoForm>;

  cursoId: number | null = null;
  mensagemSucesso = 'Curso salvo com sucesso!';
  mostrarAlert = false;

  mostrarErro = false;
  mensagemErro = '';

  private alertTimer?: ReturnType<typeof setTimeout>;
  private hojeISO(): string {
    return new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  }

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nomeCurso: this.fb.nonNullable.control('', Validators.required),
      dataCadastro: this.fb.nonNullable.control(this.hojeISO(), Validators.required),
      descricao: this.fb.nonNullable.control(''),
      cargaHoraria: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
      validadeCertificado: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.cursoId = Number(idParam);

      // ✅ carrega do back e preenche o form
      this.cursoService.buscarPorId(this.cursoId).subscribe({
        next: (c) => {
          this.form.patchValue({
            nomeCurso: c.nomeCurso ?? '',
            dataCadastro: (c.dataCadastro ?? this.hojeISO()).substring(0, 10),
            descricao: c.descricao ?? '',
            cargaHoraria: c.cargaHoraria ?? 1,
            validadeCertificado: c.validadeCertificado ?? 1,
          });
        },
        error: (e) => {
          alert(e?.error?.message ?? 'Curso não encontrado.');
          this.router.navigate(['/cursos']);
        }
      });
    }
  }

  mostrarSucesso(msg: string) {
    this.mostrarAlert = true;

    if (this.alertTimer) clearTimeout(this.alertTimer);

    this.alertTimer = setTimeout(() => {
      this.mostrarAlert = false;
    }, 3000);
  }

  fecharAlert() {
    this.mostrarAlert = false;
    if (this.alertTimer) clearTimeout(this.alertTimer);
  }

  salvar() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.mensagemErro = 'Preencha todos os campos obrigatórios.';
    this.mostrarErroAlert();
    return;
  }

  const dto: CursoCreateDTO = this.form.getRawValue();

  if (this.cursoId) {
    this.cursoService.atualizar(this.cursoId, dto).subscribe({
      next: () => {
        this.mostrarSucesso('Curso atualizado com sucesso!');
        this.router.navigate(['/cursos']);
      },
      error: (err) => {
        console.error('Erro ao atualizar', err);
        this.mensagemErro = 'Erro ao atualizar curso.';
        this.mostrarErroAlert();
      },
    });
    return;
  }

  this.cursoService.criar(dto).subscribe({
    next: () => {
      this.mostrarSucesso('Curso salvo com sucesso!');
      this.limpar();
    },
    error: (err) => {
      console.error('Erro ao salvar', err);
      this.mensagemErro = 'Erro ao salvar curso.';
      this.mostrarErroAlert();
    },
  });
}

  mostrarErroAlert() {
  this.mostrarErro = true;

  if (this.alertTimer) clearTimeout(this.alertTimer);

  this.alertTimer = setTimeout(() => {
    this.mostrarErro = false;
  }, 3000);
}

  limpar() {
    // se está editando, limpar pode voltar pra lista (fica melhor UX)
    if (this.cursoId) {
      this.router.navigate(['/cursos']);
      return;
    }

    this.form.reset({
      nomeCurso: '',
      dataCadastro: this.hojeISO(),
      descricao: '',
      cargaHoraria: 1,
      validadeCertificado: 1
    });
  }
}
