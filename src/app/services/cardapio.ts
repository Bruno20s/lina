import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OpcaoSelecionada {
  nome: string;          // Ex: "Omelete com Vegetais"
  descricao: string;     // Ex: "Omelete leve com vegetais frescos"
  periodoNome: string;   // Ex: "Café da Manhã"
  diaNome: string;       // Ex: "Segunda-feira"
}

@Injectable({
  providedIn: 'root'
})
export class CardapioService {
  // Estrutura: { [diaNome: string]: OpcaoSelecionada[] }
  private cardapioSemanal = new BehaviorSubject<Record<string, OpcaoSelecionada[]>>({});
  cardapioSemanal$ = this.cardapioSemanal.asObservable();

  /** 
   * Adiciona ou atualiza a refeição escolhida para um dia e período 
   */
  adicionarOuAtualizarRefeicao(diaNome: string, periodoNome: string, opcao: { nome: string; descricao: string }) {
    const atual = this.cardapioSemanal.value;

    // Garante que o dia exista
    if (!atual[diaNome]) {
      atual[diaNome] = [];
    }

    // Remove se já existir uma refeição para o mesmo período
    const dia = atual[diaNome].filter(r => r.periodoNome !== periodoNome);

    // Adiciona a nova refeição selecionada
    dia.push({
      nome: opcao.nome,
      descricao: opcao.descricao,
      periodoNome,
      diaNome
    });

    // Atualiza o BehaviorSubject com uma nova referência (importante!)
    this.cardapioSemanal.next({
      ...atual,
      [diaNome]: dia
    });

    console.log('📅 Refeição salva:', diaNome, periodoNome, opcao.nome);
  }

  /** Retorna o cardápio atual (útil para debug ou salvar em storage) */
  getCardapioAtual() {
    return this.cardapioSemanal.value;
  }
}
