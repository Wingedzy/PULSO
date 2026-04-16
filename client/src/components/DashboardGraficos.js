import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── Utilitário de data sem bug de timezone ───────────────────────────────────
const normData = (d) => d ? String(d).slice(0, 10) : null;
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Tooltip customizado ──────────────────────────────────────────────────────
const Tip = ({ active, payload, label, tipo }) => {
  if (!active || !payload?.length) return null;
  const cor = payload[0]?.fill || 'var(--neon-cyan)';
  return (
    <div style={{
      background: '#080c10',
      border: `1px solid ${cor}`,
      borderRadius: '4px',
      padding: '10px 14px',
      fontFamily: 'monospace',
      fontSize: '11px',
      minWidth: '160px',
      boxShadow: `0 0 12px ${cor}30`,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '1px' }}>
        {label}
      </div>
      {tipo === 'estudo' && (() => {
        const itens = payload[0]?.payload?.itens || [];
        if (!itens.length) return <div style={{ color: 'rgba(255,255,255,0.3)' }}>Sem estudos</div>;
        return itens.map((e, i) => (
          <div key={i} style={{ color: 'var(--neon-amber)', marginBottom: '2px' }}>
            📚 {e.assunto}
            {(e.duracao_real || e.duracao_planejada) && (
              <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>
                {e.duracao_real || e.duracao_planejada}min
              </span>
            )}
          </div>
        ));
      })()}
      {tipo === 'treino' && (() => {
        const itens = payload[0]?.payload?.itens || [];
        if (!itens.length) return <div style={{ color: 'rgba(255,255,255,0.3)' }}>Sem treinos</div>;
        return itens.map((t, i) => (
          <div key={i} style={{ color: 'var(--neon-green)', marginBottom: '2px' }}>
            🏋️ {t.tipo?.toUpperCase()}
            {t.duracao && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>{t.duracao}min</span>}
            {t.intensidade && (
              <span style={{
                marginLeft: '6px', fontSize: '9px', padding: '1px 5px', borderRadius: '2px',
                background: t.intensidade === 'alta' ? 'rgba(255,0,64,0.2)' : t.intensidade === 'media' ? 'rgba(255,170,0,0.2)' : 'rgba(0,243,255,0.2)',
                color: t.intensidade === 'alta' ? 'var(--neon-red)' : t.intensidade === 'media' ? 'var(--neon-amber)' : 'var(--neon-cyan)',
              }}>{t.intensidade.toUpperCase()}</span>
            )}
          </div>
        ));
      })()}
      {tipo === 'agua' && (
        <>
          <div style={{ color: cor, fontSize: '14px', fontWeight: 700 }}>
            {payload[0]?.payload?.totalMl ?? 0}ml
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
            Meta: {payload[0]?.payload?.meta ?? 2000}ml · {payload[0]?.value}%
          </div>
        </>
      )}
      {tipo === 'financas' && (
        <>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.dataKey === 'entradas' ? 'var(--neon-green)' : 'var(--neon-red)', marginBottom: '2px' }}>
              {p.dataKey === 'entradas' ? '↑' : '↓'} {p.name}: {fmt(p.value)}
            </div>
          ))}
          {payload.length === 2 && (
            <div style={{
              marginTop: '6px', paddingTop: '6px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: payload[0].payload.entradas - payload[0].payload.gastos >= 0 ? 'var(--neon-green)' : 'var(--neon-red)',
            }}>
              Saldo: {fmt(payload[0].payload.entradas - payload[0].payload.gastos)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Mini stat pill ───────────────────────────────────────────────────────────
const Stat = ({ label, valor, cor }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: '2px',
    padding: '8px 12px', borderRadius: '4px',
    background: `${cor}0d`, border: `1px solid ${cor}30`,
  }}>
    <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: '15px', fontFamily: 'Orbitron, monospace', fontWeight: 700, color: cor }}>{valor}</span>
  </div>
);

