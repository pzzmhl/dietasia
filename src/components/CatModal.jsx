import React, { useEffect, useState } from 'react';
import catSuccessImg from '../assets/cat-success.webp';     // Dieta Corretta / Rispettata (Pietra Verde) -> Gatto con occhioni azzurri
import catFailImg from '../assets/cat-fail.webp';           // Dieta Scorretta / Non Seguita (Bottone Nero) -> Gatto scettico
import catCheatKeyImg from '../assets/cat-cheat-key.webp';  // Sgarro con Chiave Jolly -> Gatto con topolino circense in bocca
import catModalBg from '../assets/cat-modal-bg.webp';
import CoralineCatCloud from './CoralineCatCloud';

/**
 * Modal Overlay del Tutor Virtuale (Il Gatto Nero di Coraline):
 * - Dieta Corretta (Pietra Verde): Gatto con occhioni azzurri (success)
 * - Dieta Scorretta / Non Seguita (Bottone Nero): Gatto scettico con occhi socchiusi (cheat)
 * - Sgarro Programmato (Chiave Nera Jolly): Gatto con topolino in bocca (key / last_key)
 */
export default function CatModal({ isOpen, quote, context, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCheat = context === 'cheat';
  const isLastKey = context === 'last_key';
  const isKey = context === 'key';
  const isCheatKey = isKey || isLastKey;
  const isSuccess = !isCheat && !isCheatKey;

  // Immagine del gatto contestuale
  let currentCatImg = catSuccessImg;
  if (isCheat) {
    currentCatImg = catFailImg;
  } else if (isCheatKey) {
    currentCatImg = catCheatKeyImg;
  } else {
    currentCatImg = catSuccessImg;
  }

  // Dimensioni proporzionate per ciascuna marionetta
  let catHeight = '260px';
  if (isCheatKey) {
    catHeight = '230px';
  } else if (isCheat) {
    catHeight = '235px';
  }

  // Pulsante personalizzato
  let buttonLabel = "Ho capito, Gatto";
  if (isLastKey) {
    buttonLabel = "Messaggio ricevuto";
  } else if (isKey) {
    buttonLabel = "Sgarro registrato ✦";
  } else if (isCheat) {
    buttonLabel = "Ricevuto, domani niente scuse";
  } else if (isSuccess) {
    buttonLabel = "Continua così ✦";
  }

  // Palette dinamica contestuale con note soffuse e vellutate
  let borderColor = 'rgba(74, 222, 128, 0.45)';
  let glowColor = 'rgba(0, 0, 0, 0.5)';
  let buttonBg = 'rgba(18, 48, 35, 0.85)';
  let buttonTextColor = 'var(--coraline-parchment)';
  let bubbleStitchColor = 'rgba(74, 222, 128, 0.6)';

  if (isLastKey) {
    borderColor = 'rgba(216, 198, 21, 0.45)';
    glowColor = 'rgba(0, 0, 0, 0.5)';
    buttonBg = 'rgba(48, 38, 22, 0.85)';
    buttonTextColor = 'var(--coraline-parchment)';
    bubbleStitchColor = 'rgba(216, 198, 21, 0.6)';
  } else if (isCheat) {
    borderColor = 'rgba(239, 68, 68, 0.45)';
    glowColor = 'rgba(0, 0, 0, 0.5)';
    buttonBg = 'rgba(48, 18, 22, 0.85)';
    buttonTextColor = 'var(--coraline-parchment)';
    bubbleStitchColor = 'rgba(239, 68, 68, 0.6)';
  } else if (isKey) {
    borderColor = 'rgba(216, 198, 21, 0.45)';
    glowColor = 'rgba(0, 0, 0, 0.5)';
    buttonBg = 'rgba(48, 38, 22, 0.85)';
    buttonTextColor = 'var(--coraline-parchment)';
    bubbleStitchColor = 'rgba(216, 198, 21, 0.6)';
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
        transition: 'opacity 0.18s ease-out',
        willChange: 'opacity',
        transform: 'translateZ(0)'
      }}
      onClick={onClose}
    >
      <div
        className="cat-modal-content"
        style={{
          width: '100%',
          maxWidth: '350px',
          background: `linear-gradient(180deg, rgba(7, 24, 42, 0.45) 0%, rgba(4, 14, 24, 0.78) 100%), url(${catModalBg}) center/cover no-repeat`,
          borderRadius: '26px',
          border: `1.5px solid var(--border-dark-blue-light)`,
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px ${glowColor}`,
          padding: '28px 20px 22px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 18px, 0) scale(0.96)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden',
          willChange: 'transform'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* NUVOLETTA A FORMA DI NUVOLA REALE GRIGIETTA IN STILE CORALINE */}
        <CoralineCatCloud
          quote={quote}
          context={context}
          stitchColor={bubbleStitchColor}
          style={{
            marginTop: '12px',
            marginBottom: '16px'
          }}
        />

        {/* IMMAGINE DEL GATTO NERO */}
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
            loading="eager"
            decoding="async"
            style={{
              maxHeight: catHeight,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: `drop-shadow(0 10px 22px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px ${glowColor})`,
              animation: 'catHeadTilt 3s ease-in-out infinite',
              willChange: 'transform',
              transform: 'translateZ(0)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* PULSANTE DI CONFERMA / CHIUSURA CON TONI SOFFUSI E FONT LEGGIBILE */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: buttonBg,
            color: buttonTextColor,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '13.5px',
            letterSpacing: '0.4px',
            padding: '11px 16px',
            borderRadius: '14px',
            border: `1.5px solid ${borderColor}`,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(0, 0, 0, 0.25)',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          {buttonLabel}
        </button>
      </div>

      <style>{`
        @keyframes coralineBubblePop {
          0% {
            opacity: 0;
            transform: scale(0.88) translate3d(0, 8px, 0);
          }
          70% {
            opacity: 1;
            transform: scale(1.02) translate3d(0, -2px, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }

        @keyframes catHeadTilt {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -4px, 0) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
}
