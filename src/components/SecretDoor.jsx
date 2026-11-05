import React, { useState, useEffect, useRef } from 'react';
import secretDoorImg from '../assets/secret-door.webp';
import { triggerHapticFeedback } from '../utils/haptics';
import { openNextDoorPortal } from '../utils/doorPortalLogic';
import { stopMusicWithFadeOut } from '../services/backgroundMusic';

/**
 * La Porticina Segreta di Coraline (Portale Musicale e Video dell'Altro Mondo)
 * - Tocco singolo: Estrae dal mazzo pesato 6:3 e apre la Colonna Sonora su Spotify o uno dei 3 video a tema Coraline.
 * - Pressione prolungata (Long-press): Attiva il riquadro segreto speciale per Asia.
 */
export default function SecretDoor({ onLongPress, onOpenSettings }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const doorRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // Rileva quando l'utente arriva in prossimità della porta, mette in pausa l'aura fuori schermo e pulisce i timer
  useEffect(() => {
    const el = doorRef.current;
    let observer = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
            setIsRevealed(true);
          }
        },
        {
          rootMargin: '100px 0px',
          threshold: [0, 0.1, 0.45, 0.8]
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

    if (isUnlocking) return;

    if (!isRevealed) {
      setIsRevealed(true);
      triggerHapticFeedback('selection');
      return;
    }

    triggerHapticFeedback('key');
    setIsUnlocking(true);

    // Sfuma la musica d'atmosfera locale prima di aprire il portale esterno
    stopMusicWithFadeOut();

    // Estrae dalla Weighted Shuffle Bag (6:3) e apre direttamente Playlist o Video YouTube
    openNextDoorPortal();

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
        touchAction: 'manipulation'
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
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isUnlocking ? 'scale(1.08) rotate(3deg)' : 'none',
          opacity: 1,
          touchAction: 'manipulation'
        }}
      >
        {/* Alone di mistero e foschia verde smeraldo dietro la porta (gradiente multi-stop GPU, zero filter:blur) */}
        <div
          style={{
            position: 'absolute',
            bottom: '-5px',
            width: '156px',
            height: '156px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.40) 0%, rgba(45, 165, 95, 0.24) 34%, rgba(13, 73, 50, 0.11) 56%, transparent 76%)',
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            animation: 'secretDoorAuraPulse 3.2s ease-in-out infinite',
            animationPlayState: isInView ? 'running' : 'paused'
          }}
        />

        {/* L'Immagine della Porticina Segreta: NON FLUTTUA, È SOLIDA E FERMA, PULSA L'AURA VERDE GPU RETROSTANTE */}
        <img
          src={secretDoorImg}
          alt="Porticina Segreta di Coraline"
          width={115}
          height={158}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{
            width: '115px',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '4px',
            pointerEvents: 'none',
            transform: 'translateZ(0)',
            filter: 'drop-shadow(0 0 14px rgba(74, 222, 128, 0.72)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.9))'
          }}
        />
      </button>

      <style>{`
        /* PULSAZIONE GPU DELL'ALONE SMERALDO RETROSTANTE (transform + opacity: zero repaint software) */
        @keyframes secretDoorAuraPulse {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.26);
            opacity: 0.98;
          }
        }
      `}</style>
    </div>
  );
}

