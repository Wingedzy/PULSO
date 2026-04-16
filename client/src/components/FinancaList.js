import React, { useState } from 'react';
import { financasAPI } from '../services/api';
import ConfirmModal from './ConfirmModal';

const FinancaList = ({ financas, filtroMes, filtroAno, filtroTipo, setFiltroMes, setFiltroAno, setFiltroTipo, onFinancaExcluida }) => {
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [financaParaExcluir, setFinancaParaExcluir] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const mostrarMensagem = (msg, tipo = 'sucesso') => {
    if (tipo === 'sucesso') {
      setSucesso(msg);
      setTimeout(() => setSucesso(''), 3000);
    } else {
      setErro(msg);
      setTimeout(() => setErro(''), 4000);
    }
  };

  const handleDelete = async (id) => {
    setFinancaParaExcluir(id);
    setModalAberto(true);
  };

  const handleConfirmDelete = async () => {
    if (!financaParaExcluir) return;
    try {
      await financasAPI.delete(financaParaExcluir);
      mostrarMensagem('Transação excluída!');
      if (onFinancaExcluida) onFinancaExcluida();
      setModalAberto(false);
      setFinancaParaExcluir(null);
    } catch (error) {
      mostrarMensagem('✗ ERRO AO EXCLUIR TRANSAÇÃO', 'erro');
      setModalAberto(false);
      setFinancaParaExcluir(null);
    }
  };

  const handleCancelDelete = () => {
    setModalAberto(false);
    setFinancaParaExcluir(null);
  };

  const handleUpdate = async (id, updates) => {
    try {
      await financasAPI.update(id, updates);
      mostrarMensagem('Transação atualizada!');
    } catch (error) {
      mostrarMensagem('✗ ERRO AO ATUALIZAR TRANSAÇÃO', 'erro');
    }
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      'alimentacao': '🍔',
      'alimentação': '🍔',
      'transporte': '🚗',
      'moradia': '🏠',
      'saude': '💉',
      'saúde': '💉',
      'lazer': '🎮',
      'educacao': '📚',
      'educação': '📚',
      'vestuario': '👕',
      'vestuário': '👕',
      'investimento': '📈',
      'salario': '💰',
      'salário': '💰',
      'freelance': '💼',
      'outros': '📦'
    };
    return icons[categoria] || '💰';
  };

  const formatValor = (valor, tipo) => {
    const v = valor || 0;
    const formatted = v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return tipo === 'entrada' ? `+${formatted}` : `-${formatted}`;
  };

  const getValorColor = (tipo) => {
    return tipo === 'entrada' ? 'var(--neon-green)' : 'var(--neon-red)';
  };

  const meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  const anos = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    anos.push(i);
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px', animation: 'spin 2s linear infinite' }}>◈</div>
        <p style={{ color: 'var(--neon-cyan)', fontFamily: 'monospace', fontSize: '12px' }}>CARREGANDO DADOS FINANCEIROS...</p>
      </div>
    );
  }

  const entradas = financas.filter(f => f.tipo === 'entrada');
  const saidas = financas.filter(f => f.tipo === 'saida');
  const totalEntradas = entradas.reduce((sum, f) => sum + (f.valor || 0), 0);
  const totalSaidas = saidas.reduce((sum, f) => sum + (f.valor || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const FeedbackMessage = ({ message, type }) => (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      padding: '12px 20px',
      borderRadius: '2px',
      fontFamily: 'monospace',
      fontSize: '12px',
      fontWeight: 600,
      boxShadow: type === 'sucesso' ? '0 0 20px rgba(0, 255, 157, 0.5)' : '0 0 20px rgba(255, 0, 64, 0.5)',
      animation: 'fadeIn 0.3s ease',
      background: type === 'sucesso' ? 'var(--neon-green)' : 'var(--neon-red)',
      color: type === 'sucesso' ? '#000' : '#fff',
      border: type === 'sucesso' ? '1px solid var(--neon-green)' : '1px solid var(--neon-red)',
    }}>
      {message}
    </div>
  );

  return (
    <div>
      {erro && <FeedbackMessage message={erro} type="erro" />}
      {sucesso && <FeedbackMessage message={sucesso} type="sucesso" />}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--neon-magenta)' }}>◈</span>
            CONTROLE FINANCEIRO
          </h3>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ID: {Math.random().toString(36).substr(2, 4).toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>MÊS</label>
            <select className="form-select" value={filtroMes} onChange={(e) => setFiltroMes && setFiltroMes(parseInt(e.target.value))} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {meses.map((mes, idx) => (<option key={mes} value={idx + 1}>{mes}</option>))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>ANO</label>
            <select className="form-select" value={filtroAno} onChange={(e) => setFiltroAno && setFiltroAno(parseInt(e.target.value))} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {anos.map(ano => (<option key={ano} value={ano}>{ano}</option>))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>FILTRO</label>
            <select className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo && setFiltroTipo(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              <option value="todos">[◈] TODOS</option>
              <option value="entrada">[📈] APENAS ENTRADAS</option>
              <option value="saida">[📉] APENAS GASTOS</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {financas.length} TRANSAÇÕES
          </div>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-3" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gradient-cyan)' }} />
          <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '8px' }}>TOTAL ENTRADAS</div>
          <div style={{ fontSize: '28px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-green)', textShadow: '0 0 20px rgba(0, 255, 157, 0.6)' }}>
            {totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {entradas.length} REGISTROS
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gradient-magenta)' }} />
          <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '8px' }}>TOTAL GASTOS</div>
          <div style={{ fontSize: '28px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-red)', textShadow: '0 0 20px rgba(255, 0, 64, 0.6)' }}>
            {totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {saidas.length} REGISTROS
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: saldo >= 0 ? 'var(--gradient-green)' : 'var(--gradient-red)' }} />
          <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '8px' }}>SALDO</div>
          <div style={{ fontSize: '28px', fontFamily: 'Orbitron', fontWeight: 700, color: saldo >= 0 ? 'var(--neon-green)' : 'var(--neon-red)', textShadow: `0 0 20px ${saldo >= 0 ? 'rgba(0, 255, 157, 0.6)' : 'rgba(255, 0, 64, 0.6)'}` }}>
            {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: saldo >= 0 ? 'var(--neon-green)' : 'var(--neon-red)', fontFamily: 'monospace', fontWeight: 600 }}>
            {saldo >= 0 ? '◉ POSITIVO' : '◉ NEGATIVO'}
          </div>
        </div>
      </div>

      {/* Lista de transações */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
          TRANSAÇÕES - {meses[filtroMes - 1]} {filtroAno}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            [{financas.length} REGISTROS]
          </span>
        </h3>

        {financas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px', border: '1px dashed rgba(0, 243, 255, 0.2)', borderRadius: '2px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>💰</div>
            [ NENHUMA TRANSAÇÃO ENCONTRADA ]
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {financas.map((financa) => (
              <div
                key={financa.id}
                className="card"
                style={{
                  marginBottom: 0,
                  padding: '12px 16px',
                  borderLeft: `4px solid ${getValorColor(financa.tipo)}`,
                  position: 'relative',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ fontSize: '20px' }}>{getCategoriaIcon(financa.categoria)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                        {financa.descricao}
                      </div>

                      {/* Banco e tipo de pagamento */}
                      {(financa.banco || financa.tipoPagamento) && (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '4px' }}>
                          {financa.banco && <span>🏦 {financa.banco}</span>}
                          {financa.tipoPagamento && <span>💳 {financa.tipoPagamento}</span>}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ padding: '2px 6px', backgroundColor: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '2px' }}>
                          {financa.categoria ? financa.categoria.toUpperCase() : 'OUTROS'}
                        </span>
                        <span>📅 {financa.data ? financa.data.split('-').reverse().join('/') : '—'}</span>
                        <span style={{ color: getValorColor(financa.tipo), fontWeight: 600 }}>
                          {formatValor(financa.valor, financa.tipo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        const novaDescricao = prompt('Nova descrição:', financa.descricao);
                        if (novaDescricao) handleUpdate(financa.id, { descricao: novaDescricao });
                      }}
                      title="Editar descrição"
                      style={{ padding: '4px 8px', fontSize: '10px', minWidth: '32px' }}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDelete(financa.id)}
                      title="Excluir"
                      style={{ padding: '4px 8px', fontSize: '10px', minWidth: '32px', color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={modalAberto}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="EXCLUSÃO DE TRANSAÇÃO"
        message="Tem certeza que deseja excluir esta transação financeira? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default FinancaList;