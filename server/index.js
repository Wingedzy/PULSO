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
  return { tarefas: [], rotinas: [], estudos: [], treinos: [], conversas: [], mensagens: [], financas: [], agua: [], categorias: [], tiposPagamento: [], bancos: [] };
};

const saveData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

const db = loadData();

const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

// ─── TaskOrganizer ────────────────────────────────────────────────────────────

class TaskOrganizer {
  constructor() {
    this.categorias = {
      saude: ['academia', 'treino', 'exercício', 'caminhada', 'corrida', 'meditação', 'yoga', 'musculação', 'alongamento'],
      trabalho: ['relatório', 'reunião', 'projeto', 'entrega', 'prazo', 'email', 'call', 'trabalho', 'cliente', 'apresentação'],
      estudos: ['estudar', 'curso', 'aula', 'livro', 'leitura', 'pesquisa', 'aprender', 'concurso', 'exame', 'prova'],
      pessoal: ['comprar', 'marcar', 'ligar', 'pagar', 'organizar', 'arrumar', 'casa', 'roupa', 'dentista', 'médico'],
      ideias: ['ideia', 'pensar', 'planejar', 'criar', 'inovar', 'projeto', 'desenvolver', 'app', 'sistema', 'negócio'],
    };
  }
  analisarTarefa(titulo, descricao) {
    const texto = `${titulo} ${descricao || ''}`.toLowerCase();
    const detectadas = {};
    for (const [cat, palavras] of Object.entries(this.categorias)) {
      const count = palavras.filter(p => texto.includes(p)).length;
      if (count > 0) detectadas[cat] = count;
    }
    return detectadas;
  }
  priorizarTarefa(titulo, descricao) {
    const texto = `${titulo} ${descricao || ''}`.toLowerCase();
    if (['urgente','hoje','agora','imediatamente','crítico','emergência'].some(p => texto.includes(p))) return 1;
    if (['importante','prioridade','fundamental','essencial','crucial'].some(p => texto.includes(p))) return 2;
    return 3;
  }
  sugerirData(prioridade) {
    const d = new Date();
    d.setDate(d.getDate() + (prioridade === 1 ? 0 : prioridade === 2 ? 1 : 3));
    return d.toISOString().split('T')[0];
  }
  organizarIdeia(titulo, descricao) {
    const categorias = this.analisarTarefa(titulo, descricao);
    const prioridade = this.priorizarTarefa(titulo, descricao);
    const tipo = Object.keys(categorias).length > 0
      ? Object.entries(categorias).sort((a, b) => b[1] - a[1])[0][0]
      : 'ideias';
    const mapeamento = { saude: 'treino', trabalho: 'tarefa', estudos: 'estudo', pessoal: 'tarefa', ideias: 'tarefa' };
    const sugestoes = {
      saude: 'Esta ideia parece relacionada à saúde física. Que tal agendar um treino?',
      trabalho: 'Parece uma tarefa profissional. Sugiro priorizar na sua agenda de tarefas.',
      estudos: 'Parece um tema de estudo. Que tal planejar uma sessão de estudos?',
      pessoal: 'Lembrete pessoal importante. Considere incluir na sua lista de tarefas.',
      ideias: 'Ótima ideia! Vou catalogá-la como tarefa para você revisar depois.',
    };
    const labels = { 1: '🔴 URGENTE', 2: '🟡 Importante', 3: '🟢 Normal' };
    return {
      tipo: mapeamento[tipo] || 'tarefa',
      prioridade,
      data: this.sugerirData(prioridade),
      categorias,
      sugestao: `${sugestoes[tipo] || sugestoes.ideias} Classificado como: ${labels[prioridade] || labels[3]}`,
    };
  }
}

const organizer = new TaskOrganizer();

// ─── FinanceParser ────────────────────────────────────────────────────────────

