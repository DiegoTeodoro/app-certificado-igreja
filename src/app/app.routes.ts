import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'novo-curso', pathMatch: 'full' },

  { path: 'novo-curso', loadComponent: () => import('./pages/novo-curso/novo-curso.component').then(m => m.NovoCursoComponent) },
  { path: 'participante', loadComponent: () => import('./pages/participante/participante.component').then(m => m.ParticipanteComponent) },
  { path: 'certificados', loadComponent: () => import('./pages/certificados/certificados.component').then(m => m.CertificadosComponent) },
  { path: 'lancamentos', loadComponent: () => import('./pages/lancamentos/lancamentos.component').then(m => m.LancamentosComponent) },
 { path: 'relatorio-participantes', loadComponent: () => import('./pages/relatorio/relatorio-participantes/relatorio-participantes.component').then(m => m.RelatorioParticipantesComponent) },


];
