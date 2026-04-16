// Nova versão do FinanceParser - Foco em multi-transação
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

    // Primeiro, normalizar a string
    let str = mensagem.toLowerCase().trim();

    // Substituir conectores por vírgulas para facilitar split
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');
    str = str.replace(/\s+em\s+/gi, ', ');
    str = str.replace(/\s+para\s+/gi, ', ');
    str = str.replace(/\s+com\s+/gi, ', ');
    str = str.replace(/\s+no\s+/gi, ', ');
    str = str.replace(/\s+na\s+/gi, ', ');
    str = str.replace(/\s+de\s+/gi, ', ');

    // Dividir por vírgulas
    const segmentos = str.split(',').map(s => s.trim()).filter(s => s);

    for (const segmento of segmentos) {
      const transacao = this.extrairTransacaoDeSegmento(segmento);
      if (transacao) {
        transacoes.push(transacao);
      }
    }

    return transacoes;
  }

  extrairTransacaoDeSegmento(segmento) {
    // Padrão 1: VERBO VALOR [contexto restante]
    const padrao1 = /^(recebi|ganhei|salário|salario|renda|lucro|vendi|gastei|paguei|comprei|custo|despesa|débito|saquei|pagamento|compra|retirada|saque)\s+(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(.*)$/i;
    const match1 = padrao1.exec(segmento);

    if (match1) {
      const verbo = match1[1].toLowerCase().trim();
      const valor = parseFloat(match1[2].replace(',', '.'));
      const contexto = (match1[3] || '').toLowerCase().trim();

      if (!valor || valor <= 0) return null;

      const tipo = this.determinarTipo(verbo);
      const descricao = this.extrairDescricao(contexto, verbo, tipo);
      const categoria = this.detectarCategoria(segmento, tipo, descricao);
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

    // Padrão 2: VALOR [contexto] (sem verbo explícito)
    const padrao2 = /^(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?\s*(.*)$/i;
    const match2 = padrao2.exec(segmento);

    if (match2) {
      const valor = parseFloat(match2[1].replace(',', '.'));
      const contexto = (match2[2] || '').toLowerCase().trim();

      if (!valor || valor <= 0) return null;

      // Determinar tipo: se o segmento contém palavras de entrada, é entrada, senão é gasto
      const temPalavraEntrada = /\b(recebi|ganhei|salário|salario|renda|lucro|vendi)\b/.test(segmento);
      const tipo = temPalavraEntrada ? 'entrada' : 'gasto';

      const descricao = this.extrairDescricao(contexto, null, tipo);
      const categoria = this.detectarCategoria(segmento, tipo, descricao);
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

    return null;
  }

  determinarTipo(verbo) {
    const entradas = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    return entradas.includes(verbo) ? 'entrada' : 'gasto';
  }

  extrairDescricao(contexto, verbo, tipo) {
    if (!contexto && !verbo) return tipo === 'entrada' ? 'Receita' : 'Despesa';

    let texto = contexto || verbo;

    // Remover preposições iniciais
    texto = texto.replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '');

    // Limitar tamanho
    if (texto.length > 30) {
      texto = texto.split(' ').slice(0, 4).join(' ') + '...';
    }

    // Capitalizar
    if (texto) {
      texto = texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    return texto || (tipo === 'entrada' ? 'Receita' : 'Despesa');
  }

  detectarCategoria(texto, tipo, descricao) {
    const completo = (texto + ' ' + descricao).toLowerCase();

    for (const [categoria, palavras] of Object.entries(this.categorias)) {
      if (categoria === 'outros') continue;
      if ((categoria === 'salário' || categoria === 'freelance') && tipo !== 'entrada') continue;
      if (palavras.some(p => completo.includes(p))) {
        return categoria;
      }
    }
    return 'outros';
  }

  // Método legado
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
