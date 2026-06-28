import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login-acesso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-acesso.component.html',
  styleUrls: ['./login-acesso.component.scss']
})
export class LoginAcessoComponent {
  form;
  mensagemErro = '';

  constructor(
  private fb: FormBuilder,
  private router: Router,
  private authService: AuthService
) {
    this.form = this.fb.group({
      login: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  logar(): void {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.mensagemErro = 'Informe login e senha.';
    return;
  }

  const payload = {
    login: this.form.controls.login.value || '',
    senha: this.form.controls.senha.value || ''
  };

  this.authService.login(payload).subscribe({

    next: (res) => {
      this.authService.salvarSessao(res.usuario);
      this.router.navigate(['/home']);
    },

    error: (e) => {
      this.mensagemErro =
        e.message || 'Login ou senha inválidos.';
    }

  });
}
}