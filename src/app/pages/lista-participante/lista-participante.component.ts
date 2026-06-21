import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { debounceTime } from "rxjs";
import {
  ParticipanteService,
  ParticipanteRelatorioItem,
} from "../../../core/participante.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-lista-participante",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./lista-participante.component.html",
  styleUrl: "./lista-participante.component.scss",
})
export class ListaParticipanteComponent implements OnInit {
 
  participantes: ParticipanteRelatorioItem[] = [];
  paginaAtual = 1;
  opcoesPaginacao = [10, 25, 50, 100];
  form;

  constructor(
    private fb: FormBuilder,
    private participanteService: ParticipanteService,
    private router: Router
  ) {
    this.form = this.fb.group({
    q: [""],
    itensPorPagina: [10],
});
  }

  ngOnInit(): void {
  this.carregarParticipantes();

  this.form.controls.q.valueChanges
    .pipe(debounceTime(500))
    .subscribe(() => {
      this.carregarParticipantes();
    });

  this.form.controls.itensPorPagina.valueChanges
    .subscribe(() => {
      this.paginaAtual = 1;
    });
}

  carregarParticipantes(): void {
    const nome = this.form.controls.q.value || "";

    this.participanteService.listarRelatorio(nome).subscribe({
      next: (dados) => {
        this.participantes = dados;
  this.paginaAtual = 1;
      },
      error: (erro) => {
        console.error("Erro ao carregar participantes", erro);
      },
    });
  
}
  

  pesquisar(): void {
    this.carregarParticipantes();
  }

  limpar(): void {
  this.form.reset({
    q: "",
    itensPorPagina: 10,
  });

  this.paginaAtual = 1;
  this.carregarParticipantes();
}


   novoParticipante(): void {
  this.router.navigate(['/novo-participante']);
}

get itensPorPagina(): number {
  return Number(this.form.controls.itensPorPagina.value) || 10;
}

get totalRegistros(): number {
  return this.participantes.length;
}

get totalPaginas(): number {
  return Math.ceil(this.totalRegistros / this.itensPorPagina) || 1;
}

get participantesPaginados(): ParticipanteRelatorioItem[] {
  const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
  const fim = inicio + this.itensPorPagina;

  return this.participantes.slice(inicio, fim);
}

paginaAnterior(): void {
  if (this.paginaAtual > 1) {
    this.paginaAtual--;
  }
}

proximaPagina(): void {
  if (this.paginaAtual < this.totalPaginas) {
    this.paginaAtual++;
  }
}
  editar(participante: ParticipanteRelatorioItem): void {
    this.router.navigate(["/novo-participante"], {
      state: { participante },
    });
  }
  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case "ATIVO":
        return "ok";

      case "INATIVO":
        return "bad";

      default:
        return "";
    }
  }
  
}
