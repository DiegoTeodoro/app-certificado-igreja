import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  [x: string]: any;

  nomeUsuario = '';

  constructor(
    private router: Router,
  private authService: AuthService
  ) {}

  ngOnInit(): void {

    const usuario = localStorage.getItem('usuarioLogado');

    if (usuario) {
      const dados = JSON.parse(usuario);
      this.nomeUsuario = dados.login;
    }
  }

  logout(): void {

   this.authService.logout();
  this.router.navigate(['/login']);
  }
}