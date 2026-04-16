import React, { useState, useEffect } from 'react';
import { tarefasAPI, estudosAPI, treinosAPI, financasAPI, testConnection } from './services/api';
import TarefaForm from './components/TarefaForm';
import TarefaList from './components/TarefaList';
import EstudoForm from './components/EstudoForm';
import TreinoForm from './components/TreinoForm';
import FinancaForm from './components/FinancaForm';
import FinancaList from './components/FinancaList';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tarefas, setTarefas] = useState([]);
  const [estudos, setEstudos] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [financas, setFinancas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtro para finanças
  const [financaFiltroMes, setFinancaFiltroMes] = useState(new Date().getMonth() + 1);
  const [financaFiltroAno, setFinancaFiltroAno] = useState(new Date().getFullYear());
  const [financaFiltroTipo, setFinancaFiltroTipo] = useState('todos');

  // Função para carregar finanças com base nos filtros
  const carregarFinancas = async () => {
    console.log('Carregando finanças com filtros:', { mes: financaFiltroMes, ano: financaFiltroAno, tipo: financaFiltroTipo });
    try {
      const params = {
        mes: financaFiltroMes,
        ano: financaFiltroAno
      };
      if (financaFiltroTipo !== 'todos') {
        params.tipo = financaFiltroTipo;
      }
      const response = await financasAPI.getAll(params);
      setFinancas(response.data);
    } catch (error) {
      console.error('Erro ao carregar finanças:', error);
    }
  };

  // Carregar finanças quando os filtros mudarem
  useEffect(() => {
    carregarFinancas();
  }, [financaFiltroMes, financaFiltroAno, financaFiltroTipo]);

  const carregarDados = async () => {
    console.log('🔄 Iniciando carregamento de dados...');
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Requisitando dados da API...');
      console.log('🌐 API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:3001/api');

      // Carregar dados em paralelo
      const [tarefasRes, estudosRes, treinosRes, financasRes] = await Promise.allSettled([
        tarefasAPI.getAll(),
        estudosAPI.getAll(),
        treinosAPI.getAll(),
        financasAPI.getAll({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() }),
      ]);

      // Processar resultados
      if (tarefasRes.status === 'fulfilled') {
        setTarefas(tarefasRes.value.data);
        console.log('✅ Tarefas carregadas:', tarefasRes.value.data.length);
      } else {
        console.error('❌ Erro ao carregar tarefas:', tarefasRes.reason);
      }

      if (estudosRes.status === 'fulfilled') {
        setEstudos(estudosRes.value.data);
        console.log('✅ Estudos carregadas:', estudosRes.value.data.length);
      } else {
        console.error('❌ Erro ao carregar estudos:', estudosRes.reason);
      }

      if (treinosRes.status === 'fulfilled') {
        setTreinos(treinosRes.value.data);
        console.log('✅ Treinos carregadas:', treinosRes.value.data.length);
      } else {
        console.error('❌ Erro ao carregar treinos:', treinosRes.reason);
      }

      if (financasRes.status === 'fulfilled') {
        setFinancas(financasRes.value.data);
        console.log('✅ Finanças carregadas:', financasRes.value.data.length);
      } else {
        console.error('❌ Erro ao carregar finanções:', financasRes.reason);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Erro crítico ao carregar dados:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleTarefaCriada = (novaTarefa, organizacao) => {
    setTarefas((prev) => [novaTarefa, ...prev]);
    console.log('Organização sugerida:', organizacao);
  };

  const handleTarefaAtualizada = () => {
    carregarDados();
  };

  const handleEstudoCriado = (novoEstudo) => {
    setEstudos((prev) => [novoEstudo, ...prev]);
  };

  const handleTreinoCriado = (novoTreino) => {
    setTreinos((prev) => [novoTreino, ...prev]);
  };

  const handleFinancaCriada = (novaFinanca) => {
    setFinancas((prev) => {
      // Verifica se a transação já existe (evitar duplicação)
      const existe = prev.some(f => f.id === novaFinanca.id || f._id === novaFinanca._id);
      if (!existe) {
        console.log('Adicionando nova transação:', novaFinanca);
        return [novaFinanca, ...prev];
      }
      return prev;
    });
    // Recarregar lista completa para sincronizar com backend
    carregarFinancas();
  };

  const concluirEstudo = async (id) => {
    const duracao = prompt('Duração real (minutos):');
    if (duracao) {
      try {
        await estudosAPI.concluir(id, parseInt(duracao));
        carregarDados();
      } catch (error) {
        alert('Erro ao concluir estudo');
      }
    }
  };

  const concluirTreino = async (id) => {
    if (window.confirm('Marcar treino como concluído?')) {
      try {
        await treinosAPI.concluir(id);
        carregarDados();
      } catch (error) {
        alert('Erro ao concluir treino');
      }
    }
  };

  const stats = {
    tarefasPendentes: tarefas.filter(t => t.status === 'pendente').length,
    tarefasConcluidas: tarefas.filter(t => t.status === 'concluido').length,
    estudosPendentes: estudos.filter(e => !e.concluido).length,
    estudosConcluidos: estudos.filter(e => e.concluido).length,
    treinosPendentes: treinos.filter(t => !t.concluido).length,
    treinosConcluidos: treinos.filter(t => t.concluido).length,
  };

  const tabs = [
    { id: 'dashboard', label: '📊 DASHBOARD', icon: '📊' },
    { id: 'tarefas', label: '📋 TAREFAS', icon: '📋' },
    { id: 'estudos', label: '📚 ESTUDOS', icon: '📚' },
    { id: 'treinos', label: '🏋️ TREINOS', icon: '🏋️' },
    { id: 'financas', label: '💰 FINANÇAS', icon: '💰' },
  ];

  return (
    <ErrorBoundary>
      <div className="container">
      {loading && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '60px 20px',
          marginTop: '48px',
          border: '2px dashed var(--neon-cyan)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'spin 2s linear infinite'
          }}>◈</div>
          <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>INICIALIZANDO SISTEMA</h2>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
            Conectando ao núcleo neural... Aguarde.
          </p>
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'rgba(255, 0, 64, 0.1)',
              border: '1px solid var(--neon-red)',
              borderRadius: '2px',
              color: 'var(--neon-red)',
              fontFamily: 'monospace',
              fontSize: '11px'
            }}>
              ⚠ ERRO: {error}
            </div>
          )}
        </div>
      )}

      {!loading && (
        <header style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', margin: 0, letterSpacing: '0.2em' }}>
                ◈ CENTRAL DE PRODUTIVIDADE ◈
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
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                className={`btn ${activeTab === tabItem.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(tabItem.id)}
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '12px 24px',
                  position: 'relative'
                }}
              >
                {activeTab === tabItem.id && <span style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', background: 'var(--gradient-cyan)' }}></span>}
                {tabItem.label}
              </button>
            ))}
          </nav>
        </header>
      )}

      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-3" style={{ marginBottom: '32px' }}>
            <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--gradient-cyan)'
              }} />
              <div style={{ fontSize: '48px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-cyan)', textShadow: '0 0 30px rgba(0, 243, 255, 0.6)' }}>
                {stats.tarefasPendentes}
              </div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginTop: '8px',
                fontFamily: 'monospace'
              }}>
                TAREFAS PENDENTES
              </div>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'monospace'
              }}>
                ID: {Math.random().toString(36).substr(2,4).toUpperCase()}
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--gradient-magenta)'
              }} />
              <div style={{ fontSize: '48px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-magenta)', textShadow: '0 0 30px rgba(255, 0, 255, 0.6)' }}>
                {stats.estudosPendentes}
              </div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginTop: '8px',
                fontFamily: 'monospace'
              }}>
                ESTUDOS ATIVOS
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--gradient-amber)'
              }} />
              <div style={{ fontSize: '48px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-amber)', textShadow: '0 0 30px rgba(255, 170, 0, 0.6)' }}>
                {stats.treinosPendentes}
              </div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginTop: '8px',
                fontFamily: 'monospace'
              }}>
                TREINOS AGENDADOS
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
                PRÓXIMAS TAREFAS
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  TOP 5
                </span>
              </h3>
              {tarefas.filter(t => t.status === 'pendente').length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  border: '1px dashed rgba(0, 243, 255, 0.2)',
                  borderRadius: '2px'
                }}>
                  [ NENHUMA TAREFA PENDENTE ]
                </div>
              ) : (
                <ul style={{ listStyle: 'none', marginTop: '16px' }}>
                  {tarefas
                    .filter(t => t.status === 'pendente')
                    .sort((a, b) => a.prioridade - b.prioridade)
                    .slice(0, 5)
                    .map((tarefa, idx) => (
                      <li
                        key={tarefa.id}
                        style={{
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(0, 243, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            marginBottom: '4px',
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em'
                          }}>
                            {String(idx + 1).padStart(2, '0')} // {tarefa.titulo}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            <span style={{
                              padding: '2px 6px',
                              backgroundColor: tarefa.prioridade === 1 ? 'rgba(255, 0, 64, 0.2)' : tarefa.prioridade === 2 ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 255, 157, 0.2)',
                              border: `1px solid ${tarefa.prioridade === 1 ? 'var(--neon-red)' : tarefa.prioridade === 2 ? 'var(--neon-amber)' : 'var(--neon-green)'}`,
                              borderRadius: '2px',
                              fontSize: '9px'
                            }}>
                              {tarefa.prioridade === 1 ? 'URG' : tarefa.prioridade === 2 ? 'IMP' : 'NRM'}
                            </span>
                            {tarefa.data && (
                              <span>📅 {new Date(tarefa.data).toLocaleDateString('pt-BR')}</span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: tarefa.prioridade === 1 ? 'var(--neon-red)' : tarefa.prioridade === 2 ? 'var(--neon-amber)' : 'var(--neon-green)',
                          boxShadow: `0 0 10px ${tarefa.prioridade === 1 ? 'var(--neon-red)' : tarefa.prioridade === 2 ? 'var(--neon-amber)' : 'var(--neon-green)'}`
                        }} />
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--neon-magenta)' }}>◈</span>
                PRÓXIMOS ESTUDOS
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  TOP 5
                </span>
              </h3>
              {estudos.filter(e => !e.concluido).length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  border: '1px dashed rgba(255, 0, 255, 0.2)',
                  borderRadius: '2px'
                }}>
                  [ NENHUM ESTUDO PENDENTE ]
                </div>
              ) : (
                <ul style={{ listStyle: 'none', marginTop: '16px' }}>
                  {estudos
                    .filter(e => !e.concluido)
                    .sort((a, b) => new Date(a.data) - new Date(b.data))
                    .slice(0, 5)
                    .map((estudo, idx) => (
                      <li
                        key={estudo.id}
                        style={{
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(255, 0, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            marginBottom: '4px',
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em'
                          }}>
                            {String(idx + 1).padStart(2, '0')} // {estudo.assunto}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            {estudo.topico && <span>📖 {estudo.topico}</span>}
                            {estudo.duracao_planejada && (
                              <span>⏱️ PLAN: {estudo.duracao_planejada}min</span>
                            )}
                            <span>📅 {new Date(estudo.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--neon-magenta)',
                          boxShadow: '0 0 10px var(--neon-magenta)'
                        }} />
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--neon-amber)' }}>◈</span>
              TREINOS RECENTES
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                ÚLTIMOS 6
              </span>
            </h3>
            {treinos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                fontSize: '11px',
                border: '1px dashed rgba(255, 170, 0, 0.2)',
                borderRadius: '2px',
                marginTop: '16px'
              }}>
                [ NENHUM TREINO REGISTRADO ]
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '16px'
              }}>
                {treinos.slice(0, 6).map((treino) => (
                  <div
                    key={treino.id}
                    className="card"
                    style={{
                      marginBottom: 0,
                      padding: '16px',
                      borderLeft: `4px solid ${treino.concluido ? 'var(--neon-green)' : 'var(--neon-amber)'}`,
                      backgroundColor: treino.concluido ? 'rgba(0, 255, 157, 0.02)' : 'rgba(255, 170, 0, 0.02)',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      textTransform: 'uppercase'
                    }}>
                      {treino.tipo === 'musculacao' ? '🏋️' : treino.tipo === 'cardio' ? '🏃' : treino.tipo === 'funcional' ? '🤸' : '⚽'}
                      <span>{treino.tipo}</span>
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      marginBottom: '4px'
                    }}>
                      📅 {new Date(treino.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      marginBottom: '8px',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {treino.duracao && <span>⏱️ {treino.duracao}min</span>}
                      {treino.intensidade && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: treino.intensidade === 'alta' ? 'rgba(255, 0, 64, 0.2)' : treino.intensidade === 'media' ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 243, 255, 0.2)',
                          border: `1px solid ${treino.intensidade === 'alta' ? 'var(--neon-red)' : treino.intensidade === 'media' ? 'var(--neon-amber)' : 'var(--neon-cyan)'}`,
                          borderRadius: '2px',
                          fontSize: '9px'
                        }}>
                          {treino.intensidade.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      backgroundColor: treino.concluido ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 170, 0, 0.15)',
                      border: `1px solid ${treino.concluido ? 'var(--neon-green)' : 'var(--neon-amber)'}`,
                      color: treino.concluido ? 'var(--neon-green)' : 'var(--neon-amber)',
                      borderRadius: '2px',
                      display: 'inline-block'
                    }}>
                      {treino.concluido ? '✓ CONCLUÍDO' : '⏳ PENDENTE'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tarefas' && (
        <div className="grid grid-2">
          <div>
            <TarefaForm onTarefaCriada={handleTarefaCriada} />
          </div>
          <div>
            <TarefaList
              tarefas={tarefas.sort((a, b) => a.prioridade - b.prioridade)}
              onTarefaAtualizada={handleTarefaAtualizada}
              onTarefaExcluida={handleTarefaAtualizada}
            />
          </div>
        </div>
      )}

      {activeTab === 'estudos' && (
        <div className="grid grid-2">
          <div>
            <EstudoForm onEstudoCriado={handleEstudoCriado} />
          </div>
          <div>
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--neon-blue)' }}>◈</span>
                REGISTRO DE ESTUDOS
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  [{estudos.length} REGISTROS]
                </span>
              </h3>
              {estudos.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  border: '1px dashed rgba(0, 243, 255, 0.2)',
                  borderRadius: '2px',
                  marginTop: '16px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📚</div>
                  [ NENHUM REGISTRO ENCONTRADO ]
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {estudos.map((estudo) => (
                    <div
                      key={estudo.id}
                      className="card"
                      style={{
                        padding: '16px',
                        marginBottom: 0,
                        borderLeft: `4px solid ${estudo.concluido ? 'var(--neon-green)' : 'var(--neon-amber)'}`,
                        opacity: estudo.concluido ? 0.6 : 1,
                        backgroundColor: estudo.concluido ? 'rgba(0, 255, 157, 0.02)' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '14px',
                            marginBottom: '8px',
                            letterSpacing: '0.02em',
                            fontFamily: 'monospace'
                          }}>
                            {estudo.assunto}
                          </div>
                          {estudo.topico && (
                            <div style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              marginBottom: '8px',
                              fontFamily: 'monospace',
                              paddingLeft: '12px',
                              borderLeft: '2px solid rgba(0, 243, 255, 0.3)'
                            }}>
                              ► {estudo.topico}
                            </div>
                          )}
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            flexWrap: 'wrap'
                          }}>
                            <span>📅 {new Date(estudo.data).toLocaleDateString('pt-BR')}</span>
                            {estudo.duracao_planejada && (
                              <span>⏱️ PLAN: {estudo.duracao_planejada}min</span>
                            )}
                            {estudo.duracao_real && (
                              <span style={{ color: 'var(--neon-green)' }}>⏱️ REAL: {estudo.duracao_real}min</span>
                            )}
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          backgroundColor: estudo.concluido ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 170, 0, 0.2)',
                          border: `1px solid ${estudo.concluido ? 'var(--neon-green)' : 'var(--neon-amber)'}`,
                          color: estudo.concluido ? 'var(--neon-green)' : 'var(--neon-amber)',
                          borderRadius: '2px',
                          minWidth: '100px',
                          textAlign: 'center'
                        }}>
                          {estudo.concluido ? '✓ CONCLUÍDO' : '⏳ PENDENTE'}
                        </span>
                      </div>
                      {!estudo.concluido && (
                        <div style={{ marginTop: '12px' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => concluirEstudo(estudo.id)}
                            style={{ fontSize: '10px', padding: '8px 16px', width: '100%' }}
                          >
                            ✓ FINALIZAR ESTUDO
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'treinos' && (
        <div className="grid grid-2">
          <div>
            <TreinoForm onTreinoCriado={handleTreinoCriado} />
          </div>
          <div>
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--neon-green)' }}>◈</span>
                REGISTRO DE TREINOS
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  [{treinos.length} REGISTROS]
                </span>
              </h3>
              {treinos.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  border: '1px dashed rgba(0, 243, 255, 0.2)',
                  borderRadius: '2px',
                  marginTop: '16px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>🏋️</div>
                  [ NENHUM REGISTRO ENCONTRADO ]
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {treinos.map((treino) => (
                    <div
                      key={treino.id}
                      className="card"
                      style={{
                        padding: '16px',
                        marginBottom: 0,
                        borderLeft: `4px solid ${treino.concluido ? 'var(--neon-green)' : 'var(--neon-red)'}`,
                        opacity: treino.concluido ? 0.6 : 1,
                        backgroundColor: treino.concluido ? 'rgba(0, 255, 157, 0.02)' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '14px',
                            marginBottom: '8px',
                            letterSpacing: '0.02em',
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {treino.tipo === 'musculacao' ? '🏋️' : treino.tipo === 'cardio' ? '🏃' : treino.tipo === 'funcional' ? '🤸' : '⚽'}
                            {treino.tipo.toUpperCase()}
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            flexWrap: 'wrap',
                            marginBottom: '8px'
                          }}>
                            <span>📅 {new Date(treino.data).toLocaleDateString('pt-BR')}</span>
                            {treino.duracao && (
                              <span>⏱️ DURAÇÃO: {treino.duracao}min</span>
                            )}
                            {treino.intensidade && (
                              <span style={{
                                padding: '2px 6px',
                                backgroundColor: treino.intensidade === 'alta' ? 'rgba(255, 0, 64, 0.2)' : treino.intensidade === 'media' ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 243, 255, 0.2)',
                                border: `1px solid ${treino.intensidade === 'alta' ? 'var(--neon-red)' : treino.intensidade === 'media' ? 'var(--neon-amber)' : 'var(--neon-cyan)'}`,
                                borderRadius: '2px',
                                fontSize: '9px'
                              }}>
                                {treino.intensidade.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {treino.exercicios && (() => {
                            try {
                              const exercicios = JSON.parse(treino.exercicios);
                              if (Array.isArray(exercicios) && exercicios.length > 0) {
                                return (
                                  <div style={{
                                    fontSize: '10px',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'monospace',
                                    paddingLeft: '12px',
                                    borderLeft: '2px solid rgba(0, 243, 255, 0.3)',
                                    marginTop: '8px'
                                  }}>
                                    <div style={{ marginBottom: '4px', color: 'var(--neon-cyan)' }}>◈ EXERCÍCIOS:</div>
                                    <ul style={{ margin: 0, paddingLeft: '12px', listStyle: 'none' }}>
                                      {exercicios.slice(0, 4).map((ex, idx) => (
                                        <li key={idx} style={{ marginBottom: '2px' }}>► {ex}</li>
                                      ))}
                                      {exercicios.length > 4 && (
                                        <li style={{ color: 'var(--text-muted)' }}>... e mais {exercicios.length - 4}</li>
                                      )}
                                    </ul>
                                  </div>
                                );
                              }
                              return null;
                            } catch (e) {
                              console.warn('Exercícios inválidos:', treino.exercicios);
                              return null;
                            }
                          })()}
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          backgroundColor: treino.concluido ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 0, 64, 0.2)',
                          border: `1px solid ${treino.concluido ? 'var(--neon-green)' : 'var(--neon-red)'}`,
                          color: treino.concluido ? 'var(--neon-green)' : 'var(--neon-red)',
                          borderRadius: '2px',
                          minWidth: '100px',
                          textAlign: 'center'
                        }}>
                          {treino.concluido ? '✓ CONCLUÍDO' : '⏳ PENDENTE'}
                        </span>
                      </div>
                      {!treino.concluido && (
                        <div style={{ marginTop: '12px' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => concluirTreino(treino.id)}
                            style={{ fontSize: '10px', padding: '8px 16px', width: '100%' }}
                          >
                            ✓ FINALIZAR TREINO
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          />
        </div>
      )}


export default App;
