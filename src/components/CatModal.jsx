import React, { useEffect, useState } from 'react';
import catSuccessImg from '../assets/cat-standing.png';
import catCheatImg from '../assets/cat-cheat.png';

/**
 * Modal Overlay del Tutor Virtuale (Il Gatto Nero di Coraline):
 * - Rimosso qualsiasi titolo testuale ("Gatto dell'Altro Mondo").
 * - Nuvoletta di dialogo gotico-artigianale stile Coraline con cuciture e codina a fumetto.
 * - Animazione elastica a comparsa della nuvoletta.
 * - Immagine del gatto per il successo visibilmente più grande e nitida.
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
  const isLastKey = context === 'last_key';
  const isKey = context === 'key';
  const isSuccess = !isCheat && !isLastKey && !isKey;

  // Immagine del gatto
  const currentCatImg = (isCheat || isLastKey) ? catCheatImg : catSuccessImg;

  // Dimensioni differenziate: il gatto del successo è visibilmente più grande
  const catHeight = (isSuccess || isKey) ? '270px' : '220px';

  // Pulsante personalizzato
  let buttonLabel = "Ho capito, Gatto";
  if (isLastKey) {
    buttonLabel = "Messaggio ricevuto";
  } else if (isCheat) {
    buttonLabel = "Ricevuto, domani niente scuse";
  } else if (isSuccess) {
    buttonLabel = "Continua così ✦";
  }

  // Palette dinamica contestuale
  let borderColor = '#34d399';
  let glowColor = 'rgba(52, 211, 153, 0.4)';
  let buttonBg = '#15803d';
  let buttonTextColor = '#ffffff';
  let bubbleStitchColor = '#34d399';

  if (isLastKey) {
    borderColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.45)';
    buttonBg = '#786343';
    buttonTextColor = '#ffffff';
    bubbleStitchColor = 'var(--coraline-yellow)';
  } else if (isCheat) {
    borderColor = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.4)';
    buttonBg = '#7f1d1d';
    buttonTextColor = '#fee2e2';
    bubbleStitchColor = '#f87171';
  } else if (isKey) {
    borderColor = 'var(--coraline-yellow)';
    glowColor = 'rgba(216, 198, 21, 0.4)';
    buttonBg = 'rgba(120, 99, 67, 0.9)';
    buttonTextColor = '#ffffff';
    bubbleStitchColor = 'var(--coraline-yellow)';
  }

  return (
    <div 
      className="cat-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(4, 14, 24, 0.9)',
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
          maxWidth: '350px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '26px',
          border: `1.5px solid var(--border-dark-blue-light)`,
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px ${glowColor}`,
          padding: '24px 20px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsantino Chiusura rapida "✕" */}
        <button
          onClick={onClose}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--coraline-parchment)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8
          }}
        >
          ✕
        </button>

        {/* NUVOLETTA DI DIALOGO STILE CORALINE (Con cuciture tratteggiate e codina verso il gatto) */}
        <div
          className="coraline-speech-bubble"
          style={{
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(145deg, rgba(8, 26, 44, 0.98) 0%, rgba(4, 16, 28, 0.98) 100%)',
            border: `2px dashed ${bubbleStitchColor}`,
            borderRadius: '20px',
            padding: '16px 18px',
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), inset 0 0 16px rgba(0,0,0,0.5)`,
            marginBottom: '16px',
            animation: 'coralineBubblePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}
        >
          {/* Testo pronunciato dal Gatto */}
          <p
            style={{
              color: 'var(--coraline-parchment)',
              fontSize: '14px',
              lineHeight: 1.5,
              fontStyle: 'italic',
              textAlign: 'center',
              fontWeight: 500,
              margin: 0,
              fontFamily: 'var(--font-body)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
            }}
          >
            «{quote}»
          </p>

          {/* Coda a triangolo della nuvoletta rivolta verso la bocca del gatto */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '11px solid transparent',
              borderRight: '11px solid transparent',
              borderTop: `12px solid ${bubbleStitchColor}`,
              filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '10px solid #061625'
            }}
          />
        </div>

        {/* IMMAGINE DEL GATTO NERO (INGRANDITO PER IL SUCCESSO) */}
        <div
          style={{
            margin: '4px 0 16px 0',
            height: catHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <img
            src={currentCatImg}
            alt="Il Gatto Nero di Coraline"
            style={{
              maxHeight: catHeight,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: `drop-shadow(0 10px 22px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px ${glowColor})`,
              animation: 'catHeadTilt 3s ease-in-out infinite'
            }}
          />
        </div>

        {/* PULSANTE DI CONFERMA / CHIUSURA */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: buttonBg,
            color: buttonTextColor,
            fontFamily: 'var(--font-gothic)',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.8px',
            padding: '13px 18px',
            borderRadius: '14px',
            border: `1.5px solid ${borderColor}`,
            boxShadow: `0 6px 18px ${glowColor}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {buttonLabel}
        </button>
      </div>

      <style>{`
        @keyframes coralineBubblePop {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(10px);
          }
          70% {
            opacity: 1;
            transform: scale(1.03) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes catHeadTilt {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
}
