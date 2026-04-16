import React, { useState } from 'react';
import { estudosAPI } from '../services/api';
import { hojeLocal } from '../utils/data';

const EstudoForm = ({ onEstudoCriado }) => {
  const [formData, setFormData] = useState({
    assunto: '',
    topico: '',
    duracao_planejada: '',
    data: hojeLocal(),
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const response = await estudosAPI.create({
        ...formData,
        duracao_planejada: formData.duracao_planejada ? parseInt(formData.duracao_planejada) : null,
      });

      const resData = response?.data?.data ?? response?.data ?? {};
      onEstudoCriado(resData);
      setFormData({
        assunto: '',
        topico: '',
        duracao_planejada: '',
        data: hojeLocal(),
        observacoes: '',
      });
      setMensagem('✓ SESSÃO DE ESTUDOS REGISTRADA');
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
        PLANEJADOR DE ESTUDOS
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {Math.random().toString(36).substr(2,6).toUpperCase()}</span>
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">ASSUNTO *</label>
          <input
            type="text"
            className="form-input"
            value={formData.assunto}
            onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
            placeholder="► Ex: Programação, Matemática, Inglês..."
            required
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">TÓPICO ESPECÍFICO</label>
          <input
            type="text"
            className="form-input"
            value={formData.topico}
            onChange={(e) => setFormData({ ...formData, topico: e.target.value })}
            placeholder="► Ex: React Hooks, Cálculo Integral, Gramática"
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
            <label className="form-label">DURAÇÃO PLANEJADA (min)</label>
            <input
              type="number"
              className="form-input"
              value={formData.duracao_planejada}
              onChange={(e) => setFormData({ ...formData, duracao_planejada: e.target.value })}
              placeholder="► 60"
              min="1"
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">OBSERVAÇÕES</label>
          <textarea
            className="form-input"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="► Metas, recursos, links, anotações..."
            rows="3"
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? '⏳ PROCESSANDO...' : '◈ REGISTRAR ESTUDO'}
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

export default EstudoForm;