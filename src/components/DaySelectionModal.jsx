import React, { useEffect, useState } from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import keyImg from '../assets/key.png';

/**
 * Modal Unificato e Chiaro di Selezione Esito Giornaliero:
 * - Intestazione con data estesa e domanda di guida.
 * - 3 Schede unificate, chiare e leggibili con icona, titolo esplicito e descrizione.
 *   1. Pietra Verde -> Dieta Rispettata
 *   2. Chiave Nera -> Sgarro Jolly (con conteggio chiavi rimanenti)
 *   3. Bottone Nero -> Dieta Non Rispettata (sgarro non programmato)
 * - Tasto di ripristino/azzeramento chiaro e accessibile.
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

  // Formattazione data in italiano
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
          maxWidth: '350px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-dark-blue-light)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(26, 69, 110, 0.4)',
          padding: '22px 18px 18px 18px',
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
        {/* Pulsante Chiusura "✕" in alto a destra */}
        <button
          onClick={onClose}
          aria-label="Chiudi finestra"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 22, 37, 0.85)',
            border: '1px solid var(--border-dark-blue)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700,
            touchAction: 'manipulation'
          }}
        >
          ✕
        </button>

        {/* Intestazione Data & Istruzione */}
        <div style={{ textAlign: 'center', marginBottom: '16px', paddingRight: '22px', paddingLeft: '22px' }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-gothic)',
            color: 'var(--coraline-parchment)',
            fontWeight: 800,
            lineHeight: 1.3,
            margin: '0 0 4px 0'
          }}>
            {capitalizedDate}
          </h3>
          <p style={{
            fontSize: '11.5px',
            color: 'var(--coraline-brown)',
            fontStyle: 'italic',
            margin: 0
          }}>
            Come è andata questa giornata?
          </p>
        </div>

        {/* OPZIONI DI REGISTRAZIONE: 3 SCHEDE CHIARE, UNIFICATE E COERENTI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>

          {/* 1. DIETA RISPETTATA (PIETRA VERDE) */}
          <button
            onClick={() => onSelectStatus('success')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: currentStatus === 'success' 
                ? 'rgba(18, 48, 35, 0.9)' 
                : 'rgba(6, 22, 37, 0.75)',
              border: currentStatus === 'success' 
                ? '2px solid #4ade80' 
                : '1.5px solid var(--border-dark-blue)',
              boxShadow: currentStatus === 'success' 
                ? '0 0 16px rgba(74, 222, 128, 0.35), inset 0 0 12px rgba(21, 128, 61, 0.3)' 
                : '0 3px 10px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              textAlign: 'left',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={seeingStoneImg}
                alt="Pietra Verde"
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.5))'
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-coraline)',
                fontSize: '12.5px',
                color: '#4ade80',
                letterSpacing: '0.6px',
                marginBottom: '2px'
              }}>
                Dieta Rispettata
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--coraline-parchment)',
                opacity: 0.85
              }}>
                Nessun passo falso, obiettivo raggiunto
              </div>
            </div>

            {currentStatus === 'success' && (
              <span style={{ fontSize: '15px', color: '#4ade80', fontWeight: 900 }}>✓</span>
            )}
          </button>

          {/* 2. SGARRO JOLLY (CHIAVE NERA) */}
          <button
            onClick={() => onSelectStatus('cheat_key')}
            disabled={!canUseKey}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: currentStatus === 'cheat_key' 
                ? 'rgba(48, 38, 22, 0.9)' 
                : canUseKey 
                ? 'rgba(6, 22, 37, 0.75)' 
                : 'rgba(20, 30, 45, 0.3)',
              border: currentStatus === 'cheat_key' 
                ? '2px solid var(--coraline-yellow)' 
                : canUseKey 
                ? '1.5px solid var(--border-dark-blue)' 
                : '1px solid #1e293b',
              boxShadow: currentStatus === 'cheat_key' 
                ? '0 0 16px rgba(216, 198, 21, 0.35), inset 0 0 12px rgba(120, 99, 67, 0.3)' 
                : '0 3px 10px rgba(0, 0, 0, 0.4)',
              cursor: canUseKey ? 'pointer' : 'not-allowed',
              opacity: canUseKey ? 1 : 0.4,
              textAlign: 'left',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={keyImg}
                alt="Chiave Nera Jolly"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8))'
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-coraline)',
                fontSize: '12.5px',
                color: 'var(--coraline-yellow)',
                letterSpacing: '0.6px',
                marginBottom: '2px'
              }}>
                Sgarro con Chiave Jolly
              </div>
              <div style={{
                fontSize: '11px',
                color: canUseKey ? 'var(--coraline-parchment)' : '#94a3b8',
                opacity: 0.85
              }}>
                {canUseKey 
                  ? `${remainingKeys} ${remainingKeys === 1 ? 'chiave disponibile' : 'chiavi disponibili'} questo mese`
                  : 'Chiavi esaurite per questo mese'}
              </div>
            </div>

            {currentStatus === 'cheat_key' && (
              <span style={{ fontSize: '15px', color: 'var(--coraline-yellow)', fontWeight: 900 }}>✓</span>
            )}
          </button>

          {/* 3. DIETA NON RISPETTATA (BOTTONE NERO) */}
          <button
            onClick={() => onSelectStatus('cheat')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: currentStatus === 'cheat' 
                ? 'rgba(48, 18, 22, 0.9)' 
                : 'rgba(6, 22, 37, 0.75)',
              border: currentStatus === 'cheat' 
                ? '2px solid #ef4444' 
                : '1.5px solid var(--border-dark-blue)',
              boxShadow: currentStatus === 'cheat' 
                ? '0 0 16px rgba(239, 68, 68, 0.35), inset 0 0 12px rgba(69, 10, 10, 0.3)' 
                : '0 3px 10px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              textAlign: 'left',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={blackButtonImg}
                alt="Bottone Nero"
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.95))'
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-coraline)',
                fontSize: '12.5px',
                color: '#f87171',
                letterSpacing: '0.6px',
                marginBottom: '2px'
              }}>
                Dieta Non Rispettata
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--coraline-parchment)',
                opacity: 0.85
              }}>
                Sgarro non programmato senza chiave
              </div>
            </div>

            {currentStatus === 'cheat' && (
              <span style={{ fontSize: '15px', color: '#f87171', fontWeight: 900 }}>✓</span>
            )}
          </button>
        </div>

        {/* TASTO DI AZZERAMENTO / CANCELLA STATO (SE GIÀ REGISTRATO) */}
        {currentStatus !== 'neutral' && (
          <div style={{ textAlign: 'center', paddingTop: '4px' }}>
            <button
              onClick={() => onSelectStatus('neutral')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-dark-blue)',
                borderRadius: '10px',
                color: 'var(--coraline-parchment)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '6px 14px',
                touchAction: 'manipulation',
                opacity: 0.85
              }}
            >
              ↺ Cancella selezione (torna neutro)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
