// Parser Robusto - Segmentação + Análise por segmento
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
  }

  parseAll(mensagem) {
    return {
      transactions: this.extrairMultiplasTransacoes(mensagem),
      count: 0
    };
  }

  extrairMultiplasTransacoes(mensagem) {
    const transacoes = [];

    // 1. Segmentar a mensagem por conectores que indicam nova transação
    // Manter conectores como parte do segmento para preservar o verbo
    const segmentos = this.segmentarMensagem(mensagem);

    for (const segmento of segmentos) {
      const transacao = this.analisarSegmento(segmento);
      if (transacao) {
        transacoes.push(transacao);
      }
    }

    return transacoes;
  }

  segmentarMensagem(mensagem) {
    // Normalizar conectores para vírgula
    let str = mensagem.toLowerCase().trim();

    // Substituir padrões de separação por vírgula
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');
    str = str.replace(/\s+em\s+/gi, ', ');
    str = str.replace(/\s+para\s+/gi, ', ');
    str = str.replace(/\s+com\s+/gi, ', ');
    str = str.replace(/\s+no\s+/gi, ', ');
    str = str.replace(/\s+na\s+/gi, ', ');
    str = str.replace(/\s+de\s+/gi, ', ');
    str = str.replace(/\s+a\s+/gi, ', ');

    // Split por vírgula
    const parts = str.split(',').map(p => p.trim()).filter(p => p);

    return parts;
  }

  analisarSegmento(segmento) {
    // Verificar se o segmento contém um valor monetário
    const regexValor = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i;
    const match = regexValor.exec(segmento);

    if (!match) return null;

    const valorStr = match[1].replace(',', '.');
    const valor = parseFloat(valorStr);
    if (!valor || valor <= 0) return null;

    // Determinar tipo baseado em palavras-chave no segmento
    const tipo = this.determinarTipoSegmento(segmento);

    // Extrair descrição
    const descricao = this.extrairDescricaoSegmento(segmento, valor, tipo);

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
  }

  determinarTipoSegmento(segmento) {
    const entradas = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    const saidas = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];

    for (const pal of entradas) {
      if (segmento.includes(pal)) return 'entrada';
    }
    for (const pal of saidas) {
      if (segmento.includes(pal)) return 'gasto';
    }

    // Se não tem verbo claro, verificar se há palavras de entrada em qualquer lugar
    if (/\b(recebi|ganhei|salário|salario|renda|lucro|vendi)\b/.test(segmento)) {
      return 'entrada';
    }

    return 'gasto'; // padrão
  }

  extrairDescricaoSegmento(segmento, valor, tipo) {
    // Remover valor e unidades monetárias
    let texto = segmento
      .replace(/(?:r\$)?\s*\d+(?:[.,]\d{2})?\s*(?:reais)?/i, '')
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!texto) {
      return tipo === 'entrada' ? 'Receita' : 'Despesa';
    }

    // Limitar tamanho
    if (texto.length > 30) {
      texto = texto.split(' ').slice(0, 4).join(' ') + '...';
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  detectarCategoria(segmento, tipo, descricao) {
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
    return 'outros';
  }

  parse(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);
    return transacoes[0] || null;
  }

  sugerirTransacao(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);
    if (transacoes.length === 0) {
      return { valido: false, mensagem: 'Nenhuma transação detectada.' };
    }
    return {
      valido: true,
      transacoes,
      sugestoes: transacoes.map(t => `${t.type.toUpperCase()} R$ ${t.amount.toFixed(2)} - ${t.category} - ${t.description}`)
    };
  }
}

module.exports = FinanceParser;
