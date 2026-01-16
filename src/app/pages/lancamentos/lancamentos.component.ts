import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './lancamentos.component.html',
  styleUrl: './lancamentos.component.scss'
})
export class LancamentosComponent {
  form;
  arquivoSelecionado: File | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nomeCurso: ['', Validators.required],
      participante: ['', Validators.required],
      instrutor: ['', Validators.required],
      descricao: [''],
      dataRealizacao: ['', Validators.required],
      dataVencimento: ['', Validators.required],
      anexo: this.fb.control<File | null>(null), // ✅ aqui
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.arquivoSelecionado = file;
    this.form.patchValue({ anexo: file }); // ✅ agora funciona
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('Lançamento:', this.form.value);
    console.log('Arquivo:', this.arquivoSelecionado);
  }

  limpar() {
    this.form.reset();
    this.arquivoSelecionado = null;
  }
}
