import React, { useEffect, useState } from 'react';
import catSuccessImg from '../assets/cat-success.png';
import catCheatImg from '../assets/cat-cheat.png';

/**
 * Modal Overlay del Tutor Virtuale (Il Gatto Nero di Coraline)
 * Adattato con la Palette Ufficiale Coraline:
 * - #0d2c49 (Navy Notte)
 * - #ddcab7 (Pergamena per testi e fumetto)
 * - #c7a40e (Oro impermeabile)
 * - #786343 (Marrone vintage)
 */
export default function CatModal({ isOpen, quote, context, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCheat = context === 'cheat';
  const currentCatImg = isCheat ? catCheatImg : catSuccessImg;
  const buttonLabel = isCheat 
    ? "Ricevuto, domani niente scuse" 
    : "Ho capito, Gatto";

  // Palette dinamica contestuale
  const borderColor = isCheat ? '#ef4444' : '#34d399';
  const glowColor = isCheat ? 'rgba(239, 68, 68, 0.35)' : 'rgba(52, 211, 153, 0.35)';
  const titleColor = isCheat ? '#f87171' : '#4ade80';
  const buttonBg = isCheat ? '#7f1d1d' : '#15803d';
  const buttonTextColor = isCheat ? '#fee2e2' : '#ffffff';

  return (
    <div 
      className="cat-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(6, 18, 30, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="cat-modal-content"
        style={{
          width: '100%',
          maxWidth: '360px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '24px',
          border: `2px dashed ${borderColor}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px ${glowColor}`,
          padding: '22px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Etichetta superiore */}
        <div style={{
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: titleColor,
          fontFamily: 'var(--font-gothic)',
          marginBottom: '8px',
          fontWeight: 700
        }}>
          ✦ Il Gatto dell'Altro Mondo ✦
        </div>

        {/* Nuvoletta di Dialogo (Speech Bubble) in colore Pergamena */}
        <div 
          className="speech-bubble"
          style={{
            width: '100%',
            marginBottom: '10px',
            backgroundColor: 'rgba(6, 22, 37, 0.95)',
            border: `1.5px dashed ${borderColor}`,
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)'
          }}
        >
          <p style={{
            color: 'var(--coraline-parchment)',
            fontSize: '14px',
            lineHeight: '1.45',
            fontStyle: 'italic',
            textAlign: 'center',
            fontWeight: 500
          }}>
            «{quote}»
          </p>
        </div>

        {/* Immagine Ufficiale del Gatto Nero */}
        <div style={{ 
          margin: '4px 0 12px 0',
          height: '210px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={currentCatImg}
            alt="Il Gatto Nero di Coraline"
            style={{
              maxHeight: '210px',
              maxWidth: '220px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.9))'
            }}
          />
        </div>

        {/* Pulsante di conferma stile Coraline */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: buttonBg,
            color: buttonTextColor,
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.8px',
            padding: '13px 16px',
            borderRadius: '12px',
            border: `1.5px dashed ${borderColor}`,
            boxShadow: `0 4px 15px ${glowColor}`,
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
