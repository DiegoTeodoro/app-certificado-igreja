import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../../core/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  usuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || '{}');

  cards = [
    { titulo: 'Cursos', total: 0, icone: 'bi-journal-bookmark-fill', rota: '/cursos' },
    { titulo: 'Participantes', total: 0, icone: 'bi-people-fill', rota: '/participante' },
    { titulo: 'Certificados', total: 0, icone: 'bi-award-fill', rota: '/certificados' },
    { titulo: 'Lançamentos', total: 0, icone: 'bi-clipboard-check-fill', rota: '/lancamentos' }
  ];

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.carregarResumo();
  }

  carregarResumo(): void {
    this.homeService.buscarResumo().subscribe({
      next: (res) => {
        this.cards[0].total = res.cursos;
        this.cards[1].total = res.participantes;
        this.cards[2].total = res.certificados;
        this.cards[3].total = res.lancamentos;
      },
      error: (erro) => {
        console.error('Erro ao carregar dashboard', erro);
      }
    });
  }
}