class FinanceParser {
  constructor() {
    this.categorias = {
      alimentacao: ['mercado','supermercado','restaurante','lanchonete','padaria','food','comida','refeicao','jantar','almoco','cafe','big box','carrefour','extra','assai','atacadao'],
      transporte: ['uber','taxi','onibus','metro','combustivel','gasolina','estacionamento','transporte','corrida','99'],
      moradia: ['aluguel','condominio','luz','agua','gas','internet','telefone','casa','apartamento','net','fatura'],
      saude: ['farmacia','remedio','medico','hospital','plano de saude','dentista','consulta','exame','drogaria'],
      lazer: ['cinema','teatro','parque','viagem','hospedagem','show','evento','diversao','netflix','spotify'],
      educacao: ['curso','livro','material','escola','faculdade','mensalidade','apostila','udemy','coursera'],
      vestuario: ['roupa','calcado','acessorio','camisa','calca','tenis','sapato','zara','renner'],
      investimento: ['acoes','fundos','reserva','poupanca','cdb','tesouro','cripto','bitcoin'],
      salario: ['salario','salário','ordenado','rendimento','contracheque','holerite'],
      freelance: ['freelance','servico','cliente','projeto','trabalho extra','consultoria'],
      outros: [],
    };
    this.palavrasEntrada = ['recebi','ganhei','salario','salário','renda','lucro','vendi','receber','pagaram','depositaram','reembolso','estorno','dividendo','juros','rendimento','contracheque'];
    this.palavrasSaida   = ['gastei','paguei','comprei','custo','despesa','debito','saquei','pagamento','compra','retirada','saque','gastar','pagar','comprar'];
  }
  segmentar(mensagem) {
    let str = mensagem.toLowerCase().trim();
    if (!str) return [];
    str = str.replace(/(\d),(\d)/g, '$1.$2');
    str = str.replace(/\s+e\s+(?:depois\s+)?/gi, ', ');
    str = str.replace(/\s+depois\s+/gi, ', ');
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0 && s.length < 300);
  }
  determinarTipo(seg) {
    const temE = this.palavrasEntrada.some(p => seg.includes(p));
    const temS = this.palavrasSaida.some(p => seg.includes(p));
    if (temE && !temS) return 'entrada';
    if (temS && !temE) return 'gasto';
    if (temS && temE)  return 'entrada';
    if (/\b(recebi|ganhei|vendi|aluguel)\b/.test(seg)) return 'entrada';
    return null;
  }
  detectarCategoria(seg, tipo, desc) {
    const texto = (seg + ' ' + desc).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [cat, palavras] of Object.entries(this.categorias)) {
      if (cat === 'outros') continue;
      if ((cat === 'salario' || cat === 'freelance') && tipo !== 'entrada') continue;
      if (palavras.some(p => texto.includes(p))) return cat;
    }
    return 'outros';
  }
  extrairDescricao(seg, tipo) {
    let d = seg
      .replace(/(?:r\$)?\s*[\d.,]+\s*(?:reais)?/gi, '')
      .replace(/\b(gastei|paguei|comprei|recebi|ganhei|vendi|custo|despesa|pagamento|compra)\b/gi, '')
      .replace(/\b(no|na|nos|nas|de|do|da|dos|das|em|por|para|um|uma)\b/gi, '')
      .replace(/\s+/g, ' ').trim();
    if (d.length > 0) d = d.charAt(0).toUpperCase() + d.slice(1);
    return d || (tipo === 'entrada' ? 'Receita' : 'Despesa');
  }
  analisarSegmento(seg, warnings) {
    const m = seg.match(/(?:r\$)?\s*([\d.,]+)\s*(?:reais)?/i);
    if (!m) return null;
    const valor = parseFloat(m[1].replace(/\.(?=\d{3})/g, '').replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return null;
    let tipo = this.determinarTipo(seg);
    if (!tipo) { tipo = 'gasto'; if (warnings) warnings.push(`Sem verbo, assumido gasto.`); }
    const tipoB = tipo === 'entrada' ? 'income' : 'expense';
    const cat = this.detectarCategoria(seg, tipo, '');
    return { type: tipoB, amount: valor, currency: 'BRL', date: hojeISO(), description: this.extrairDescricao(seg, tipo), category: cat };
  }
  extrairFallback(mensagem, warnings) {
    const ts = [];
    const re = /(?:r\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais)?/gi;
    let m;
    while ((m = re.exec(mensagem)) !== null) {
      const valor = parseFloat(m[1].replace(',', '.'));
      if (!valor || valor <= 0) continue;
      const ctx = mensagem.substring(Math.max(0, m.index - 50), Math.min(mensagem.length, m.index + m[0].length + 50));
      const tipo = this.determinarTipo(ctx) || 'gasto';
      const tipoB = tipo === 'entrada' ? 'income' : 'expense';
      const cat = this.detectarCategoria(ctx, tipo, '');
      if (warnings) warnings.push('Transação extraída por fallback.');
      ts.push({ type: tipoB, amount: valor, currency: 'BRL', date: hojeISO(), description: this.extrairDescricao(ctx, tipo), category: cat });
    }
    return ts;
  }
  sugerirTransacao(mensagem) {
    const warnings = [];
    const segs = this.segmentar(mensagem);
    const transacoes = [];
    for (const s of segs) {
      const t = this.analisarSegmento(s, warnings);
      if (t) transacoes.push(t);
    }
    if (transacoes.length === 0) transacoes.push(...this.extrairFallback(mensagem, warnings));
    if (transacoes.length === 0) return { valido: false, mensagem: 'Nenhuma transação detectada.', warnings };
    return {
      valido: true,
      transacoes,
      warnings,
      sugestoes: transacoes.map(t => `${t.type.toUpperCase()} R$ ${t.amount.toFixed(2)} - ${t.category} - ${t.description}`),
    };
  }
}

