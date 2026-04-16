import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AguaTracker = () => {
  const [registro, setRegistro] = useState({ data: '', total: 0, registros: [], meta: 2000 });
  const [primeiraVez, setPrimeiraVez] = useState(false);
  const [metaInicial, setMetaInicial] = useState('2000');
  const [loading, setLoading] = useState(true);
  const [animando, setAnimando] = useState(false);
  const [metaInput, setMetaInput] = useState('');
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const porcentagem = Math.min((registro.total / registro.meta) * 100, 100);

  const carregarAgua = async () => {
    try {
      const res = await fetch(`${API_URL}/agua`);
      const data = await res.json();
      setRegistro(data);
      setMetaInput(data.meta);
      if (data.total === 0 && data.registros.length === 0 && !localStorage.getItem('agua_meta_configurada')) {
        setPrimeiraVez(true);
      }
    } catch (e) {
      console.error('Erro ao carregar água:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgua();
  }, []);

  const confirmarMetaInicial = async () => {
    const nova = parseInt(metaInicial);
    if (!nova || nova < 100) return;
    await fetch(`${API_URL}/agua`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meta: nova })
    });
    localStorage.setItem('agua_meta_configurada', 'true');
    setPrimeiraVez(false);
    carregarAgua();
  };

  const adicionar = async (quantidade) => {
    setAnimando(true);
    try {
      const res = await fetch(`${API_URL}/agua`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade })
      });
      const data = await res.json();
      setRegistro(data);
      mostrarMensagem(`+${quantidade}ml REGISTRADO`);
    } catch (e) {
      mostrarMensagem('ERRO AO REGISTRAR');
    }
    setTimeout(() => setAnimando(false), 600);
  };

  const desfazer = async () => {
    try {
      const res = await fetch(`${API_URL}/agua/ultimo`, { method: 'DELETE' });
      const data = await res.json();
      setRegistro(data);
      mostrarMensagem('ÚLTIMO REGISTRO REMOVIDO');
    } catch (e) {
      mostrarMensagem('ERRO AO REMOVER');
    }
  };

  const salvarMeta = async () => {
    const nova = parseInt(metaInput);
    if (!nova || nova < 100) return;
    try {
      const res = await fetch(`${API_URL}/agua`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: nova })
      });
      const data = await res.json();
      setRegistro(data);
      setEditandoMeta(false);
      mostrarMensagem(`META ATUALIZADA: ${nova}ml`);
    } catch (e) {
      mostrarMensagem('ERRO AO SALVAR META');
    }
  };

  const mostrarMensagem = (msg) => {
    setMensagem(msg);
    setTimeout(() => setMensagem(''), 2500);
  };

  const getCorNivel = () => {
    if (porcentagem >= 100) return 'var(--neon-green)';
    if (porcentagem >= 60) return 'var(--neon-cyan)';
    if (porcentagem >= 30) return 'var(--neon-amber)';
    return 'var(--neon-red)';
  };

  const getStatus = () => {
    if (porcentagem >= 100) return '◉ META ATINGIDA';
    if (porcentagem >= 60) return '◉ BOM PROGRESSO';
    if (porcentagem >= 30) return '◉ HIDRATAÇÃO BAIXA';
    return '◉ CRÍTICO';
  };

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '24px', animation: 'spin 2s linear infinite', color: 'var(--neon-cyan)' }}>◈</div>
    </div>
  );

  if (primeiraVez) return (
    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💧</div>
      <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '8px', letterSpacing: '0.2em' }}>CONFIGURAR HIDRATAÇÃO</h3>
      <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        ► DEFINA SUA META DIÁRIA DE ÁGUA
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[1500, 2000, 2500, 3000].map(v => (
          <button key={v} className={`btn ${metaInicial == v ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetaInicial(v.toString())}
            style={{ fontSize: '11px', fontFamily: 'monospace' }}>
            {v}ml
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
        <input type="number" className="form-input" value={metaInicial}
          onChange={e => setMetaInicial(e.target.value)}
          placeholder="Ou digite um valor..."
          style={{ fontFamily: 'monospace', fontSize: '12px', maxWidth: '200px', textAlign: 'center' }}
        />
        <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', alignSelf: 'center' }}>ml</span>
      </div>
      <button className="btn btn-primary" onClick={confirmarMetaInicial} style={{ fontSize: '12px', padding: '12px 32px' }}>
        ◈ CONFIRMAR META
      </button>
    </div>
  );

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
        HIDRATAÇÃO DIÁRIA
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {new Date().toLocaleDateString('pt-BR')}
        </span>
      </h3>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="120" height="180" viewBox="0 0 120 180" style={{ filter: `drop-shadow(0 0 12px ${getCorNivel()})` }}>
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getCorNivel()} stopOpacity="0.9" />
                <stop offset="100%" stopColor={getCorNivel()} stopOpacity="0.4" />
              </linearGradient>
              <clipPath id="reservatorio">
                <path d="M20,20 L100,20 L110,40 L110,160 L10,160 L10,40 Z" />
              </clipPath>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <rect x="45" y="5" width="30" height="18" rx="4" fill="rgba(0,243,255,0.2)" stroke={getCorNivel()} strokeWidth="1.5" />
            <rect x="52" y="2" width="16" height="8" rx="3" fill="rgba(0,0,0,0.8)" stroke={getCorNivel()} strokeWidth="1" />

            <path d="M20,20 L100,20 L110,40 L110,160 L10,160 L10,40 Z"
              fill="rgba(0,10,20,0.8)" stroke={getCorNivel()} strokeWidth="2" />

            <g clipPath="url(#reservatorio)">
              <rect x="0" y={160 - (140 * porcentagem / 100)} width="120" height={140 * porcentagem / 100}
                fill="url(#waterGrad)" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              {porcentagem > 0 && porcentagem < 100 && (
                <rect x="0" y={160 - (140 * porcentagem / 100) - 3} width="120" height="6"
                  fill={getCorNivel()} opacity="0.6" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              )}
              <rect x="15" y={160 - (140 * porcentagem / 100) + 5}
                width="8" height={Math.max(0, (140 * porcentagem / 100) - 10)}
                fill="white" opacity="0.15" rx="4" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </g>

            {[25, 50, 75].map(nivel => (
              <g key={nivel}>
                <line x1="10" y1={160 - (140 * nivel / 100)} x2="25" y2={160 - (140 * nivel / 100)} stroke={getCorNivel()} strokeWidth="1" opacity="0.5" />
                <line x1="95" y1={160 - (140 * nivel / 100)} x2="110" y2={160 - (140 * nivel / 100)} stroke={getCorNivel()} strokeWidth="1" opacity="0.5" />
                <text x="28" y={160 - (140 * nivel / 100) + 4} fontSize="7" fill={getCorNivel()} opacity="0.5" fontFamily="monospace">{nivel}%</text>
              </g>
            ))}

            <line x1="10" y1="40" x2="10" y2="55" stroke={getCorNivel()} strokeWidth="3" />
            <line x1="110" y1="40" x2="110" y2="55" stroke={getCorNivel()} strokeWidth="3" />
            <line x1="10" y1="145" x2="10" y2="160" stroke={getCorNivel()} strokeWidth="3" />
            <line x1="110" y1="145" x2="110" y2="160" stroke={getCorNivel()} strokeWidth="3" />

            <text x="60" y="95" textAnchor="middle" fontSize="22" fontFamily="monospace" fontWeight="bold"
              fill={porcentagem > 50 ? 'rgba(0,0,0,0.8)' : getCorNivel()} filter="url(#glow)"
              style={{ transition: 'all 0.8s ease' }}>
              {Math.round(porcentagem)}%
            </text>
          </svg>

          {animando && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: getCorNivel(), fontSize: '24px', fontFamily: 'monospace', fontWeight: 700, animation: 'fadeIn 0.3s ease', pointerEvents: 'none', textShadow: `0 0 20px ${getCorNivel()}` }}>+</div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '36px', fontFamily: 'monospace', fontWeight: 700, color: getCorNivel(), textShadow: `0 0 20px ${getCorNivel()}`, lineHeight: 1 }}>
              {registro.total}<span style={{ fontSize: '14px', marginLeft: '4px', color: 'var(--text-muted)' }}>ml</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '4px' }}>META: {registro.meta}ml</div>
            <div style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, color: getCorNivel(), marginTop: '4px', letterSpacing: '0.1em' }}>{getStatus()}</div>
          </div>

          <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '16px', border: `1px solid ${getCorNivel()}30`, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${porcentagem}%`, background: `linear-gradient(90deg, ${getCorNivel()}80, ${getCorNivel()})`, borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${getCorNivel()}` }} />
          </div>

          {porcentagem < 100 && (
            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '16px' }}>
              ► FALTAM {registro.meta - registro.total}ml PARA A META
            </div>
          )}

          {registro.registros.length > 0 && (
            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '16px' }}>
              ÚLTIMO: {registro.registros[registro.registros.length - 1].quantidade}ml às {registro.registros[registro.registros.length - 1].hora}
            </div>
          )}

          {editandoMeta ? (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="number" className="form-input" value={metaInput}
                onChange={e => setMetaInput(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '11px', flex: 1 }} placeholder="Meta em ml" />
              <button className="btn btn-primary" onClick={salvarMeta} style={{ fontSize: '10px', padding: '6px 12px' }}>OK</button>
              <button className="btn btn-secondary" onClick={() => setEditandoMeta(false)} style={{ fontSize: '10px', padding: '6px 12px' }}>✕</button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setEditandoMeta(true)} style={{ fontSize: '10px', padding: '6px 12px', marginBottom: '8px' }}>
              ⚙ EDITAR META
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {[
          { ml: 200, label: '200ml', icon: '▪' },
          { ml: 500, label: '500ml', icon: '▪▪' },
          { ml: 1000, label: '1L', icon: '▪▪▪' },
          { ml: 2000, label: '2L', icon: '▪▪▪▪' },
        ].map(({ ml, label, icon }) => (
          <button key={ml} className="btn btn-secondary" onClick={() => adicionar(ml)}
            style={{ fontSize: '11px', fontFamily: 'monospace', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', transition: 'all 0.2s ease' }}>
            <span style={{ fontSize: '8px', letterSpacing: '2px', color: 'var(--neon-cyan)' }}>{icon}</span>
            <span>+{label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={desfazer} disabled={registro.registros.length === 0}
          style={{ fontSize: '10px', padding: '6px 12px', color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}>
          ↩ DESFAZER ÚLTIMO
        </button>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {registro.registros.length} REGISTRO(S) HOJE
        </span>
      </div>

      {mensagem && (
        <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: 'rgba(0, 243, 255, 0.05)', border: '1px solid var(--neon-cyan)', borderRadius: '2px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--neon-cyan)', letterSpacing: '0.1em', textAlign: 'center' }}>
          ◈ {mensagem}
        </div>
      )}
    </div>
  );
};

export default AguaTracker;