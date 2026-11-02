import React, { useState, useEffect, useRef } from 'react';
import secretDoorImg from '../assets/secret-door.webp';
import madeWithLoveImg from '../assets/made-with-love-michele.webp';
import { triggerHapticFeedback } from '../services/haptics';
import { openCoralineSpotifyShuffle } from '../services/spotify';

/**
 * La Porticina Segreta di Coraline (Portale Musicale dell'Altro Mondo)
 * - Tocco singolo: Apre Spotify e avvia immediatamente in modalità shuffle
 *   un brano dalla Colonna Sonora ufficiale di Coraline (senza alcuna anteprima testo a schermo).
 * - Pressione prolungata (Long-press): Attiva il riquadro segreto "Ti amo".
 */
export default function SecretDoor({ onLongPress, onOpenSettings }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isEasterEggRevealed, setIsEasterEggRevealed] = useState(false);
  const [isPressuring, setIsPressuring] = useState(false);

  const doorRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const zoneTimerRef = useRef(null);

  // Rileva quando l'utente arriva in fondo alla pagina e pulisce i timer allo smontaggio
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
      if (zoneTimerRef.current) clearTimeout(zoneTimerRef.current);
    };
  }, []);

  // Rileva pressione o tiro prolungato (2.0s esatti) a fine pagina
  useEffect(() => {
    let pressureTimeout = null;
    let isHolding = false;
    let startY = 0;

    const checkIsStrictlyAtBottom = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      // Solo quando si è esattamente arrivati alla fine della pagina
      return scrollY + windowHeight >= docHeight - 50;
    };

    const onTouchStart = (e) => {
      if (isEasterEggRevealed) return;
      if (!e.touches || e.touches.length !== 1) return;
      if (checkIsStrictlyAtBottom()) {
        isHolding = true;
        startY = e.touches[0].clientY;
        setIsPressuring(true);

        pressureTimeout = setTimeout(() => {
          triggerHapticFeedback('key');
          setIsEasterEggRevealed(true);
          setIsPressuring(false);
          isHolding = false;
          setTimeout(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          }, 180);
        }, 2000); // 2 secondi pieni
      }
    };

    const onTouchMove = (e) => {
      if (!isHolding) return;
      const currentY = e.touches[0].clientY;
      // Se si rilascia il tiro o si risale, annulla
      if (startY - currentY < -80 || currentY - startY > 60) {
        if (pressureTimeout) clearTimeout(pressureTimeout);
        setIsPressuring(false);
        isHolding = false;
      }
    };

    const onTouchEnd = () => {
      if (pressureTimeout) clearTimeout(pressureTimeout);
      setIsPressuring(false);
      isHolding = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      if (pressureTimeout) clearTimeout(pressureTimeout);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isEasterEggRevealed]);

  const handleZonePointerDown = () => {
    if (isEasterEggRevealed) return;
    setIsPressuring(true);
    zoneTimerRef.current = setTimeout(() => {
      triggerHapticFeedback('key');
      setIsEasterEggRevealed(true);
      setIsPressuring(false);
      setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }, 180);
    }, 2000); // 2 secondi pieni
  };

  const handleZonePointerUp = () => {
    if (zoneTimerRef.current) clearTimeout(zoneTimerRef.current);
    setIsPressuring(false);
  };

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
          transform: isUnlocking 
            ? 'scale(1.12) rotate(4deg)' 
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
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.45) 0%, rgba(13, 73, 50, 0.22) 50%, transparent 70%)',
            filter: 'blur(14px)',
            pointerEvents: 'none',
            animation: 'secretDoorAuraPulse 3s ease-in-out infinite'
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
            pointerEvents: 'none',
            animation: 'secretDoorGlowPulse 3s ease-in-out infinite',
            willChange: 'transform, filter'
          }}
        />
      </button>

      {/* ZONA DI PRESSIONE & CONTENITORE EASTER EGG SOTTO LA PORTA */}
      <div
        onPointerDown={handleZonePointerDown}
        onPointerUp={handleZonePointerUp}
        onPointerLeave={handleZonePointerUp}
        onPointerCancel={handleZonePointerUp}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          paddingTop: '8px',
          userSelect: 'none',
          touchAction: 'pan-y'
        }}
      >
        {/* Glow di tensione durante la pressione continua in fondo */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            width: isPressuring ? '180px' : '60px',
            height: isPressuring ? '50px' : '20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.55) 0%, rgba(216, 198, 21, 0.25) 55%, transparent 75%)',
            filter: 'blur(16px)',
            opacity: isPressuring ? 1 : 0,
            transition: 'all 0.4s ease',
            pointerEvents: 'none'
          }}
        />

        {/* SPAZIO EXTRA BLU NOTTE PROFONDO RIVELATO: "fatto con Amore dal tuo Michele" */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isEasterEggRevealed ? '#0a0b1a' : 'transparent',
            borderRadius: '24px',
            paddingTop: isEasterEggRevealed ? '36px' : '0px',
            paddingBottom: isEasterEggRevealed ? '44px' : '0px',
            maxHeight: isEasterEggRevealed ? '260px' : '0px',
            opacity: isEasterEggRevealed ? 1 : 0,
            transform: isEasterEggRevealed ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 24px, 0) scale(0.9)',
            transition: 'all 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            pointerEvents: isEasterEggRevealed ? 'auto' : 'none',
            boxSizing: 'border-box'
          }}
        >
          <img
            src={madeWithLoveImg}
            alt="fatto con Amore dal tuo Michele"
            loading="eager"
            decoding="async"
            onClick={() => triggerHapticFeedback('success')}
            style={{
              width: '175px',
              maxWidth: '56vw',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 3px 14px rgba(220, 38, 38, 0.75)) drop-shadow(0 0 12px rgba(239, 68, 68, 0.45))',
              animation: isEasterEggRevealed ? 'madeWithLoveFloat 3.8s ease-in-out infinite' : 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes secretDoorGlowPulse {
          0%, 100% {
            transform: scale(1) translateY(0);
            filter: drop-shadow(0 0 12px rgba(74, 222, 128, 0.65)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.9));
          }
          50% {
            transform: scale(1.055) translateY(-6px);
            filter: drop-shadow(0 0 24px rgba(74, 222, 128, 0.95)) drop-shadow(0 14px 26px rgba(0, 0, 0, 0.95));
          }
        }

        @keyframes secretDoorAuraPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.92;
          }
        }

        @keyframes madeWithLoveFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            filter: drop-shadow(0 4px 18px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 16px rgba(239, 68, 68, 0.5));
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(-1.4deg);
            filter: drop-shadow(0 8px 24px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 24px rgba(239, 68, 68, 0.65));
          }
        }
      `}</style>
    </div>
  );
}

