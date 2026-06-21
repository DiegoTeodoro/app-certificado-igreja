import { Routes } from '@angular/router';

export const routes: Routes = [
 {path: 'login',loadComponent: () =>import('./pages/login-acesso/login-acesso.component').then(m => m.LoginAcessoComponent)},
  // Cursos
  { path: 'cursos', loadComponent: () => import('./pages/lista-curso/lista-curso.component').then(m => m.ListaCursoComponent) },
  { path: 'novo-curso', loadComponent: () => import('./pages/novo-curso/novo-curso.component').then(m => m.NovoCursoComponent) },
  { path: 'novo-curso/:id', loadComponent: () => import('./pages/novo-curso/novo-curso.component').then(m => m.NovoCursoComponent) },

  // Cadastro
  {  path: 'participante', loadComponent: () => import('./pages/lista-participante/lista-participante.component').then(m => m.ListaParticipanteComponent) },
  { path: 'novo-participante', loadComponent: () => import('./pages/participante/participante.component').then(m => m.ParticipanteComponent) },
  { path: 'certificados', loadComponent: () => import('./pages/certificados/certificados.component').then(m => m.CertificadosComponent) },
  { path: 'lancamentos', loadComponent: () => import('./pages/lancamentos/lancamentos.component').then(m => m.LancamentosComponent) },
 { path: 'participante', loadComponent: () => import('./pages/lista-participante/lista-participante.component').then(m => m.ListaParticipanteComponent) },
 { path: 'cadastro-usuario', loadComponent: () => import('./pages/cadastro-usuario/cadastro-usuario.component').then(m => m.CadastroUsuarioComponent) },
  // ✅ Relatórios (ADICIONAR)
  {path: 'relatorio-participantes', loadComponent: () => import('./pages/relatorio/relatorio-participantes/relatorio-participantes.component').then(m => m.RelatorioParticipantesComponent)},
   {path: 'relatorio-certificado-vencer', loadComponent: () => import('./pages/relatorio/relatorio-certificado-vencer/relatorio-certificado-vencer.component').then(m => m.RelatorioCertificadoVencerComponent)},
 

  // ✅ opcional: rota coringa
  { path: '**', redirectTo: 'cursos' },
];
