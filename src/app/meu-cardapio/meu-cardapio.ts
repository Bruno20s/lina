// meu-cardapio.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardapioService, OpcaoSelecionada } from '../services/cardapio'; // <-- Ajuste o caminho se necessário!
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Definimos o tipo de dado que virá do serviço
interface RefeicaoExibicao {
  nome: string;
  prato: string;
  icone: string;
  cor: string;
}

@Component({
  selector: 'app-meu-cardapio',
  // CORREÇÃO: Adicionando 'standalone: true' e movendo o CommonModule para 'imports'
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meu-cardapio.html',
  styleUrls: ['./meu-cardapio.css'],
})
export class MeuCardapioComponent implements OnInit {
  // Dados para os botões do menu, sem precisar de @Input
  diasSemana: string[] = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  diaSelecionado: string = 'Domingo';

  // Onde armazenaremos o cardápio lido do serviço. Usa o pipe 'async' no HTML.
  cardapioDoDia$!: Observable<Record<string, RefeicaoExibicao>>;

  // Estrutura fixa para os períodos do dia (baseado na sua imagem)
  periodosDoDia: RefeicaoExibicao[] = [
    { nome: 'Café da Manhã', icone: '☕', cor: '#fff7ed', prato: 'Adicionar Refeição' },
    { nome: 'Almoço', icone: '🍽️', cor: '#ecfdf5', prato: 'Adicionar Refeição' },
    { nome: 'Café da Tarde', icone: '🍪', cor: '#fff7ed', prato: 'Adicionar Refeição' },
    { nome: 'Jantar', icone: '🌙', cor: '#eef2ff', prato: 'Refeição' },
  ];

  // Estrutura para armazenar as refeicoes escolhidas
  refeicoes: Record<string, RefeicaoExibicao> = {};

  // INJEÇÃO: Injetamos o CardapioService
  constructor(private router: Router, private cardapioService: CardapioService) {}

 ngOnInit(): void {
  // Observa as alterações no cardápio
  this.cardapioService.cardapioSemanal$.subscribe(cardapio => {
    const refeicoesDoDia = cardapio[this.diaSelecionado];
    
    if (refeicoesDoDia) {
      // Atualiza a refeição salva
      refeicoesDoDia.forEach(r => {
        const periodo = this.periodosDoDia.find(p => p.nome === r.periodoNome);
        if (periodo) {
          this.refeicoes[r.periodoNome] = {
            nome: periodo.nome,
            icone: periodo.icone,
            cor: periodo.cor,
            prato: r.nome 
          };
        }
      });
    }
  });

  this.carregarCardapioDoDia();
}


  carregarCardapioDoDia() {
  this.cardapioDoDia$ = this.cardapioService.cardapioSemanal$.pipe(
    map(cardapioCompleto => {
      console.log('DEBUG: cardapioCompleto (raw):', cardapioCompleto);

      // Proteção: se cardapioCompleto não for um objeto, transforma em objeto vazio
      if (!cardapioCompleto || typeof cardapioCompleto !== 'object') {
        return this.criarResultadoPadrao();
      }

      // Obtém as refeições do dia selecionado. Pode ser undefined -> usa array vazio.
      const refeicoesDoDia = cardapioCompleto[this.diaSelecionado] ?? [];
      console.log(`DEBUG: refeicoesDoDia para ${this.diaSelecionado}:`, refeicoesDoDia);

      // Se refeicoesDoDia não for array, trata como vazio e loga aviso
      if (!Array.isArray(refeicoesDoDia)) {
        console.warn(`WARN: esperava um array para ${this.diaSelecionado} mas recebeu:`, refeicoesDoDia);
        return this.criarResultadoPadrao();
      }

      const resultado: Record<string, RefeicaoExibicao> = {};

      // Monta o resultado a partir das refeições salvas
      refeicoesDoDia.forEach(refeicaoSalva => {
        // Segurança: garante que refeicaoSalva existe e tem as propriedades esperadas
        if (!refeicaoSalva || !refeicaoSalva.periodoNome) {
          console.warn('WARN: refeicaoSalva inválida encontrada:', refeicaoSalva);
          return; // pula este item
        }

        const periodoNome = refeicaoSalva.periodoNome;
        const pratoNome = refeicaoSalva.nome ?? 'Adicionar Refeição';
        const info = this.getIconeCor(periodoNome);

        resultado[periodoNome] = {
          nome: periodoNome,
          prato: pratoNome,
          icone: info.icone,
          cor: info.cor
        };
      });

      // Preenche com padrão os períodos que ainda não têm prato
      this.periodosDoDia.forEach(p => {
        if (!resultado[p.nome]) {
          resultado[p.nome] = { ...p }; // copia o padrão (Adicionar Refeição)
        }
      });

      console.log('DEBUG: resultado mapeado para exibição:', resultado);
      return resultado;
    })
  );
}

private getIconeCor(periodoNome: string) {
  const periodoEncontrado = this.periodosDoDia.find(p => p.nome === periodoNome);
  if (periodoEncontrado) {
    return { icone: periodoEncontrado.icone, cor: periodoEncontrado.cor };
  }
  // Valor padrão se não encontrar o período
  return { icone: '🍽️', cor: '#CCCCCC' };
}
  selecionarDia(dia: string) {
    this.diaSelecionado = dia;
    this.carregarCardapioDoDia(); // Recarrega o cardápio para o novo dia
  }

/** Retorna um objeto resultado padrão (todos os períodos com "Adicionar Refeição") */
private criarResultadoPadrao(): Record<string, RefeicaoExibicao> {
  const padrao: Record<string, RefeicaoExibicao> = {};
  this.periodosDoDia.forEach(p => {
    padrao[p.nome] = { ...p };
  });
  return padrao;
}
// 👉 abre a tela de seleção (cardápio-semanal) para adicionar uma refeição
adicionarRefeicao(periodoNome: string) {
  console.log(`Adicionar refeição para ${this.diaSelecionado} - ${periodoNome}`);
  this.router.navigate(['/cardapio-semanal']); 
}

// 👉 abre a tela de seleção para mudar a refeição já escolhida
mudarRefeicao(periodoNome: string) {
  console.log(`Mudar refeição para ${this.diaSelecionado} - ${periodoNome}`);
  this.router.navigate(['/cardapio-semanal']); 
}

// 👉 botão “Ver Receita” (não faz nada ainda, só loga)
verReceita(prato: string) {
  console.log('Ver receita:', prato);
}

}