const financeParser = new FinanceParser();

// ─── Dados padrão ─────────────────────────────────────────────────────────────

const CATEGORIAS_PADRAO = [
  { id: 'alimentacao', label: 'Alimentação', icon: '🍔', cor: '#ffaa00', padrao: true },
  { id: 'transporte',  label: 'Transporte',  icon: '🚗', cor: '#00f3ff', padrao: true },
  { id: 'moradia',     label: 'Moradia',     icon: '🏠', cor: '#ff00ff', padrao: true },
  { id: 'saude',       label: 'Saúde',       icon: '💉', cor: '#00ff9d', padrao: true },
  { id: 'lazer',       label: 'Lazer',       icon: '🎮', cor: '#a78bfa', padrao: true },
  { id: 'educacao',    label: 'Educação',    icon: '📚', cor: '#00f3ff', padrao: true },
  { id: 'vestuario',   label: 'Vestuário',   icon: '👕', cor: '#ff00ff', padrao: true },
  { id: 'investimento',label: 'Investimento',icon: '📈', cor: '#00ff9d', padrao: true },
  { id: 'salario',     label: 'Salário',     icon: '💰', cor: '#00ff9d', padrao: true },
  { id: 'freelance',   label: 'Freelance',   icon: '💼', cor: '#ffaa00', padrao: true },
  { id: 'outros',      label: 'Outros',      icon: '📦', cor: '#888888', padrao: true },
];

const TIPOS_PAGAMENTO_PADRAO = [
  { id: 'debito',   label: 'Débito',        icon: '💳' },
  { id: 'credito',  label: 'Crédito',       icon: '💳' },
  { id: 'fatura',   label: 'Fatura Cartão', icon: '🧾' },
  { id: 'pix',      label: 'Pix',           icon: '⚡' },
  { id: 'dinheiro', label: 'Dinheiro',      icon: '💵' },
  { id: 'ted_doc',  label: 'TED / DOC',     icon: '🏦' },
  { id: 'boleto',   label: 'Boleto',        icon: '📄' },
];

const BANCOS_PADRAO = [
  { id: 'nubank',      label: 'Nubank',         icon: '🟣' },
  { id: 'inter',       label: 'Inter',           icon: '🟠' },
  { id: 'itau',        label: 'Itaú',            icon: '🟡' },
  { id: 'bradesco',    label: 'Bradesco',        icon: '🔴' },
  { id: 'bb',          label: 'Banco do Brasil', icon: '🟡' },
  { id: 'caixa',       label: 'Caixa',           icon: '🔵' },
  { id: 'santander',   label: 'Santander',       icon: '🔴' },
  { id: 'c6',          label: 'C6 Bank',         icon: '⚫' },
  { id: 'xp',          label: 'XP',              icon: '⬛' },
  { id: 'picpay',      label: 'PicPay',          icon: '🟢' },
  { id: 'mercadopago', label: 'Mercado Pago',    icon: '💙' },
  { id: 'outro',       label: 'Outro',           icon: '🏦' },
];

