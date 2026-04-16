// Parser Financeiro Resiliente - Compatível com backend existente
class FinanceParser {
  constructor() {
    // Categorias SEM ACENTOS para detecção
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

  // ============ MÉTODO PRINCIPAL (compatível) ============
  parseAll(mensagem) {
    const warnings = [];
    const transacoes = this.extrairMultiplasTransacoes(mensagem, warnings);
    return {
      transactions: transacoes,
      count: transacoes.length,
      warnings: warnings
    };
  }

  // ============ EXTRAÇÃO MÚLTIPLA (compatível) ============
  extrairMultiplasTransacoes(mensagem, warnings) {
    const transacoes = [];

    if (!mensagem || typeof mensagem !== 'string') {
      warnings.push('Mensagem inválida ou vazia');
      return transacoes;
    }

    // Segmentar por conectores
    const segmentos = this.segmentar(mensagem);

    for (const segmento of segmentos) {
      const transacao = this.analisarSegmentoSimples(segmento, warnings);
      if (transacao) {
        transacoes.push(transacao);
      }
    }

    // Se não conseguiu nada, tentar métodos de fallback
    if (transacoes.length === 0) {
      const porValores = this.extrairPorValoresGlobais(mensagem, warnings);
      transacoes.push(...porValores);
    }

    if (transacoes.length === 0) {
      const valoresIsolados = this.extrairValoresIsolados(mensagem, warnings);
      transacoes.push(...valoresIsolados);
    }

    return transacoes;
  }

  // ============ SEGMENTAÇÃO ============
  segmentar(mensagem) {
    let str = mensagem.toLowerCase().trim();
    if (!str) return [];

    // Apenas conectores que separam transações
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');

    return str.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 300);
  }

