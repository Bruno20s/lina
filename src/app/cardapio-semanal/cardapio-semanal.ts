import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardapioService } from '../services/cardapio'; 

interface Opcao {
  nome: string;
  descricao: string;
  selecionado?: boolean;
}

interface Periodo {
  nome: string;
  icone: string;
  opcoes: Opcao[];
}

interface DiaSemana {
  nome: string;
  periodos: Periodo[];
  refeicoesSelecionadas: number;
}

@Component({
  selector: 'app-cardapio-semanal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cardapio-semanal.html',
  styleUrls: ['./cardapio-semanal.css']
})
export class CardapioSemanalComponent {
  
  // 2. Injete o serviço no construtor
  constructor(private cardapioService: CardapioService) { }

  diasSemana: DiaSemana[] = [
    this.criarDia('Segunda-feira'),
    this.criarDia('Terça-feira'),
    this.criarDia('Quarta-feira'),
    this.criarDia('Quinta-feira'),
    this.criarDia('Sexta-feira'),
    this.criarDia('Sábado'),
    this.criarDia('Domingo'),
  ];

  // Função que gera o mesmo conteúdo para cada dia (MANTIDO)
  private criarDia(nome: string): DiaSemana {
    return {
      nome,
      refeicoesSelecionadas: 0,
      periodos: [
        // ... (Seus períodos e opções originais)
        {
          nome: 'Café da Manhã',
          icone: '☕',
          opcoes: [
            { nome: 'Smoothie de Frutas Vermelhas', descricao: 'Smoothie nutritivo com frutas vermelhas e leite de amêndoa' },
            { nome: 'Omelete com Vegetais', descricao: 'Omelete leve com vegetais frescos' },
            { nome: 'Pão Integral com Abacate', descricao: 'Torrada integral com abacate e ovo pochê' }
          ]
        },
        {
          nome: 'Almoço',
          icone: '🌞',
          opcoes: [
            { nome: 'Peixe Assado com Batata Doce', descricao: 'Filé de peixe assado com batata doce e vegetais' },
            { nome: 'Frango Grelhado com Quinoa', descricao: 'Peito de frango grelhado com quinoa e legumes salteados' },
            { nome: 'Salmão com Batata Doce', descricao: 'Salmão assado com batata doce e salada verde' }
          ]
        },
        {
          nome: 'Café da Tarde',
          icone: '🍪',
          opcoes: [
            { nome: 'Chips de Batata Doce', descricao: 'Chips crocantes de batata doce assados' },
            { nome: 'Castanhas e Frutas', descricao: 'Mix de castanhas com maçã verde' },
            { nome: 'Vitamina de Abacate', descricao: 'Vitamina de abacate com leite desnatado' }
          ]
        },
        {
          nome: 'Jantar',
          icone: '🌙',
          opcoes: [
            { nome: 'Berinjela Recheada', descricao: 'Berinjela assada recheada com quinoa e vegetais' },
            { nome: 'Sopa de Legumes', descricao: 'Sopa nutritiva de legumes com frango desfiado' },
            { nome: 'Peixe ao Forno', descricao: 'Filé de peixe branco ao forno com ervas e legumes' }
          ]
        }
      ]
    };
  }

  selecionarOpcao(dia: DiaSemana, periodo: Periodo, opcao: Opcao) {
    periodo.opcoes.forEach(o => (o.selecionado = false));
    opcao.selecionado = true;

    const totalSelecionadas = dia.periodos.filter(p =>
      p.opcoes.some(o => o.selecionado)
    ).length;

    dia.refeicoesSelecionadas = totalSelecionadas;
    
    // 3. CHAMA O SERVIÇO PARA SALVAR A INFORMAÇÃO!
    this.cardapioService.adicionarOuAtualizarRefeicao(
      dia.nome, 
      periodo.nome, 
      opcao
    );
  }
}