if (!db.categorias   || !db.categorias.length)   { db.categorias   = [...CATEGORIAS_PADRAO];    saveData(db); }
if (!db.tiposPagamento || !db.tiposPagamento.length) { db.tiposPagamento = TIPOS_PAGAMENTO_PADRAO; saveData(db); }
if (!db.bancos       || !db.bancos.length)        { db.bancos       = BANCOS_PADRAO;            saveData(db); }
if (!db.agua)     { db.agua     = []; saveData(db); }
if (!db.conversas){ db.conversas= []; saveData(db); }
if (!db.mensagens){ db.mensagens= []; saveData(db); }
if (!db.tarefas)  { db.tarefas  = []; saveData(db); }
if (!db.estudos)  { db.estudos  = []; saveData(db); }
if (!db.treinos)  { db.treinos  = []; saveData(db); }
if (!db.financas) { db.financas = []; saveData(db); }

// ══════════════════════════════════════════════════════════════════════════════
// TAREFAS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/tarefas', (req, res) => {
  res.json(db.tarefas.sort((a, b) => a.prioridade - b.prioridade));
});

app.post('/api/tarefas', (req, res) => {
  const { titulo, descricao, data, prioridade, status, tags, tipo } = req.body;
  if (!titulo || !titulo.trim()) return res.status(400).json({ error: 'Título é obrigatório.' });
  const org = organizer.organizarIdeia(titulo, descricao);
  const novaTarefa = {
    id: uuidv4(),
    tipo: tipo || org.tipo,
    titulo: titulo.trim(),
    descricao: descricao || '',
    data: data || org.data,
    prioridade: prioridade || org.prioridade,
    status: status || 'pendente',
    tags: tags || Object.keys(org.categorias),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.tarefas.push(novaTarefa);
  saveData(db);
  res.json({ tarefa: novaTarefa, organizacao: org });
});

app.put('/api/tarefas/:id', (req, res) => {
  const idx = db.tarefas.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  db.tarefas[idx] = { ...db.tarefas[idx], ...req.body, id: req.params.id, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.tarefas[idx]);
});

app.put('/api/tarefas/:id/concluir', (req, res) => {
  const idx = db.tarefas.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  db.tarefas[idx] = { ...db.tarefas[idx], status: 'concluido', updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.tarefas[idx]);
});

app.delete('/api/tarefas/:id', (req, res) => {
  const idx = db.tarefas.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  db.tarefas.splice(idx, 1);
  saveData(db);
  res.json({ message: 'Tarefa removida com sucesso.' });
});

// ══════════════════════════════════════════════════════════════════════════════
// ESTUDOS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/estudos', (req, res) => {
  res.json(db.estudos.sort((a, b) => new Date(b.data) - new Date(a.data)));
});

app.post('/api/estudos', (req, res) => {
  const { assunto, topico, duracao_planejada, data, observacoes } = req.body;
  if (!assunto || !assunto.trim()) return res.status(400).json({ error: 'Assunto é obrigatório.' });
  const novo = {
    id: uuidv4(),
    assunto: assunto.trim(),
    topico: topico || '',
    duracao_planejada: duracao_planejada || null,
    data: data || hojeISO(),
    duracao_real: null,
    concluido: 0,
    observacoes: observacoes || '',
    created_at: new Date().toISOString(),
  };
  db.estudos.push(novo);
  saveData(db);
  res.json(novo);
});

app.put('/api/estudos/:id/concluir', (req, res) => {
  const idx = db.estudos.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Estudo não encontrado.' });
  // Aceita 'duracao' (frontend) ou 'duracao_real'
  const duracao_real = req.body.duracao_real || req.body.duracao || null;
  db.estudos[idx] = { ...db.estudos[idx], concluido: 1, duracao_real: duracao_real ? parseInt(duracao_real) : null, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.estudos[idx]);
});

app.put('/api/estudos/:id', (req, res) => {
  const idx = db.estudos.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Estudo não encontrado.' });
  db.estudos[idx] = { ...db.estudos[idx], ...req.body, id: req.params.id, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.estudos[idx]);
});

app.delete('/api/estudos/:id', (req, res) => {
  const idx = db.estudos.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Estudo não encontrado.' });
  db.estudos.splice(idx, 1);
  saveData(db);
  res.json({ message: 'Estudo removido com sucesso.' });
});

// ══════════════════════════════════════════════════════════════════════════════
// TREINOS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/treinos', (req, res) => {
  res.json(db.treinos.sort((a, b) => new Date(b.data) - new Date(a.data)));
});