  // ============ ANÁLISE DE SEGMENTO (compatível) ============
  analisarSegmentoSimples(segmento, warnings) {
    // Extrair valor
    const regexValor = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i;
    const match = regexValor.exec(segmento);
    if (!match) return null;

    const valor = parseFloat(match[1].replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return null;

    // Determinar tipo
    const tipo = this.determinarTipoSegmento(segmento);
    if (!tipo) {
      warnings.push(`Transação sem verbo assumida como gasto: "${segmento.substring(0, 30)}..."`);
    }
    const tipoFinal = tipo || 'gasto';

    // Extrair descrição
    const descricao = this.extrairDescricaoSegmento(segmento, match, tipoFinal);

    // Categoria
    const categoria = this.detectarCategoria(segmento, tipoFinal, descricao);

    // Data (hoje)
    const data = new Date().toISOString().split('T')[0];

    // Retornar no formato do backend
    const tipoBackend = tipoFinal === 'entrada' ? 'income' : 'expense';

    return {
      type: tipoBackend,
      amount: valor,
      currency: 'BRL',
      date: data,
      description: descricao,
      category: categoria
    };
  }

  extrairDescricaoSegmento(segmento, match, tipo) {
    // Remover valor
    let texto = segmento.replace(/(?:r\$)?\s*\d+(?:[.,]\d{2})?\s*(?:reais)?/i, '').trim();

    // Remover preposições e verbos do início
    texto = texto.replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '');
    texto = texto.replace(/^(?:recebi|ganhei|salario|salario|renda|lucro|vendi|receber|pagaram|depositaram|reembolso|estorno|dividendo|juros|aluguel|freelance|servico|rendimento|contracheque|gastei|paguei|comprei|custo|despesa|debito|saquei|pagamento|compra|retirada|saque|gastar|pagar|comprar)\s+/i, '');

    // Se ainda houver preposição, pegar só o que vem depois
    const matchResto = texto.match(/(?:de|do|da|dos|das)\s+(.+)/i);
    if (matchResto) {
      texto = matchResto[1];
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

  // ============ MÉTODOS DE FALLBACK (compatíveis) ============
  extrairPorValoresGlobais(mensagem, warnings) {
    const transacoes = [];
    const regex = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/gi;
    let match;

    while ((match = regex.exec(mensagem)) !== null) {
      const valor = parseFloat(match[1].replace(',', '.'));
      if (!valor || valor <= 0) continue;

      // Contexto
      const inicio = Math.max(0, match.index - 50);
      const fim = Math.min(mensagem.length, match.index + match[0].length + 50);
      const contexto = mensagem.substring(inicio, fim);

      const tipo = this.determinarTipoSegmento(contexto) || this.determinarTipoParaContexto(contexto, mensagem) || 'gasto';
      const tipoBackend = tipo === 'entrada' ? 'income' : 'expense';

      // Descrição
      const depois = mensagem.substring(match.index + match[0].length).toLowerCase();
      const descBase = depois.split(/[,\s]/)[0] || '';
      let descricao = descBase.replace(/^(?:de|do|da|em|no|na)\s+/i, '').trim();
      if (!descricao) descricao = tipo === 'entrada' ? 'Receita' : 'Despesa';
      descricao = descricao.charAt(0).toUpperCase() + descricao.slice(1);

      // Categoria
      const categoria = this.detectarCategoria(contexto, tipo, descricao);

      // Data
      const data = new Date().toISOString().split('T')[0];

      transacoes.push({
        type: tipoBackend,
        amount: valor,
        currency: 'BRL',
        date: data,
        description: descricao,
        category: categoria
      });
    }

    return transacoes;
  }

  extrairValoresIsolados(mensagem, warnings) {
    const transacoes = [];
    const regex = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/gi;
    let match;

    while ((match = regex.exec(mensagem)) !== null) {
      const valor = parseFloat(match[1].replace(',', '.'));
      if (!valor || valor <= 0) continue;

      // Contexto
      const inicio = Math.max(0, match.index - 50);
      const fim = Math.min(mensagem.length, match.index + match[0].length + 50);
      const contexto = mensagem.substring(inicio, fim);

      const tipo = this.determinarTipoSegmento(contexto) || this.determinarTipoParaContexto(contexto, mensagem) || 'gasto';
      const tipoBackend = tipo === 'entrada' ? 'income' : 'expense';

      // Descrição
      const descricao = this.extrairDescricaoDoContexto(contexto, null, tipo);

      // Categoria
      const categoria = this.detectarCategoria(contexto, tipo, descricao);

      // Data
      const data = this.extrairData(mensagem) || new Date().toISOString().split('T')[0];

      transacoes.push({
        type: tipoBackend,
        amount: valor,
        currency: 'BRL',
        date: data,
        description: descricao,
        category: categoria
      });
    }

    return transacoes;
  }

  // ============ MÉTODOS AUXILIARES (compatíveis) ============
  determinarTipoSegmento(segmento) {
    return this.determinarTipo(segmento);
  }

  determinarTipo(segmento) {
    const segmentoLower = segmento.toLowerCase();
    const temEntrada = this.palavrasEntrada.some(p => segmentoLower.includes(p));
    const temSaida = this.palavrasSaida.some(p => segmentoLower.includes(p));

    if (temEntrada && !temSaida) return 'entrada';
    if (temSaida) return 'gasto';
    if (/\b(recebi|ganhei|vendi|aluguel)\b/.test(segmentoLower)) return 'entrada';
    return null;
  }

  determinarTipoParaContexto(contexto, textoCompleto) {
    const texto = textoCompleto.toLowerCase();
    const temEntrada = this.palavrasEntrada.some(p => texto.includes(p));
    const temSaida = this.palavrasSaida.some(p => texto.includes(p));

    if (temEntrada && !temSaida) return 'entrada';
    if (temSaida) return 'gasto';
    return 'gasto';
  }

  extrairDescricaoDoContexto(contexto, verbo, tipo) {
    if (!contexto) return verbo ? verbo : (tipo === 'entrada' ? 'Receita' : 'Despesa');

    let desc = contexto
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!desc) return tipo === 'entrada' ? 'Receita' : 'Despesa';

    desc = desc.charAt(0).toUpperCase() + desc.slice(1);

    if (desc.length > 50) {
      const palavras = desc.split(' ');
      desc = palavras.slice(0, 4).join(' ') + (palavras.length > 4 ? '...' : '');
    }

    return desc;
  }

  detectarCategoria(segmento, tipo, descricao) {
    try {
      const texto = (segmento + ' ' + (descricao || '')).toLowerCase();

      for (const [categoria, palavras] of Object.entries(this.categorias)) {
        if (categoria === 'outros') continue;
        if ((categoria === 'salario' || categoria === 'freelance') && tipo !== 'entrada') continue;

        for (const palavra of palavras) {
          if (texto.includes(palavra)) {
            return categoria;
          }
        }
      }
    } catch (e) {
      // Silencioso
    }

    return 'outros';
  }

  extrairData(texto) {
    const hoje = new Date();
    const dataStr = hoje.toISOString().split('T')[0];

    if (texto.includes('hoje')) return dataStr;
    if (texto.includes('ontem')) {
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      return ontem.toISOString().split('T')[0];
    }

    const dataMatch = texto.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (dataMatch) {
      const dia = parseInt(dataMatch[1]);
      const mes = parseInt(dataMatch[2]) - 1;
      const ano = dataMatch[3] ? parseInt(dataMatch[3]) : hoje.getFullYear();
      const data = new Date(ano, mes, dia);
      if (!isNaN(data.getTime())) {
        return data.toISOString().split('T')[0];
      }
    }

    return dataStr;
  }

  // ============ MÉTODOS DE COMPATIBILIDADE ============
  parse(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem, []);
    return transacoes[0] || null;
  }

  sugerirTransacao(mensagem) {
    const warnings = [];
    const transacoes = this.extrairMultiplasTransacoes(mensagem, warnings);

    if (transacoes.length === 0) {
      return {
        valido: false,
        mensagem: 'Nenhuma transação detectada.',
        warnings: warnings
      };
    }

    return {
      valido: true,
      transacoes,
      warnings: warnings,
      sugestoes: transacoes.map(t => `${t.type.toUpperCase()} R$ ${t.amount.toFixed(2)} - ${t.category} - ${t.description}`)
    };
  }

  gerarSugestao(transacao) {
    const tipoLabel = transacao.type === 'income' ? '📈 ENTRADA' : transacao.type === 'expense' ? '📉 GASTO' : transacao.type.toUpperCase();
    const valorFormatado = transacao.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `${tipoLabel} de ${valorFormatado}\nCategoria: ${transacao.category}\nData: ${new Date(transacao.date).toLocaleDateString('pt-BR')}\nDescrição: ${transacao.description}`;
  }
}

module.exports = FinanceParser;
