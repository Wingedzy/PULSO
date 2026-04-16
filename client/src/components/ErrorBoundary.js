import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERRO CAPTURADO:', error);
    console.error('📋 Stack:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{
          padding: '40px',
          textAlign: 'center',
          border: '2px solid var(--neon-red)',
          backgroundColor: 'rgba(255, 0, 64, 0.05)'
        }}>
          <h2 style={{ color: 'var(--neon-red)', marginBottom: '16px' }}>⚠ SISTEMA FALHOU</h2>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '8px' }}>
            ERRO: {this.state.error?.toString()}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px' }}
          >
            ◈ RECARREGAR SISTEMA
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;