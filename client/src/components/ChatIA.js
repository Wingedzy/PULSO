import React, { useState, useEffect, useRef } from 'react';
import { conversasAPI, financasAPI } from '../services/api';

const ChatIA = () => {
  const [conversas, setConversas] = useState([]);
  const [conversaAtual, setConversaAtual] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNomearModal, setShowNomearModal] = useState(false);
  const [novaSessaoNome, setNovaSessaoNome] = useState('');
  const [sessaoPendente, setSessaoPendente] = useState(false);
  const [transacoesPendentes, setTransacoesPendentes] = useState(null); // Armazena transações aguardando confirmação
  const messagesEndRef = useRef(null);

  const carregarConversas = async () => {
    try {
      const response = await conversasAPI.getAll();
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setConversas(data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const carregarMensagens = async (conversaId) => {
    try {
      const response = await conversasAPI.getMensagens(conversaId);
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setMensagens(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const criarNovaConversa = async () => {
    setNovaSessaoNome('');
    setSessaoPendente(true);
    setShowNomearModal(true);
  };

  const confirmarCriarSessao = async () => {
    if (!novaSessaoNome.trim()) {
      alert('Digite um nome para a sessão');
      return;
    }

    try {
      const response = await conversasAPI.create({
        titulo: novaSessaoNome.trim()
      });
      const data = response?.data?.data ?? response?.data ?? {};
      setConversaAtual(data.id);
      setMensagens([]);
      setShowNomearModal(false);
      setSessaoPendente(false);
      await carregarConversas();
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      alert('Erro ao criar sessão');
    }
  };

  const cancelarCriarSessao = () => {
    setShowNomearModal(false);
    setSessaoPendente(false);
    setNovaSessaoNome('');
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtual) return;

    // Verificar se estamos aguardando confirmação de transação financeira
    if (transacoesPendentes) {
      const confirmacao = novaMensagem.trim().toLowerCase();
      const eConfirmacao = /^(sim|não|nao|yes|no|s|n)$/i.test(confirmacao);

      if (!eConfirmacao) {
        // Mensagem não é confirmação, ignorar pendência e tratar como novo input
        setTransacoesPendentes(null);
      } else {
        // Processar confirmação
        setLoading(true);
        try {
          const response = await financasAPI.confirmar(transacoesPendentes, confirmacao);
          const resultData = response?.data?.data ?? response?.data ?? {};

          // Mensagem de resultado
          const resultMensagem = {
            id: 'result-' + Date.now(),
            conversa_id: conversaAtual,
            role: 'user',
            conteudo: confirmacao === 'sim' || confirmacao === 's' ? 'Sim' : 'Não',
            created_at: new Date().toISOString(),
          };
          setMensagens(prev => [...prev, resultMensagem]);

          // Resposta da IA sobre o resultado
          setTimeout(() => {
            const respostaMsg = {
              id: 'resposta-' + Date.now(),
              conversa_id: conversaAtual,
              role: 'assistant',
              conteudo: resultData.mensagem || 'Transações processadas.',
              created_at: new Date().toISOString(),
            };
            setMensagens(prev => [...prev, respostaMsg]);
          }, 300);

          setTransacoesPendentes(null);
          setNovaMensagem('');
        } catch (error) {
          console.error('Erro ao confirmar transações:', error);
          alert('Erro ao processar confirmação');
          setTransacoesPendentes(null);
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    // Fluxo normal
    setLoading(true);
    try {
      const response = await conversasAPI.sendMensagem(conversaAtual, {
        role: 'user',
        conteudo: novaMensagem,
      });

      const resData = response?.data?.data ?? response?.data ?? {};

      if (resData.mensagem) {
        setMensagens(prev => [...prev, resData.mensagem]);
      }

      if (resData.sugestoes && resData.sugestoes.length > 0) {
        // Verificar se há sugestão de transação pendente
        const sugestaoFinanceira = resData.sugestoes.find(s => s.requerConfirmacao);
        if (sugestaoFinanceira && sugestaoFinanceira.transacoes) {
          // Armazenar transações pendentes para confirmação
          setTransacoesPendentes(sugestaoFinanceira.transacoes);
        }

        setTimeout(() => {
          const sugestaoMsg = {
            id: 'sugestao-' + Date.now(),
            conversa_id: conversaAtual,
            role: 'assistant',
            conteudo: resData.sugestoes.map(s => `► ${s.descricao}`).join('\n\n'),
            created_at: new Date().toISOString(),
          };
          setMensagens(prev => [...prev, sugestaoMsg]);
        }, 500);
      }

      setNovaMensagem('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarConversa = (conversa) => {
    setConversaAtual(conversa.id);
    carregarMensagens(conversa.id);
  };

  useEffect(() => {
    carregarConversas();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  return (
    <div className="card" style={{
      height: '650px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative corners */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        right: '8px',
        bottom: '8px',
        border: '1px solid rgba(0, 243, 255, 0.1)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: 0,
            fontSize: '16px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            <span style={{ color: 'var(--neon-cyan)', fontSize: '20px' }}>◉</span>
            INTERFACE NEURAL
            <span style={{
              marginLeft: 'auto',
              fontSize: '10px',
              color: 'var(--neon-green)',
              fontFamily: 'monospace',
              padding: '4px 8px',
              border: '1px solid var(--neon-green)',
              borderRadius: '2px'
            }}>
              ● CONECTADO
            </span>
          </h3>
          <button
            className="btn btn-primary"
            onClick={criarNovaConversa}
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '0.1em',
              padding: '8px 16px'
            }}
          >
            ◈ NOVA SESSÃO
          </button>
        </div>

        {/* Modal para nomear sessão */}
        {showNomearModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{
              width: '400px',
              maxWidth: '90%',
              border: '2px solid var(--neon-cyan)',
              boxShadow: '0 0 30px rgba(0, 243, 255, 0.5)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--neon-cyan)'
              }}>
                ◈ NOVA SESSÃO
              </h3>
              <div className="form-group">
                <label className="form-label">NOME DA SESSÃO</label>
                <input
                  type="text"
                  className="form-input"
                  value={novaSessaoNome}
                  onChange={(e) => setNovaSessaoNome(e.target.value)}
                  placeholder="► Ex: Planejamento Semanal, Ideias Projeto..."
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && confirmarCriarSessao()}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button
                  className="btn btn-primary"
                  onClick={confirmarCriarSessao}
                  style={{ flex: 1 }}
                >
                  ◉ CRIAR
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={cancelarCriarSessao}
                  style={{ flex: 1 }}
                >
                  ◼ CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}

        <p style={{
          color: 'var(--text-muted)',
          marginBottom: '20px',
          fontSize: '11px',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          ► Transmissão direta com núcleo neural organizacional. Digite suas ideias, afazeres, planejamentos. A IA irá catalogar e sugerir organização.
        </p>

        <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Sidebar - Conversas */}
          <div style={{
            width: '220px',
            borderRight: '1px solid rgba(0, 243, 255, 0.2)',
            paddingRight: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h4 style={{
              marginBottom: '12px',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--neon-magenta)',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚙</span> SESSÕES ARquivadas
            </h4>
            {conversas.length === 0 ? (
              <div style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                padding: '12px',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '2px',
                textAlign: 'center'
              }}>
                [ NENHUMA SESSÃO ENCONTRADA ]
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {conversas.map((conversa) => (
                  <li
                    key={conversa.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      backgroundColor: conversaAtual === conversa.id
                        ? 'rgba(0, 243, 255, 0.1)'
                        : 'transparent',
                      border: conversaAtual === conversa.id
                        ? '1px solid rgba(0, 243, 255, 0.3)'
                        : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => selecionarConversa(conversa)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (conversaAtual !== conversa.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conversa.titulo || 'SEM TÍTULO'}
                    </div>
                    <div style={{
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📅</span>
                      {new Date(conversa.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Messages */}
            <div
              ref={messagesEndRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '2px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {mensagens.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '40px',
                  border: '1px dashed rgba(0, 243, 255, 0.2)',
                  borderRadius: '2px'
                }}>
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.3 }}>◉</div>
                    <p style={{ marginBottom: '8px' }}>SISTEMA PRONTO PARA RECEBER INPUT</p>
                    <p style={{ fontSize: '10px', opacity: 0.6 }}>
                      Exemplos:<br/>
                      "Preciso studying React"<br/>
                      "Vou treinar amanhã"<br/>
                      "Ideia: app de produtividade"
                    </p>
                  </div>
                </div>
              ) : (
                mensagens.map((msg, idx) => (
                  <div
                    key={msg.id || `msg-${idx}`}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: '2px',
                        backgroundColor: msg.role === 'user'
                          ? 'rgba(0, 128, 255, 0.2)'
                          : 'rgba(0, 243, 255, 0.05)',
                        border: msg.role === 'user'
                          ? '1px solid rgba(0, 128, 255, 0.4)'
                          : '1px solid rgba(0, 243, 255, 0.2)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        boxShadow: msg.role === 'user'
                          ? '0 0 20px rgba(0, 128, 255, 0.2)'
                          : '0 0 10px rgba(0, 243, 255, 0.1)',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.role === 'assistant' && (
                        <span style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}>►</span>
                      )}
                      {msg.conteudo}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                type="text"
                className="form-input"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), enviarMensagem())}
                placeholder="► Insira seu comando ou ideia..."
                disabled={loading}
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  color: 'var(--neon-cyan)',
                  padding: '12px 16px',
                  resize: 'none',
                  height: '48px'
                }}
              />
              <button
                className="btn btn-primary"
                onClick={enviarMensagem}
                disabled={loading || !novaMensagem.trim()}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  padding: '12px 24px',
                  minWidth: '120px',
                  height: '48px'
                }}
              >
                {loading ? '⏳' : '◈ ENVIAR'}
              </button>
            </div>
          </div>

          {/* Indicador de transações pendentes */}
          {transacoesPendentes && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'rgba(255, 170, 0, 0.1)',
              border: '1px solid var(--neon-amber)',
              borderRadius: '2px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              <div style={{ color: 'var(--neon-amber)', marginBottom: '8px', fontWeight: 600 }}>
                ⚠ TRANSAÇÕES PENDENTES DE CONFIRMAÇÃO
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                As seguintes transações foram detectadas. Responda "sim" para registrar ou "não" para cancelar.
              </div>
              {transacoesPendentes.map((t, idx) => (
                <div key={idx} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderLeft: `3px solid ${t.tipo === 'entrada' ? 'var(--neon-green)' : 'var(--neon-red)'}`
                }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: t.tipo === 'entrada' ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 600 }}>
                      {t.tipo === 'entrada' ? '📈 ENTRADA' : '📉 GASTO'}
                    </span>
                    <span style={{ marginLeft: '12px', color: 'var(--neon-cyan)' }}>
                      {(t.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {t.descricao} • {t.categoria} • {new Date(t.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--neon-amber)' }}>
                Digite "sim" para confirmar ou "não" para cancelar:
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatIA;