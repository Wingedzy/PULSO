import React, { useState, useEffect } from 'react';
import { tarefasAPI } from '../services/api';
import ConfirmModal from './ConfirmModal';

const TarefaList = ({ tarefas, onTarefaAtualizada, onTarefaExcluida }) => {
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [erro, setErro] = useState('');

  // Modal de confirmação de exclusão
  useEffect(() => {
    if (!modalAberto) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setModalAberto(false);
        setTarefaParaExcluir(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalAberto]);

  const handleEdit = (tarefa) => {
    setEditandoId(tarefa.id);
    setEditForm({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      data: tarefa.data || '',
      prioridade: tarefa.prioridade,
      status: tarefa.status,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await tarefasAPI.update(id, editForm);
      onTarefaAtualizada();
      setEditandoId(null);
      setEditForm({});
    } catch (error) {
      setErro('✗ ERRO AO ATUALIZAR TAREFA');
    }
  };

  const handleDeleteClick = (id) => {
    setTarefaParaExcluir(id);
    setModalAberto(true);
  };

  const handleConfirmDelete = async () => {
    if (!tarefaParaExcluir) return;
    try {
      await tarefasAPI.delete(tarefaParaExcluir);
      onTarefaExcluida();
      setModalAberto(false);
      setTarefaParaExcluir(null);
    } catch (error) {
      setErro('✗ ERRO AO EXCLUIR TAREFA');
      setModalAberto(false);
      setTarefaParaExcluir(null);
    }
  };

  const handleCancelDelete = () => {
    setModalAberto(false);
    setTarefaParaExcluir(null);
  };

  const handleStatusChange = async (id, novoStatus) => {
    try {
      await tarefasAPI.update(id, { status: novoStatus });
      onTarefaAtualizada();
    } catch (error) {
      setErro('✗ ERRO AO ATUALIZAR STATUS');
    }
  };

  const mostrarErro = (msg) => {
    setErro(msg);
    setTimeout(() => setErro(''), 4000);
  };

  const getPrioridadeLabel = (prioridade) => {
    const labels = {
      1: '🔴 NÍVEL 01',
      2: '🟡 NÍVEL 02',
      3: '🟢 NÍVEL 03',
      4: '🔵 NÍVEL 04',
      5: '⚪ NÍVEL 05',
    };
    return labels[prioridade] || `NÍVEL ${prioridade}`;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: '⏳ PENDENTE',
      em_andamento: '◉ PROCESSANDO',
      concluido: '✓ CONCLUÍDO',
      cancelado: '✗ CANCELADO',
    };
    return labels[status] || status.toUpperCase();
  };

  if (tarefas.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>◈</div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
          [ NENHUMA TAREFA REGISTRADA NO SISTEMA ]
        </p>
        <p style={{ fontSize: '10px', marginTop: '8px', opacity: 0.5 }}>
          AGUARDANDO INPUT...
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Alerta de erro */}
      {erro && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: 'var(--neon-red)',
          color: '#000',
          padding: '12px 20px',
          borderRadius: '2px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 0 20px rgba(255, 0, 64, 0.5)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
          TAREFAS REGISTRADAS
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '0.1em' }}>
            [{tarefas.length} UNIDADES]
          </span>
        </h3>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          OFF: {Math.random().toString(16).substr(2, 4).toUpperCase()}
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tarefas.map((tarefa) => (
          <div
            key={tarefa.id}
            className="card"
            style={{
              marginBottom: 0,
              padding: '16px',
              borderLeft: `4px solid ${
                tarefa.prioridade === 1
                  ? 'var(--neon-red)'
                  : tarefa.prioridade === 2
                  ? 'var(--neon-amber)'
                  : tarefa.prioridade === 3
                  ? 'var(--neon-green)'
                  : 'var(--neon-cyan)'
              }`,
              opacity: tarefa.status === 'concluido' ? 0.5 : 1,
              position: 'relative',
              backgroundColor: tarefa.status === 'concluido' ? 'rgba(0, 255, 157, 0.02)' : 'transparent',
            }}
          >
            {editandoId === tarefa.id ? (
              <div style={{ fontFamily: 'monospace' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.titulo}
                    onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <textarea
                    className="form-input"
                    value={editForm.descricao}
                    onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                    rows="2"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
                <div className="grid grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-input"
                      value={editForm.data}
                      onChange={(e) => setEditForm({ ...editForm, data: e.target.value })}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={editForm.prioridade}
                      onChange={(e) => setEditForm({ ...editForm, prioridade: parseInt(e.target.value) })}
                      style={{ fontFamily: 'monospace' }}
                    >
                      <option value={1}>1 - URGENTE</option>
                      <option value={2}>2 - IMPORTANTE</option>
                      <option value={3}>3 - NORMAL</option>
                      <option value={4}>4 - BAIXA</option>
                      <option value={5}>5 - MUITO BAIXA</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ fontFamily: 'monospace' }}
                  >
                    <option value="pendente">⏳ PENDENTE</option>
                    <option value="em_andamento">◉ PROCESSANDO</option>
                    <option value="concluido">✓ CONCLUÍDO</option>
                    <option value="cancelado">✗ CANCELADO</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={() => handleSaveEdit(tarefa.id)} style={{ flex: 1 }}>
                    ◉ SALVAR ALTERAÇÕES
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditandoId(null)} style={{ flex: 1 }}>
                    ◼ CANCELAR
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {tarefa.titulo}
                    </h4>
                    {tarefa.descricao && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>
                        {tarefa.descricao}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span className="tag" style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.05em' }}>
                        {getPrioridadeLabel(tarefa.prioridade)}
                      </span>
                      <span className="tag" style={{
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        letterSpacing: '0.05em',
                        backgroundColor: tarefa.status === 'concluido' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 170, 0, 0.2)',
                        borderColor: tarefa.status === 'concluido' ? 'var(--neon-green)' : 'var(--neon-amber)',
                        color: tarefa.status === 'concluido' ? 'var(--neon-green)' : 'var(--neon-amber)'
                      }}>
                        {getStatusLabel(tarefa.status)}
                      </span>
                      {tarefa.data && (
                        <span className="tag" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                          📅 {new Date(tarefa.data).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {(() => {
                        try {
                          const tags = JSON.parse(tarefa.tags || '[]');
                          return Array.isArray(tags) ? tags.map((tag, idx) => (
                            <span key={idx} className="tag" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                              #{tag}
                            </span>
                          )) : null;
                        } catch (e) {
                          console.warn('Tags inválidas:', tarefa.tags);
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(tarefa)}
                      title="Editar"
                      style={{ padding: '6px 12px', fontSize: '10px', minWidth: '36px' }}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDeleteClick(tarefa.id)}
                      title="Excluir"
                      style={{ padding: '6px 12px', fontSize: '10px', minWidth: '36px', color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0, 243, 255, 0.1)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tarefa.status !== 'concluido' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusChange(tarefa.id, 'concluido')}
                      style={{ fontSize: '10px', padding: '6px 12px', letterSpacing: '0.05em' }}
                    >
                      ✓ CONCLUIR
                    </button>
                  )}
                  {tarefa.status === 'pendente' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStatusChange(tarefa.id, 'em_andamento')}
                      style={{ fontSize: '10px', padding: '6px 12px', letterSpacing: '0.05em' }}
                    >
                      ▶ PROCESSAR
                    </button>
                  )}
                  {(tarefa.status === 'em_andamento' || tarefa.status === 'concluido') && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStatusChange(tarefa.id, 'pendente')}
                      style={{ fontSize: '10px', padding: '6px 12px', letterSpacing: '0.05em' }}
                    >
                      ↺ REABRIR
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={modalAberto}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="EXCLUSÃO DE REGISTRO"
        message="Tem certeza que deseja excluir este registro?"
      />
    </div>
  );
};

export default TarefaList;
