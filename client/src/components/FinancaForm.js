import React, { useState, useEffect } from 'react';
import { financasAPI, tiposPagamentoAPI, bancosAPI } from '../services/api';

const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const FinancaForm = ({ onFinancaCriada }) => {
  const [modo, setModo] = useState('manual');
  const [mensagemNL, setMensagemNL] = useState('');
  const [formData, setFormData] = useState({
    tipo: 'saida',
    tipoGasto: 'normal',       // 'normal' | 'assinatura' | 'parcelado'
    valor: '',
    data: hojeISO(),
    descricao: '',
    categoria: 'outros',
    tipoPagamento: '',
    banco: '',
    // assinatura
    assinatura: false,
    frequenciaAssinatura: 'mensal',
    // parcelas
    parcelas: '',
    errors: {},
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
    'educação', 'vestuário', 'investimento', 'salário', 'freelance',
    'assinatura', 'outros',
  ];

  const frequencias = [
    { value: 'semanal',   label: 'Semanal'   },
    { value: 'mensal',    label: 'Mensal'     },
    { value: 'trimestral',label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral'  },
    { value: 'anual',     label: 'Anual'      },
  ];

  const handleParseNL = () => {
    if (!mensagemNL.trim()) return;
    const texto = mensagemNL.toLowerCase();

    let tipo = null;
    const palavrasEntrada = ['recebi','ganhei','salário','salario','renda','lucro','vendi','receber','pagaram','depositaram','reembolso','estorno','dividendo','juros','aluguel','freelance','serviço','rendimento','contracheque'];
    const palavrasSaida   = ['gastei','paguei','comprei','custo','despesa','débito','saquei','pagamento','compra','retirada','saque','gastar','pagar','comprar'];

    const temEntrada = palavrasEntrada.some(p => texto.includes(p));
    const temSaida   = palavrasSaida.some(p => texto.includes(p));
    if (temEntrada && !temSaida) tipo = 'entrada';
    else if (temSaida && !temEntrada) tipo = 'saida';

    const valorMatch = texto.match(/(?:r\$)?\s*([\d.,]+)/);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(/\.(?=\d{3})/g, '').replace(',', '.')) : null;

    let data = hojeISO();
    if (texto.includes('ontem')) {
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      data = ontem.toISOString().split('T')[0];
    }

    let descricao = texto
      .replace(new RegExp(palavrasEntrada.join('|'), 'gi'), '')
      .replace(new RegExp(palavrasSaida.join('|'), 'gi'), '')
      .replace(/(?:r\$)?\s*\d+(?:[.,]\d{2})?/gi, '')
      .replace(/^(?:de|do|da|dos|das|no|na|nos|nas|em|por|para|com)\s+/i, '')
      .trim();

    const categoriasMap = {
      'alimentação': ['mercado','supermercado','restaurante','lanchonete','padaria','food','comida','refeição','jantar','almôço','café'],
      'transporte':  ['uber','taxi','ônibus','metrô','combustível','gasolina','estacionamento','viagem','transporte'],
      'moradia':     ['aluguel','condomínio','luz','água','gás','internet','telefone','casa','apartamento'],
      'saúde':       ['farmácia','remédio','médico','hospital','plano de saúde','dentista','consulta','exame'],
      'lazer':       ['cinema','teatro','parque','viagem','hospedagem','show','evento','diversão'],
      'educação':    ['curso','livro','material','escola','faculdade','mensalidade','apostila'],
      'vestuário':   ['roupa','calçado','acessório','camisa','calça','tênis','sapato','zara','renner'],
      'investimento':['ações','fundos','reserva','poupança','cdb','tesouro','cripto','bitcoin'],
      'salário':     ['salário','ordenado','rendimento','contracheque','holerite'],
      'freelance':   ['freelance','serviço','cliente','projeto','trabalho extra','consultoria'],
      'assinatura':  ['netflix','spotify','amazon','prime','youtube','disney','hbo','apple','plano','assinatura','mensalidade'],
    };

    let categoria = 'outros';
    for (const [cat, palavras] of Object.entries(categoriasMap)) {
      if (palavras.some(p => texto.includes(p))) { categoria = cat; break; }
    }

    const resultado = {
      Tipo: tipo ? (tipo === 'entrada' ? '📈 ENTRADA' : '📉 GASTO') : '❓ NÃO DETECTADO',
      Valor: valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '❓ NÃO DETECTADO',
      Data: data.split('-').reverse().join('/'),
      Descrição: descricao || (tipo === 'entrada' ? 'Receita' : 'Despesa'),
      Categoria: categoria,
    };

    setParseResult(resultado);
    if (tipo && valor) {
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
        for (const t of transacoes) { if (onFinancaCriada) onFinancaCriada(t); }
        setMensagem(`✓ ${transacoes.length} TRANSAÇÃO(ÕES) REGISTRADA(S)`);
      } else {
        if (!formData.valor || !formData.descricao) {
          setMensagem('⚠ Preencha todos os campos obrigatórios');
          setLoading(false);
          return;
        }

        const payload = {
          tipo: formData.tipo,
          valor: parseFloat(formData.valor),
          data: formData.data,
          descricao: formData.descricao,
          categoria: formData.categoria,
          banco: formData.banco || null,
          tipoPagamento: formData.tipoPagamento || null,
          // Assinatura
          assinatura: formData.tipoGasto === 'assinatura',
          frequenciaAssinatura: formData.tipoGasto === 'assinatura' ? formData.frequenciaAssinatura : null,
          // Parcelas
          parcelas: formData.tipoGasto === 'parcelado' ? parseInt(formData.parcelas) || null : null,
          parcelaAtual: formData.tipoGasto === 'parcelado' ? 1 : null,
        };

        const response = await financasAPI.create(payload);
        const data = unwrap(response);
        if (onFinancaCriada) onFinancaCriada(data.financa);
        setMensagem(`✓ TRANSAÇÃO REGISTRADA // ${new Date().toLocaleDateString('pt-BR')}`);
      }

      setMensagemNL('');
      setFormData({
        tipo: 'saida', tipoGasto: 'normal', valor: '', data: hojeISO(),
        descricao: '', categoria: 'outros', tipoPagamento: '', banco: '',
        assinatura: false, frequenciaAssinatura: 'mensal', parcelas: '', errors: {},
      });
      setParseResult(null);
      setModo('manual');
    } catch (error) {
      setMensagem(`✗ ERRO: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor, errors: { ...prev.errors, [campo]: null } }));
    setParseResult(null);
  };

  const tipoGastoOpcoes = [
    { value: 'normal',     label: '◼ NORMAL',      desc: 'Gasto avulso'           },
    { value: 'assinatura', label: '🔄 ASSINATURA',  desc: 'Recorrente (Netflix…)'  },
    { value: 'parcelado',  label: '📦 PARCELADO',   desc: 'Em X vezes'             },
  ];

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
        REGISTRO FINANCEIRO
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
        </span>
      </h3>

      <form onSubmit={handleSubmit}>
        {/* ── MODO NL ── */}
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
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '8px', color: 'var(--neon-cyan)', fontFamily: 'monospace' }}>► PARSING RESULT:</div>
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

        {/* ── MODO MANUAL ── */}
        {modo === 'manual' && (
          <div style={{ marginBottom: '16px' }}>

            {/* Tipo entrada/saída + valor */}
            <div className="grid grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">TIPO</label>
                <select className="form-select" value={formData.tipo} onChange={(e) => handleInputChange('tipo', e.target.value)} style={{ fontFamily: 'monospace' }}>
                  <option value="saida">📉 GASTO</option>
                  <option value="entrada">📈 ENTRADA</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">VALOR (R$) *</label>
                <input type="number" className="form-input" value={formData.valor} onChange={(e) => handleInputChange('valor', e.target.value)} placeholder="► 0,00" required step="0.01" min="0" style={{ fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Tipo de gasto */}
            {formData.tipo === 'saida' && (
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">MODALIDADE DO GASTO</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tipoGastoOpcoes.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleInputChange('tipoGasto', opt.value)}
                      style={{
                        flex: 1, minWidth: '100px', padding: '8px 10px',
                        fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer',
                        border: formData.tipoGasto === opt.value ? '1px solid var(--neon-cyan)' : '1px solid rgba(0,243,255,0.2)',
                        background: formData.tipoGasto === opt.value ? 'rgba(0,243,255,0.1)' : 'transparent',
                        color: formData.tipoGasto === opt.value ? 'var(--neon-cyan)' : 'var(--text-muted)',
                        borderRadius: '2px', textAlign: 'left', lineHeight: 1.4,
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{opt.label}</div>
                      <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Campos de ASSINATURA */}
            {formData.tipo === 'saida' && formData.tipoGasto === 'assinatura' && (
              <div className="form-group" style={{ marginBottom: '12px', padding: '12px', background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.25)', borderRadius: '2px' }}>
                <label className="form-label" style={{ color: '#ffaa00' }}>🔄 CONFIGURAR ASSINATURA</label>
                <div>
                  <label className="form-label" style={{ fontSize: '9px' }}>FREQUÊNCIA DE COBRANÇA</label>
                  <select
                    className="form-select"
                    value={formData.frequenciaAssinatura}
                    onChange={(e) => handleInputChange('frequenciaAssinatura', e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {frequencias.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: '8px', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,170,0,0.7)' }}>
                  ► A assinatura será salva com recorrência {formData.frequenciaAssinatura}.
                </div>
              </div>
            )}

            {/* Campos de PARCELAS */}
            {formData.tipo === 'saida' && formData.tipoGasto === 'parcelado' && (
              <div className="form-group" style={{ marginBottom: '12px', padding: '12px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '2px' }}>
                <label className="form-label" style={{ color: '#a78bfa' }}>📦 CONFIGURAR PARCELAMENTO</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '9px' }}>Nº DE PARCELAS</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.parcelas}
                      onChange={(e) => handleInputChange('parcelas', e.target.value)}
                      placeholder="Ex: 12"
                      min="2" max="60" step="1"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  {formData.valor && formData.parcelas && parseInt(formData.parcelas) > 0 && (
                    <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '2px', fontSize: '10px', fontFamily: 'monospace', color: '#a78bfa', whiteSpace: 'nowrap' }}>
                      {parseInt(formData.parcelas)}x de{' '}
                      {(parseFloat(formData.valor) / parseInt(formData.parcelas)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '8px', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(167,139,250,0.7)' }}>
                  ► O valor total será dividido em {formData.parcelas || '?'} parcelas mensais.
                </div>
              </div>
            )}

            {/* Data + Categoria */}
            <div className="grid grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">DATA</label>
                <input type="date" className="form-input" value={formData.data} onChange={(e) => handleInputChange('data', e.target.value)} style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="form-group">
                <label className="form-label">CATEGORIA</label>
                <select className="form-select" value={formData.categoria} onChange={(e) => handleInputChange('categoria', e.target.value)} style={{ fontFamily: 'monospace' }}>
                  {categorias.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Banco + Tipo pagamento */}
            <div className="grid grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">BANCO</label>
                <select className="form-select" value={formData.banco} onChange={(e) => handleInputChange('banco', e.target.value)} disabled={loading} style={{ fontFamily: 'monospace' }}>
                  <option value="">— Selecione —</option>
                  {bancos.map(banco => (
                    <option key={banco.id} value={banco.id}>{banco.icon} {banco.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">TIPO DE PAGAMENTO</label>
                <select className="form-select" value={formData.tipoPagamento} onChange={(e) => handleInputChange('tipoPagamento', e.target.value)} disabled={loading} style={{ fontFamily: 'monospace' }}>
                  <option value="">— Selecione —</option>
                  {tiposPagamento.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.icon} {tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label className="form-label">DESCRIÇÃO *</label>
              <input type="text" className="form-input" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} placeholder="► Detalhes da transação..." required style={{ fontFamily: 'monospace' }} />
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
          {modo === 'nl'
            ? '► Use linguagem natural. Ex: "gastei 50 no mercado", "recebi 1500 de salário"'
            : '► Preencha todos os campos para registro manual.'}
        </div>
      </form>
    </div>
  );
};

export default FinancaForm;