// Parser Final - Abordagem por detecção de valores na string inteira
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
    const texto = mensagem.toLowerCase().trim();

    // Encontrar todos os valores na string
    const valoresEncontrados = this.encontrarValoresComContexto(texto);

    // Para cada valor+contexto, criar uma transação
    for (const { valor, contexto, verbo } of valoresEncontrados) {
      const tipo = verbo ? this.determinarTipo(verbo) : this.determinarTipoPorContexto(contexto, texto);
      const descricao = this.extrairDescricao(contexto, verbo, tipo);
      const categoria = this.detectarCategoria(texto, tipo, descricao);
      const data = new Date().toISOString().split('T')[0];

      transacoes.push({
        type: tipo,
        amount: valor,
        currency: 'BRL',
        date: data,
        description: descricao,
        category: categoria
      });
    }

    return transacoes;
  }

  // Encontrar todos os valores e sua phrases de contexto
  encontrarValoresComContexto(texto) {
    const resultados = [];

    // Padrão: verbo + valor + resto, ou valor + resto
    // Procurar globalmente por valores monetários
    const regexGlobal = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?\s*([a-z\s]*)/gi;

    let match;
    const seen = new Set(); // evitar duplicatas

    while ((match = regexGlobal.exec(texto)) !== null) {
      const valorStr = match[1].replace(',', '.');
      const valor = parseFloat(valorStr);
      const contexto = match[2] ? match[2].toLowerCase().trim() : '';

      if (!valor || valor <= 0 || seen.has(valor + '|' + contexto)) continue;
      seen.add(valor + '|' + contexto);

      // Olhar para trás e ver se há um verbo antes deste valor
      const antes = texto.substring(0, match.index).toLowerCase().trim();
      const palavrasAntes = antes.split(/\s+/);
      const ultimaPalavra = palavrasAntes[palavrasAntes.length - 1];

      const verbosEntrada = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
      const verbosSaida = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];

      let verbo = null;
      if (verbosEntrada.includes(ultimaPalavra)) {
        verbo = ultimaPalavra;
      } else if (verbosSaida.includes(ultimaPalavra)) {
        verbo = ultimaPalavra;
      }

      resultados.push({ valor, contexto, verbo });
    }

    return resultados;
  }

  determinarTipo(verbo) {
    const entradas = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    return entradas.includes(verbo) ? 'entrada' : 'gasto';
  }

  determinarTipoPorContexto(contexto, textoCompleto) {
    if (/\b(recebi|ganhei|salário|salario|renda|lucro|vendi)\b/.test(textoCompleto)) {
      return 'entrada';
    }
    return 'gasto';
  }

  extrairDescricao(contexto, verbo, tipo) {
    let texto = contexto || verbo || '';

    // Se não tem contexto, tentar extrair do verbo
    if (!texto && verbo) {
      texto = verbo;
    }

    // Remover preposições iniciais
    texto = texto.replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '');

    // Se ainda não tem nada, usar padrão
    if (!texto.trim()) {
      return tipo === 'entrada' ? 'Receita' : 'Despesa';
    }

    // Limitar tamanho
    if (texto.length > 30) {
      texto = texto.split(' ').slice(0, 4).join(' ') + '...';
    }

    // Capitalizar
    texto = texto.charAt(0).toUpperCase() + texto.slice(1);

    return texto;
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
