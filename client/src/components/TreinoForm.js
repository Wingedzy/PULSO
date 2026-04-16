import React, { useState } from 'react';
import { treinosAPI } from '../services/api';
import { hojeLocal } from '../utils/data';

const TreinoForm = ({ onTreinoCriado }) => {
  const [formData, setFormData] = useState({
    tipo: 'musculacao',
    exercicios: '',
    data: hojeLocal(),
    duracao: '',
    intensidade: 'media',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const exerciciosList = formData.exercicios
        .split('\n')
        .filter(ex => ex.trim())
        .map(ex => ex.trim());

      const response = await treinosAPI.create({
        ...formData,
        duracao: formData.duracao ? parseInt(formData.duracao) : null,
        exercicios: exerciciosList,
      });

      const resData = response?.data?.data ?? response?.data ?? {};
      onTreinoCriado(resData);
      setFormData({
        tipo: 'musculacao',
        exercicios: '',
        data: hojeLocal(),
        duracao: '',
        intensidade: 'media',
        observacoes: '',
      });
      setMensagem('✓ TREINO REGISTRADO NO SISTEMA');
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
        REGISTRAR TREINO
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {Math.random().toString(36).substr(2,6).toUpperCase()}</span>
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">TIPO DE TREINO *</label>
            <select
              className="form-select"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              style={{ fontFamily: 'monospace' }}
            >
              <option value="musculacao">🏋️ MUSCULAÇÃO</option>
              <option value="cardio">🏃 CARDIO</option>
              <option value="funcional">🤸 FUNCIONAL</option>
              <option value="esportivo">⚽ ESPORTIVO</option>
              <option value="outro">◇ OUTRO</option>
            </select>
          </div>

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
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">DURAÇÃO (min)</label>
            <input
              type="number"
              className="form-input"
              value={formData.duracao}
              onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
              placeholder="► 60"
              min="1"
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">INTENSIDADE</label>
            <select
              className="form-select"
              value={formData.intensidade}
              onChange={(e) => setFormData({ ...formData, intensidade: e.target.value })}
              style={{ fontFamily: 'monospace' }}
            >
              <option value="baixa">⬇ BAIXA</option>
              <option value="media">◉ MÉDIA</option>
              <option value="alta">⬆ ALTA</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">EXERCÍCIOS (um por linha)</label>
          <textarea
            className="form-input"
            value={formData.exercicios}
            onChange={(e) => setFormData({ ...formData, exercicios: e.target.value })}
            placeholder={`► Supino: 4x10\n► Agachamento: 4x12\n► Corrida: 30min`}
            rows="5"
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">OBSERVAÇÕES</label>
          <textarea
            className="form-input"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="► Como foi o treino, dores, progresso, métricas..."
            rows="2"
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? '⏳ PROCESSANDO...' : '◈ REGISTRAR TREINO'}
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

export default TreinoForm;