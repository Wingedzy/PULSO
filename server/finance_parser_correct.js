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
    const segmentos = this.segmentar(mensagem);

    for (const segmento of segmentos) {
      const t = this.processarSegmento(segmento);
      if (t) transacoes.push(t);
    }

    return transacoes;
  }

  segmentar(mensagem) {
    let str = mensagem.toLowerCase().trim();
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');
    str = str.replace(/\s+em\s+/gi, ', ');
    str = str.replace(/\s+para\s+/gi, ', ');
    str = str.replace(/\s+com\s+/gi, ', ');
    str = str.replace(/\s+no\s+/gi, ', ');
    str = str.replace(/\s+na\s+/gi, ', ');
    str = str.replace(/\s+de\s+/gi, ', ');
    str = str.replace(/\s+a\s+/gi, ', ');
    str = str.replace(/,+/g, ', ');

    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  processarSegmento(segmento) {
    const match = segmento.match(/(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i);
    if (!match) return null;

    const valor = parseFloat(match[1].replace(',', '.'));
    if (!valor || valor <= 0) return null;

    const tipo = this.determinarTipoSegmento(segmento);
    let desc = segmento
      .replace(match[0], '')
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .trim();

    if (!desc) {
      desc = tipo === 'entrada' ? 'Receita' : 'Despesa';
    } else {
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
      if (desc.length > 30) {
        desc = desc.split(' ').slice(0, 4).join(' ') + '...';
      }
    }

    const categoria = this.detectarCategoria(segmento, tipo, desc);
    const data = new Date().toISOString().split('T')[0];

    return {
      type: tipo,
      amount: valor,
      currency: 'BRL',
      date: data,
      description: desc,
      category: categoria
    };
  }

  determinarTipoSegmento(segmento) {
    const entradas = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    const saidas = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];

    if (entradas.some(p => segmento.includes(p))) return 'entrada';
    if (saidas.some(p => segmento.includes(p))) return 'gasto';

    if (/\b(recebi|ganhei|vendi|aluguel)\b/.test(segmento)) return 'entrada';
    return 'gasto';
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
