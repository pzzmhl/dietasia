import React, { useState, useEffect, useRef } from 'react';
import secretDoorImg from '../assets/secret-door.webp';
import { triggerHapticFeedback } from '../services/haptics';
import { openCoralineSpotifyShuffle } from '../services/spotify';

/**
 * La Porticina Segreta di Coraline (Portale Musicale dell'Altro Mondo)
 * - Tocco singolo: Apre Spotify e avvia immediatamente in modalità shuffle
 *   un brano dalla Colonna Sonora ufficiale di Coraline.
 * - Pressione prolungata (Long-press): Attiva il riquadro segreto speciale per Asia.
 */
export default function SecretDoor({ onLongPress, onOpenSettings }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const doorRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // Rileva quando l'utente arriva in prossimità della porta e pulisce i timer allo smontaggio
  useEffect(() => {
    const el = doorRef.current;
    let observer = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
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
    }

    return () => {
      if (observer) observer.disconnect();
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, []);

  const handlePointerDown = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      triggerHapticFeedback('key');
      if (onLongPress) {
        onLongPress();
      } else if (onOpenSettings) {
        onOpenSettings();
      }
    }, 750);
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    if (!isRevealed) {
      setIsRevealed(true);
      triggerHapticFeedback('selection');
      return;
    }

    triggerHapticFeedback('key');
    setIsUnlocking(true);

    // Apre Spotify in shuffle mode con la playlist di Coraline direttamente (senza mostrare anteprime testo)
    openCoralineSpotifyShuffle();

    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => {
      setIsUnlocking(false);
    }, 400);
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
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onPointerCancel={handlePointerUpOrLeave}
        aria-label="La Porticina Segreta: tocca per riprodurre la colonna sonora di Coraline su Spotify"
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
          transform: isUnlocking ? 'scale(1.08) rotate(3deg)' : 'none',
          opacity: 1,
          touchAction: 'manipulation'
        }}
      >
        {/* Alone di mistero e foschia verde smeraldo dietro la porta (Pulsazione della luce) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            width: '125px',
            height: '125px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.45) 0%, rgba(13, 73, 50, 0.22) 50%, transparent 70%)',
            filter: 'blur(15px)',
            pointerEvents: 'none',
            animation: 'secretDoorAuraPulse 3.2s ease-in-out infinite'
          }}
        />

        {/* L'Immagine della Porticina Segreta: NON FLUTTUA, È SOLIDA E FERMA, PULSA SOLO LA LUCE VERDE */}
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
            pointerEvents: 'none',
            transform: 'none',
            animation: 'secretDoorGlowPulse 3.2s ease-in-out infinite',
            willChange: 'filter'
          }}
        />
      </button>

      <style>{`
        /* PULSAZIONE PURA DELLA LUCE: LA PORTA NON SI MUOVE E NON FLUTTUA */
        @keyframes secretDoorGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(74, 222, 128, 0.55)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.9));
          }
          50% {
            filter: drop-shadow(0 0 28px rgba(74, 222, 128, 0.98)) drop-shadow(0 0 16px rgba(139, 229, 116, 0.75)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.9));
          }
        }

        /* PULSAZIONE DEL BAGLIORE / ALONE SMERALDO RETROSTANTE */
        @keyframes secretDoorAuraPulse {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.24);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
}

