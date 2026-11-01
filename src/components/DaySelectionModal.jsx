import React, { useEffect, useState } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import keyImg from '../assets/key.webp';

/**
 * Modal Compatto e Iconico per la Registrazione Esito Giornaliero:
 * - Intestazione con data estesa e testo "Come è andata questa giornata?".
 * - 4 Riquadri in griglia 2x2 con sole immagini dei simboli:
 *   1. In alto a sinistra: Dieta Rispettata (Pietra verde)
 *   2. In alto a destra: Dieta Non Rispettata (Bottone nero)
 *   3. In basso a sinistra: Sgarro con Chiave (Chiave jolly)
 *   4. In basso a destra: X molto anonima per chiudere la finestra
 * - Nessun pulsante X in alto a destra.
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
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !dateStr) return null;

  // Formattazione data in italiano (es. Sabato 28 Novembre 2026)
  const dateObj = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('it-IT', options);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // La chiave è utilizzabile se ce ne sono disponibili o se è già stata assegnata a questo giorno
  const canUseKey = remainingKeys > 0 || currentStatus === 'cheat_key';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(3, 10, 18, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
        willChange: 'opacity',
        transform: 'translateZ(0)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '290px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-dark-blue-light)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(26, 69, 110, 0.4)',
          padding: '20px 16px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transform: visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 14px, 0) scale(0.96)',
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Intestazione Data & Domanda */}
        <div style={{ textAlign: 'center', marginBottom: '16px', padding: '0 6px' }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-body)',
            color: 'var(--coraline-parchment)',
            fontWeight: 700,
            lineHeight: 1.3,
            margin: '0 0 4px 0'
          }}>
            {capitalizedDate}
          </h3>
          <p style={{
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            color: 'var(--coraline-brown)',
            margin: 0
          }}>
            Come è andata questa giornata?
          </p>
        </div>

        {/* GRIGLIA 2x2 DEI 4 RIQUADRI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '6px'
        }}>
          {/* 1. IN ALTO A SINISTRA: DIETA RISPETTATA (PIETRA VERDE) */}
          <button
            type="button"
            onClick={() => onSelectStatus(currentStatus === 'success' ? 'neutral' : 'success')}
            aria-label="Dieta Rispettata"
            title="Dieta Rispettata"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: currentStatus === 'success' 
                ? 'rgba(18, 48, 35, 0.92)' 
                : 'rgba(6, 22, 37, 0.8)',
              border: currentStatus === 'success' 
                ? '2px solid #4ade80' 
                : '1.5px solid var(--border-dark-blue)',
              boxShadow: currentStatus === 'success' 
                ? '0 0 16px rgba(74, 222, 128, 0.4), inset 0 0 12px rgba(21, 128, 61, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              position: 'relative',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={seeingStoneImg}
              alt="Dieta Rispettata"
              style={{
                width: '54px',
                height: '54px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 8px rgba(16, 185, 129, 0.55))'
              }}
            />
            {currentStatus === 'success' && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '14px',
                color: '#4ade80',
                fontWeight: 900
              }}>✓</span>
            )}
          </button>

          {/* 2. IN ALTO A DESTRA: DIETA NON RISPETTATA (BOTTONE NERO) */}
          <button
            type="button"
            onClick={() => onSelectStatus(currentStatus === 'cheat' ? 'neutral' : 'cheat')}
            aria-label="Dieta Non Rispettata"
            title="Dieta Non Rispettata"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: currentStatus === 'cheat' 
                ? 'rgba(48, 18, 22, 0.92)' 
                : 'rgba(6, 22, 37, 0.8)',
              border: currentStatus === 'cheat' 
                ? '2px solid #ef4444' 
                : '1.5px solid var(--border-dark-blue)',
              boxShadow: currentStatus === 'cheat' 
                ? '0 0 16px rgba(239, 68, 68, 0.4), inset 0 0 12px rgba(69, 10, 10, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              position: 'relative',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={blackButtonImg}
              alt="Dieta Non Rispettata"
              style={{
                width: '52px',
                height: '52px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.95))'
              }}
            />
            {currentStatus === 'cheat' && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '14px',
                color: '#ef4444',
                fontWeight: 900
              }}>✓</span>
            )}
          </button>

          {/* 3. IN BASSO A SINISTRA: SGARRO CON CHIAVE */}
          <button
            type="button"
            onClick={() => onSelectStatus(currentStatus === 'cheat_key' ? 'neutral' : 'cheat_key')}
            disabled={!canUseKey}
            aria-label="Sgarro con Chiave"
            title="Sgarro con Chiave"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: currentStatus === 'cheat_key' 
                ? 'rgba(48, 38, 22, 0.92)' 
                : canUseKey 
                ? 'rgba(6, 22, 37, 0.8)' 
                : 'rgba(20, 30, 45, 0.3)',
              border: currentStatus === 'cheat_key' 
                ? '2px solid var(--coraline-yellow)' 
                : canUseKey 
                ? '1.5px solid var(--border-dark-blue)' 
                : '1px solid #1e293b',
              boxShadow: currentStatus === 'cheat_key' 
                ? '0 0 16px rgba(216, 198, 21, 0.4), inset 0 0 12px rgba(120, 99, 67, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
              cursor: canUseKey ? 'pointer' : 'not-allowed',
              opacity: canUseKey ? 1 : 0.35,
              position: 'relative',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={keyImg}
              alt="Sgarro con Chiave"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.85))'
              }}
            />
            {currentStatus === 'cheat_key' && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '14px',
                color: 'var(--coraline-yellow)',
                fontWeight: 900
              }}>✓</span>
            )}
          </button>

          {/* 4. IN BASSO A DESTRA: X ANONIMA PER CHIUDERE */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra"
            title="Chiudi"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: 'rgba(6, 22, 37, 0.55)',
              border: '1.5px solid rgba(221, 202, 183, 0.18)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              fontSize: '26px',
              fontWeight: 300,
              color: 'rgba(221, 202, 183, 0.45)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: 1
            }}>
              ✕
            </span>
          </button>
        </div>

        {/* TASTO DI AZZERAMENTO / CANCELLA STATO (SE GIÀ REGISTRATO) */}
        {currentStatus !== 'neutral' && (
          <div style={{ textAlign: 'center', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => onSelectStatus('neutral')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-dark-blue)',
                borderRadius: '10px',
                color: 'var(--coraline-parchment)',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                padding: '6px 14px',
                touchAction: 'manipulation',
                opacity: 0.85
              }}
            >
              ↺ Cancella selezione
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
