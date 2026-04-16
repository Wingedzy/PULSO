const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data');
const dbPath = path.join(dataPath, 'database.json');

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const loadData = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  return { tarefas: [], rotinas: [], estudos: [], treinos: [], conversas: [], mensagens: [], financas: [] };
};

const saveData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

const db = loadData();

class TaskOrganizer {
  constructor() {
    this.categorias = {
      saude: ['academia', 'treino', 'exercício', 'caminhada', 'corrida', 'meditação', 'yoga', 'musculação', 'alongamento'],
      trabalho: ['relatório', 'reunião', 'projeto', 'entrega', 'prazo', 'email', 'call', 'trabalho', 'cliente', 'apresentação'],
      estudos: ['estudar', 'curso', 'aula', 'livro', 'leitura', 'pesquisa', 'aprender', 'concurso', 'exame', 'prova'],
      pessoal: ['comprar', 'marcar', 'ligar', 'pagar', 'organizar', 'arrumar', 'casa', 'roupa', 'dentista', 'médico'],
      ideias: ['ideia', 'pensar', 'planejar', 'criar', 'inovar', 'projeto', 'desenvolver', 'app', 'sistema', 'negócio']
    };
  }

  analisarTarefa(titulo, descricao) {
    const texto = `${titulo} ${descricao || ''}`.toLowerCase();
    const categoriasDetectadas = {};

    for (const [categoria, palavras] of Object.entries(this.categorias)) {
      const matchCount = palavras.filter(palavra => texto.includes(palavra)).length;
      if (matchCount > 0) {
        categoriasDetectadas[categoria] = matchCount;
      }
    }

    return categoriasDetectadas;
  }

  priorizarTarefa(titulo, descricao) {
    const texto = `${titulo} ${descricao || ''}`.toLowerCase();
    const palavrasUrgentes = ['urgente', 'hoje', 'agora', 'imediatamente', 'crítico', 'prazo curto', 'emergência', 'hoje mesmo'];
    const palavrasImportantes = ['importante', 'prioridade', 'fundamental', 'essencial', 'crucial', 'relevante'];

    const isUrgente = palavrasUrgentes.some(palavra => texto.includes(palavra));
    const isImportante = palavrasImportantes.some(palavra => texto.includes(palavra));

    if (isUrgente) return 1;
    if (isImportante) return 2;
    return 3;
  }

  sugerirData(prioridade) {
    const hoje = new Date();

    if (prioridade === 1) {
      return this.formatarData(hoje);
    } else if (prioridade === 2) {
      const data = new Date(hoje);
      data.setDate(data.getDate() + 1);
      return this.formatarData(data);
    } else {
      const data = new Date(hoje);
      data.setDate(data.getDate() + 3);
      return this.formatarData(data);
    }
  }

  formatarData(data) {
    return data.toISOString().split('T')[0];
  }

  organizarIdeia(titulo, descricao) {
    const categorias = this.analisarTarefa(titulo, descricao);
    const prioridade = this.priorizarTarefa(titulo, descricao);
    const dataSugerida = this.sugerirData(prioridade);

    const tipo = Object.keys(categorias).length > 0
      ? Object.entries(categorias).sort((a, b) => b[1] - a[1])[0][0]
      : 'ideias';

    return {
      tipo: this.mapearTipo(tipo),
      prioridade,
      data: dataSugerida,
      categorias: categorias,
      sugestao: this.gerarSugestao(tipo, prioridade, titulo)
    };
  }

  mapearTipo(categoria) {
    const mapeamento = {
      saude: 'treino',
      trabalho: 'tarefa',
      estudos: 'estudo',
      pessoal: 'tarefa',
      ideias: 'tarefa'
    };
    return mapeamento[categoria] || 'tarefa';
  }

