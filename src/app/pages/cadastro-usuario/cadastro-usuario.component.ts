import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  UsuarioService,
  UsuarioRequest,
  UsuarioListItem
} from '../../../core/usuario.service';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss']
})
export class CadastroUsuarioComponent implements OnInit {

  form;

  usuarios: UsuarioListItem[] = [];

  mostrarAlert = false;
  mostrarErro = false;
  mensagemSucesso = '';
  mensagemErro = '';
  private alertTimer: any;
  usuarioEditandoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {
    this.form = this.fb.group({
      login: ['', [Validators.required, Validators.maxLength(100)]],
      senha: ['', [Validators.required, Validators.maxLength(100)]],
      status: ['ATIVO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.listarUsuarios();
  }

 salvar(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.mensagemErro = 'Preencha todos os campos obrigatórios.';
    this.mostrarErroAlert();
    return;
  }

  const payload = this.form.value as UsuarioRequest;

  if (this.usuarioEditandoId) {
    this.usuarioService.atualizar(this.usuarioEditandoId, payload).subscribe({
      next: () => {
        this.mensagemSucesso = 'Usuário atualizado com sucesso!';
        this.mostrarAlertSucesso();

        this.usuarioEditandoId = null;
        this.limpar();
        this.listarUsuarios();
      },
      error: (e) => {
        this.mensagemErro = e.message || 'Erro ao atualizar usuário.';
        this.mostrarErroAlert();
      }
    });

    return;
  }

  this.usuarioService.cadastrar(payload).subscribe({
    next: () => {
      this.mensagemSucesso = 'Usuário cadastrado com sucesso!';
      this.mostrarAlertSucesso();
      this.limpar();
      this.listarUsuarios();
    },
    error: (e) => {
      this.mensagemErro = e.message || 'Erro ao salvar usuário.';
      this.mostrarErroAlert();
    }
  });
}

  listarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (dados) => {
        this.usuarios = dados;
      },
      error: (e) => {
        console.error('Erro ao listar usuários', e);
      }
    });
  }

 limpar(): void {
  this.usuarioEditandoId = null;

  this.form.reset({
    login: '',
    senha: '',
    status: 'ATIVO'
  });
}

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ATIVO':
        return 'ok';
      case 'INATIVO':
        return 'bad';
      default:
        return '';
    }
  }

  private mostrarAlertSucesso(): void {
    this.mostrarAlert = true;
    if (this.alertTimer) clearTimeout(this.alertTimer);

    this.alertTimer = setTimeout(() => {
      this.mostrarAlert = false;
    }, 3000);
  }

  private mostrarErroAlert(): void {
    this.mostrarErro = true;
    if (this.alertTimer) clearTimeout(this.alertTimer);

    this.alertTimer = setTimeout(() => {
      this.mostrarErro = false;
    }, 3000);
  }

 editar(usuario: UsuarioListItem): void {
  this.usuarioEditandoId = usuario.id;

  this.form.patchValue({
    login: usuario.login,
    senha: usuario.senha,
    status: usuario.status
  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


}