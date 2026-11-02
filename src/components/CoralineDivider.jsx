import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import otherMotherHandImg from '../assets/other-mother-hand.webp';
import coralineBeetleImg from '../assets/coraline-beetle.webp';
import coralineWardrobeImg from '../assets/coraline-wardrobe.webp';
import { triggerHapticFeedback } from '../services/haptics';

/**
 * Linea di demarcazione orizzontale in puro stile Coraline con Easter Eggs Interattivi:
 * - variant="hand": Mano metallica dell'Altra Madre -> Vibra e trema in modo spaventoso.
 * - variant="beetle": Scarafaggio-bottone viola -> Corre fluido e continuo come una formica su tutto lo schermo, scompare e riappare con dissolvenza.
 * - variant="wardrobe": Insetto-armadio arancio -> Si ingrandisce (scale 2.7) e scende in basso a guardia della Porticina (senza scritte).
 */
const CoralineDivider = React.memo(function CoralineDivider({ 
  variant = 'hand', 
  style = {} 
}) {
  const isBeetle = variant === 'beetle';
  const isWardrobe = variant === 'wardrobe';
  const isHand = variant === 'hand';

  // STATI EASTER EGGS
  const [isHandShaking, setIsHandShaking] = useState(false);
  
  // Scarafaggio che scappa
  const [isBeetleEscaping, setIsBeetleEscaping] = useState(false);
  const [beetleEscapeOrigin, setBeetleEscapeOrigin] = useState(null);
  const [isBeetleFadingIn, setIsBeetleFadingIn] = useState(false);
  
  // Insetto-armadio che protegge la porta
  const [isWardrobeGuarding, setIsWardrobeGuarding] = useState(false);

  const iconRef = useRef(null);
  const timersRef = useRef([]);

  const addTimer = (timer) => {
    timersRef.current.push(timer);
    return timer;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // 1. EASTER EGG MANO: VIBRAZIONE SPAVENTOSA (CONFERMATA PERFETTA)
  const handleHandClick = (e) => {
    e.stopPropagation();
    if (isHandShaking) return;

    setIsHandShaking(true);
    triggerHapticFeedback('cheat');

    // Sequenza di micro-vibrazioni aptiche
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 150));
    addTimer(setTimeout(() => triggerHapticFeedback('cheat'), 320));
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 500));

    addTimer(setTimeout(() => {
      setIsHandShaking(false);
    }, 1300));
  };

  // 2. EASTER EGG SCARAFAGGIO: CORSA FLUIDA E CONTINUA SU TUTTO LO SCHERMO
  const handleBeetleClick = (e) => {
    e.stopPropagation();
    if (isBeetleEscaping || isBeetleFadingIn) return;

    if (iconRef.current && typeof window !== 'undefined') {
      const rect = iconRef.current.getBoundingClientRect();
      setBeetleEscapeOrigin({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }

    triggerHapticFeedback('selection');
    setIsBeetleEscaping(true);

    // Micro vibrazioni ritmate durante la corsa dell'insetto
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 500));
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 1200));
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 2000));
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 2800));
    addTimer(setTimeout(() => triggerHapticFeedback('selection'), 3600));

    // Dopo 4.2s termina la corsa dello scarafaggio e inizia la dissolvenza di ritorno
    addTimer(setTimeout(() => {
      setIsBeetleEscaping(false);
      setIsBeetleFadingIn(true);
      triggerHapticFeedback('key');

      addTimer(setTimeout(() => {
        setIsBeetleFadingIn(false);
      }, 1000));
    }, 4200));
  };

  // 3. EASTER EGG INSETTO-ARMADIO: SCENDE PIÙ IN BASSO SOPRA LA PORTA E PIÙ GRANDE
  const handleWardrobeClick = (e) => {
    e.stopPropagation();
    if (isWardrobeGuarding) {
      setIsWardrobeGuarding(false);
      triggerHapticFeedback('selection');
      return;
    }

    setIsWardrobeGuarding(true);
    triggerHapticFeedback('key');

    // Ritorna al suo posto dopo 4.5 secondi (o al tocco manuale)
    addTimer(setTimeout(() => {
      setIsWardrobeGuarding(false);
    }, 4500));
  };

  // CONFIGURAZIONE CROMATICA
  let threadLeft = 'linear-gradient(90deg, transparent 0%, rgba(25, 12, 38, 0.2) 20%, rgba(76, 26, 110, 0.65) 75%, rgba(18, 8, 26, 0.95) 100%)';
  let threadRight = 'linear-gradient(90deg, rgba(18, 8, 26, 0.95) 0%, rgba(76, 26, 110, 0.65) 25%, rgba(25, 12, 38, 0.2) 80%, transparent 100%)';
  let threadGlow = '0 0 8px rgba(88, 28, 130, 0.55), 0 0 2px rgba(10, 4, 15, 0.9)';
  let imageSrc = otherMotherHandImg;
  let imageWidth = '56px';
  let imageHeight = '38px';
  let imageFilter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 8px rgba(88, 28, 130, 0.55))';
  let imageTransform = 'rotate(-10deg)';

  if (isBeetle) {
    threadLeft = 'linear-gradient(90deg, transparent 0%, rgba(162, 28, 175, 0.2) 20%, rgba(217, 70, 239, 0.6) 70%, rgba(244, 114, 182, 0.95) 100%)';
    threadRight = 'linear-gradient(90deg, rgba(244, 114, 182, 0.95) 0%, rgba(217, 70, 239, 0.6) 30%, rgba(162, 28, 175, 0.2) 80%, transparent 100%)';
    threadGlow = '0 0 8px rgba(244, 114, 182, 0.55), 0 0 16px rgba(217, 70, 239, 0.35)';
    imageSrc = coralineBeetleImg;
    imageWidth = '42px';
    imageHeight = '42px';
    imageFilter = 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(244, 114, 182, 0.65))';
    imageTransform = 'none';
  } else if (isWardrobe) {
    threadLeft = 'linear-gradient(90deg, transparent 0%, rgba(194, 65, 12, 0.2) 20%, rgba(234, 88, 12, 0.65) 70%, rgba(251, 146, 60, 0.95) 100%)';
    threadRight = 'linear-gradient(90deg, rgba(251, 146, 60, 0.95) 0%, rgba(234, 88, 12, 0.65) 30%, rgba(194, 65, 12, 0.2) 80%, transparent 100%)';
    threadGlow = '0 0 8px rgba(251, 146, 60, 0.55), 0 0 16px rgba(234, 88, 12, 0.35)';
    imageSrc = coralineWardrobeImg;
    imageWidth = '38px';
    imageHeight = '46px';
    imageFilter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(249, 115, 22, 0.65))';
    imageTransform = 'none';
  }

  // Seleziona handler click in base alla variante
  const handleIconClick = isHand 
    ? handleHandClick 
    : isBeetle 
    ? handleBeetleClick 
    : handleWardrobeClick;

  return (
    <>
      <div
        role="separator"
        aria-hidden="true"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          margin: '22px 0',
          userSelect: 'none',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: isWardrobeGuarding ? 70 : 10,
          ...style
        }}
      >
        {/* Filo di cucitura sinistro */}
        <div
          style={{
            flex: 1,
            height: '1.5px',
            background: threadLeft,
            boxShadow: threadGlow,
            borderRadius: '1px',
            pointerEvents: 'none'
          }}
        />

        {/* Icona centrale cliccabile con Easter Egg */}
        <button
          ref={iconRef}
          type="button"
          onClick={handleIconClick}
          aria-label={
            isHand 
              ? "Mano dell'Altra Madre" 
              : isBeetle 
              ? "Scarafaggio-bottone di Coraline" 
              : "Insetto-armadio a guardia della porta"
          }
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: imageWidth,
            height: imageHeight,
            flexShrink: 0,
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            touchAction: 'manipulation',
            outline: 'none',
            pointerEvents: 'auto',
            transition: 'transform 0.65s cubic-bezier(0.34, 1.35, 0.64, 1), filter 0.4s ease, opacity 0.4s ease',
            transform: isWardrobeGuarding 
              ? 'translate3d(0, 118px, 0) scale(2.7)' 
              : isHand && isHandShaking 
              ? 'scale(1.1)' 
              : 'scale(1)',
            opacity: isBeetleEscaping ? 0 : 1,
            zIndex: isWardrobeGuarding ? 90 : 1
          }}
        >
          <img
            src={imageSrc}
            alt=""
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              filter: isWardrobeGuarding
                ? 'drop-shadow(0 14px 35px rgba(0, 0, 0, 0.98)) drop-shadow(0 0 26px rgba(249, 115, 22, 0.92))'
                : imageFilter,
              transform: isHand && isHandShaking
                ? 'none'
                : imageTransform,
              animation: isHand && isHandShaking 
                ? 'spookyHandShiver 0.08s infinite alternate' 
                : isWardrobeGuarding 
                ? 'wardrobeGuardingPulse 2.4s ease-in-out infinite' 
                : isBeetleFadingIn 
                ? 'beetleFadeInReappear 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
                : 'dividerIconHoverFloat 3.4s ease-in-out infinite'
            }}
          />
        </button>

        {/* Filo di cucitura destro */}
        <div
          style={{
            flex: 1,
            height: '1.5px',
            background: threadRight,
            boxShadow: threadGlow,
            borderRadius: '1px',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* PORTAL PER LO SCARAFAGGIO: CORSA FLUIDA E CONTINUA (COME UNA FORMICA) SU TUTTO LO SCHERMO */}
      {isBeetleEscaping && beetleEscapeOrigin && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99999,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${beetleEscapeOrigin.width}px`,
              height: `${beetleEscapeOrigin.height}px`,
              '--startX': `${beetleEscapeOrigin.left}px`,
              '--startY': `${beetleEscapeOrigin.top}px`,
              animation: 'coralineBeetleFluidRun 4.2s ease-in-out forwards'
            }}
          >
            <img
              src={coralineBeetleImg}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 14px rgba(244, 114, 182, 0.9))',
                animation: 'beetleLegScurry 0.08s linear infinite alternate'
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* KEYFRAME ANIMATIONS PER GLI EASTER EGGS */}
      <style>{`
        /* 1. VIBRAZIONE SPAVENTOSA DELLA MANO METALLICA */
        @keyframes spookyHandShiver {
          0% {
            transform: rotate(-14deg) translate3d(-3px, -2px, 0) scale(1.06);
            filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.95)) drop-shadow(0 0 4px #000);
          }
          25% {
            transform: rotate(-7deg) translate3d(3px, 2px, 0) scale(1.08);
            filter: drop-shadow(0 0 20px rgba(147, 51, 234, 1)) drop-shadow(0 0 6px #000);
          }
          50% {
            transform: rotate(-12deg) translate3d(-2px, 3px, 0) scale(1.05);
            filter: drop-shadow(0 0 14px rgba(192, 132, 252, 0.9)) drop-shadow(0 0 4px #000);
          }
          75% {
            transform: rotate(-8deg) translate3d(2px, -3px, 0) scale(1.1);
            filter: drop-shadow(0 0 22px rgba(126, 34, 206, 1)) drop-shadow(0 0 6px #000);
          }
          100% {
            transform: rotate(-13deg) translate3d(3px, -1px, 0) scale(1.07);
            filter: drop-shadow(0 0 18px rgba(168, 85, 247, 0.95)) drop-shadow(0 0 4px #000);
          }
        }

        /* 2. CORSA FLUIDA E CONTINUA DELLO SCARAFAGGIO ATTORNO A TUTTO LO SCHERMO */
        @keyframes coralineBeetleFluidRun {
          0% {
            transform: translate3d(var(--startX), var(--startY), 0) rotate(0deg);
            opacity: 1;
          }
          8% {
            /* Scatta rapido a destra */
            transform: translate3d(calc(var(--startX) + 80px), calc(var(--startY) - 40px), 0) rotate(55deg);
          }
          18% {
            /* Scende verso il centro-destra */
            transform: translate3d(calc(var(--startX) + 130px), calc(var(--startY) + 120px), 0) rotate(125deg);
          }
          28% {
            /* Curva fluida in basso attraversando la parte inferiore */
            transform: translate3d(calc(var(--startX) - 20px), calc(var(--startY) + 190px), 0) rotate(210deg);
          }
          40% {
            /* Corre sul lato sinistro dello schermo */
            transform: translate3d(12vw, calc(var(--startY) + 80px), 0) rotate(270deg);
          }
          52% {
            /* Risale rapidamente lungo il bordo sinistro */
            transform: translate3d(8vw, calc(var(--startY) - 200px), 0) rotate(-35deg);
          }
          65% {
            /* Taglia in diagonale verso l'alto a destra */
            transform: translate3d(78vw, calc(var(--startY) - 340px), 0) rotate(45deg);
          }
          78% {
            /* Corre lungo la parte superiore dello schermo */
            transform: translate3d(35vw, 6vh, 0) rotate(-110deg);
          }
          90% {
            /* Si allontana verso l'angolo in alto a sinistra */
            transform: translate3d(-2vw, 4vh, 0) rotate(-115deg);
            opacity: 0.85;
          }
          100% {
            /* Esce definitivamente dallo schermo */
            transform: translate3d(-18vw, 2vh, 0) rotate(-120deg);
            opacity: 0;
          }
        }

        /* Vibrazione continua delle zampe dell'insetto che corre */
        @keyframes beetleLegScurry {
          0% {
            transform: scale(1) rotate(-1.5deg);
          }
          100% {
            transform: scale(1.03) rotate(1.5deg);
          }
        }

        /* 2b. DISSOLVENZA CON RICOMPARSA DELLO SCARAFAGGIO NEL DIVISORE */
        @keyframes beetleFadeInReappear {
          0% {
            opacity: 0;
            transform: scale(0.4) rotate(-20deg);
            filter: drop-shadow(0 0 25px rgba(244, 114, 182, 1));
          }
          60% {
            opacity: 0.9;
            transform: scale(1.15) rotate(6deg);
            filter: drop-shadow(0 0 16px rgba(244, 114, 182, 0.85));
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(244, 114, 182, 0.65));
          }
        }

        /* 3. RESPIRO E PROTEZIONE DELL'INSETTO-ARMADIO */
        @keyframes wardrobeGuardingPulse {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(1.2deg);
          }
        }

        /* 4. FLUTTUAZIONE ORGANICA A RIPOSO PER LE ICONE DEL DIVIDER */
        @keyframes dividerIconHoverFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -4px, 0);
          }
        }
      `}</style>
    </>
  );
});

export default CoralineDivider;
