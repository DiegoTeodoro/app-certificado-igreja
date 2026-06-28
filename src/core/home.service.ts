import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HomeResumo {
  cursos: number;
  participantes: number;
  certificados: number;
  lancamentos: number;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly baseUrl = 'http://localhost:3000/api/home';

  constructor(private http: HttpClient) {}

  buscarResumo(): Observable<HomeResumo> {
    return this.http.get<HomeResumo>(`${this.baseUrl}/resumo`);
  }
}