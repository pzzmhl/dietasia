import React, { useEffect, useState } from 'react';
import CatIllustration from './CatIllustration';

/**
 * Modal Overlay del Tutor Virtuale (Il Gatto Nero di Coraline)
 * Riceve la frase personalizzata rivolta ad Asia, il contesto e la callback onClose.
 */
export default function CatModal({ isOpen, quote, context, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Piccolo ritardo per attivare la transizione CSS di comparsa fluida
      const timer = setTimeout(() => setVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Personalizzazione del pulsante in base alla natura della battuta
  const buttonLabel = context === 'cheat' 
    ? "Ricevuto, domani niente scuse" 
    : "Ho capito, Gatto";

  return (
    <div 
      className="cat-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 6, 15, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="cat-modal-content"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(180deg, #1b1633 0%, #111224 100%)',
          borderRadius: '24px',
          border: '2px dashed #e09f3e',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(224, 159, 62, 0.2)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Etichetta superiore gotica */}
        <div style={{
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#e09f3e',
          fontFamily: 'var(--font-gothic)',
          marginBottom: '6px',
          opacity: 0.9
        }}>
          ✦ Il Gatto dell'Altro Mondo ✦
        </div>

        {/* Nuvoletta di Dialogo (Speech Bubble) */}
        <div 
          className="speech-bubble"
          style={{
            width: '100%',
            marginBottom: '14px',
            backgroundColor: 'rgba(15, 16, 38, 0.95)',
            border: '1.5px dashed rgba(224, 159, 62, 0.5)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
          }}
        >
          <p style={{
            color: '#f8fafc',
            fontSize: '15px',
            lineHeight: '1.45',
            fontStyle: 'italic',
            textAlign: 'center',
            fontWeight: 500
          }}>
            «{quote}»
          </p>
        </div>

        {/* Illustrazione del Gatto Nero */}
        <div style={{ margin: '4px 0 14px 0' }}>
          <CatIllustration size={180} />
        </div>

        {/* Pulsante di conferma stile cucitura di Coraline */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: '#e09f3e',
            color: '#0f1026',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '1px',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '2px dashed #0f1026',
            boxShadow: '0 4px 15px rgba(224, 159, 62, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
