import React, { useState, useEffect, useRef } from 'react';
import secretDoorImg from '../assets/secret-door.webp';
import { triggerHapticFeedback } from '../services/haptics';

/**
 * La Porticina Segreta di Coraline (Easter Egg & Ingresso Impostazioni)
 * Posizionata in fondo all'applicazione, parzialmente nascosta.
 * Quando l'utente scorre in fondo e fa resistenza/tira più giù,
 * la porticina emerge con animazione gotica e bagliore verde smeraldo.
 */
export default function SecretDoor({ onOpenSettings }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const doorRef = useRef(null);

  // Rileva quando l'utente arriva in fondo alla pagina
  useEffect(() => {
    const el = doorRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
          setIsRevealed(true);
        }
      },
      {
        threshold: [0.1, 0.45, 0.8]
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      triggerHapticFeedback('selection');
      return;
    }

    triggerHapticFeedback('key');
    setIsUnlocking(true);
    setTimeout(() => {
      setIsUnlocking(false);
      onOpenSettings();
    }, 380);
  };

  return (
    <div
      ref={doorRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '18px',
        marginBottom: '40px',
        position: 'relative',
        touchAction: 'pan-y'
      }}
    >
      {/* Bottone interattivo con la porticina */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="La Porticina Segreta dell'Altro Mondo (Impostazioni)"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isUnlocking 
            ? 'scale(1.08) rotate(3deg)' 
            : isRevealed 
            ? 'translate3d(0, 0, 0)' 
            : 'translate3d(0, 38px, 0)',
          opacity: isRevealed ? 1 : 0.65,
          touchAction: 'manipulation'
        }}
      >
        {/* Alone di mistero e foschia verde smeraldo dietro la porta */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.35) 0%, rgba(13, 73, 50, 0.15) 50%, transparent 70%)',
            filter: 'blur(14px)',
            pointerEvents: 'none',
            opacity: isRevealed ? 1 : 0.4,
            transition: 'opacity 0.4s ease'
          }}
        />

        {/* L'Immagine della Porticina Segreta di Coraline */}
        <img
          src={secretDoorImg}
          alt="Porticina Segreta di Coraline"
          loading="eager"
          decoding="async"
          style={{
            width: '115px',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '4px',
            filter: isRevealed
              ? 'drop-shadow(0 0 16px rgba(74, 222, 128, 0.75)) drop-shadow(0 10px 22px rgba(0, 0, 0, 0.95))'
              : 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.4)) drop-shadow(0 6px 14px rgba(0, 0, 0, 0.85))',
            transition: 'filter 0.35s ease, transform 0.35s ease',
            pointerEvents: 'none',
            animation: isRevealed ? 'secretDoorGlowPulse 3s ease-in-out infinite' : 'none'
          }}
        />
      </button>

      <style>{`
        @keyframes secretDoorGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(74, 222, 128, 0.65)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.9));
          }
          50% {
            filter: drop-shadow(0 0 22px rgba(74, 222, 128, 0.9)) drop-shadow(0 10px 26px rgba(0, 0, 0, 0.95));
          }
        }
      `}</style>
    </div>
  );
}

