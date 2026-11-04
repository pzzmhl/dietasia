import React from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary ha catturato un errore:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      STORAGE_KEYS.LEGACY_OBSOLETE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0d2c49',
          color: '#ddcab7',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '360px',
            backgroundColor: 'rgba(6, 22, 37, 0.95)',
            border: '2px solid #d8c615',
            borderRadius: '20px',
            padding: '24px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🪡</div>
            <h2 style={{ color: '#d8c615', margin: '0 0 10px 0', fontSize: '18px' }}>
              Piccolo intoppo nel tunnel di Coraline
            </h2>
            <p style={{ fontSize: '13px', lineHeight: 1.4, margin: '0 0 18px 0', color: '#ddcab7' }}>
              Si è verificato un errore temporaneo nel caricamento dell'interfaccia.
            </p>
            {this.state.error && (
              <pre style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#ef4444',
                overflowX: 'auto',
                textAlign: 'left',
                marginBottom: '16px',
                maxHeight: '120px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#d8c615',
                color: '#061625',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Ricarica Applicazione
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

