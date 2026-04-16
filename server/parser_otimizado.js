// Parser Financeiro Resiliente - Formato garantido para backend
class FinanceParser {
  constructor() {
    // Categorias SEM ACENTOS
    this.categorias = {
      'alimentacao': ['mercado', 'supermercado', 'restaurante', 'lanchonete', 'padaria', 'food', 'comida', 'refeicao', 'jantar', 'almoco', 'cafe', 'big box', 'carrefour', 'extra', 'assai', 'atacadao'],
      'transporte': ['uber', 'taxi', 'onibus', 'metro', 'combustivel', 'gasolina', 'estacionamento', 'viagem', 'transporte', 'corrida', '99', 'tim', 'operadora'],
      'moradia': ['aluguel', 'condominio', 'luz', 'agua', 'gas', 'internet', 'telefone', 'casa', 'apartamento', 'net', 'fatura'],
      'saude': ['farmacia', 'remedio', 'medico', 'hospital', 'plano de saude', 'dentista', 'consulta', 'exame', 'drogaria'],
      'lazer': ['cinema', 'teatro', 'parque', 'viagem', 'hospedagem', 'show', 'evento', 'diversao', 'netflix', 'spotify'],
      'educacao': ['curso', 'livro', 'material', 'escola', 'faculdade', 'mensalidade', 'apostila', 'udemy', 'coursera'],
      'vestuario': ['roupa', 'calcado', 'acessorio', 'camisa', 'calca', 'tenis', 'sapato', 'zara', 'renner'],
      'investimento': ['acoes', 'fundos', 'reserva', 'poupanca', 'cdb', 'tesouro', 'cripto', 'bitcoin'],
      'salario': ['salario', 'ordenado', 'rendimento', 'contracheque', 'holerite'],
      'freelance': ['freelance', 'servico', 'cliente', 'projeto', 'trabalho extra', 'consultoria'],
      'outros': []
    };

    this.palavrasEntrada = ['recebi', 'ganhei', 'salario', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'servico', 'rendimento', 'contracheque'];
    this.palavrasSaida = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'debito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];
  }

  parseAll(mensagem) {
    const warnings = [];
    const transacoes = this.extrairMultiplasTransacoes(mensagem, warnings);

    return { transactions: transacoes, count: transacoes.length, warnings };
  }

  extrairMultiplasTransacoes(mensagem, warnings) {
    const transacoes = [];
    if (!mensagem || typeof mensagem !== 'string') return transacoes;

    const segmentos = this.segmentar(mensagem);
    for (const segmento of segmentos) {
      const t = this.analisarSegmento(segmento, warnings);
      if (t) transacoes.push(t);
    }

    if (transacoes.length === 0) {
      const fallback = this.extrairFallback(mensagem, warnings);
      transacoes.push(...fallback);
    }

    return transacoes;
  }

  segmentar(mensagem) {
    let str = mensagem.toLowerCase().trim();
    if (!str) return [];
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0 && s.length < 300);
  }

  analisarSegmento(segmento, warnings) {
    const match = segmento.match(/(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i);
    if (!match) return null;

    const valor = parseFloat(match[1].replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return null;

    let tipo = this.determinarTipo(segmento);
    if (!tipo) {
      tipo = 'gasto';
      warnings.push(`Transação sem verbo assumida como gasto: "${segmento.substring(0, 30)}..."`);
    }

    // CONVERTER para formato do backend
    const tipoBackend = tipo === 'entrada' ? 'income' : 'expense';

    const descricao = this.extrairDescricao(segmento, match, tipo);
    const categoria = this.detectarCategoria(segmento, tipo, descricao);
    const data = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return {
      type: tipoBackend,
      amount: valor,
      currency: 'BRL',
      date: data,
      description: descricao,
      category: categoria
    };
  }

  extrairDescricao(segmento, match, tipo) {
    const depois = segmento.substring(match.index + match[0].length).trim()
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '');
    const antes = segmento.substring(0, match.index).trim()
      .replace(/^(?:recebi|ganhei|salario|salario|renda|lucro|vendi|receber|pagaram|depositaram|reembolso|estorno|dividendo|juros|aluguel|freelance|servico|rendimento|contracheque|gastei|paguei|comprei|custo|despesa|debito|saquei|pagamento|compra|retirada|saque|gastar|pagar|comprar)\s+/i, '');

    const desc = depois || antes || (tipo === 'entrada' ? 'Receita' : 'Despesa');
    const texto = desc.trim();

    if (!texto) return tipo === 'entrada' ? 'Receita' : 'Despesa';

    const capitalizado = texto.charAt(0).toUpperCase() + texto.slice(1);
    return capitalizado.length > 30 ? capitalizado.split(' ').slice(0, 4).join(' ') + '...' : capitalizado;
  }

  determinarTipo(segmento) {
    const temEntrada = this.palavrasEntrada.some(p => segmento.includes(p));
    const temSaida = this.palavrasSaida.some(p => segmento.includes(p));

    if (temEntrada && !temSaida) return 'entrada';
    if (temSaida) return 'gasto';
    if (/\b(recebi|ganhei|vendi|aluguel)\b/.test(segmento)) return 'entrada';
    return null;
  }

  detectarCategoria(segmento, tipo, descricao) {
    const texto = (segmento + ' ' + descricao).toLowerCase();
    for (const [cat, palavras] of Object.entries(this.categorias)) {
      if (cat === 'outros') continue;
      if ((cat === 'salario' || cat === 'freelance') && tipo !== 'entrada') continue;
      if (palavras.some(p => texto.includes(p))) return cat;
    }
    return 'outros';
  }

  extrairFallback(mensagem, warnings) {
    const transacoes = [];
    const regex = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/gi;
    let match;

    while ((match = regex.exec(mensagem)) !== null) {
      const valor = parseFloat(match[1].replace(',', '.'));
      if (!valor || valor <= 0) continue;

      const inicio = Math.max(0, match.index - 50);
      const fim = Math.min(mensagem.length, match.index + match[0].length + 50);
      const contexto = mensagem.substring(inicio, fim);

      const tipo = this.determinarTipo(contexto) || 'gasto';
      const tipoBackend = tipo === 'entrada' ? 'income' : 'expense';
      const categoria = this.detectarCategoria(contexto, tipo, '');

      warnings.push(`Transação extraída por fallback (baixa confiança)`);

      transacoes.push({
        type: tipoBackend,
        amount: valor,
        currency: 'BRL',
        date: new Date().toISOString().split('T')[0],
        description: tipo === 'entrada' ? 'Receita' : 'Despesa',
        category: categoria
      });
    }

    return transacoes;
  }

  parse(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem, []);
    return transacoes[0] || null;
  }

  sugerirTransacao(mensagem) {
    const warnings = [];
    const transacoes = this.extrairMultiplasTransacoes(mensagem, warnings);

    if (transacoes.length === 0) {
      return { valido: false, mensagem: 'Nenhuma transação detectada.', warnings };
    }

    return {
      valido: true,
      transacoes,
      warnings,
      sugestoes: transacoes.map(t => `${t.type.toUpperCase()} R$ ${t.amount.toFixed(2)} - ${t.category} - ${t.description}`)
    };
  }
}

module.exports = FinanceParser;
