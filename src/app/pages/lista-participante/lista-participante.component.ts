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

  form;

  constructor(
    private fb: FormBuilder,
    private participanteService: ParticipanteService,
    private router: Router
  ) {
    this.form = this.fb.group({
      q: [""],
    });
  }

  ngOnInit(): void {
    this.carregarParticipantes();
    this.form.controls.q.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.carregarParticipantes();
    });
  }

  carregarParticipantes(): void {
    const nome = this.form.controls.q.value || "";

    this.participanteService.listarRelatorio(nome).subscribe({
      next: (dados) => {
        this.participantes = dados;
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
    });

    this.carregarParticipantes();
  }
   novoParticipante(): void {
  this.router.navigate(['/novo-participante']);
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