app.post('/api/treinos', (req, res) => {
  const { tipo, exercicios, data, duracao, intensidade, observacoes } = req.body;
  if (!tipo || !tipo.trim()) return res.status(400).json({ error: 'Tipo de treino é obrigatório.' });
  const novo = {
    id: uuidv4(),
    tipo: tipo.trim(),
    exercicios: Array.isArray(exercicios) ? exercicios : [],
    data: data || hojeISO(),
    duracao: duracao || null,
    intensidade: intensidade || 'media',
    concluido: 0,
    observacoes: observacoes || '',
    created_at: new Date().toISOString(),
  };
  db.treinos.push(novo);
  saveData(db);
  res.json(novo);
});

app.put('/api/treinos/:id/concluir', (req, res) => {
  const idx = db.treinos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Treino não encontrado.' });
  db.treinos[idx] = { ...db.treinos[idx], concluido: 1, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.treinos[idx]);
});

app.put('/api/treinos/:id', (req, res) => {
  const idx = db.treinos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Treino não encontrado.' });
  db.treinos[idx] = { ...db.treinos[idx], ...req.body, id: req.params.id, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.treinos[idx]);
});

app.delete('/api/treinos/:id', (req, res) => {
  const idx = db.treinos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Treino não encontrado.' });
  db.treinos.splice(idx, 1);
  saveData(db);
  res.json({ message: 'Treino removido com sucesso.' });
});

// ══════════════════════════════════════════════════════════════════════════════
// FINANÇAS  (rotas específicas ANTES das parametrizadas)
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/financas/resumo', (req, res) => {
  const mesNum = req.query.mes ? parseInt(req.query.mes) : new Date().getMonth() + 1;
  const anoNum = req.query.ano ? parseInt(req.query.ano) : new Date().getFullYear();
  const filtradas = db.financas.filter(f => {
    const d = new Date(f.data + 'T12:00:00');
    return d.getMonth() + 1 === mesNum && d.getFullYear() === anoNum;
  });
  const totalEntradas = filtradas.filter(f => f.tipo === 'entrada').reduce((s, f) => s + (f.valor || 0), 0);
  const totalSaidas   = filtradas.filter(f => f.tipo === 'saida').reduce((s, f) => s + (f.valor || 0), 0);
  res.json({ mes: mesNum, ano: anoNum, totalEntradas, totalSaidas, saldo: totalEntradas - totalSaidas, totalTransacoes: filtradas.length });
});

app.get('/api/financas/assinaturas', (req, res) => {
  res.json(db.financas.filter(f => f.assinatura === true));
});

app.get('/api/financas', (req, res) => {
  const { mes, ano, tipo } = req.query;
  let financas = [...db.financas];
  if (mes || ano) {
    const mesNum = mes ? parseInt(mes) : null;
    const anoNum = ano ? parseInt(ano) : null;
    financas = financas.filter(f => {
      const d = new Date(f.data + 'T12:00:00');
      if (mesNum && d.getMonth() + 1 !== mesNum) return false;
      if (anoNum && d.getFullYear() !== anoNum) return false;
      return true;
    });
  }
  if (tipo && ['entrada', 'saida'].includes(tipo)) financas = financas.filter(f => f.tipo === tipo);
  financas.sort((a, b) => new Date(b.data) - new Date(a.data));
  res.json(financas);
});

