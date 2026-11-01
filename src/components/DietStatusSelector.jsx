import React from 'react';
import BlackButtonIcon from './BlackButtonIcon';

/**
 * Selettore Esito Dieta Giornaliero (3 stati):
 * 1. neutral: Nessuna registrazione
 * 2. success: Dieta seguita (Checkbox stilizzato con spunta dorata)
 * 3. cheat: Dieta non seguita (Bottone Nero di Coraline)
 */
export default function DietStatusSelector({ status, onSelectStatus }) {
  return (
    <div className="stitched-card" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-gothic)', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-yellow)' }}>🪡</span> Esito Dieta del Giorno
        </h3>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {status === 'success' && '✨ Rispettata'}
          {status === 'cheat' && '🧵 Bottone Cucito'}
          {status === 'neutral' && 'In attesa'}
        </span>
      </div>

      {/* Visualizzatore Principale dello Stato */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '22px',
        backgroundColor: 'rgba(15, 16, 38, 0.65)',
        borderRadius: '16px',
        border: '1px solid rgba(224, 159, 62, 0.2)',
        marginBottom: '18px'
      }}>
        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {/* Checkbox Classico Stilizzato Tema Coraline */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#1b1c2b',
              border: '2.5px solid #e09f3e',
              boxShadow: '0 0 16px rgba(224, 159, 62, 0.4), inset 0 0 8px rgba(224, 159, 62, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Spunta dorata ricamata */}
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 4 12 L 9.5 17.5 L 20 6"
                  stroke="#e09f3e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dettaglio impuntura interna bianca */}
                <path
                  d="M 4 12 L 9.5 17.5 L 20 6"
                  stroke="#f8fafc"
                  strokeWidth="1.2"
                  strokeDasharray="2 1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e09f3e', fontFamily: 'var(--font-gothic)' }}>
              Dieta Seguita Perfettamente
            </span>
          </div>
        )}

        {status === 'cheat' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {/* Bottone Nero di Coraline */}
            <div className="animate-subtle-pulse">
              <BlackButtonIcon size={64} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', fontFamily: 'var(--font-gothic)' }}>
              Tentazione dell'Altra Madre (Sgarro)
            </span>
          </div>
        )}

        {status === 'neutral' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              border: '2px dashed #4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '22px'
            }}>
              ?
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Nessun esito segnato per oggi
            </span>
          </div>
        )}
      </div>

      {/* Pulsanti Rapidi di Selezione */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={() => onSelectStatus('success')}
          style={{
            padding: '13px 10px',
            backgroundColor: status === 'success' ? '#e09f3e' : 'rgba(35, 25, 66, 0.8)',
            color: status === 'success' ? '#0f1026' : '#e2e8f0',
            border: status === 'success' ? '2px solid #f4ba40' : '1px dashed rgba(224, 159, 62, 0.35)',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'var(--font-gothic)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>✓</span> Dieta Seguita
        </button>

        <button
          onClick={() => onSelectStatus('cheat')}
          style={{
            padding: '13px 10px',
            backgroundColor: status === 'cheat' ? '#35121b' : 'rgba(35, 25, 66, 0.8)',
            color: status === 'cheat' ? '#fca5a5' : '#e2e8f0',
            border: status === 'cheat' ? '2px solid #ef4444' : '1px dashed rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'var(--font-gothic)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#000', border: '1px solid #94a3b8' }} /> Sgarrato
        </button>
      </div>

      {/* Opzione reset se già compilato */}
      {status !== 'neutral' && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={() => onSelectStatus('neutral')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '11px',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            Azzera stato del giorno
          </button>
        </div>
      )}
    </div>
  );
}
