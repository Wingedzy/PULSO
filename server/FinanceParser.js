// Parser Financeiro Resiliente Total - NUNCA FALHA
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
      const warnings = [];
      const transacoes = this.extrairMultiplasTransacoes(mensagem, warnings);

      return {
        transactions: transacoes,
        count: transacoes.length,
        warnings: warnings
      };
    } catch (error) {
      // NUNCA falhar - retornar array vazio em caso de erro catastrófico
      return {
        transactions: [],
        count: 0,
        warnings: ['Erro interno no parser, mas sistema continuou funcionando']
      };
    }
  }

  extrairMultiplasTransacoes(mensagem, warnings) {
    const transacoes = [];

    if (!mensagem || typeof mensagem !== 'string') {
      warnings.push('Mensagem inválida ou vazia');
      return transacoes;
    }

    const segmentos = this.segmentarMensagem(mensagem);

    if (segmentos.length === 0) {
      warnings.push('Nenhum segmento detectado na mensagem');
      return transacoes;
    }

    for (let i = 0; i < segmentos.length; i++) {
      const segmento = segmentos[i];
      try {
        const transacao = this.analisarSegmento(segmento, warnings);
        if (transacao) {
          transacoes.push(transacao);
        } else {
          warnings.push(`Segmento "${segmento.substring(0, 30)}..." não pôde ser analisado`);
        }
      } catch (e) {
        warnings.push(`Erro ao processar segmento ${i + 1}: ${e.message}`);
        // Continuar processando outros segmentos
      }
    }

    // Se não conseguiu nada, tentar fallback global
    if (transacoes.length === 0) {
      const fallback = this.extrairFallbackGlobal(mensagem, warnings);
      transacoes.push(...fallback);
    }

    return transacoes;
  }

  segmentarMensagem(mensagem) {
    let str = mensagem.toLowerCase().trim();
    if (!str) return [];

    // Apenas normalizar conectores que REALMENTE separam transações
    // NÃO substituir preposições dentro de uma transação (de, no, na, em, etc.)
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', '); // "e depois" -> ","
    str = str.replace(/\s+depois\s+/gi, ', ');
    // Manter vírgulas existentes

    // Split por vírgula
    return str.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 300);
  }

  analisarSegmento(segmento, warnings) {
    // Extrair valor - se não houver, ignorar segmento
    const matchValor = segmento.match(/(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i);
    if (!matchValor) {
      warnings.push(`Segmento "${segmento.substring(0, 30)}..." não contém valor monetário`);
      return null;
    }

    const valor = parseFloat(matchValor[1].replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      warnings.push(`Valor inválido extraído: "${matchValor[1]}"`);
      return null;
    }

    // Determinar tipo
    let tipo = this.determinarTipoSegmento(segmento);
    const tipoOriginal = tipo;

    // Inferência inteligente: se não há verbo claro, assumir GASTO como padrão
    if (tipo === null) {
      tipo = 'gasto';
      warnings.push(`Transação sem verbo claro assumida como "${tipo}"`);
    }

    // Extrair descrição
    const descricao = this.extrairDescricao(segmento, matchValor, tipo);

    // Detectar categoria (sempre retorna algo, mesmo "outros")
    const categoria = this.detectarCategoria(segmento, tipo, descricao);

    // Data (hoje, nunca falha)
    const data = new Date().toISOString().split('T')[0];

    return {
      type: tipo,
      amount: valor,
      currency: 'BRL',
      date: data,
      description: descricao,
      category: categoria,
      _meta: {
        originalSegment: segmento,
        inferredType: tipoOriginal === null,
        warnings: warnings.filter(w => w.includes(segmento.substring(0, 20)))
      }
    };
  }

  extrairDescricao(segmento, matchValor, tipo) {
    try {
      // Obter texto antes e depois do valor
      const antes = segmento.substring(0, matchValor.index).trim();
      const depois = segmento.substring(matchValor.index + matchValor[0].length).trim();

      // Função para limpar texto
      const limpar = (txt) => {
        if (!txt) return '';
        return txt
          .replace(/^(?:recebi|ganhei|salário|salario|renda|lucro|vendi|receber|pagaram|depositaram|reembolso|estorno|dividendo|juros|aluguel|freelance|serviço|rendimento|contracheque|gastei|paguei|comprei|custo|despesa|débito|saquei|pagamento|compra|retirada|saque|gastar|pagar|comprar)\s+/i, '')
          .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
          .trim();
      };

      const desc1 = limpar(depois);
      const desc2 = limpar(antes);

      // Escolher descrição mais longa
      let desc = desc1 || desc2;

      if (!desc) {
        desc = tipo === 'entrada' ? 'Receita' : 'Despesa';
      } else {
        // Capitalizar primeira letra
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);
        // Limitar tamanho
        if (desc.length > 30) {
          const palavras = desc.split(' ');
          desc = palavras.slice(0, 4).join(' ') + (palavras.length > 4 ? '...' : '');
        }
      }

      return desc;
    } catch (e) {
      return tipo === 'entrada' ? 'Receita' : 'Despesa';
    }
  }

  determinarTipoSegmento(segmento) {
    try {
      const temEntrada = this.palavrasEntrada.some(p => segmento.includes(p));
      const temSaida = this.palavrasSaida.some(p => segmento.includes(p));

      if (temEntrada && !temSaida) return 'entrada';
      if (temSaida) return 'gasto';

      // Regex adicional para casos limítrofes
      if (/\b(recebi|ganhei|vendi|aluguel)\b/.test(segmento)) return 'entrada';

      // Se não conseguiu determinar, retorna null (será tratado como 'gasto' no caller)
      return null;
    } catch (e) {
      return null;
    }
  }

  detectarCategoria(segmento, tipo, descricao) {
    try {
      const texto = (segmento + ' ' + (descricao || '')).toLowerCase();

      for (const [categoria, palavras] of Object.entries(this.categorias)) {
        if (categoria === 'outros') continue;
        if ((categoria === 'salário' || categoria === 'freelance') && tipo !== 'entrada') continue;

        for (const palavra of palavras) {
          if (texto.includes(palavra)) {
            return categoria;
          }
        }
      }
    } catch (e) {
      // Silencioso - fallback para 'outros'
    }

    return 'outros';
  }

  extrairFallbackGlobal(mensagem, warnings) {
    const transacoes = [];
    const regex = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/gi;
    let match;

    while ((match = regex.exec(mensagem)) !== null) {
      try {
        const valor = parseFloat(match[1].replace(',', '.'));
        if (!valor || valor <= 0 || isNaN(valor)) continue;

        // Contexto mínimo
        const contexto = mensagem.substring(
          Math.max(0, match.index - 30),
          Math.min(mensagem.length, match.index + match[0].length + 30)
        );

        const tipo = this.determinarTipoSegmento(contexto) || 'gasto';
        const categoria = this.detectarCategoria(contexto, tipo, '');

        transacoes.push({
          type: tipo,
          amount: valor,
          currency: 'BRL',
          date: new Date().toISOString().split('T')[0],
          description: tipo === 'entrada' ? 'Receita' : 'Despesa',
          category: categoria,
          _meta: { extractedBy: 'fallbackGlobal' }
        });

        warnings.push(`Transação extraída por fallback global (baixa confiança)`);
      } catch (e) {
        warnings.push(`Erro no fallback para valor em posição ${match.index}: ${e.message}`);
      }
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
}

module.exports = FinanceParser;
