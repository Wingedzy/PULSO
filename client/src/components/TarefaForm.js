import React, { useState } from 'react';
import { tarefasAPI } from '../services/api';
import { hojeLocal } from '../utils/data';

const TarefaForm = ({ onTarefaCriada }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: hojeLocal(),
    prioridade: 3,
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMensagem('');

  if (!formData.titulo.trim()) {
    setMensagem('✗ ERRO: TÍTULO É OBRIGATÓRIO');
    setLoading(false);
    return;
  }

  if (parseInt(formData.prioridade) < 1 || parseInt(formData.prioridade) > 5) {
    setMensagem('✗ ERRO: PRIORIDADE INVÁLIDA');
    setLoading(false);
    return;
  }
    

    try {
      const response = await tarefasAPI.create({
        ...formData,
        prioridade: parseInt(formData.prioridade),
        tags: formData.tags.split(',').map(tag => tag.trim()),
      });

      const resData = response?.data?.data ?? response?.data ?? {};
      onTarefaCriada(resData.tarefa, resData.organizacao);
      setFormData({
        titulo: '',
        descricao: '',
        data: hojeLocal(),
        prioridade: 3,
        tags: '',
      });
      setMensagem(`✓ TAREFA CRIADA // ${resData.organizacao?.sugestao || ''}`);
    } catch (error) {
      setMensagem(`✗ ERRO: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
        ADICIONAR NOVA TAREFA
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {Math.random().toString(36).substr(2,6).toUpperCase()}</span>
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">TÍTULO</label>
          <input
            type="text"
            className="form-input"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="► O que precisa ser feito?"
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">DESCRIÇÃO</label>
          <textarea
            className="form-input"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="► Detalhes adicionais, contexto, observações..."
            rows="3"
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">DATA</label>
            <input
              type="date"
              className="form-input"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PRIORIDADE</label>
            <select
              className="form-select"
              value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: parseInt(e.target.value) })}
              style={{ fontFamily: 'monospace' }}
            >
              <option value={1}>[🔴] NÍVEL 01 // URGENTE</option>
              <option value={2}>[🟡] NÍVEL 02 // IMPORTANTE</option>
              <option value={3}>[🟢] NÍVEL 03 // NORMAL</option>
              <option value={4}>[🔵] NÍVEL 04 // BAIXA</option>
              <option value={5}>[⚪] NÍVEL 05 // MUITO BAIXA</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">TAGS</label>
          <input
            type="text"
            className="form-input"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="trabalho, projeto, reunião..."
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? '⏳ PROCESSANDO...' : '◈ REGISTRAR TAREFA'}
        </button>

        {mensagem && (
          <div className={`alert ${mensagem.includes('✓') ? 'alert-success' : 'alert-warning'}`} style={{ marginTop: '16px' }}>
            <code style={{ fontSize: '12px', fontFamily: 'monospace', display: 'block' }}>
              {mensagem}
            </code>
          </div>
        )}
      </form>
    </div>
  );
};

export default TarefaForm;