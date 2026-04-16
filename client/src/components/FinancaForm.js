import React, { useState, useEffect } from 'react';
import { financasAPI, tiposPagamentoAPI, bancosAPI } from '../services/api';

const FinancaForm = ({ onFinancaCriada }) => {
  const [modo, setModo] = useState('manual'); // 'nl' = linguagem natural, 'manual' = campos manuais
  const [mensagemNL, setMensagemNL] = useState('');
  const [formData, setFormData] = useState({
    tipo: 'saida',
    tipo_gasto: '',
    tipoGasto: 'normal',
    valor: '',
    data: (() => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })(),
    descricao: '',
    categoria: 'outros',
    tipoPagamento: '',
    banco: '',
    parcelas: '',
    // Validação adicional
    errors: {}
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [tiposPagamento, setTiposPagamento] = useState([]);
  const [bancos, setBancos] = useState([]);

  useEffect(() => {
    const getData = (r) => Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.data) ? r.data.data : [];
    tiposPagamentoAPI.getAll().then(res => setTiposPagamento(getData(res)));
    bancosAPI.getAll().then(res => setBancos(getData(res)));
  }, []);

  const categorias = [
    'alimentação', 'transporte', 'moradia', 'saúde', 'lazer',
    'educação', 'vestuário', 'investimento', 'salário', 'freelance', 'outros'
  ];

  const handleParseNL = () => {
    if (!mensagemNL.trim()) return;

    // Simples parse cliente (fallback) baseado no backend parser
    const texto = mensagemNL.toLowerCase();

    // Detectar tipo
    let tipo = null;
    const palavrasEntrada = ['recebi', 'ganhei', 'salário', 'salario', 'renda', 'lucro', 'vendi', 'receber', 'pagaram', 'depositaram', 'reembolso', 'estorno', 'dividendo', 'juros', 'aluguel', 'freelance', 'serviço', 'rendimento', 'contracheque'];
    const palavrasSaida = ['gastei', 'paguei', 'comprei', 'custo', 'despesa', 'débito', 'saquei', 'pagamento', 'compra', 'retirada', 'saque', 'gastar', 'pagar', 'comprar'];

    const temEntrada = palavrasEntrada.some(p => texto.includes(p));
    const temSaida = palavrasSaida.some(p => texto.includes(p));

    if (temEntrada && !temSaida) tipo = 'entrada';
    else if (temSaida && !temEntrada) tipo = 'saida';

    // Extrair valor
    const valorMatch = texto.match(/(?:r\$)?\s*([\d.,]+)/);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(/\.(?=\d{3})/g, '').replace(',', '.')) : null;

    // Extrair data
    let data = (() => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })();
    if (texto.includes('ontem')) {
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      data = ontem.toISOString().split('T')[0];
    }

    // Extrair descrição (remover tipo, valor, data, artigos)
    let descricao = texto
      .replace(new RegExp(palavrasEntrada.join('|'), 'gi'), '')
      .replace(new RegExp(palavrasSaida.join('|'), 'gi'), '')
      .replace(/(?:r\$)?\s*\d+(?:[.,]\d{2})?/gi, '')
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .trim();

    // Detectar categoria
    const categoriasMap = {
      'alimentação': ['mercado', 'supermercado', 'restaurante', 'lanchonete', 'padaria', 'food', 'comida', 'refeição', 'jantar', 'almôço', 'café'],
      'transporte': ['uber', 'taxi', 'ônibus', 'metrô', 'combustível', 'gasolina', 'estacionamento', 'viagem', 'transporte'],
      'moradia': ['aluguel', 'condomínio', 'luz', 'água', 'gás', 'internet', 'telefone', 'casa', 'apartamento'],
      'saúde': ['farmácia', 'remédio', 'médico', 'hospital', 'plano de saúde', 'dentista', 'consulta', 'exame'],
      'lazer': ['cinema', 'teatro', 'parque', 'viagem', 'hospedagem', 'show', 'evento', 'diversão'],
      'educação': ['curso', 'livro', 'material', 'escola', 'faculdade', 'mensalidade', 'apostila'],
      'vestuário': ['roupa', 'calçado', 'acessório', 'camisa', 'calça', 'tênis', 'sapato', 'zara', 'renner'],
      'investimento': ['ações', 'fundos', 'reserva', 'poupança', 'cdb', 'tesouro', 'cripto', 'bitcoin'],
      'salário': ['salário', 'ordenado', 'rendimento', 'contracheque', 'holerite'],
      'freelance': ['freelance', 'serviço', 'cliente', 'projeto', 'trabalho extra', 'consultoria']
    };

    let categoria = 'outros';
    for (const [cat, palavras] of Object.entries(categoriasMap)) {
      if (palavras.some(p => texto.includes(p))) {
        categoria = cat;
        break;
      }
    }

    const resultado = {
      Tipo: tipo ? (tipo === 'entrada' ? '📈 ENTRADA' : '📉 GASTO') : '❓ NÃO DETECTADO',
      'Valor': valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '❓ NÃO DETECTADO',
      'Data': data.split('-').reverse().join('/'),
      'Descrição': descricao || (tipo === 'entrada' ? 'Receita' : 'Despesa'),
      'Categoria': categoria
    };

    setParseResult(resultado);

    // Preencher formulário manual
    if (tipo && valor) {
      setFormData({
        tipo: 'saida', tipo_gasto: '', tipoGasto: 'normal',
        valor: '', data: (() => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })(), descricao: '',
        categoria: 'outros', tipoPagamento: '', banco: '',
        parcelas: '', errors: {},
      });
      setMensagem('► Dados extraídos automaticamente. Revise e ajuste se necessário.');
    } else {
      setMensagem('⚠ Não foi possível extrair todos os dados. Preencha manualmente.');
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMensagem('');

  try {
    const unwrap = (r) => r?.data?.data ?? r?.data ?? {};
    if (modo === 'nl') {
      const res = await financasAPI.create({ mensagem_nl: mensagemNL });
      const data = unwrap(res);
      const transacoes = data.transacoes || [data.financa];

      for (const t of transacoes) {
        if (onFinancaCriada) onFinancaCriada(t);
      }

      setMensagem(`✓ ${transacoes.length} TRANSAÇÃO(ÕES) REGISTRADA(S)`);
    } else {
      if (!formData.valor || !formData.descricao) {
        setMensagem('⚠ Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      const response = await financasAPI.create({
        ...formData,
        valor: parseFloat(formData.valor),
      });
      const data = unwrap(response);
      if (onFinancaCriada) onFinancaCriada(data.financa);
      setMensagem(`✓ TRANSAÇÃO REGISTRADA // ${new Date().toLocaleDateString('pt-BR')}`);
    }

    setMensagemNL('');
    setFormData({
      tipo: 'saida',
      tipo_gasto: '',
      tipoGasto: 'normal',
      valor: '',
      data: (() => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })(),
      descricao: '',
      categoria: 'outros'
    });
    setParseResult(null);
    setModo('nl');
  } catch (error) {
    setMensagem(`✗ ERRO: ${error.response?.data?.error || error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (campo, valor) => {
  setFormData(prev => ({
    ...prev,
    [campo]: valor,
    errors: { ...prev.errors, [campo]: null },
  }));
  setParseResult(null);
};

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
        REGISTRO FINANCEIRO
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {Math.random().toString(36).substr(2,6).toUpperCase()}</span>
      </h3>

      {/* Toggle de modo */}
      {/*<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          className={`btn ${modo === 'nl' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setModo('nl'); setParseResult(null); }}
          style={{ flex: 1, fontSize: '10px' }}
        >
          ◉ LINGUAGEM NATURAL
        </button>
        <button
          type="button"
          className={`btn ${modo === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setModo('manual')}
          style={{ flex: 1, fontSize: '10px' }}
        >
          ◼ ENTRADA MANUAL
        </button>
      </div>*/}

      <form onSubmit={handleSubmit}>
        {modo === 'nl' && (
          <div style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">COMANDO EM LINGUAGEM NATURAL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={mensagemNL}
                  onChange={(e) => setMensagemNL(e.target.value)}
                  placeholder="► Ex: gastei 50 reais no mercado, recebi 1200 do salário..."
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleParseNL}
                  disabled={!mensagemNL.trim()}
                  style={{ fontSize: '10px', minWidth: '100px' }}
                >
                  ► INTERPRETAR
                </button>
              </div>
            </div>

            {parseResult && (
              <div className="card" style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0, 243, 255, 0.05)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '8px', color: 'var(--neon-cyan)', fontFamily: 'monospace' }}>
                  ► PARSING RESULT:
                </div>
                {Object.entries(parseResult).map(([chave, valor]) => (
                  <div key={chave} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{chave}:</span>
                    <span style={{ color: valor.includes('❓') ? 'var(--neon-amber)' : 'var(--neon-green)' }}>{valor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {modo === 'manual' && (
          <div style={{ marginBottom: '16px' }}>
            <div className="grid grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">TIPO</label>
                <select
                  className="form-select"
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                >
                  <option value="saida">📉 GASTO</option>
                  <option value="entrada">📈 ENTRADA</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">VALOR (R$) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', e.target.value)}
                  placeholder="► 0,00"
                  required
                  step="0.01"
                  min="0"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">DATA</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.data}
                  onChange={(e) => handleInputChange('data', e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CATEGORIA</label>
                <select
                  className="form-select"
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">BANCO</label>
                <select
                  className="form-select"
                  value={formData.banco}
                  onChange={(e) => handleInputChange('banco', e.target.value)}
                  disabled={loading}
                  style={{ fontFamily: 'monospace' }}
                >
                  <option value="">— Selecione —</option>
                  {bancos.map(banco => (
                    <option key={banco.id} value={banco.id}>
                      {banco.icon} {banco.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">TIPO DE PAGAMENTO</label>
                <select
                  className="form-select"
                  value={formData.tipoPagamento}
                  onChange={(e) => handleInputChange('tipoPagamento', e.target.value)}
                  disabled={loading}
                  style={{ fontFamily: 'monospace' }}
                >
                  <option value="">— Selecione —</option>
                  {tiposPagamento.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.icon} {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIÇÃO *</label>
              <input
                type="text"
                className="form-input"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="► Detalhes da transação..."
                required
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
          {loading ? '⏳ PROCESSANDO...' : modo === 'nl' ? '◈ REGISTRAR TRANSAÇÃO' : '◈ SALVAR'}
        </button>

        {mensagem && (
          <div className={`alert ${mensagem.includes('✓') ? 'alert-success' : 'alert-warning'}`} style={{ marginTop: '16px' }}>
            <code style={{ fontSize: '12px', fontFamily: 'monospace', display: 'block', whiteSpace: 'pre-wrap' }}>
              {mensagem}
            </code>
          </div>
        )}

        <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {modo === 'nl' ? '► Use linguagem natural. Ex: "gastei 50 no mercado", "recebi 1500 de salário"' : '► Preencha todos os campos para registro manual.'}
        </div>
      </form>
    </div>
  );
};

export default FinancaForm;