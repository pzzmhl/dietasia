import React, { useEffect, useState } from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import KeyIcon from './KeyIcon';

/**
 * Modal Compatto di Selezione Esito Giornaliero:
 * - Opzione 1: Dieta Rispettata (Pietra Verde)
 * - Opzione 2: Non Rispettata (Bottone Nero)
 * - Opzione 3: Sgarro Programmato con Chiave Nera Jolly (se disponibile)
 * - Opzione 4: Azzera registrazione
 */
export default function DaySelectionModal({ 
  isOpen, 
  dateStr, 
  currentStatus = 'neutral', 
  remainingKeys = 0,
  onSelectStatus, 
  onClose 
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !dateStr) return null;

  // Formattazione data in italiano
  const dateObj = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('it-IT', options);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // La chiave è utilizzabile se ce ne sono ancora disponibili OPPURE se questo giorno ha già la chiave
  const canUseKey = remainingKeys > 0 || currentStatus === 'cheat_key';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(6, 18, 30, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '350px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '22px',
          border: '1.5px solid var(--border-dark-blue-light)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(26, 69, 110, 0.35)',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsante Chiusura "✕" in alto a destra */}
        <button
          onClick={onClose}
          aria-label="Chiudi finestra"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 22, 37, 0.8)',
            border: '1px solid rgba(199, 164, 14, 0.4)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          ✕
        </button>

        {/* Intestazione Data Selezionata */}
        <div style={{ textAlign: 'center', marginBottom: '16px', paddingRight: '20px', paddingLeft: '20px' }}>
          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-gothic)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--coraline-gold)',
            marginBottom: '4px'
          }}>
            ✦ Registra Giornata ✦
          </div>
          <h3 style={{
            fontSize: '16px',
            fontFamily: 'var(--font-gothic)',
            color: 'var(--coraline-parchment)',
            fontWeight: 800,
            lineHeight: 1.3
          }}>
            {capitalizedDate}
          </h3>
        </div>

        {/* OPZIONE 1: DIETA RISPETTATA (Verde Smeraldo con Pietra) */}
        <button
          onClick={() => onSelectStatus('success')}
          style={{
            width: '100%',
            padding: '12px 14px',
            marginBottom: '10px',
            backgroundColor: currentStatus === 'success' ? '#15803d' : 'rgba(21, 128, 61, 0.35)',
            border: currentStatus === 'success' ? '2px solid #4ade80' : '1.5px solid rgba(74, 222, 128, 0.4)',
            boxShadow: currentStatus === 'success' ? '0 0 16px rgba(74, 222, 128, 0.45)' : 'none',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src={seeingStoneImg}
            alt="Pietra Verde"
            style={{ width: '26px', height: '26px', objectFit: 'contain' }}
          />
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 800, color: '#86efac' }}>
              Dieta Rispettata
            </div>
            <div style={{ fontSize: '10.5px', color: '#dcfce7', opacity: 0.85 }}>
              Pietra della vista (successo)
            </div>
          </div>
          <span style={{ fontSize: '15px', color: '#4ade80', fontWeight: 900 }}>✓</span>
        </button>

        {/* OPZIONE 2: USA CHIAVE (SGARRO PROGRAMMATO JOLLY) */}
        <button
          onClick={() => onSelectStatus('cheat_key')}
          disabled={!canUseKey}
          style={{
            width: '100%',
            padding: '13px 14px',
            marginBottom: '10px',
            backgroundColor: currentStatus === 'cheat_key' 
              ? 'rgba(120, 99, 67, 0.75)' 
              : canUseKey 
              ? 'rgba(120, 99, 67, 0.35)' 
              : 'rgba(30, 41, 59, 0.3)',
            border: currentStatus === 'cheat_key' 
              ? '2px solid var(--coraline-gold)' 
              : canUseKey 
              ? '1.5px solid var(--border-dark-blue)' 
              : '1px solid #334155',
            boxShadow: currentStatus === 'cheat_key' ? '0 0 16px rgba(199, 164, 14, 0.5)' : 'none',
            borderRadius: '12px',
            color: canUseKey ? '#ffffff' : '#64748b',
            cursor: canUseKey ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: canUseKey ? 1 : 0.65,
            transition: 'all 0.15s ease'
          }}
          onMouseDown={(e) => canUseKey && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => canUseKey && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <KeyIcon size={34} isUsed={!canUseKey && currentStatus !== 'cheat_key'} />
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ 
              fontFamily: 'var(--font-gothic)', 
              fontSize: '13.5px', 
              fontWeight: 800, 
              color: canUseKey ? 'var(--coraline-yellow)' : '#94a3b8' 
            }}>
              Usa Chiave Nera
            </div>
            <div style={{ fontSize: '11px', color: canUseKey ? 'var(--coraline-parchment)' : '#64748b', opacity: 0.85 }}>
              {canUseKey 
                ? `Sgarro programmato (${remainingKeys} rimaste)` 
                : "Chiavi esaurite per questo mese"}
            </div>
          </div>
          <span style={{ fontSize: '15px', color: canUseKey ? 'var(--coraline-yellow)' : '#64748b', fontWeight: 900 }}>🗝️</span>
        </button>

        {/* OPZIONE 3: NON RISPETTATA (Bordeaux Scuro con Bottone Nero) */}
        <button
          onClick={() => onSelectStatus('cheat')}
          style={{
            width: '100%',
            padding: '12px 14px',
            marginBottom: '12px',
            backgroundColor: currentStatus === 'cheat' ? '#450a0a' : 'rgba(69, 10, 10, 0.45)',
            border: currentStatus === 'cheat' ? '2px solid #ef4444' : '1.5px solid rgba(239, 68, 68, 0.4)',
            boxShadow: currentStatus === 'cheat' ? '0 0 16px rgba(220, 38, 38, 0.45)' : 'none',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src={blackButtonImg}
            alt="Bottone Nero"
            style={{ width: '26px', height: '26px', objectFit: 'contain' }}
          />
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 800, color: '#fca5a5' }}>
              Non Rispettata
            </div>
            <div style={{ fontSize: '10.5px', color: '#fee2e2', opacity: 0.85 }}>
              Bottone dell'Altra Madre (sgarro)
            </div>
          </div>
          <span style={{ fontSize: '14px', color: '#f87171', fontWeight: 900 }}>●</span>
        </button>

        {/* OPZIONE 4: AZZERA / CANCELLA STATO */}
        {currentStatus !== 'neutral' && (
          <div style={{ textAlign: 'center', marginTop: '2px' }}>
            <button
              onClick={() => onSelectStatus('neutral')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--coraline-brown)',
                fontSize: '11px',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              Rimuovi registrazione per questo giorno
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
