import React, { useState, useEffect, useCallback } from 'react';
import { financasAPI, categoriasAPI } from '../services/api';

const CORES_OPCOES = [
  '#00f3ff', '#ff00ff', '#00ff9d', '#ffaa00',
  '#ff0040', '#a78bfa', '#f97316', '#06b6d4',
];

const EMOJIS_OPCOES = [
  '🏷️','💡','🎯','⭐','🔑','🛒','🎁','🏆',
  '🔧','📱','🎵','✈️','🏋️','🐾','💊','🍕',
];

const CategoriaGastos = () => {
  const [categorias,   setCategorias]   = useState([]);
  const [dados,        setDados]        = useState([]);
  const [totalGastos,  setTotalGastos]  = useState(0);
  const [filtroMes,    setFiltroMes]    = useState(new Date().getMonth() + 1);
  const [filtroAno,    setFiltroAno]    = useState(new Date().getFullYear());
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState('');
  const [sucesso,      setSucesso]      = useState('');
  const [painelAberto, setPainelAberto] = useState(false);
  const [novaLabel,    setNovaLabel]    = useState('');
  const [novaIcon,     setNovaIcon]     = useState('🏷️');
  const [novaCor,      setNovaCor]      = useState('#00f3ff');
  const [criando,      setCriando]      = useState(false);
  const [erroForm,     setErroForm]     = useState('');

  const meses = [
    'JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
    'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO',
  ];
  const anos = [];
  for (let i = new Date().getFullYear() - 2; i <= new Date().getFullYear() + 1; i++) anos.push(i);

  const flash = (msg, tipo = 'sucesso') => {
    if (tipo === 'sucesso') { setSucesso(msg); setTimeout(() => setSucesso(''), 3000); }
    else                    { setErro(msg);    setTimeout(() => setErro(''),    4000); }
  };

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const configDe = useCallback((catId) => {
    const cat = categorias.find(c => c.id === catId);
    if (cat) return { label: cat.label.toUpperCase(), icon: cat.icon, color: cat.cor };
    return { label: catId.toUpperCase(), icon: '📦', color: '#888888' };
  }, [categorias]);

  const carregarCategorias = async () => {
    try {
      const res = await categoriasAPI.getAll();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setCategorias(data);
    } catch {
      flash('Erro ao carregar categorias.', 'erro');
    }
  };

  const carregarGastos = async () => {
    setLoading(true);
    try {
      const res = await financasAPI.getAll({ mes: filtroMes, ano: filtroAno });
      const financasData = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      const gastos = financasData.filter(f => f.tipo === 'saida');
      const total  = gastos.reduce((s, f) => s + (f.valor || 0), 0);
      const mapa   = {};
      gastos.forEach(f => {
        const cat = f.categoria || 'outros';
        if (!mapa[cat]) mapa[cat] = { total: 0, count: 0, transacoes: [] };
        mapa[cat].total      += f.valor || 0;
        mapa[cat].count      += 1;
        mapa[cat].transacoes.push(f);
      });
      const arr = Object.entries(mapa)
        .map(([cat, info]) => ({ categoria: cat, ...info, percentual: total > 0 ? (info.total / total) * 100 : 0 }))
        .sort((a, b) => b.total - a.total);
      setDados(arr);
      setTotalGastos(total);
    } catch {
      flash('Erro ao carregar dados financeiros.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarCategorias(); }, []);

  useEffect(() => {
    if (categorias.length > 0) carregarGastos();
  }, [filtroMes, filtroAno, categorias.length]);
  const handleCriar = async () => {
    setErroForm('');
    if (!novaLabel.trim()) { setErroForm('Nome é obrigatório.'); return; }
    setCriando(true);
    try {
      await categoriasAPI.create({ label: novaLabel.trim(), icon: novaIcon, cor: novaCor });
      flash(`Categoria "${novaLabel}" criada!`);
      setNovaLabel(''); setNovaIcon('🏷️'); setNovaCor('#00f3ff');
      setPainelAberto(false);
      await carregarCategorias();
    } catch (e) {
      setErroForm(e.response?.data?.error || 'Erro ao criar categoria.');
    } finally {
      setCriando(false);
    }
  };

  const handleRemover = async (id, label, padrao) => {
    if (padrao) { flash('Categorias padrão não podem ser removidas.', 'erro'); return; }
    try {
      await categoriasAPI.delete(id);
      flash(`Categoria "${label}" removida.`);
      await carregarCategorias();
    } catch (e) {
      flash(e.response?.data?.error || 'Erro ao remover.', 'erro');
    }
  };

  const topCat = dados[0] || null;

  return (
    <div>
      {/* FEEDBACK */}
      {(sucesso || erro) && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
          padding: '12px 20px', borderRadius: '2px', fontFamily: 'monospace',
          fontSize: '12px', fontWeight: 600,
          background: sucesso ? 'var(--neon-green)' : 'var(--neon-red)',
          color: sucesso ? '#000' : '#fff',
          boxShadow: sucesso ? '0 0 20px rgba(0,255,157,0.5)' : '0 0 20px rgba(255,0,64,0.5)',
        }}>
          {sucesso || erro}
        </div>
      )}

      {/* CABEÇALHO + FILTROS */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--neon-magenta)' }}>◈</span>
            GASTOS POR CATEGORIA
          </h3>
          <button className="btn btn-primary" onClick={() => { setPainelAberto(p => !p); setErroForm(''); }}
            style={{ fontSize: '11px', padding: '8px 18px' }}>
            {painelAberto ? '✕ FECHAR' : '+ NOVA CATEGORIA'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>MÊS</label>
            <select className="form-select" value={filtroMes} onChange={e => setFiltroMes(parseInt(e.target.value))} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {meses.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>ANO</label>
            <select className="form-select" value={filtroAno} onChange={e => setFiltroAno(parseInt(e.target.value))} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>TOTAL GASTOS</div>
            <div style={{ fontSize: '22px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-red)', textShadow: '0 0 16px rgba(255,0,64,0.5)' }}>
              {fmt(totalGastos)}
            </div>
          </div>
        </div>

        {/* PAINEL NOVA CATEGORIA */}
        {painelAberto && (
          <div style={{ marginTop: '20px', padding: '16px', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '2px', background: 'rgba(0,243,255,0.03)' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neon-cyan)', marginBottom: '14px', letterSpacing: '0.1em' }}>
              ◈ CRIAR NOVA CATEGORIA
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '10px' }}>NOME DA CATEGORIA *</label>
              <input className="form-input" type="text" value={novaLabel}
                onChange={e => { setNovaLabel(e.target.value); setErroForm(''); }}
                placeholder="Ex: Pet Shop, Streaming, Assinaturas..."
                style={{ fontFamily: 'monospace' }} maxLength={30} />
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label" style={{ fontSize: '10px' }}>ÍCONE</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {EMOJIS_OPCOES.map(e => (
                    <button key={e} type="button" onClick={() => setNovaIcon(e)} style={{
                      width: '34px', height: '34px', fontSize: '18px',
                      border: novaIcon === e ? '2px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px', cursor: 'pointer',
                      background: novaIcon === e ? 'rgba(0,243,255,0.15)' : 'transparent',
                      boxShadow: novaIcon === e ? '0 0 8px rgba(0,243,255,0.4)' : 'none',
                    }}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label" style={{ fontSize: '10px' }}>COR NEON</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {CORES_OPCOES.map(cor => (
                    <button key={cor} type="button" onClick={() => setNovaCor(cor)} style={{
                      width: '34px', height: '34px', borderRadius: '4px', background: cor, cursor: 'pointer',
                      border: novaCor === cor ? '3px solid #fff' : '2px solid transparent',
                      boxShadow: novaCor === cor ? `0 0 12px ${cor}` : `0 0 6px ${cor}60`,
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '2px', marginBottom: '12px', border: `1px solid ${novaCor}60`, background: `${novaCor}12` }}>
              <span style={{ fontSize: '18px' }}>{novaIcon}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: novaCor, fontWeight: 600, letterSpacing: '0.08em' }}>
                {novaLabel.toUpperCase() || 'PRÉVIA DA CATEGORIA'}
              </span>
            </div>

            {erroForm && (
              <div style={{ color: 'var(--neon-red)', fontFamily: 'monospace', fontSize: '11px', marginBottom: '10px' }}>⚠ {erroForm}</div>
            )}

            <button className="btn btn-primary" onClick={handleCriar}
              disabled={criando || !novaLabel.trim()} style={{ width: '100%', fontSize: '11px' }}>
              {criando ? '⏳ CRIANDO...' : '◈ CRIAR CATEGORIA'}
            </button>
          </div>
        )}
      </div>

      {/* LISTA DE TODAS AS CATEGORIAS */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
          TODAS AS CATEGORIAS
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            [{categorias.length} CADASTRADAS]
          </span>
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categorias.map(cat => (
            <div key={cat.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '2px',
              border: `1px solid ${cat.cor}50`, background: `${cat.cor}0f`,
            }}>
              <span style={{ fontSize: '16px' }}>{cat.icon}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: cat.cor, letterSpacing: '0.05em' }}>
                {cat.label.toUpperCase()}
              </span>
              {cat.padrao ? (
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>PADRÃO</span>
              ) : (
                <button onClick={() => handleRemover(cat.id, cat.label, cat.padrao)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-red)', fontSize: '12px', padding: '0 2px', lineHeight: 1 }}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', animation: 'spin 2s linear infinite' }}>◈</div>
          <p style={{ color: 'var(--neon-cyan)', fontFamily: 'monospace', fontSize: '12px', marginTop: '16px' }}>ANALISANDO DADOS FINANCEIROS...</p>
        </div>
      )}

      {/* VAZIO */}
      {!loading && dados.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed rgba(0,243,255,0.2)' }}>
          <div style={{ fontSize: '40px', opacity: 0.3, marginBottom: '12px' }}>📊</div>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
            [ NENHUM GASTO REGISTRADO EM {meses[filtroMes - 1]} {filtroAno} ]
          </p>
        </div>
      )}

      {/* DESTAQUE MAIOR GASTO */}
      {!loading && topCat && (() => {
        const cfg = configDe(topCat.categoria);
        return (
          <div className="card" style={{ marginBottom: '20px', borderLeft: `4px solid ${cfg.color}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: cfg.color, opacity: 0.7 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '40px' }}>{cfg.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '4px' }}>◉ MAIOR CATEGORIA DE GASTO</div>
                <div style={{ fontSize: '18px', fontFamily: 'Orbitron', fontWeight: 700, color: cfg.color, textShadow: `0 0 20px ${cfg.color}80` }}>{cfg.label}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontFamily: 'Orbitron', fontWeight: 700, color: cfg.color, textShadow: `0 0 20px ${cfg.color}80` }}>{fmt(topCat.total)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {topCat.percentual.toFixed(1)}% dos gastos · {topCat.count} transação(ões)
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CARDS RANKEADOS */}
      {!loading && dados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dados.map((item, idx) => {
            const cfg = configDe(item.categoria);
            return (
              <div key={item.categoria} className="card" style={{ marginBottom: 0, borderLeft: `4px solid ${cfg.color}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: cfg.color, opacity: 0.4 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '18px', color: idx === 0 ? cfg.color : 'var(--text-muted)', minWidth: '28px', textAlign: 'center' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span style={{ fontSize: '22px' }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', color: cfg.color }}>{cfg.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.count} transação(ões)</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700, color: cfg.color }}>{fmt(item.total)}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.percentual.toFixed(1)}% DOS GASTOS</div>
                  </div>
                </div>

                {/* Barra neon */}
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.percentual}%`, background: cfg.color, boxShadow: `0 0 8px ${cfg.color}80`, borderRadius: '2px', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: '#fff', opacity: 0.5, filter: 'blur(2px)' }} />
                  </div>
                </div>

                {/* Transações expansíveis */}
                {item.transacoes.length > 0 && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '0.1em', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
                      <span style={{ color: cfg.color }}>▸</span> VER TRANSAÇÕES ({item.transacoes.length})
                    </summary>
                    <div style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: `2px solid ${cfg.color}40`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.transacoes.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)', padding: '2px 0' }}>
                          <span>► {t.descricao}</span>
                          <span style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{t.data ? t.data.split('-').reverse().join('/') : '—'}</span>
                            <span style={{ color: cfg.color, fontWeight: 600 }}>{fmt(t.valor)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* GRÁFICO HORIZONTAL */}
{!loading && dados.length > 0 && (
  <div className="card" style={{ marginTop: '24px' }}>
    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
      DISTRIBUIÇÃO VISUAL
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {dados.map(item => {
        const cfg = configDe(item.categoria);
        const pct = item.percentual;
        const dentroDaBarra = pct >= 12;
        return (
          <div key={item.categoria} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Label esquerda */}
            <div style={{ width: '110px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)', textAlign: 'right', letterSpacing: '0.05em', flexShrink: 0 }}>
              {cfg.icon} {cfg.label}
            </div>

            {/* Barra — position relative, overflow visible */}
            <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', position: 'relative', overflow: 'visible' }}>

              {/* Preenchimento */}
              <div style={{
                height: '100%',
                width: `${pct}%`,
                minWidth: pct > 0 ? '3px' : '0',
                background: cfg.color,
                boxShadow: `0 0 10px ${cfg.color}60`,
                borderRadius: '2px',
              }} />

              {/* % sempre absoluto, centralizado verticalmente */}
              <span style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                // Dentro da barra: alinha à direita do preenchimento
                // Fora da barra: logo após o fim da barra
                left: dentroDaBarra ? `calc(${pct}% - 28px)` : `calc(${pct}% + 5px)`,
                fontSize: '9px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: dentroDaBarra ? '#000' : cfg.color,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                {pct.toFixed(0)}%
              </span>
            </div>

            {/* Valor direita */}
            <div style={{ width: '90px', fontSize: '11px', fontFamily: 'monospace', color: cfg.color, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>
              {fmt(item.total)}
            </div>

          </div>
        );
      })}
    </div>
  </div>
)}
    </div>
  );
};

export default CategoriaGastos;