// ─── Badge de status ──────────────────────────────────────────────────────────
const StatusBadge = ({ label, cor }) => (
  <span style={{
    padding: '5px 14px', borderRadius: '20px',
    backgroundColor: `${cor}25`, border: `2px solid ${cor}`,
    color: cor, fontFamily: 'monospace', fontSize: '11px', letterSpacing: '1px',
    whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

// ─── Eixo Y sem decimais ──────────────────────────────────────────────────────
const tickY = (v) => Number.isInteger(v) ? v : '';

// ─── Componente principal ─────────────────────────────────────────────────────
const DashboardGraficos = ({ tarefas = [], estudos = [], treinos = [], financas = [] }) => {

  // Últimos 7 dias em YYYY-MM-DD local (sem UTC)
  const ultimos7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { data: str, label: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()] };
  }), []);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // ── Estudos ────────────────────────────────────────────────────────────────
  const dadosEstudos = useMemo(() => ultimos7.map(d => {
    // Filtra estudos concluídos — normaliza a data para comparação segura
    const itens = estudos.filter(e => e.concluido && normData(e.data) === d.data);
    const minutos = itens.reduce((s, e) => s + (e.duracao_real || e.duracao_planejada || 0), 0);
    return { dia: d.label, dataCompleta: d.data, valor: itens.length, minutos, itens };
  }), [estudos, ultimos7]);

  const totalEstudosSemana  = dadosEstudos.reduce((s, d) => s + d.valor, 0);
  const totalMinEstudos     = dadosEstudos.reduce((s, d) => s + d.minutos, 0);
  const sequenciaEstudos    = (() => {
    let seq = 0;
    for (let i = dadosEstudos.length - 1; i >= 0; i--) {
      if (dadosEstudos[i].valor > 0) seq++; else break;
    }
    return seq;
  })();
  const maxDiaEstudo = dadosEstudos.reduce((max, d) => d.minutos > max ? d.minutos : max, 0);

  // ── Treinos ────────────────────────────────────────────────────────────────
  const dadosTreinos = useMemo(() => ultimos7.map(d => {
    const itens = treinos.filter(t => t.concluido && normData(t.data) === d.data);
    const minutos = itens.reduce((s, t) => s + (t.duracao || 0), 0);
    return { dia: d.label, dataCompleta: d.data, valor: itens.length, minutos, itens };
  }), [treinos, ultimos7]);

  const totalTreinosSemana = dadosTreinos.reduce((s, d) => s + d.valor, 0);
  const totalMinTreinos    = dadosTreinos.reduce((s, d) => s + d.minutos, 0);
  const sequenciaTreinos   = (() => {
    let seq = 0;
    for (let i = dadosTreinos.length - 1; i >= 0; i--) {
      if (dadosTreinos[i].valor > 0) seq++; else break;
    }
    return seq;
  })();
  const tiposTreino = [...new Set(treinos.filter(t => t.concluido).map(t => t.tipo).filter(Boolean))];

  // ── Hidratação ─────────────────────────────────────────────────────────────
  const [dadosAgua, setDadosAgua] = useState([]);
  useEffect(() => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    Promise.all(
      ultimos7.map(d =>
        fetch(`${API}/agua?data=${d.data}`)
          .then(r => r.json())
          .catch(() => ({ total: 0, meta: 2000 }))
      )
    ).then(results => {
      setDadosAgua(ultimos7.map((d, i) => {
        const total = results[i]?.total || 0;
        const meta  = results[i]?.meta  || 2000;
        return {
          dia: d.label,
          dataCompleta: d.data,
          totalMl: total,
          meta,
          pct: Math.min(Math.round((total / meta) * 100), 100),
        };
      }));
    });
  }, [ultimos7]);

  const mediaAgua   = dadosAgua.length ? dadosAgua.reduce((s, d) => s + d.pct, 0) / dadosAgua.length : 0;
  const hojeAgua    = dadosAgua[dadosAgua.length - 1];
  const diasMetaAgua = dadosAgua.filter(d => d.pct >= 100).length;

  const corAgua = (pct) => {
    if (pct >= 100) return 'var(--neon-green)';
    if (pct >= 70)  return 'var(--neon-cyan)';
    if (pct >= 40)  return 'var(--neon-amber)';
    return 'var(--neon-red)';
  };

  // ── Finanças ───────────────────────────────────────────────────────────────
  // Usa slice(0,7) para filtrar mês/ano — sem new Date() que quebra timezone
  const financasMes = useMemo(() => (financas || []).filter(f => {
    const d = normData(f.data);
    if (!d) return false;
    const [a, m] = d.split('-').map(Number);
    return m === mesAtual && a === anoAtual;
  }), [financas, mesAtual, anoAtual]);

  const semanas = [
    { label: 'S1', dias: [1,2,3,4,5,6,7] },
    { label: 'S2', dias: [8,9,10,11,12,13,14] },
    { label: 'S3', dias: [15,16,17,18,19,20,21] },
    { label: 'S4', dias: [22,23,24,25,26,27,28,29,30,31] },
  ];

  const dadosFinancas = useMemo(() => semanas.map(s => {
    const trans = financasMes.filter(f => {
      const dia = parseInt(normData(f.data)?.split('-')[2] || '0');
      return s.dias.includes(dia);
    });
    return {
      semana: s.label,
      entradas: trans.filter(f => f.tipo === 'entrada').reduce((sum, f) => sum + (f.valor || 0), 0),
      gastos:   trans.filter(f => f.tipo === 'saida' || f.tipo === 'saída').reduce((sum, f) => sum + (f.valor || 0), 0),
    };
  }), [financasMes]);

  const totalEntradas = financasMes.filter(f => f.tipo === 'entrada').reduce((s, f) => s + (f.valor || 0), 0);
  const totalGastos   = financasMes.filter(f => f.tipo === 'saida' || f.tipo === 'saída').reduce((s, f) => s + (f.valor || 0), 0);
  const saldo         = totalEntradas - totalGastos;
  const pctGasto      = totalEntradas > 0 ? (totalGastos / totalEntradas) * 100 : 0;
  const txEconomia    = totalEntradas > 0 ? ((saldo / totalEntradas) * 100).toFixed(1) : '—';

  // ── Status helpers ─────────────────────────────────────────────────────────
  const statusConsistencia = (diasAtivos) => {
    if (diasAtivos >= 5) return { label: '◉ ÓTIMO',   cor: 'var(--neon-green)' };
    if (diasAtivos >= 3) return { label: '◉ BOM',     cor: 'var(--neon-cyan)'  };
    if (diasAtivos >= 1) return { label: '◉ REGULAR', cor: 'var(--neon-amber)' };
    return              { label: '◉ CRÍTICO', cor: 'var(--neon-red)'   };
  };

  const msgConsistencia = (diasAtivos, tipo) => {
    if (diasAtivos >= 5) return `Excelente consistência de ${tipo}! Continue assim.`;
    if (diasAtivos >= 3) return `Boa frequência. Tente manter ${tipo} por mais dias.`;
    if (diasAtivos >= 1) return `Poucos dias de ${tipo}. Tente aumentar a frequência.`;
    return `Nenhum ${tipo} esta semana. Que tal começar hoje?`;
  };

  const diasAtivosEstudos = dadosEstudos.filter(d => d.valor > 0).length;
  const diasAtivosTreinos = dadosTreinos.filter(d => d.valor > 0).length;
  const stEstudos = statusConsistencia(diasAtivosEstudos);
  const stTreinos = statusConsistencia(diasAtivosTreinos);
  const stAgua    = (() => {
    if (mediaAgua >= 90) return { label: '◉ ÓTIMO',   cor: 'var(--neon-green)' };
    if (mediaAgua >= 70) return { label: '◉ BOM',     cor: 'var(--neon-cyan)'  };
    if (mediaAgua >= 40) return { label: '◉ REGULAR', cor: 'var(--neon-amber)' };
    return                      { label: '◉ CRÍTICO', cor: 'var(--neon-red)'   };
  })();
  const stFinancas = (() => {
    if (pctGasto > 90) return { label: '◉ CRÍTICO',  cor: 'var(--neon-red)'   };
    if (pctGasto > 70) return { label: '◉ AVISO',    cor: 'var(--neon-amber)' };
    return                    { label: '◉ SAUDÁVEL', cor: 'var(--neon-green)' };
  })();

  // ── Card wrapper ───────────────────────────────────────────────────────────
  const Card = ({ cor, children }) => (
  <div
    className="card"
    style={{
      border: `1px solid ${cor}50`,
      background: `linear-gradient(160deg, ${cor}08 0%, transparent 60%)`,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '520px',
      boxSizing: 'border-box'
    }}
  >
    {children}
  </div>
);

  const CardHeader = ({ icon, title, cor, status }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <h3 style={{ margin: 0, color: cor, fontFamily: 'Orbitron, monospace', fontSize: '13px', letterSpacing: '1px' }}>
        {title}
      </h3>
      <div style={{ marginLeft: 'auto' }}>
        <StatusBadge label={status.label} cor={status.cor} />
      </div>
    </div>
  );

  const Divisor = () => (
    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 -20px' }} />
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

      {/* ══ ESTUDOS ══════════════════════════════════════════════════════════ */}
      <Card cor="var(--neon-amber)">
        <CardHeader icon="📚" title="CONSISTÊNCIA DE ESTUDOS" cor="var(--neon-amber)" status={stEstudos} />

        {/* Stats rápidas */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Stat label="Dias ativos" valor={`${diasAtivosEstudos}/7`}       cor="var(--neon-amber)" />
          <Stat label="Total sessões" valor={totalEstudosSemana}            cor="var(--neon-amber)" />
          <Stat label="Total min."  valor={totalMinEstudos > 0 ? `${totalMinEstudos}min` : '—'} cor="var(--neon-amber)" />
          <Stat label="Sequência"   valor={sequenciaEstudos > 0 ? `${sequenciaEstudos}d 🔥` : '0d'} cor={sequenciaEstudos >= 3 ? 'var(--neon-green)' : 'var(--neon-amber)'} />
          <Stat label="Maior sessão" valor={maxDiaEstudo > 0 ? `${maxDiaEstudo}min` : '—'} cor="var(--neon-amber)" />
        </div>

        <Divisor />

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosEstudos} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
            <XAxis dataKey="dia" tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={tickY} tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} domain={[0, 'dataMax + 1']} allowDecimals={false} />
            {/* cursor={false} elimina o hover de fundo incomodativo */}
            <Tooltip cursor={false} content={(p) => <Tip {...p} tipo="estudo" />} />
            <Bar dataKey="valor" radius={[3,3,0,0]} maxBarSize={32}>
              {dadosEstudos.map((entry, i) => (
                <Cell key={i}
                  fill={entry.valor > 0 ? 'var(--neon-amber)' : 'rgba(255,170,0,0.12)'}
                  stroke={entry.valor > 0 ? 'var(--neon-amber)' : 'rgba(255,170,0,0.25)'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Mensagem de status */}
        <div style={{
          padding: '10px 14px', borderRadius: '4px',
          background: `${stEstudos.cor}0d`, border: `1px solid ${stEstudos.cor}30`,
          fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.6)',
        }}>
          {msgConsistencia(diasAtivosEstudos, 'estudos')}
        </div>
      </Card>

      {/* ══ TREINOS ══════════════════════════════════════════════════════════ */}
      <Card cor="var(--neon-green)">
        <CardHeader icon="🏋️" title="CONSISTÊNCIA DE TREINOS" cor="var(--neon-green)" status={stTreinos} />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Stat label="Dias ativos"   valor={`${diasAtivosTreinos}/7`}    cor="var(--neon-green)" />
          <Stat label="Total treinos" valor={totalTreinosSemana}           cor="var(--neon-green)" />
          <Stat label="Total min."    valor={totalMinTreinos > 0 ? `${totalMinTreinos}min` : '—'} cor="var(--neon-green)" />
          <Stat label="Sequência"     valor={sequenciaTreinos > 0 ? `${sequenciaTreinos}d 🔥` : '0d'} cor={sequenciaTreinos >= 3 ? 'var(--neon-cyan)' : 'var(--neon-green)'} />
        </div>

        {/* Tipos de treino da semana */}
        {tiposTreino.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {tiposTreino.map(t => (
              <span key={t} style={{
                fontSize: '9px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '3px',
                background: 'rgba(0,255,128,0.08)', border: '1px solid rgba(0,255,128,0.25)',
                color: 'var(--neon-green)', letterSpacing: '1px',
              }}>
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        <Divisor />

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosTreinos} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
            <XAxis dataKey="dia" tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={tickY} tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} domain={[0, 'dataMax + 1']} allowDecimals={false} />
            <Tooltip cursor={false} content={(p) => <Tip {...p} tipo="treino" />} />
            <Bar dataKey="valor" radius={[3,3,0,0]} maxBarSize={32}>
              {dadosTreinos.map((entry, i) => (
                <Cell key={i}
                  fill={entry.valor > 0 ? 'var(--neon-green)' : 'rgba(0,255,128,0.08)'}
                  stroke={entry.valor > 0 ? 'var(--neon-green)' : 'rgba(0,255,128,0.2)'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div style={{ padding: '10px 14px', borderRadius: '4px', background: `${stTreinos.cor}0d`, border: `1px solid ${stTreinos.cor}30`, fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
          {msgConsistencia(diasAtivosTreinos, 'treinos')}
        </div>
      </Card>

      {/* ══ HIDRATAÇÃO ═══════════════════════════════════════════════════════ */}
      <Card cor="var(--neon-cyan)">
        <CardHeader icon="💧" title="HIDRATAÇÃO SEMANAL" cor="var(--neon-cyan)" status={stAgua} />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Stat label="Hoje"        valor={hojeAgua ? `${hojeAgua.pct}%` : '—'}    cor={corAgua(hojeAgua?.pct || 0)} />
          <Stat label="Média 7d"    valor={`${Math.round(mediaAgua)}%`}             cor="var(--neon-cyan)" />
          <Stat label="Metas bat."  valor={`${diasMetaAgua}/7`}                     cor={diasMetaAgua >= 5 ? 'var(--neon-green)' : 'var(--neon-amber)'} />
          <Stat label="Hoje ml"     valor={hojeAgua ? `${hojeAgua.totalMl}ml` : '—'} cor="var(--neon-cyan)" />
        </div>

        <Divisor />

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosAgua} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
            <XAxis dataKey="dia" tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip cursor={false} content={(p) => <Tip {...p} tipo="agua" />} />
            {/* Linha de referência 100% */}
            <Bar dataKey="pct" radius={[3,3,0,0]} maxBarSize={32}>
              {dadosAgua.map((entry, i) => (
                <Cell key={i}
                  fill={entry.pct > 0 ? corAgua(entry.pct) : 'rgba(0,243,255,0.08)'}
                  stroke={entry.pct > 0 ? corAgua(entry.pct) : 'rgba(0,243,255,0.2)'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div style={{ padding: '10px 14px', borderRadius: '4px', background: `${stAgua.cor}0d`, border: `1px solid ${stAgua.cor}30`, fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
          {hojeAgua
            ? `Hoje: ${hojeAgua.totalMl}ml de ${hojeAgua.meta}ml (${hojeAgua.pct}%). Média semanal: ${Math.round(mediaAgua)}%.`
            : 'Carregando dados de hidratação...'}
        </div>
      </Card>

      {/* ══ FINANÇAS ═════════════════════════════════════════════════════════ */}
      <Card cor={stFinancas.cor}>
        <CardHeader icon="💰" title="VISÃO FINANCEIRA" cor={stFinancas.cor} status={stFinancas} />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Stat label="Entradas"    valor={fmt(totalEntradas)}  cor="var(--neon-green)" />
          <Stat label="Gastos"      valor={fmt(totalGastos)}    cor="var(--neon-red)"   />
          <Stat label="Saldo"       valor={fmt(saldo)}          cor={saldo >= 0 ? 'var(--neon-green)' : 'var(--neon-red)'} />
          <Stat label="Tx. gasto"   valor={`${pctGasto.toFixed(1)}%`} cor={stFinancas.cor} />
          <Stat label="Tx. economia" valor={`${txEconomia}%`}  cor={saldo >= 0 ? 'var(--neon-green)' : 'var(--neon-red)'} />
        </div>

        {/* Alerta financeiro */}
        {pctGasto > 70 && (
          <div style={{
            padding: '10px 14px', borderRadius: '4px',
            background: `${stFinancas.cor}0d`, border: `1px solid ${stFinancas.cor}40`,
            fontFamily: 'monospace', fontSize: '11px', color: stFinancas.cor,
          }}>
            {pctGasto > 90
              ? `🚨 ATENÇÃO: ${pctGasto.toFixed(1)}% da renda comprometida este mês!`
              : `⚠ Gastos em ${pctGasto.toFixed(1)}% da renda. Atenção ao orçamento.`}
          </div>
        )}

        <Divisor />

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosFinancas} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="25%">
            <XAxis dataKey="semana" tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip cursor={false} content={(p) => <Tip {...p} tipo="financas" />} />
            <Bar dataKey="entradas" name="Entradas" fill="var(--neon-green)" radius={[3,3,0,0]} maxBarSize={20} />
            <Bar dataKey="gastos"   name="Gastos"   fill="var(--neon-red)"   radius={[3,3,0,0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>

        {/* Transações do mês */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>
          <span>{financasMes.length} transações este mês</span>
          <span>·</span>
          <span>{financasMes.filter(f => f.tipo === 'entrada').length} entradas</span>
          <span>·</span>
          <span>{financasMes.filter(f => f.tipo === 'saida' || f.tipo === 'saída').length} saídas</span>
        </div>
      </Card>

    </div>
  );
};

export default DashboardGraficos;