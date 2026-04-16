import React, { useState, useEffect } from 'react';
import { tarefasAPI, estudosAPI, treinosAPI, financasAPI } from './services/api';
import TarefaForm from './components/TarefaForm';
import TarefaList from './components/TarefaList';
import EstudoForm from './components/EstudoForm';
import TreinoForm from './components/TreinoForm';
import FinancaForm from './components/FinancaForm';
import FinancaList from './components/FinancaList';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardGraficos from './components/DashboardGraficos';
import CategoriaGastos from './components/CategoriaGastos';
import Calendario from './components/Calendario';
import AguaTracker from './components/AguaTracker';
import InputModal from './components/InputModal';
import ConfirmModal from './components/ConfirmModal';
import './index.css';

// ─── Utilitário de data seguro (sem bug de timezone) ──────────────────────────
// Extrai YYYY-MM-DD de qualquer formato, sem converter para UTC
function normalizarData(data) {
  if (!data) return null;
  return String(data).slice(0, 10);
}

// Formata YYYY-MM-DD para DD/MM/YYYY sem usar new Date() (evita UTC shift)
function formatarData(data) {
  const d = normalizarData(data);
  if (!d) return '—';
  const [ano, mes, dia] = d.split('-');
  return `${dia}/${mes}/${ano}`;
}
// ──────────────────────────────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tarefas,   setTarefas]   = useState([]);
  const [estudos,   setEstudos]   = useState([]);
  const [treinos,   setTreinos]   = useState([]);
  const [financas,  setFinancas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Filtros de finanças
  const [financaFiltroMes,  setFinancaFiltroMes]  = useState(new Date().getMonth() + 1);
  const [financaFiltroAno,  setFinancaFiltroAno]  = useState(new Date().getFullYear());
  const [financaFiltroTipo, setFinancaFiltroTipo] = useState('todos');

  // Modais
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalInputAberto,       setModalInputAberto]       = useState(false);
  const [idModal,                setIdModal]                = useState(null);

  // ── Finanças ──────────────────────────────────────────────────────────────
  const carregarFinancas = async () => {
    try {
      const params = { mes: financaFiltroMes, ano: financaFiltroAno };
      if (financaFiltroTipo !== 'todos') params.tipo = financaFiltroTipo;
      const response = await financasAPI.getAll(params);
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setFinancas(data);
    } catch (err) {
      console.error('Erro ao carregar finanças:', err);
    }
  };

  useEffect(() => { carregarFinancas(); }, [financaFiltroMes, financaFiltroAno, financaFiltroTipo]);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tarefasRes, estudosRes, treinosRes, financasRes] = await Promise.allSettled([
        tarefasAPI.getAll(),
        estudosAPI.getAll(),
        treinosAPI.getAll(),
        financasAPI.getAll({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() }),
      ]);

      const arr = (r) => {
        if (Array.isArray(r?.data)) return r.data;
        if (Array.isArray(r?.data?.data)) return r.data.data;
        return [];
      };
      if (tarefasRes.status  === 'fulfilled') setTarefas(arr(tarefasRes.value));
      if (estudosRes.status  === 'fulfilled') setEstudos(arr(estudosRes.value));
      if (treinosRes.status  === 'fulfilled') setTreinos(arr(treinosRes.value));
      if (financasRes.status === 'fulfilled') setFinancas(arr(financasRes.value));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTarefaCriada   = (nova) => setTarefas(prev => [nova, ...prev]);
  const handleTarefaAtualizada = ()   => carregarDados();
  const handleEstudoCriado   = (novo) => setEstudos(prev => [novo, ...prev]);
  const handleTreinoCriado   = (novo) => setTreinos(prev => [novo, ...prev]);

  const handleFinancaCriada = (nova) => {
    setFinancas(prev => {
      const existe = prev.some(f => f.id === nova.id || f._id === nova._id);
      return existe ? prev : [nova, ...prev];
    });
    carregarFinancas();
  };

  const abrirModalEstudo = (id) => { setIdModal(id); setModalInputAberto(true); };
  const abrirModalTreino = (id) => { setIdModal(id); setModalConfirmacaoAberto(true); };

  const concluirEstudo = async (duracao) => {
    if (!duracao || !idModal) return;
    try {
      await estudosAPI.concluir(idModal, parseInt(duracao));
      carregarDados();
    } catch { alert('Erro ao concluir estudo'); }
    finally { setModalInputAberto(false); setIdModal(null); }
  };

  const concluirTreino = async () => {
    if (!idModal) return;
    try {
      await treinosAPI.concluir(idModal);
      carregarDados();
    } catch { alert('Erro ao concluir treino'); }
    finally { setModalConfirmacaoAberto(false); setIdModal(null); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    tarefasPendentes:  tarefas.filter(t => t.status === 'pendente').length,
    tarefasConcluidas: tarefas.filter(t => t.status === 'concluido').length,
    estudosPendentes:  estudos.filter(e => !e.concluido).length,
    estudosConcluidos: estudos.filter(e => e.concluido).length,
    treinosPendentes:  treinos.filter(t => !t.concluido).length,
    treinosConcluidos: treinos.filter(t => t.concluido).length,
  };

  const tabs = [
    { id: 'dashboard',  label: '📊 DASHBOARD'  },
    { id: 'tarefas',    label: '📋 TAREFAS'    },
    { id: 'estudos',    label: '📚 ESTUDOS'    },
    { id: 'treinos',    label: '🏋️ TREINOS'    },
    { id: 'financas',   label: '💰 FINANÇAS'   },
    { id: 'agua',       label: '💧 HIDRATAÇÃO' },
    { id: 'categorias', label: '📈 CATEGORIAS' },
    { id: 'calendario', label: '📅 CALENDÁRIO' },
  ];

  // ── Helpers de cor ────────────────────────────────────────────────────────
  const corPrioridade = (p) =>
    p === 1 ? 'var(--neon-red)' : p === 2 ? 'var(--neon-amber)' : 'var(--neon-green)';
  const bgPrioridade = (p) =>
    p === 1 ? 'rgba(255,0,64,0.2)' : p === 2 ? 'rgba(255,170,0,0.2)' : 'rgba(0,255,157,0.2)';
  const labelPrioridade = (p) =>
    p === 1 ? 'URG' : p === 2 ? 'IMP' : 'NRM';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div className="container">

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '48px', border: '2px dashed var(--neon-cyan)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>◈</div>
            <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>INICIALIZANDO SISTEMA</h2>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              Conectando ao núcleo neural... Aguarde.
            </p>
            {error && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255,0,64,0.1)', border: '1px solid var(--neon-red)', borderRadius: '2px', color: 'var(--neon-red)', fontFamily: 'monospace', fontSize: '11px' }}>
                ⚠ ERRO: {error}
              </div>
            )}
          </div>
        )}

        {/* ── Header + Nav ──────────────────────────────────────────────── */}
        {!loading && (
          <header style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '32px', margin: 0, letterSpacing: '0.2em' }}>
                  ◈ MENTRIX ◈
                </h1>
                <p style={{ marginTop: '8px', fontSize: '12px', letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>
                  ▸ SISTEMA DE ORGANIZAÇÃO INTELIGENTE ◉ V 2.0.77
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                <div>{new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                <div style={{ color: 'var(--neon-cyan)' }}>● ONLINE</div>
              </div>
            </div>
            <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 24px', position: 'relative' }}
                >
                  {activeTab === tab.id && (
                    <span style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', background: 'var(--gradient-cyan)' }} />
                  )}
                  {tab.label}
                </button>
              ))}
            </nav>
          </header>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: DASHBOARD
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
  <div>
    {/* Stats cards */}
    <div className="grid grid-3" style={{ marginBottom: '32px' }}>
      {[
        {
          valor: stats.tarefasPendentes,
          label: 'TAREFAS PENDENTES',
          cor: 'var(--neon-cyan)',
          grad: 'var(--gradient-cyan)'
        },
        {
          valor: stats.estudosPendentes,
          label: 'ESTUDOS ATIVOS',
          cor: 'var(--neon-magenta)',
          grad: 'var(--gradient-magenta)'
        },
        {
          valor: stats.treinosPendentes,
          label: 'TREINOS AGENDADOS',
          cor: 'var(--neon-amber)',
          grad: 'var(--gradient-amber)'
        },
      ].map(({ valor, label, cor, grad }) => (
        <div
          key={label}
          className="card"
          style={{
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: grad
            }}
          />

          <div
            style={{
              fontSize: '48px',
              fontFamily: 'Orbitron',
              fontWeight: 700,
              color: cor,
              textShadow: `0 0 30px ${cor}99`
            }}
          >
            {valor}
          </div>

          <div
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginTop: '8px',
              fontFamily: 'monospace'
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>

    <DashboardGraficos
      tarefas={tarefas}
      estudos={estudos}
      treinos={treinos}
      financas={financas}
    />
  </div>
)}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: TAREFAS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'tarefas' && (
          <div className="grid grid-2">
            <TarefaForm onTarefaCriada={handleTarefaCriada} />
            <TarefaList
              tarefas={tarefas.sort((a, b) => a.prioridade - b.prioridade)}
              onTarefaAtualizada={handleTarefaAtualizada}
              onTarefaExcluida={handleTarefaAtualizada}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: ESTUDOS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'estudos' && (
          <div className="grid grid-2">
            <EstudoForm onEstudoCriado={handleEstudoCriado} />
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
                REGISTRO DE ESTUDOS
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>[{estudos.length} REGISTROS]</span>
              </h3>
              {estudos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px', border: '1px dashed rgba(0,243,255,0.2)', borderRadius: '2px', marginTop: '16px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📚</div>
                  [ NENHUM REGISTRO ENCONTRADO ]
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {estudos.map(estudo => (
                    <div key={estudo.id} className="card" style={{ padding: '16px', marginBottom: 0, borderLeft: `4px solid ${estudo.concluido ? 'var(--neon-green)' : 'var(--neon-amber)'}`, opacity: estudo.concluido ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', fontFamily: 'monospace' }}>{estudo.assunto}</div>
                          {estudo.topico && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: 'monospace', paddingLeft: '12px', borderLeft: '2px solid rgba(0,243,255,0.3)' }}>
                              ► {estudo.topico}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', flexWrap: 'wrap' }}>
                            {estudo.data && <span>📅 {formatarData(estudo.data)}</span>}
                            {estudo.duracao_planejada && <span>⏱️ PLAN: {estudo.duracao_planejada}min</span>}
                            {estudo.duracao_real      && <span style={{ color: 'var(--neon-green)' }}>⏱️ REAL: {estudo.duracao_real}min</span>}
                          </div>
                        </div>
                        <span style={{ padding: '4px 10px', fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, backgroundColor: estudo.concluido ? 'rgba(0,255,157,0.2)' : 'rgba(255,170,0,0.2)', border: `1px solid ${estudo.concluido ? 'var(--neon-green)' : 'var(--neon-amber)'}`, color: estudo.concluido ? 'var(--neon-green)' : 'var(--neon-amber)', borderRadius: '2px', minWidth: '100px', textAlign: 'center' }}>
                          {estudo.concluido ? '✓ CONCLUÍDO' : '⏳ PENDENTE'}
                        </span>
                      </div>
                      {!estudo.concluido && (
                        <button className="btn btn-primary" onClick={() => abrirModalEstudo(estudo.id)} style={{ fontSize: '10px', padding: '8px 16px', width: '100%', marginTop: '12px' }}>
                          ✓ FINALIZAR ESTUDO
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: TREINOS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'treinos' && (
          <div className="grid grid-2">
            <TreinoForm onTreinoCriado={handleTreinoCriado} />
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--neon-green)' }}>◈</span>
                REGISTRO DE TREINOS
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>[{treinos.length} REGISTROS]</span>
              </h3>
              {treinos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px', border: '1px dashed rgba(0,243,255,0.2)', borderRadius: '2px', marginTop: '16px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>🏋️</div>
                  [ NENHUM REGISTRO ENCONTRADO ]
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {treinos.map(treino => (
                    <div key={treino.id} className="card" style={{ padding: '16px', marginBottom: 0, borderLeft: `4px solid ${treino.concluido ? 'var(--neon-green)' : 'var(--neon-red)'}`, opacity: treino.concluido ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', fontFamily: 'monospace' }}>{treino.tipo.toUpperCase()}</div>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', flexWrap: 'wrap' }}>
                            {treino.data && <span>📅 {formatarData(treino.data)}</span>}
                            {treino.duracao && <span>⏱️ {treino.duracao}min</span>}
                            {treino.intensidade && (
                              <span style={{ padding: '2px 6px', backgroundColor: treino.intensidade === 'alta' ? 'rgba(255,0,64,0.2)' : treino.intensidade === 'media' ? 'rgba(255,170,0,0.2)' : 'rgba(0,243,255,0.2)', border: `1px solid ${treino.intensidade === 'alta' ? 'var(--neon-red)' : treino.intensidade === 'media' ? 'var(--neon-amber)' : 'var(--neon-cyan)'}`, borderRadius: '2px', fontSize: '9px' }}>
                                {treino.intensidade.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ padding: '4px 10px', fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, backgroundColor: treino.concluido ? 'rgba(0,255,157,0.2)' : 'rgba(255,0,64,0.2)', border: `1px solid ${treino.concluido ? 'var(--neon-green)' : 'var(--neon-red)'}`, color: treino.concluido ? 'var(--neon-green)' : 'var(--neon-red)', borderRadius: '2px', minWidth: '100px', textAlign: 'center' }}>
                          {treino.concluido ? '✓ CONCLUÍDO' : '⏳ PENDENTE'}
                        </span>
                      </div>
                      {!treino.concluido && (
                        <button className="btn btn-primary" onClick={() => abrirModalTreino(treino.id)} style={{ fontSize: '10px', padding: '8px 16px', width: '100%', marginTop: '12px' }}>
                          ✓ FINALIZAR TREINO
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: FINANÇAS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'financas' && (
          <div>
            <FinancaForm onFinancaCriada={handleFinancaCriada} />
            <FinancaList
              financas={financas}
              filtroMes={financaFiltroMes}
              filtroAno={financaFiltroAno}
              filtroTipo={financaFiltroTipo}
              setFiltroMes={setFinancaFiltroMes}
              setFiltroAno={setFinancaFiltroAno}
              setFiltroTipo={setFinancaFiltroTipo}
              onFinancaExcluida={carregarFinancas}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: HIDRATAÇÃO
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'agua' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <AguaTracker />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: CATEGORIAS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'categorias' && (
          <CategoriaGastos />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ABA: CALENDÁRIO
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'calendario' && (
          <Calendario tarefas={tarefas} estudos={estudos} treinos={treinos} />
        )}

        {/* ── Modais ────────────────────────────────────────────────────── */}
        {modalInputAberto && (
          <InputModal
            isOpen={modalInputAberto}
            onConfirm={concluirEstudo}
            onCancel={() => { setModalInputAberto(false); setIdModal(null); }}
            titulo="Duração do Estudo"
            placeholder="Minutos estudados"
          />
        )}

        {modalConfirmacaoAberto && (
          <ConfirmModal
            isOpen={modalConfirmacaoAberto}
            onConfirm={concluirTreino}
            onCancel={() => { setModalConfirmacaoAberto(false); setIdModal(null); }}
            title="Concluir Treino"
            message="Confirmar conclusão do treino?"
          />
        )}

      </div>
    </ErrorBoundary>
  );
}

export default App;