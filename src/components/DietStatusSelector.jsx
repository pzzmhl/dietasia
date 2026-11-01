import React from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';

/**
 * Selettore Esito Dieta Giornaliero:
 * - Palette Coraline con contrasto pergamena/navy (#0d2c49, #ddcab7, #c7a40e, #786343).
 * - Tasto Verde per Pietra della Vista (Rispettata).
 * - Tasto Bordeaux Scuro per Bottone Nero (Non Rispettata).
 */
export default function DietStatusSelector({ status, onSelectStatus }) {
  return (
    <div className="stitched-card" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-gothic)', fontSize: '15px', color: 'var(--coraline-parchment)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--coraline-gold)' }}>🪡</span> Esito Dieta del Giorno
        </h3>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          {status === 'success' && <span style={{ color: '#4ade80' }}>✨ Pietra Verde</span>}
          {status === 'cheat' && <span style={{ color: '#f87171' }}>🧵 Bottone Cucito</span>}
          {status === 'neutral' && <span style={{ color: 'var(--coraline-brown)' }}>In attesa</span>}
        </span>
      </div>

      {/* Visualizzatore Principale dello Stato */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: status === 'success' 
          ? 'rgba(21, 128, 61, 0.25)' 
          : status === 'cheat' 
          ? 'rgba(69, 10, 10, 0.4)' 
          : 'rgba(6, 22, 37, 0.75)',
        borderRadius: '16px',
        border: status === 'success' 
          ? '1.5px solid rgba(52, 211, 153, 0.4)' 
          : status === 'cheat' 
          ? '1.5px solid rgba(220, 38, 38, 0.4)' 
          : '1px solid rgba(199, 164, 14, 0.25)',
        marginBottom: '18px',
        transition: 'all 0.25s ease'
      }}>
        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '74px',
              height: '74px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 14px rgba(16, 185, 129, 0.5))'
            }}>
              <img
                src={seeingStoneImg}
                alt="Pietra della Vista - Dieta Rispettata"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', fontFamily: 'var(--font-gothic)', letterSpacing: '0.5px' }}>
              Pietra della Vista • Dieta Rispettata
            </span>
          </div>
        )}

        {status === 'cheat' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '74px',
              height: '74px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.9))'
            }} className="animate-subtle-pulse">
              <img
                src={blackButtonImg}
                alt="Bottone Nero - Sgarro"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', fontFamily: 'var(--font-gothic)', letterSpacing: '0.5px' }}>
              Bottone dell'Altra Madre • Sgarrato
            </span>
          </div>
        )}

        {status === 'neutral' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              border: '2px dashed var(--coraline-brown)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--coraline-brown)',
              fontSize: '22px'
            }}>
              ?
            </div>
            <span style={{ fontSize: '12px', color: 'var(--coraline-parchment)', opacity: 0.75 }}>
              Nessun esito segnato per questo giorno
            </span>
          </div>
        )}
      </div>

      {/* Pulsanti Rapidi di Selezione */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* PULSANTE VERDE: DIETA RISPETTATA */}
        <button
          onClick={() => onSelectStatus('success')}
          style={{
            padding: '13px 8px',
            backgroundColor: status === 'success' ? '#15803d' : 'rgba(21, 128, 61, 0.45)',
            color: status === 'success' ? '#ffffff' : '#86efac',
            border: status === 'success' ? '2px solid #4ade80' : '1.5px dashed rgba(74, 222, 128, 0.4)',
            boxShadow: status === 'success' ? '0 0 16px rgba(74, 222, 128, 0.45)' : 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'var(--font-gothic)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.18s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src={seeingStoneImg}
            alt=""
            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
          <span>Rispettata</span>
        </button>

        {/* PULSANTE BORDEAUX SCURO: NON RISPETTATA (SGARRATO) */}
        <button
          onClick={() => onSelectStatus('cheat')}
          style={{
            padding: '13px 8px',
            backgroundColor: status === 'cheat' ? '#450a0a' : 'rgba(69, 10, 10, 0.55)',
            color: status === 'cheat' ? '#fee2e2' : '#fca5a5',
            border: status === 'cheat' ? '2px solid #ef4444' : '1.5px dashed rgba(239, 68, 68, 0.4)',
            boxShadow: status === 'cheat' ? '0 0 16px rgba(220, 38, 38, 0.45)' : 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'var(--font-gothic)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.18s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src={blackButtonImg}
            alt=""
            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
          <span>Non Rispettata</span>
        </button>
      </div>

      {/* Opzione reset se già compilato */}
      {status !== 'neutral' && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            onClick={() => onSelectStatus('neutral')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--coraline-brown)',
              fontSize: '11px',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            Azzera esito del giorno
          </button>
        </div>
      )}
    </div>
  );
}
