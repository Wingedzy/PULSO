import React, { useState, useEffect } from 'react';
import { normalizarData } from '../utils/data';

const Calendario = ({ tarefas, estudos, treinos }) => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

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

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0=domingo, 1=segunda, etc

    const dias = [];

    // Dias do mês anterior (opacidade 0.2)
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anoAnterior = mes === 0 ? ano - 1 : ano;
    const ultimoDiaAnterior = new Date(anoAnterior, mesAnterior + 1, 0);
    const diasAnterior = ultimoDiaAnterior.getDate();

    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      dias.push({
        dia: diasAnterior - i,
        mes: mesAnterior,
        ano: anoAnterior,
        anterior: true
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= totalDias; i++) {
      dias.push({
        dia: i,
        mes: mes,
        ano: ano,
        anterior: false
      });
    }

    // Dias do próximo mês (opacidade 0.2)
    const proximoMes = (mes + 1) % 12;
    const proximoAno = mes === 11 ? ano + 1 : ano;
    const totalProximo = new Date(proximoAno, proximoMes + 1, 0).getDate();

    const diasRestantes = 42 - dias.length; // Garantir pelo menos 6 semanas
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({
        dia: i,
        mes: proximoMes,
        ano: proximoAno,
        anterior: true
      });
    }

    return dias;
  };

  const tarefasDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (tarefas || []).filter(item => {
      if (!item?.data) return false;
      return normalizarData(item.data) === dataFormatada;
    });
  };

  const estudosDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (estudos || []).filter(item => {
      if (!item?.data) return false;
      // Ajustar data para o fuso horário local
      const dataItem = new Date(item.data);
      const dataFormatadaItem = normalizarData(dataItem);
      return dataFormatadaItem === dataFormatada;
    });
  };

  const treinosDoDia = (date) => {
    const dataFormatada = normalizarData(date);
    return (treinos || []).filter(item => {
      if (!item?.data) return false;
      return normalizarData(item.data) === dataFormatada;
    });
  };

  const obterItensDoDia = (date) => {
    const itens = [];

    const tarefasDia = tarefasDoDia(date);
    const estudosDia = estudosDoDia(date);
    const treinosDia = treinosDoDia(date);

    itens.push(...tarefasDia.map(t => ({ ...t, tipo: 'tarefa' })));
    itens.push(...estudosDia.map(e => ({ ...e, tipo: 'estudo' })));
    itens.push(...treinosDia.map(t => ({ ...t, tipo: 'treino' })));

    return itens.sort((a, b) => {
      if (a.tipo !== b.tipo) {
        const ordem = { 'tarefa': 0, 'estudo': 1, 'treino': 2 };
        return ordem[a.tipo] - ordem[b.tipo];
      }
      return 0;
    });
  };

  const renderizarBolinhas = (date) => {
    const itens = obterItensDoDia(date);
    const tipos = [...new Set(itens.map(i => i.tipo))];

    const cores = {
      'tarefa': '#00f3ff',
      'estudo': '#ffaa00',
      'treino': '#00ff88'
    };

    return (
      <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
        {tipos.map(tipo => (
          <div
            key={tipo}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: cores[tipo] || '#888'
            }}
          />
        ))}
      </div>
    );
  };

  const obterCorTipo = (tipo) => {
    switch(tipo) {
      case 'tarefa': return '#00f3ff';
      case 'estudo': return '#ffaa00';
      case 'treino': return '#00ff88';
      default: return '#888';
    }
  };

  const getTipoItem = (item) => {
    if (item.tipo) return item.tipo;
    if (item.categoria) {
      const cat = item.categoria.toLowerCase();
      if (cat.includes('treino') || cat.includes('exerci')) return 'treino';
      if (cat.includes('estudo') || cat.includes('estud') || cat.includes('livro')) return 'estudo';
      if (cat.includes('tarefa') || cat.includes('tarefas')) return 'tarefa';
    }
    return 'tarefa';
  };

  const obterNomeTipo = (tipo) => {
    switch(tipo) {
      case 'tarefa': return 'TAREFAS';
      case 'estudo': return 'ESTUDOS';
      case 'treino': return 'TREINOS';
      default: return tipo.toUpperCase();
    }
  };

  const obterIconeTipo = (tipo) => {
    switch(tipo) {
      case 'tarefa': return '📋';
      case 'estudo': return '📚';
      case 'treino': return '🏋️';
      default: return '📦';
    }
  };

  const dias = gerarDias();
  const hoje = new Date();

  const ehHoje = (dia) => {
    return dia.getDate() === hoje.getDate() &&
           dia.getMonth() === hoje.getMonth() &&
           dia.getFullYear() === hoje.getFullYear();
  };

  const selecionarDia = (dia) => {
    setDiaSelecionado(dia);
  };

  const fecharDetalhes = () => {
    setDiaSelecionado(null);
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h3
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
        MÓDULO TEMPORAL // {meses[dataAtual.getMonth()]}/{dataAtual.getFullYear()}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => mudarMes(-1)}
            style={{ fontSize: '10px', minWidth: '32px' }}
          >
            ◀
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => mudarMes(1)}
            style={{ fontSize: '10px', minWidth: '32px' }}
          >
            ▶
          </button>
        </div>
      </h3>

      {/* Cabeçalho de dias da semana */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '12px',
          padding: '8px 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {diasSemana.map((dia, index) => (
          <div
            key={index}
            style={{
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '4px 0',
            }}
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px'
        }}
      >
        {dias.map((d, index) => {
          const data = new Date(d.ano, d.mes, d.dia);
          const itens = obterItensDoDia(data);
          const ehHojeDia = ehHoje(data);
          const temItens = itens.length > 0;
          const opacidade = d.anterior ? 0.2 : 1;

          // Coleta tipos únicos para bolinhas
          const tiposUnicos = [...new Set(itens.map(i => i.tipo))];

          return (
            <div
              key={index}
              onClick={() => selecionarDia(data)}
              style={{
                padding: '6px 4px',
                border: temItens
                  ? '1px solid var(--neon-magenta)'
                  : ehHojeDia
                  ? '1px solid var(--neon-cyan)'
                  : `1px solid rgba(0, 243, 255, ${0.2 * opacidade})`,
                boxShadow: temItens
                  ? '0 0 10px rgba(255, 0, 255, 0.2)'
                  : ehHojeDia
                  ? '0 0 8px rgba(0, 243, 255, 0.15)'
                  : 'none',
                background: temItens
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
                <span
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '2px',
                    display: 'block',
                    fontSize: '11px',
                    color: temItens || ehHojeDia ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {d.dia}
                </span>
                {renderizarBolinhas(data)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de detalhes do dia selecionado */}
      {diaSelecionado && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(0, 243, 255, 0.03)',
            border: '1px solid var(--neon-cyan)',
            borderRadius: '4px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(0, 243, 255, 0.1)',
            }}
          >
            <h4
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '14px',
                color: 'var(--text-primary)',
              }}
            >
              {diaSelecionado.getDate()}/{dataAtual.getMonth() + 1}/{diaSelecionado.getFullYear()}
            </h4>
            <button
              onClick={fecharDetalhes}
              style={{
                background: 'transparent',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '4px 12px',
                fontSize: '10px',
                fontFamily: 'monospace',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              FECHAR
            </button>
          </div>

          {/* Lista de itens por tipo */}
          {['tarefa', 'estudo', 'treino'].map((tipo) => {
            const itens = obterItensDoDia(diaSelecionado).filter(i => i.tipo === tipo);

            if (itens.length === 0) return null;

            const nomeTipo = obterNomeTipo(tipo);
            const iconeTipo = obterIconeTipo(tipo);
            const corTipo = obterCorTipo(tipo);

            return (
              <div key={tipo} style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: corTipo,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {iconeTipo} {nomeTipo}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {itens.map((item) => (
                    <div
                      key={item.id || Math.random()}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: `3px solid ${corTipo}`,
                        fontFamily: 'monospace',
                        fontSize: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px' }}>
                          {item.titulo || (item.assunto ? `📝 ${item.assunto}` : 'Item sem título')}
                        </span>
                        {item.data && (
                          <span style={{ opacity: '0.6', fontSize: '9px' }}>
                            📅 {new Date(item.data).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {item?.duracao && (
                        <div style={{ marginTop: '4px', display: 'flex', gap: '12px', fontSize: '9px', opacity: '0.7' }}>
                          <span>⏱️ {item.duracao}min</span>
                          {item.prioridade && (
                            <span>📊 Prioridade: {item.prioridade}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Mensagem caso não haja itens */}
          {(() => {
            const itens = obterItensDoDia(diaSelecionado);
            if (itens.length > 0) return null;

            return (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                  opacity: '0.6',
                }}
              >
                Sem itens para este dia
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Calendario;