  gerarSugestao(categoria, prioridade, titulo) {
    const sugestoes = {
      saude: `Esta ideia parece relacionada à saúde física. Que tal agendar um treino?`,
      trabalho: `Parece uma tarefa profissional. Sugiro priorizar na sua agenda de tarefas.`,
      estudos: `Parece um tema de estudo. Que tal planejar uma sessão de estudos?`,
      pessoal: `Lembrete pessoal importante. Considere incluir na sua lista de tarefas.`,
      ideias: `Ótima ideia! Vou catalogá-la como tarefa para você revisar depois.`
    };

    const labels = {
      1: '🔴 URGENTE',
      2: '🟡 Importante',
      3: '🟢 Normal',
      4: '🔵 Baixa',
      5: '⚪ Muito baixa'
    };

    return `${sugestoes[categoria] || sugestoes.ideias} Classificado como: ${labels[prioridade] || labels[3]}`;
  }
}

const organizer = new TaskOrganizer();

class FinanceParser {
  constructor() {
    this.categorias = {
      'alimentação': ['mercado', 'supermercado', 'restaurante', 'lanchonete', 'padaria', 'food', 'comida', 'refeição', 'jantar', 'almôço', 'café', 'big box', 'carrefour', 'extra', 'assai', 'atacadao'],
      'transporte': ['uber', 'taxi', 'ônibus', 'metrô', 'combustível', 'gasolina', 'estacionamento', 'viagem', 'transporte', 'corrida', '99'],
      'moradia': ['aluguel', 'condomínio', 'luz', 'água', 'gás', 'internet', 'telefone', 'casa', 'apartamento', 'net'],
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

  // ============ MÉTODO PRINCIPAL ============
  parseAll(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);
    return {
      transactions: transacoes,
      count: transacoes.length
    };
  }

  // ============ EXTRAÇÃO MÚLTIPLA ============
  extrairMultiplasTransacoes(mensagem) {
    const transacoes = [];

    // Primeiro, substituir conectores para facilitar divisão
    let str = mensagem.toLowerCase().trim();
    str = str.replace(/\s+e\s+/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');
    str = str.replace(/\s+em\s+/gi, ', ');
    str = str.replace(/\s+para\s+/gi, ', ');
    str = str.replace(/\s+com\s+/gi, ', ');
    str = str.replace(/\s+no\s+/gi, ', ');
    str = str.replace(/\s+na\s+/gi, ', ');
    str = str.replace(/\s+de\s+/gi, ', ');
    str = str.replace(/\s+a\s+/gi, ', ');

    // Dividir por vírgula
    const segmentos = str.split(',').map(s => s.trim()).filter(s => s.length > 0);

    for (const segmento of segmentos) {
      const transacao = this.analisarSegmentoSimples(segmento);
      if (transacao) {
        transacoes.push(transacao);
      }
    }

    // Se não encontrou nada, tentar método de busca global por valores
    if (transacoes.length === 0) {
      return this.extrairPorValoresGlobais(mensagem);
    }

    return transacoes;
  }

  analisarSegmentoSimples(segmento) {
    // Extrair valor do segmento
    const regexValor = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/i;
    const match = regexValor.exec(segmento);
    if (!match) return null;

    const valor = parseFloat(match[1].replace(',', '.'));
    if (!valor || valor <= 0) return null;

    // Determinar tipo
    const tipo = this.determinarTipoSegmento(segmento);

    // Extrair descrição: remover valor e preposições
    let desc = segmento
      .replace(/(?:r\$)?\s*\d+(?:[.,]\d{2})?\s*(?:reais)?/i, '')
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .trim();

    if (!desc) {
      desc = tipo === 'entrada' ? 'Receita' : 'Despesa';
    } else {
      // Capitalizar e limitar
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
      if (desc.length > 30) {
        desc = desc.split(' ').slice(0, 4).join(' ') + '...';
      }
    }

    // Categoria
    const categoria = this.detectarCategoria(segmento, tipo, desc);

    // Data
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

  extrairPorValoresGlobais(mensagem) {
    const transacoes = [];
    const regex = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?\s*([a-z]*)/gi;
    let match;

    while ((match = regex.exec(mensagem)) !== null) {
      const valor = parseFloat(match[1].replace(',', '.'));
      if (!valor || valor <= 0) continue;

      // Contexto: 30 caracteres antes e depois
      const inicio = Math.max(0, match.index - 30);
      const fim = Math.min(mensagem.length, match.index + match[0].length + 30);
      const contexto = mensagem.substring(inicio, fim).toLowerCase();

      // Determinar tipo
      const temEntrada = /\b(recebi|ganhei|salário|salario|renda|lucro|vendi)\b/.test(contexto);
      const tipo = temEntrada ? 'entrada' : 'gasto';

      // Descrição (após o valor)
      const depois = mensagem.substring(match.index + match[0].length).toLowerCase();
      const descBase = depois.split(/[,\s]/)[0] || '';
      let descricao = descBase.replace(/^(?:de|do|da|em|no|na)\s+/i, '').trim();
      if (!descricao) descricao = tipo === 'entrada' ? 'Receita' : 'Despesa';
      descricao = descricao.charAt(0).toUpperCase() + descricao.slice(1);

      // Categoria
      const categoria = this.detectarCategoria(contexto + ' ' + descricao, tipo, descricao);

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

  // Método alternativo para casos como "50 reais no mercado"
  extrairValoresIsolados(mensagem) {
    const transacoes = [];
    const texto = mensagem.toLowerCase();

    // Procurar por valores numéricos
    const regexValores = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?\s*(?:em|no|na|de|para|sobre)?\s*([a-z\s]+)?/gi;

    let match;
    while ((match = regexValores.exec(mensagem)) !== null) {
      const valorStr = match[1].replace(',', '.');
      const contexto = match[2] ? match[2].toLowerCase().trim() : '';

      const valor = parseFloat(valorStr);
      if (!valor || valor <= 0) continue;

      // Determinar tipo (assumir gasto por padrão se não houver verbo claro)
      const tipo = this.determinarTipoParaContexto(contexto, texto);

      // Descrição
      const descricao = this.extrairDescricaoDoContexto(contexto, null, tipo);

      // Categoria
      const categoria = this.detectarCategoria(mensagem, tipo, descricao);

      // Data
      const data = this.extrairData(mensagem);

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

  determinarTipo(verbo) {
    const palavrasEntrada = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    const palavrasSaida = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];

    if (palavrasEntrada.includes(verbo)) return 'entrada';
    if (palavrasSaida.includes(verbo)) return 'saida';
    return 'gasto'; // padrão para contexto sem verbo claro
  }

  determinarTipoParaContexto(contexto, textoCompleto) {
    // Verificar se há palavras de entrada no texto
    const palavrasEntrada = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    const palavrasSaida = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];

    const temEntrada = palavrasEntrada.some(p => textoCompleto.includes(p));
    const temSaida = palavrasSaida.some(p => textoCompleto.includes(p));

    if (temEntrada && !temSaida) return 'entrada';
    if (temSaida) return 'gasto';

    return 'gasto'; // padrão
  }

  extrairDescricaoDoContexto(contexto, verbo, tipo) {
    if (!contexto) return verbo ? verbo : (tipo === 'entrada' ? 'Receita' : 'Despesa');

    // Remover conectores
    let desc = contexto
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalizar primeira letra
    if (desc) {
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    // Se descrição muito longa, pegar só a parte relevante
    if (desc.length > 50) {
      const palavras = desc.split(' ');
      desc = palavras.slice(0, 4).join(' ') + (palavras.length > 4 ? '...' : '');
    }

    return desc || (verbo ? verbo.charAt(0).toUpperCase() + verbo.slice(1) : (tipo === 'entrada' ? 'Receita' : 'Despesa'));
  }

  detectarCategoria(texto, tipo, descricao) {
    const textoCompleto = (texto + ' ' + descricao).toLowerCase();

    for (const [categoria, palavras] of Object.entries(this.categorias)) {
      if (categoria === 'outros') continue;
      if ((categoria === 'salário' || categoria === 'freelance') && tipo !== 'entrada') continue;

      for (const palavra of palavras) {
        if (textoCompleto.includes(palavra)) {
          return categoria;
        }
      }
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

    // Padrão DD/MM ou DD/MM/YYYY
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

    return dataStr; // padrão: hoje
  }

  // Método compatibilidade (antigo)
  parse(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);
    return transacoes[0] || null;
  }

  sugerirTransacao(mensagem) {
    const transacoes = this.extrairMultiplasTransacoes(mensagem);

    if (transacoes.length === 0) {
      return {
        valido: false,
        mensagem: 'Não foi possível identificar transações financeiras na mensagem.'
      };
    }

    return {
      valido: true,
      transacoes: transacoes,
      sugestoes: transacoes.map(t => this.gerarSugestao(t))
    };
  }

  gerarSugestao(transacao) {
    const tipoLabel = transacao.type === 'entrada' ? '📈 ENTRADA' : '📉 GASTO';
    const valorFormatado = transacao.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `${tipoLabel} de ${valorFormatado}\nCategoria: ${transacao.category}\nData: ${new Date(transacao.date).toLocaleDateString('pt-BR')}\nDescrição: ${transacao.description}`;
  }
}

const financeParser = new FinanceParser();

app.get('/api/tarefas', (req, res) => {
  res.json(db.tarefas.sort((a, b) => a.prioridade - b.prioridade));
});

app.post('/api/tarefas', (req, res) => {
  const { titulo, descricao, data, prioridade, status, tags, tipo } = req.body;
  const id = uuidv4();

  const organizacao = organizer.organizarIdeia(titulo, descricao);

  const novaTarefa = {
    id,
    tipo: tipo || organizacao.tipo,
    titulo,
    descricao: descricao || '',
    data: data || organizacao.data,
    prioridade: prioridade || organizacao.prioridade,
    status: status || 'pendente',
    tags: tags || Object.keys(organizacao.categorias),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.tarefas.push(novaTarefa);
  saveData(db);

  res.json({ tarefa: novaTarefa, organizacao });
});

app.put('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = db.tarefas.findIndex(t => t.id === id);
  if (index !== -1) {
    db.tarefas[index] = { ...db.tarefas[index], ...updates, updated_at: new Date().toISOString() };
    saveData(db);
    res.json(db.tarefas[index]);
  } else {
    res.status(404).json({ error: 'Tarefa não encontrada' });
  }
});

app.delete('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  db.tarefas = db.tarefas.filter(t => t.id !== id);
  saveData(db);
  res.json({ message: 'Tarefa removida com sucesso' });
});

app.get('/api/rotinas', (req, res) => {
  res.json(db.rotinas);
});

app.post('/api/rotinas', (req, res) => {
  const { nome, descricao, periodicidade, horario, dias_semana, ativa } = req.body;
  const id = uuidv4();

  const novaRotina = {
    id,
    nome,
    descricao: descricao || '',
    periodicidade,
    horario: horario || null,
    dias_semana: dias_semana || null,
    ativa: ativa !== undefined ? ativa : 1,
    created_at: new Date().toISOString(),
  };

  db.rotinas.push(novaRotina);
  saveData(db);

  res.json(novaRotina);
});

app.get('/api/estudos', (req, res) => {
  res.json(db.estudos.sort((a, b) => new Date(b.data) - new Date(a.data)));
});

app.post('/api/estudos', (req, res) => {
  const { assunto, topico, duracao_planejada, data, observacoes } = req.body;
  const id = uuidv4();

  const novoEstudo = {
    id,
    assunto,
    topico: topico || '',
    duracao_planejada: duracao_planejada || null,
    data: data || new Date().toISOString().split('T')[0],
    duracao_real: null,
    concluido: 0,
    observacoes: observacoes || '',
    created_at: new Date().toISOString(),
  };

  db.estudos.push(novoEstudo);
  saveData(db);

  res.json(novoEstudo);
});

app.put('/api/estudos/:id/concluir', (req, res) => {
  const { id } = req.params;
  const { duracao_real } = req.body;

  const index = db.estudos.findIndex(e => e.id === id);
  if (index !== -1) {
    db.estudos[index] = {
      ...db.estudos[index],
      concluido: 1,
      duracao_real: duracao_real || null,
      updated_at: new Date().toISOString(),
    };
    saveData(db);
    res.json(db.estudos[index]);
  } else {
    res.status(404).json({ error: 'Estudo não encontrado' });
  }
});

app.get('/api/treinos', (req, res) => {
  res.json(db.treinos.sort((a, b) => new Date(b.data) - new Date(a.data)));
});

app.post('/api/treinos', (req, res) => {
  const { tipo, exercicios, data, duracao, intensidade, observacoes } = req.body;
  const id = uuidv4();

  const novoTreino = {
    id,
    tipo,
    exercicios: Array.isArray(exercicios) ? exercicios : [],
    data: data || new Date().toISOString().split('T')[0],
    duracao: duracao || null,
    intensidade: intensidade || 'media',
    concluido: 0,
    observacoes: observacoes || '',
    created_at: new Date().toISOString(),
  };

  db.treinos.push(novoTreino);
  saveData(db);

  res.json(novoTreino);
});

app.put('/api/treinos/:id/concluir', (req, res) => {
  const { id } = req.params;

  const index = db.treinos.findIndex(t => t.id === id);
  if (index !== -1) {
    db.treinos[index] = {
      ...db.treinos[index],
      concluido: 1,
      updated_at: new Date().toISOString(),
    };
    saveData(db);
    res.json(db.treinos[index]);
  } else {
    res.status(404).json({ error: 'Treino não encontrado' });
  }
});

// ==================== FINANÇAS ====================

app.get('/api/financas', (req, res) => {
  const { mes, ano, tipo } = req.query;

  let financas = [...db.financas];

  // Filtro por mês/ano
  if (mes || ano) {
    const mesNum = mes ? parseInt(mes) : null;
    const anoNum = ano ? parseInt(ano) : null;

    financas = financas.filter(f => {
      const data = new Date(f.data);
      if (mesNum && data.getMonth() + 1 !== mesNum) return false;
      if (anoNum && data.getFullYear() !== anoNum) return false;
      return true;
    });
  }

  // Filtro por tipo
  if (tipo && ['entrada', 'saida'].includes(tipo)) {
    financas = financas.filter(f => f.tipo === tipo);
  }

  // Ordenar por data (mais recente primeiro)
  financas.sort((a, b) => new Date(b.data) - new Date(a.data));

  res.json(financas);
});

app.get('/api/financas/resumo', (req, res) => {
  const { mes, ano } = req.query;

  const mesNum = mes ? parseInt(mes) : new Date().getMonth() + 1;
  const anoNum = ano ? parseInt(ano) : new Date().getFullYear();

  const financasFiltradas = db.financas.filter(f => {
    const data = new Date(f.data);
    return data.getMonth() + 1 === mesNum && data.getFullYear() === anoNum;
  });

  const totalEntradas = financasFiltradas
    .filter(f => f.tipo === 'entrada')
    .reduce((sum, f) => sum + (f.valor || 0), 0);

  const totalSaidas = financasFiltradas
    .filter(f => f.tipo === 'saida')
    .reduce((sum, f) => sum + (f.valor || 0), 0);

  const saldo = totalEntradas - totalSaidas;

  res.json({
    mes: mesNum,
    ano: anoNum,
    totalEntradas,
    totalSaidas,
    saldo,
    totalTransacoes: financasFiltradas.length
  });
});

app.post('/api/financas', (req, res) => {
  const { tipo, valor, data, descricao, categoria, mensagem_nl } = req.body;
  const id = uuidv4();

  // Se veio mensagem em linguagem natural, fazer parse
  let transacao = {};
  if (mensagem_nl) {
    const sugestao = financeParser.sugerirTransacao(mensagem_nl);
    if (sugestao.valido && sugestao.transacoes && sugestao.transacoes.length > 0) {
      // Pegar a primeira transação (parser otimizado retorna array)
      const parsed = sugestao.transacoes[0];
      transacao = {
        tipo: parsed.type === 'entrada' ? 'entrada' : 'saida',
        valor: parsed.amount,
        data: parsed.date,
        descricao: parsed.description,
        categoria: parsed.category
      };
      // Permitir override com campos manuais
      transacao = {
        ...transacao,
        tipo: tipo || transacao.tipo,
        valor: valor || transacao.valor,
        data: data || transacao.data,
        descricao: descricao || transacao.descricao,
        categoria: categoria || transacao.categoria
      };
    } else {
      return res.status(400).json({ error: sugestao.mensagem });
    }
  } else {
    // Validação manual
    if (!tipo || !['entrada', 'saida'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser "entrada" ou "saida"' });
    }
    if (!valor || isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: 'Valor deve ser um número positivo' });
    }
    transacao = {
      tipo,
      valor: parseFloat(valor),
      data: data || new Date().toISOString().split('T')[0],
      descricao: descricao || (tipo === 'entrada' ? 'Receita' : 'Despesa'),
      categoria: categoria || 'outros'
    };
  }

  const novaFinanca = {
    id,
    ...transacao,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.financas.push(novaFinanca);
  saveData(db);

  res.json({ financa: novaFinanca });
});

app.put('/api/financas/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = db.financas.findIndex(f => f.id === id);
  if (index !== -1) {
    db.financas[index] = {
      ...db.financas[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData(db);
    res.json(db.financas[index]);
  } else {
    res.status(404).json({ error: 'Transação financeira não encontrada' });
  }
});

app.delete('/api/financas/:id', (req, res) => {
  const { id } = req.params;
  const index = db.financas.findIndex(f => f.id === id);

  if (index !== -1) {
    db.financas.splice(index, 1);
    saveData(db);
    res.json({ message: 'Transação removida com sucesso' });
  } else {
    res.status(404).json({ error: 'Transação financeira não encontrada' });
  }
});

// ==================== FINANÇAS - CONFIRMAÇÃO ====================

// Endpoint para registrar múltiplas transações (usado pela IA)
app.post('/api/financas/confirmar', async (req, res) => {
  const { transacoes, confirmacao } = req.body;

  if (!confirmacao || !['sim', 'não', 'nao'].includes(confirmacao.toLowerCase())) {
    return res.status(400).json({ error: 'Response de confirmação inválida. Use "sim" ou "não".' });
  }

  if (confirmacao.toLowerCase() === 'não' || confirmacao.toLowerCase() === 'nao') {
    return res.json({ registrado: false, mensagem: 'Registro cancelado pelo usuário.' });
  }

  if (!transacoes || !Array.isArray(transacoes) || transacoes.length === 0) {
    return res.status(400).json({ error: 'Nenhuma transação fornecida para registro.' });
  }

  const resultados = [];
  for (const transacao of transacoes) {
    const id = uuidv4();

    // Normalizar dados (suportar formato novo e legado)
    const tipo = transacao.type === 'entrada' ? 'entrada' : transacao.type === 'gasto' ? 'saida' : (transacao.tipo === 'entrada' ? 'entrada' : 'saida');
    const valor = parseFloat(transacao.amount || transacao.valor || 0);
    const descricao = transacao.description || transacao.descricao || (tipo === 'entrada' ? 'Receita' : 'Despesa');
    const categoria = transacao.category || transacao.categoria || 'outros';
    const data = transacao.date || transacao.data || new Date().toISOString().split('T')[0];

    const novaFinanca = {
      id,
      tipo,
      valor,
      data,
      descricao,
      categoria,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.financas.push(novaFinanca);
    resultados.push(novaFinanca);
  }

  saveData(db);

  res.json({
    registrado: true,
    mensagem: `${resultados.length} transação(ões) registrada(s) com sucesso!`,
    transacoes: resultados
  });
});

app.get('/api/conversas', (req, res) => {
  res.json(db.conversas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

app.post('/api/conversas', (req, res) => {
  const { titulo } = req.body;
  const id = uuidv4();

  const novaConversa = {
    id,
    titulo: titulo || null,
    created_at: new Date().toISOString(),
  };

  db.conversas.push(novaConversa);
  db.mensagens = db.mensagens || [];
  saveData(db);

  res.json(novaConversa);
});

app.get('/api/conversas/:id/mensagens', (req, res) => {
  const { id } = req.params;
  const mensagens = db.mensagens.filter(m => m.conversa_id === id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.json(mensagens);
});

app.post('/api/conversas/:id/mensagens', (req, res) => {
  const { id: conversaId } = req.params;
  const { role, conteudo } = req.body;
  const id = uuidv4();

  if (!db.mensagens) {
    db.mensagens = [];
  }

  const novaMensagem = {
    id,
    conversa_id: conversaId,
    role,
    conteudo,
    created_at: new Date().toISOString(),
  };

  db.mensagens.push(novaMensagem);
  saveData(db);

  let sugestoes = [];
  if (role === 'user') {
    sugestoes = gerarRespostaIA(conteudo);
  }

  res.json({ mensagem: novaMensagem, sugestoes });
});

function gerarRespostaIA(mensagem) {
  const mensagemLower = mensagem.toLowerCase();
  const sugestoes = [];

  // 1. PRIORIDADE: Detecção de transações financeiras
  const financeiro = financeParser.sugerirTransacao(mensagem);

  if (financeiro.valido && financeiro.transacoes && financeiro.transacoes.length > 0) {
    // Detectar se o usuário está confirmando ou negando um registro anterior
    const confirmaSim = /^(sim|yes|s|confirmo|confirmar|pode|registra|salvar)$/i.test(mensagem.trim());
    const confirmaNao = /^(não|nao|no|n|cancela|cancelar|pare|stop)$/i.test(mensagem.trim());

    // Se for confirmação, o handler na rota irá processar
    if (confirmaSim || confirmaNao) {
      return []; // Deixa o handler de confirmação cuidar disso
    }

    // Retornar detecção de transações para confirmação
    const sugestoesFinanceiras = [{
      tipo: 'financa_pendente',
      acao: 'Registrar transações detectadas?',
      descricao: `Detectei ${financeiro.transacoes.length} movimentação(ões) financeira(s):\n\n${financeiro.sugestoes.join('\n\n')}\n\nDeseja registrar? (sim/não)`,
      transacoes: financeiro.transacoes,
      requerConfirmacao: true
    }];

    return sugestoesFinanceiras;
  }

  // 2. OUTRAS FUNCIONALIDADES (manter comportamento existente)
  if (mensagemLower.includes('tarefa') || mensagemLower.includes('afazer') || mensagemLower.includes('lembrar') || mensagemLower.includes('preciso')) {
    sugestoes.push({
      tipo: 'tarefa',
      acao: 'Criar nova tarefa',
      descricao: `Vou adicionar: "${mensagem}" às suas tarefas. A IA vai organizar automaticamente por prioridade e data!`
    });
  }

  if (mensagemLower.includes('estudar') || mensagemLower.includes('estudo') || mensagemLower.includes('aprender')) {
    sugestoes.push({
      tipo: 'estudo',
      acao: 'Planejar sessão de estudos',
      descricao: `Vou registrar um plano de estudos para: "${mensagem}". Define assunto e duração!`
    });
  }

  if (mensagemLower.includes('treino') || mensagemLower.includes('academia') || mensagemLower.includes('exercício') || mensagemLower.includes('caminhada')) {
    sugestoes.push({
      tipo: 'treino',
      acao: 'Agendar treino',
      descricao: `Vou criar um registro de treino para: "${mensagem}". Você pode adicionar exercícios e intensidade!`
    });
  }

  if (mensagemLower.includes('ideia') || mensagemLower.includes('pensar') || mensagemLower.includes('planejar') || mensagemLower.includes('criar')) {
    sugestoes.push({
      tipo: 'ideia',
      acao: 'Registrar ideia',
      descricao: `Excelente! Vou catalogar sua ideia: "${mensagem}" e organizar na sua agenda.`
    });
  }

  if (sugestoes.length === 0) {
    sugestoes.push({
      tipo: 'geral',
      acao: 'Ajudar a organizar',
      descricao: `Entendi: "${mensagem}". Posso ajudar a organizar isso como uma tarefa, estudo ou treino. Em que categoria se encaixa melhor?`
    });
  }

  return sugestoes;
}


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});