import React, { useState, useEffect } from 'react';
import { normalizarData } from '../utils/data';

const Calendario = ({ tarefas, estudos, treinos, financas: financasProp }) => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [financas, setFinancas] = useState([]);

  const meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  // Carregar finanças quando o mês mudar ou via prop
  useEffect(() => {
    if (financasProp) {
      setFinancas(financasProp);
      return;
    }
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();
    fetch(`http://localhost:3001/api/financas?mes=${mes}&ano=${ano}`)
      .then(r => r.json())
      .then(data => setFinancas(Array.isArray(data) ? data : []))
      .catch(() => setFinancas([]));
  }, [dataAtual, financasProp]);

  const mudarMes = (direcao) => {
    const novaData = new Date(dataAtual);
    novaData.setMonth(novaData.getMonth() + direcao);
    setDataAtual(novaData);
    setDiaSelecionado(null);
  };

  const gerarDias = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const ultimoDia = new Date(ano, mes + 1, 0);
    const totalDias = ultimoDia.getDate();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const dias = [];

    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anoAnterior = mes === 0 ? ano - 1 : ano;
    const ultimoDiaAnterior = new Date(anoAnterior, mesAnterior + 1, 0);
    const diasAnterior = ultimoDiaAnterior.getDate();

    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      dias.push({ dia: diasAnterior - i, mes: mesAnterior, ano: anoAnterior, anterior: true });
    }
    for (let i = 1; i <= totalDias; i++) {
      dias.push({ dia: i, mes, ano, anterior: false });
    }

    const proximoMes = (mes + 1) % 12;
    const proximoAno = mes === 11 ? ano + 1 : ano;
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({ dia: i, mes: proximoMes, ano: proximoAno, anterior: true });
    }
    return dias;
  };

  const tarefasDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (tarefas || []).filter(item => item?.data && normalizarData(item.data) === dataFormatada);
  };

  const estudosDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (estudos || []).filter(item => {
      if (!item?.data) return false;
      return normalizarData(new Date(item.data)) === dataFormatada;
    });
  };

  const treinosDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (treinos || []).filter(item => item?.data && normalizarData(item.data) === dataFormatada);
  };

  const financasDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (financas || []).filter(item => {
      if (!item?.data) return false;
      return normalizarData(item.data) === dataFormatada;
    });
  };

  const obterItensDoDia = (date) => {
    const itens = [];
    itens.push(...tarefasDoDia(date).map(t => ({ ...t, tipo: 'tarefa' })));
    itens.push(...estudosDoDia(date).map(e => ({ ...e, tipo: 'estudo' })));
    itens.push(...treinosDoDia(date).map(t => ({ ...t, tipo: 'treino' })));
    itens.push(...financasDoDia(date).map(f => ({ ...f, tipo: 'financa' })));
    return itens.sort((a, b) => {
      const ordem = { tarefa: 0, estudo: 1, treino: 2, financa: 3 };
      return (ordem[a.tipo] ?? 9) - (ordem[b.tipo] ?? 9);
    });
  };

  const obterCorTipo = (tipo) => {
    switch (tipo) {
      case 'tarefa':  return '#00f3ff';
      case 'estudo':  return '#ffaa00';
      case 'treino':  return '#00ff88';
      case 'financa': return '#ff4466';
      default:        return '#888';
    }
  };

  const obterNomeTipo = (tipo) => {
    switch (tipo) {
      case 'tarefa':  return 'TAREFAS';
      case 'estudo':  return 'ESTUDOS';
      case 'treino':  return 'TREINOS';
      case 'financa': return 'FINANÇAS';
      default:        return tipo.toUpperCase();
    }
  };

  const obterIconeTipo = (tipo) => {
    switch (tipo) {
      case 'tarefa':  return '📋';
      case 'estudo':  return '📚';
      case 'treino':  return '🏋️';
      case 'financa': return '💸';
      default:        return '📦';
    }
  };

  const renderizarBolinhas = (date) => {
    const itens = obterItensDoDia(date);
    const tipos = [...new Set(itens.map(i => i.tipo))];
    return (
      <div style={{ display: 'flex', gap: '2px', marginTop: '4px', justifyContent: 'center' }}>
        {tipos.map(tipo => (
          <div
            key={tipo}
            style={{
              width: '4px', height: '4px', borderRadius: '50%',
              backgroundColor: obterCorTipo(tipo),
            }}
          />
        ))}
      </div>
    );
  };

  // Saldo financeiro do dia para mostrar no calendário
  const saldoDoDia = (date) => {
    const fins = financasDoDia(date);
    if (!fins.length) return null;
    const entradas = fins.filter(f => f.tipo === 'entrada').reduce((s, f) => s + (f.valor || 0), 0);
    const saidas   = fins.filter(f => f.tipo === 'saida').reduce((s, f) => s + (f.valor || 0), 0);
    return { entradas, saidas, saldo: entradas - saidas, total: fins.length };
  };

  const dias = gerarDias();
  const hoje = new Date();

  const ehHoje = (dia) =>
    dia.getDate() === hoje.getDate() &&
    dia.getMonth() === hoje.getMonth() &&
    dia.getFullYear() === hoje.getFullYear();

  const fecharDetalhes = () => setDiaSelecionado(null);

  const formatarMoeda = (v) =>
    (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
        MÓDULO TEMPORAL // {meses[dataAtual.getMonth()]}/{dataAtual.getFullYear()}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => mudarMes(-1)} style={{ fontSize: '10px', minWidth: '32px' }}>◀</button>
          <button className="btn btn-secondary" onClick={() => mudarMes(1)}  style={{ fontSize: '10px', minWidth: '32px' }}>▶</button>
        </div>
      </h3>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { tipo: 'tarefa',  label: 'Tarefas'  },
          { tipo: 'estudo',  label: 'Estudos'  },
          { tipo: 'treino',  label: 'Treinos'  },
          { tipo: 'financa', label: 'Finanças' },
        ].map(({ tipo, label }) => (
          <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: obterCorTipo(tipo) }} />
            {label}
          </div>
        ))}
      </div>

      {/* Cabeçalho dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
        {diasSemana.map((dia, index) => (
          <div key={index} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>
            {dia}
          </div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {dias.map((d, index) => {
          const data = new Date(d.ano, d.mes, d.dia);
          const itens = obterItensDoDia(data);
          const ehHojeDia = ehHoje(data);
          const temItens = itens.length > 0;
          const opacidade = d.anterior ? 0.2 : 1;
          const saldo = saldoDoDia(data);
          const temFinanca = (saldo?.total || 0) > 0;

          return (
            <div
              key={index}
              onClick={() => setDiaSelecionado(data)}
              style={{
                padding: '6px 4px',
                border: temItens
                  ? `1px solid ${temFinanca ? 'rgba(255,68,102,0.6)' : 'var(--neon-magenta)'}`
                  : ehHojeDia
                  ? '1px solid var(--neon-cyan)'
                  : `1px solid rgba(0, 243, 255, ${0.2 * opacidade})`,
                boxShadow: temFinanca
                  ? '0 0 8px rgba(255, 68, 102, 0.15)'
                  : temItens
                  ? '0 0 10px rgba(255, 0, 255, 0.2)'
                  : ehHojeDia
                  ? '0 0 8px rgba(0, 243, 255, 0.15)'
                  : 'none',
                background: temFinanca
                  ? 'rgba(255, 68, 102, 0.04)'
                  : temItens
                  ? 'rgba(255, 0, 255, 0.03)'
                  : ehHojeDia
                  ? 'rgba(0, 243, 255, 0.03)'
                  : 'transparent',
                minHeight: '70px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: 'var(--text-muted)',
                cursor: temItens || ehHojeDia ? 'pointer' : 'default',
                opacity: opacidade,
                transition: 'all 0.2s ease',
                position: 'relative',
                borderRadius: '2px',
              }}
              onMouseEnter={(e) => {
                if (temItens || ehHojeDia) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.zIndex = '10';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '1';
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontWeight: 'bold', marginBottom: '2px', display: 'block', fontSize: '11px',
                  color: temItens || ehHojeDia ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {d.dia}
                </span>
                {renderizarBolinhas(data)}
                {/* Mini saldo do dia */}
                {saldo && !d.anterior && (
                  <div style={{
                    fontSize: '8px', marginTop: '3px', lineHeight: 1.2,
                    color: saldo.saldo >= 0 ? '#00ff88' : '#ff4466',
                    fontFamily: 'monospace',
                  }}>
                    {saldo.saldo >= 0 ? '+' : ''}{(saldo.saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', 'R$')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de detalhes do dia selecionado */}
      {diaSelecionado && (
        <div style={{
          marginTop: '20px', padding: '16px',
          background: 'rgba(0, 243, 255, 0.03)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '4px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 243, 255, 0.1)' }}>
            <h4 style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-primary)' }}>
              {diaSelecionado.getDate().toString().padStart(2,'0')}/{(diaSelecionado.getMonth() + 1).toString().padStart(2,'0')}/{diaSelecionado.getFullYear()}
            </h4>
            <button onClick={fecharDetalhes} style={{ background: 'transparent', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)', padding: '4px 12px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '2px' }}>
              FECHAR
            </button>
          </div>

          {/* Resumo financeiro do dia */}
          {(() => {
            const fins = financasDoDia(diaSelecionado);
            if (!fins.length) return null;
            const entradas = fins.filter(f => f.tipo === 'entrada').reduce((s, f) => s + (f.valor || 0), 0);
            const saidas   = fins.filter(f => f.tipo === 'saida').reduce((s, f) => s + (f.valor || 0), 0);
            return (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {entradas > 0 && (
                  <div style={{ padding: '6px 12px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '2px', fontSize: '10px', fontFamily: 'monospace' }}>
                    <span style={{ color: 'var(--text-muted)' }}>ENTRADAS </span>
                    <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{formatarMoeda(entradas)}</span>
                  </div>
                )}
                {saidas > 0 && (
                  <div style={{ padding: '6px 12px', background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.3)', borderRadius: '2px', fontSize: '10px', fontFamily: 'monospace' }}>
                    <span style={{ color: 'var(--text-muted)' }}>SAÍDAS </span>
                    <span style={{ color: '#ff4466', fontWeight: 'bold' }}>{formatarMoeda(saidas)}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Lista por tipo */}
          {['tarefa', 'estudo', 'treino', 'financa'].map((tipo) => {
            const itens = obterItensDoDia(diaSelecionado).filter(i => i.tipo === tipo);
            if (!itens.length) return null;
            const corTipo = obterCorTipo(tipo);

            return (
              <div key={tipo} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '11px', fontFamily: 'monospace', color: corTipo, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {obterIconeTipo(tipo)} {obterNomeTipo(tipo)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {itens.map((item) => (
                    <div key={item.id || Math.random()} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderLeft: `3px solid ${corTipo}`, fontFamily: 'monospace', fontSize: '10px' }}>
                      {tipo === 'financa' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '11px' }}>{item.descricao}</span>
                            {item.categoria && (
                              <span style={{ marginLeft: '8px', fontSize: '9px', opacity: 0.6, textTransform: 'uppercase' }}>[{item.categoria}]</span>
                            )}
                            {item.assinatura && (
                              <span style={{ marginLeft: '6px', fontSize: '9px', color: '#ffaa00' }}>🔄 ASSINATURA</span>
                            )}
                            {item.parcelas && (
                              <span style={{ marginLeft: '6px', fontSize: '9px', color: '#a78bfa' }}>📦 {item.parcelaAtual || 1}/{item.parcelas}x</span>
                            )}
                          </div>
                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: item.tipo === 'entrada' ? '#00ff88' : '#ff4466' }}>
                            {item.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(item.valor)}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px' }}>
                              {item.titulo || (item.assunto ? `📝 ${item.assunto}` : 'Item sem título')}
                            </span>
                          </div>
                          {item?.duracao && (
                            <div style={{ marginTop: '4px', display: 'flex', gap: '12px', fontSize: '9px', opacity: '0.7' }}>
                              <span>⏱️ {item.duracao}min</span>
                              {item.prioridade && <span>📊 Prioridade: {item.prioridade}</span>}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {obterItensDoDia(diaSelecionado).length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', opacity: '0.6' }}>
              Sem itens para este dia
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendario;