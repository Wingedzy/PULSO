// Parser Financeiro Final - Resiliente e Robusto
class FinanceParser {
  constructor() {
    this.categorias = {
      'alimentação': ['mercado', 'supermercado', 'restaurante', 'lanchonete', 'padaria', 'food', 'comida', 'refeição', 'jantar', 'almôço', 'café', 'big box', 'carrefour', 'extra', 'assai', 'atacadao'],
      'transporte': ['uber', 'taxi', 'ônibus', 'metrô', 'combustível', 'gasolina', 'estacionamento', 'viagem', 'transporte', 'corrida', '99', 'tim', 'operadora'],
      'moradia': ['aluguel', 'condomínio', 'luz', 'água', 'gás', 'internet', 'telefone', 'casa', 'apartamento', 'net', 'fatura'],
      'saúde': ['farmácia', 'remédio', 'médico', 'hospital', 'plano de saúde', 'dentista', 'consulta', 'exame', 'drogaria'],
      'lazer': ['cinema', 'teatro', 'parque', 'viagem', 'hospedagem', 'show', 'evento', 'diversão', 'netflix', 'spotify'],
      'educação': ['curso', 'livro', 'material', 'escola', 'faculdade', 'mensalidade', 'apostila', 'udemy', 'coursera'],
      'vestuário': ['roupa', 'calçado', 'acessório', 'camisa', 'calça', 'tênis', 'sapato', 'zara', 'renner'],
      'investimento': ['ações', 'fundos', 'reserva', 'poupança', 'cdb', 'tesouro', 'cripto', 'bitcoin'],
      'salário': ['salário', 'ordenado', 'rendimento', 'contracheque', 'holerite'],
      'freelance': ['freelance', 'serviço', 'cliente', 'projeto', 'trabalho extra', 'consultoria'],
      'outros': []
    };

    this.palavrasEntrada = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    this.palavrasSaida = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];
  }

  parseAll(mensagem) {
    try {
      const transacoes = this.extrairMultiplasTransacoes(mensagem);
      return {
        transactions: transacoes,
        count: transacoes.length,
        incomplete: false
      };
    } catch (error) {
      return {
        transactions: [],
        count: 0,
        incomplete: false
      };
    }
  }

  extrairMultiplasTransacoes(mensagem) {
    const transacoes = [];
    const segmentos = this.segmentarMensagem(mensagem);

    for (const segmento of segmentos) {
      const transacao = this.analisarSegmento(segmento);
      if (transacao) {
        transacoes.push(transacao);
      }
    }

    // Se não encontrou nada, tentar extração global por valores
    if (transacoes.length === 0) {
      const globais = this.extrairPorValoresGlobais(mensagem);
      transacoes.push(...globais);
    }

    return transacoes;
  }

  segmentarMensagem(mensagem) {
    if (!mensagem) return [];

    let str = mensagem.toLowerCase().trim();
    const conectores = [',', ' e ', ' e depois ', 'depois ', ' em ', ' para ', ' com ', ' no ', ' na ', ' de ', ' a '];

    conectores.forEach(conector => {
      if (conector === ',' || conector.includes(' ')) {
        const regex = new RegExp(conector.replace(/\s/g, '\\s*'), 'gi');
        str = str.replace(regex, ', ');
      }
    });

    return str.split(',').map(p => p.trim()).filter(p => p.length > 0 && p.length < 200);
  }

  analisarSegmento(segmento) {
    try {
      // Extrair valor
      const regexValor = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i;
      const match = regexValor.exec(segmento);
      if (!match) return null;

      const valor = parseFloat(match[1].replace(',', '.'));
      if (!valor || valor <= 0 || isNaN(valor)) return null;

      // Determinar tipo
      const tipo = this.determinarTipoSegmento(segmento);

      // Extrair descrição
      const descricao = this.extrairDescricao(segmento, tipo);

      // Detectar categoria
      const categoria = this.detectarCategoria(segmento, tipo, descricao);

      // Data (hoje)
      const data = new Date().toISOString().split('T')[0];

      return {
        type: tipo,
        amount: valor,
        currency: 'BRL',
        date: data,
        description: descricao,
        category: categoria
      };
    } catch (e) {
      return null;
    }
  }

  extrairDescricao(segmento, tipo) {
    // Remover valor do segmento
    let texto = segmento.replace(/(?:r\$)?\s*\d+(?:[.,]\d{2})?\s*(?:reais)?/i, '').trim();

    // Remover verbos do início
    texto = texto.replace(/^(?:recebi|ganhei|salário|salario|renda|lucro|vendi|receber|pagaram|depositaram|reembolso|estorno|dividendo|juros|aluguel|freelance|serviço|rendimento|contracheque|gastei|paguei|comprei|custo|despesa|débito|saquei|pagamento|compra|retirada|saque|gastar|pagar|comprar)\s+/i, '');

    // Remover preposições iniciais
    texto = texto.replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '');

    // Se ainda houver preposição no meio, pegar o que vem depois da última preposição
    const matchPreposicao = texto.match(/(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+(.+)/i);
    if (matchPreposicao) {
      texto = matchPreposicao[1];
    }

    texto = texto.trim();

    if (!texto) {
      return tipo === 'entrada' ? 'Receita' : 'Despesa';
    }

    // Capitalizar
    texto = texto.charAt(0).toUpperCase() + texto.slice(1);

    // Limitar tamanho
    if (texto.length > 30) {
      const palavras = texto.split(' ');
      texto = palavras.slice(0, 4).join(' ') + (palavras.length > 4 ? '...' : '');
    }

    return texto;
  }

  determinarTipoSegmento(segmento) {
    const temEntrada = this.palavrasEntrada.some(p => segmento.includes(p));
    const temSaida = this.palavrasSaida.some(p => segmento.includes(p));

    if (temEntrada && !temSaida) return 'entrada';
    if (temSaida) return 'gasto';

    if (/\b(recebi|ganhei|vendi|aluguel)\b/.test(segmento)) return 'entrada';
    return 'gasto';
  }

  detectarCategoria(segmento, tipo, descricao) {
    try {
      const completo = (segmento + ' ' + descricao).toLowerCase();

      for (const [categoria, palavras] of Object.entries(this.categorias)) {
        if (categoria === 'outros') continue;
        if ((categoria === 'salário' || categoria === 'freelance') && tipo !== 'entrada') continue;
        for (const palavra of palavras) {
          if (completo.includes(palavra)) {
            return categoria;
          }
        }
      }
    } catch (e) {
      // Silencioso
    }

    return 'outros';
  }

  extrairPorValoresGlobais(mensagem) {
    const transacoes = [];
    const regex = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/gi;
    let match;

    while ((match = regex.exec(mensagem)) !== null) {
      try {
        const valor = parseFloat(match[1].replace(',', '.'));
        if (!valor || valor <= 0 || isNaN(valor)) continue;

        // Contexto ao redor do valor
        const inicio = Math.max(0, match.index - 50);
        const fim = Math.min(mensagem.length, match.index + match[0].length + 50);
        const contexto = mensagem.substring(inicio, fim);

        const tipo = this.determinarTipoSegmento(contexto);
        const categoria = this.detectarCategoria(contexto, tipo, '');
        const data = new Date().toISOString().split('T')[0];

        transacoes.push({
          type: tipo,
          amount: valor,
          currency: 'BRL',
          date: data,
          description: tipo === 'entrada' ? 'Receita' : 'Despesa',
          category: categoria
        });
      } catch (e) {
        continue;
      }
    }

    return transacoes;
  }

  parse(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);
    return transacoes[0] || null;
  }

  sugerirTransacao(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);
    if (transacoes.length === 0) {
      return {
        valido: false,
        mensagem: 'Nenhuma transação detectada.'
      };
    }
    return {
      valido: true,
      transacoes,
      sugestoes: transacoes.map(t => `${t.type.toUpperCase()} R$ ${t.amount.toFixed(2)} - ${t.category} - ${t.description}`)
    };
  }
}

module.exports = FinanceParser;
