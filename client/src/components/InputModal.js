import React, { useState, useEffect, useCallback } from 'react';

const InputModal = ({ isOpen, onConfirm, onCancel, title = 'ENTRADA DE DADOS', message = 'Digite:', placeholder = '', inputType = 'text', defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter') onConfirm(value);
  }, [onConfirm, onCancel, value]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="card"
        style={{
          maxWidth: '420px',
          width: '90%',
          padding: '28px',
          position: 'relative',
          border: '1px solid var(--border-color)',
          boxShadow: '0 0 30px rgba(0, 243, 255, 0.2), 0 0 60px rgba(0, 243, 255, 0.1), inset 0 0 20px rgba(0, 243, 255, 0.02)',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderTop: '2px solid var(--brass)', borderRight: '2px solid var(--brass)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '16px', height: '16px', borderBottom: '2px solid var(--brass)', borderLeft: '2px solid var(--brass)', opacity: 0.5 }} />

        {/* Scanline */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 243, 255, 0.03) 50%)', backgroundSize: '100% 4px', opacity: 0.4 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(0, 243, 255, 0.2)' }}>
          <div style={{ fontSize: '20px', color: 'var(--neon-cyan)', textShadow: '0 0 10px rgba(0, 243, 255, 0.5)' }}>◈</div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--neon-cyan)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '2px' }}>[ SISTEMA ]</div>
            <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{message}</p>

        {/* Input */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type={inputType}
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            style={{ fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', letterSpacing: '0.1em' }}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel} style={{ minWidth: '100px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            ❌ CANCELAR
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(value)}
            style={{ minWidth: '100px', fontFamily: 'monospace', letterSpacing: '0.1em' }}
          >
            ✅ CONFIRMAR
          </button>
        </div>

        {/* Status bar */}
        <div style={{ marginTop: '16px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span>ESC → CANCELAR</span>
          <span>ENTER → CONFIRMAR</span>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