app.post('/api/financas/confirmar', (req, res) => {
  const { transacoes, confirmacao } = req.body;
  if (!confirmacao) return res.status(400).json({ error: 'Confirmação é obrigatória.' });
  const conf = confirmacao.toLowerCase().trim();
  if (!['sim','s','não','nao','n','no'].includes(conf)) return res.status(400).json({ error: 'Use "sim" ou "não".' });
  if (['não','nao','n','no'].includes(conf)) return res.json({ registrado: false, mensagem: 'Registro cancelado pelo usuário.' });
  if (!transacoes || !Array.isArray(transacoes) || transacoes.length === 0) return res.status(400).json({ error: 'Nenhuma transação fornecida.' });
  const resultados = [];
  for (const t of transacoes) {
    const tipo = (t.type === 'entrada' || t.type === 'income') ? 'entrada' : 'saida';
    const nova = {
      id: uuidv4(),
      tipo,
      valor: parseFloat(t.amount || t.valor || 0),
      data: t.date || t.data || hojeISO(),
      descricao: t.description || t.descricao || (tipo === 'entrada' ? 'Receita' : 'Despesa'),
      categoria: t.category || t.categoria || 'outros',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.financas.push(nova);
    resultados.push(nova);
  }
  saveData(db);
  res.json({ registrado: true, mensagem: `${resultados.length} transação(ões) registrada(s) com sucesso!`, transacoes: resultados });
});

app.post('/api/financas', (req, res) => {
  const { tipo, valor, data, descricao, categoria, mensagem_nl, banco, tipoPagamento, parcelas, assinatura } = req.body;
  if (mensagem_nl) {
    const sug = financeParser.sugerirTransacao(mensagem_nl);
    if (!sug.valido || !sug.transacoes || sug.transacoes.length === 0) {
      return res.status(400).json({ error: sug.mensagem || 'Nenhuma transação detectada.' });
    }
    const resultados = sug.transacoes.map(p => {
      const t = {
        id: uuidv4(),
        tipo: (p.type === 'entrada' || p.type === 'income') ? 'entrada' : 'saida',
        valor: p.amount,
        data: p.date,
        descricao: p.description,
        categoria: p.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.financas.push(t);
      return t;
    });
    saveData(db);
    return res.json({ transacoes: resultados, financa: resultados[0] });
  }
  if (!tipo || !['entrada', 'saida'].includes(tipo)) return res.status(400).json({ error: 'Tipo deve ser "entrada" ou "saida".' });
  if (!valor || isNaN(valor) || parseFloat(valor) <= 0) return res.status(400).json({ error: 'Valor deve ser um número positivo.' });
  const nova = {
    id: uuidv4(),
    tipo,
    valor: parseFloat(valor),
    data: data || hojeISO(),
    descricao: descricao || (tipo === 'entrada' ? 'Receita' : 'Despesa'),
    categoria: categoria || 'outros',
    banco: banco || null,
    tipoPagamento: tipoPagamento || null,
    parcelas: parcelas || null,
    assinatura: assinatura || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.financas.push(nova);
  saveData(db);
  res.json({ financa: nova });
});

app.put('/api/financas/:id', (req, res) => {
  const idx = db.financas.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transação não encontrada.' });
  db.financas[idx] = { ...db.financas[idx], ...req.body, id: req.params.id, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.financas[idx]);
});

app.patch('/api/financas/:id/parcela', (req, res) => {
  const idx = db.financas.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transação não encontrada.' });
  const f = db.financas[idx];
  if ((f.parcelaAtual || 1) >= (f.parcelaTotal || 1)) return res.status(400).json({ error: 'Todas as parcelas já foram pagas.' });
  db.financas[idx] = { ...f, parcelaAtual: (f.parcelaAtual || 1) + 1, updated_at: new Date().toISOString() };
  saveData(db);
  res.json(db.financas[idx]);
});

app.delete('/api/financas/assinatura/:id', (req, res) => {
  const idx = db.financas.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Assinatura não encontrada.' });
  db.financas.splice(idx, 1);
  saveData(db);
  res.json({ message: 'Assinatura cancelada.' });
});

app.delete('/api/financas/:id', (req, res) => {
  const idx = db.financas.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transação não encontrada.' });
  db.financas.splice(idx, 1);
  saveData(db);
  res.json({ message: 'Transação removida com sucesso.' });
});

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSAS / CHAT IA
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/conversas', (req, res) => {
  res.json(db.conversas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

app.post('/api/conversas', (req, res) => {
  const nova = { id: uuidv4(), titulo: req.body.titulo || null, created_at: new Date().toISOString() };
  db.conversas.push(nova);
  saveData(db);
  res.json(nova);
});

app.get('/api/conversas/:id/mensagens', (req, res) => {
  res.json(db.mensagens.filter(m => m.conversa_id === req.params.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
});

app.post('/api/conversas/:id/mensagens', (req, res) => {
  const { role, conteudo } = req.body;
  const nova = { id: uuidv4(), conversa_id: req.params.id, role, conteudo, created_at: new Date().toISOString() };
  db.mensagens.push(nova);
  saveData(db);
  const sugestoes = role === 'user' ? gerarRespostaIA(conteudo) : [];
  res.json({ mensagem: nova, sugestoes });
});

function gerarRespostaIA(mensagem) {
  const lower = mensagem.toLowerCase();
  const fin = financeParser.sugerirTransacao(mensagem);
  if (fin.valido && fin.transacoes && fin.transacoes.length > 0) {
    if (/^(sim|yes|s|confirmo|não|nao|no|n|cancela)$/i.test(mensagem.trim())) return [];
    return [{ tipo: 'financa_pendente', acao: 'Registrar transações detectadas?', descricao: `Detectei ${fin.transacoes.length} movimentação(ões):\n\n${fin.sugestoes.join('\n\n')}\n\nDeseja registrar? (sim/não)`, transacoes: fin.transacoes, requerConfirmacao: true }];
  }
  const sugestoes = [];
  if (lower.includes('tarefa') || lower.includes('lembrar') || lower.includes('preciso')) sugestoes.push({ tipo: 'tarefa', acao: 'Criar nova tarefa', descricao: `Vou adicionar: "${mensagem}" às suas tarefas.` });
  if (lower.includes('estudar') || lower.includes('estudo') || lower.includes('aprender'))  sugestoes.push({ tipo: 'estudo',  acao: 'Planejar sessão de estudos', descricao: `Vou registrar um plano de estudos para: "${mensagem}".` });
  if (lower.includes('treino') || lower.includes('academia') || lower.includes('exercício')) sugestoes.push({ tipo: 'treino',  acao: 'Agendar treino', descricao: `Vou criar um registro de treino para: "${mensagem}".` });
  if (sugestoes.length === 0) sugestoes.push({ tipo: 'geral', acao: 'Ajudar a organizar', descricao: `Entendi: "${mensagem}". Posso ajudar a organizar isso como uma tarefa, estudo ou treino.` });
  return sugestoes;
}

// ══════════════════════════════════════════════════════════════════════════════
// ÁGUA
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/agua', (req, res) => {
  const hoje = req.query.data || hojeISO();
  res.json(db.agua.find(a => a.data === hoje) || { data: hoje, total: 0, registros: [], meta: 2000 });
});

app.post('/api/agua', (req, res) => {
  const { quantidade, meta } = req.body;
  const hoje = hojeISO();
  let reg = db.agua.find(a => a.data === hoje);
  if (!reg) { reg = { data: hoje, total: 0, registros: [], meta: meta || 2000 }; db.agua.push(reg); }
  if (quantidade) { reg.total += quantidade; reg.registros.push({ quantidade, hora: new Date().toLocaleTimeString('pt-BR') }); }
  if (meta) reg.meta = meta;
  saveData(db);
  res.json(reg);
});

app.delete('/api/agua/ultimo', (req, res) => {
  const hoje = hojeISO();
  const reg = db.agua.find(a => a.data === hoje);
  if (reg && reg.registros.length > 0) {
    const ult = reg.registros.pop();
    reg.total = Math.max(0, reg.total - ult.quantidade);
    saveData(db);
  }
  res.json(reg || { data: hoje, total: 0, registros: [], meta: 2000 });
});

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIAS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/categorias', (req, res) => res.json(db.categorias));

app.post('/api/categorias', (req, res) => {
  const { label, icon, cor } = req.body;
  if (!label || !label.trim()) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
  const id = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (db.categorias.some(c => c.id === id)) return res.status(400).json({ error: 'Já existe uma categoria com esse nome.' });
  const nova = { id, label: label.trim(), icon: icon || '🏷️', cor: cor || '#00f3ff', padrao: false, created_at: new Date().toISOString() };
  db.categorias.push(nova);
  saveData(db);
  res.json(nova);
});

app.delete('/api/categorias/:id', (req, res) => {
  const cat = db.categorias.find(c => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada.' });
  if (cat.padrao) return res.status(400).json({ error: 'Categorias padrão não podem ser removidas.' });
  db.categorias = db.categorias.filter(c => c.id !== req.params.id);
  saveData(db);
  res.json({ message: 'Categoria removida com sucesso.' });
});

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS DE PAGAMENTO E BANCOS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/tipos-pagamento', (req, res) => res.json(db.tiposPagamento));
app.get('/api/bancos', (req, res) => res.json(db.bancos));

// ══════════════════════════════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Database: ${dbPath}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
  });
}