import React, { useEffect, useState } from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import KeyIcon from './KeyIcon';

/**
 * Modal Compatto di Selezione Esito Giornaliero:
 * - Data del giorno in intestazione con chiusura "✕".
 * - A SINISTRA: L'Anello / Pietra Verde (successo).
 * - A DESTRA: Il Bottone Nero con il rosso (sgarro).
 * - SOTTO: In giallo la Chiave Nera Jolly (leggermente più piccola come opzione secondaria).
 * - Nessun testo descrittivo: solo le immagini pure ad alto contrasto.
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
        transition: 'opacity 0.18s ease-out',
        willChange: 'opacity',
        transform: 'translateZ(0)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '320px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-dark-blue-light)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 20px rgba(26, 69, 110, 0.35)',
          padding: '20px 18px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transform: visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 16px, 0) scale(0.96)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform'
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

        {/* Intestazione Data del Giorno */}
        <div style={{ textAlign: 'center', marginBottom: '18px', paddingRight: '20px', paddingLeft: '20px' }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-gothic)',
            color: 'var(--coraline-parchment)',
            fontWeight: 800,
            lineHeight: 1.3
          }}>
            {capitalizedDate}
          </h3>
        </div>

        {/* RIGA SUPERIORE: A SINISTRA PIETRA VERDE, A DESTRA BOTTONE NERO CON IL ROSSO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {/* A SINISTRA: ANELLO / PIETRA VERDE */}
          <button
            onClick={() => onSelectStatus('success')}
            aria-label="Dieta Rispettata"
            title="Dieta Rispettata"
            style={{
              aspectRatio: '1',
              width: '100%',
              backgroundColor: currentStatus === 'success' ? '#15803d' : 'rgba(21, 128, 61, 0.35)',
              border: currentStatus === 'success' ? '2.5px solid #4ade80' : '1.5px solid rgba(52, 211, 153, 0.45)',
              boxShadow: currentStatus === 'success' 
                ? '0 0 18px rgba(74, 222, 128, 0.55)' 
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              touchAction: 'manipulation'
            }}
          >
            <img
              src={seeingStoneImg}
              alt="Pietra Verde"
              loading="eager"
              decoding="async"
              style={{
                width: '54px',
                height: '54px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 8px rgba(16, 185, 129, 0.6))',
                pointerEvents: 'none'
              }}
            />
          </button>

          {/* A DESTRA: BOTTONE NERO CON IL ROSSO */}
          <button
            onClick={() => onSelectStatus('cheat')}
            aria-label="Dieta Non Rispettata"
            title="Non Rispettata (Sgarrato)"
            style={{
              aspectRatio: '1',
              width: '100%',
              backgroundColor: currentStatus === 'cheat' ? '#450a0a' : 'rgba(69, 10, 10, 0.45)',
              border: currentStatus === 'cheat' ? '2.5px solid #ef4444' : '1.5px solid rgba(239, 68, 68, 0.45)',
              boxShadow: currentStatus === 'cheat' 
                ? '0 0 18px rgba(220, 38, 38, 0.55)' 
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              touchAction: 'manipulation'
            }}
          >
            <img
              src={blackButtonImg}
              alt="Bottone Nero"
              loading="eager"
              decoding="async"
              style={{
                width: '54px',
                height: '54px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.95))',
                pointerEvents: 'none'
              }}
            />
          </button>
        </div>

        {/* RIGA INFERIORE: SOTTO IN GIALLO LA CHIAVE (LEGGERMENTE PIÙ PICCOLA) */}
        <button
          onClick={() => onSelectStatus('cheat_key')}
          disabled={!canUseKey}
          aria-label="Usa Chiave Nera"
          title={canUseKey ? "Usa Chiave Nera (Sgarro Programmato)" : "Chiavi esaurite"}
          style={{
            width: '100%',
            height: '54px',
            backgroundColor: currentStatus === 'cheat_key' 
              ? 'rgba(120, 99, 67, 0.75)' 
              : canUseKey 
              ? 'rgba(6, 22, 37, 0.85)' 
              : 'rgba(20, 30, 45, 0.4)',
            border: currentStatus === 'cheat_key' 
              ? '2px solid var(--coraline-yellow)' 
              : canUseKey 
              ? '1.5px solid var(--coraline-gold)' 
              : '1px solid #334155',
            boxShadow: currentStatus === 'cheat_key' 
              ? '0 0 16px rgba(216, 198, 21, 0.5)' 
              : canUseKey 
              ? '0 3px 10px rgba(0, 0, 0, 0.35)' 
              : 'none',
            borderRadius: '14px',
            cursor: canUseKey ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canUseKey ? 1 : 0.35,
            marginBottom: currentStatus !== 'neutral' ? '10px' : '2px',
            touchAction: 'manipulation'
          }}
        >
          {/* Chiave Nera Jolly: leggermente più piccola (36px) */}
          <KeyIcon size={36} isUsed={!canUseKey && currentStatus !== 'cheat_key'} />
        </button>

        {/* OPZIONE AZZERA / CANCELLA STATO */}
        {currentStatus !== 'neutral' && (
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button
              onClick={() => onSelectStatus('neutral')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--coraline-brown)',
                fontSize: '11px',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '4px 8px',
                touchAction: 'manipulation'
              }}
            >
              Azzera esito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
