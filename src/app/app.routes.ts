import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'cursos', pathMatch: 'full' },

  // Cursos
  { path: 'cursos', loadComponent: () => import('./pages/lista-curso/lista-curso.component').then(m => m.ListaCursoComponent) },
  { path: 'novo-curso', loadComponent: () => import('./pages/novo-curso/novo-curso.component').then(m => m.NovoCursoComponent) },
  { path: 'novo-curso/:id', loadComponent: () => import('./pages/novo-curso/novo-curso.component').then(m => m.NovoCursoComponent) },

  // Cadastro
  { path: 'participante', loadComponent: () => import('./pages/participante/participante.component').then(m => m.ParticipanteComponent) },
  { path: 'certificados', loadComponent: () => import('./pages/certificados/certificados.component').then(m => m.CertificadosComponent) },
  { path: 'lancamentos', loadComponent: () => import('./pages/lancamentos/lancamentos.component').then(m => m.LancamentosComponent) },

  // ✅ Relatórios (ADICIONAR)
  {path: 'relatorio-participantes', loadComponent: () => import('./pages/relatorio/relatorio-participantes/relatorio-participantes.component').then(m => m.RelatorioParticipantesComponent)},
   {path: 'relatorio-certificado-vencer', loadComponent: () => import('./pages/relatorio/relatorio-certificado-vencer/relatorio-certificado-vencer.component').then(m => m.RelatorioCertificadoVencerComponent)},
 

  // ✅ opcional: rota coringa
  { path: '**', redirectTo: 'cursos' },
];
