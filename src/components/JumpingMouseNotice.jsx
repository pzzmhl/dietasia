import React, { useState, useEffect, useRef } from 'react';
import jumpingMouseImg from '../assets/jumping-mouse.webp';
import jumpingMiceCircusBg from '../assets/jumping-mice-circus-bg.webp';
import { triggerHapticFeedback } from '../services/haptics';

/**
 * Avviso Topo Saltatore del Circo di Bobinsky:
 * - Più spazio in alto e in basso (padding 18px)
 * - Topo saltatore a sinistra più grande (96px) con animazione tromba
 * - A destra allineati: titolo in font Coraline "Topi Saltatori!", 
 *   avviso giorni mancanti in font normale, e pulsante [✓ OK]
 * - Al clic su [✓ OK], la notifica si chiude per oggi e riappare eventualmente il giorno successivo
 */
const JumpingMouseNotice = React.memo(function JumpingMouseNotice({
  unmarkedDays = [],
  onSelectDay = () => {},
  audioSrc = null
}) {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const dismissedDate = localStorage.getItem('coraline_mouse_notice_dismissed_date');
      return dismissedDate === todayStr;
    } catch (e) {
      return false;
    }
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const effectiveDays = Array.isArray(unmarkedDays) ? unmarkedDays : [];
  const firstMissingDate = effectiveDays[0];
  const missingCount = effectiveDays.length;

  const formatDateLabel = (dStr) => {
    try {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        return `${day} ${months[monthIdx] || ''}`;
      }
      return dStr;
    } catch (e) {
      return dStr || '';
    }
  };

  const handleConfirmOk = (e) => {
    if (e) e.stopPropagation();
    triggerHapticFeedback('selection');
    setIsDismissed(true);
    try {
      localStorage.setItem('coraline_mouse_notice_dismissed_date', todayStr);
    } catch (err) {}
  };

  const handlePlayAudio = () => {
    try {
      if (audioRef.current && audioSrc) {
        audioRef.current.currentTime = 0;
        const p = audioRef.current.play();
        if (p && typeof p.then === 'function') {
          p.then(() => setIsPlayingAudio(true)).catch(() => {});
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (audioSrc && audioRef.current && !isDismissed && effectiveDays.length > 0) {
      handlePlayAudio();
    }
  }, [audioSrc, isDismissed, effectiveDays.length]);

  // La notifica appare SOLO se c'è almeno un giorno non segnato indietro di 2 giorni (e se l'utente non ha cliccato OK oggi)
  if (isDismissed || effectiveDays.length === 0) {
    return null;
  }

  return (
    <>
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => setIsPlayingAudio(false)}
        />
      )}

      {/* BANNER / AVVISO DEL TOPO SALTATORE CON BORDO GIALLO TRATTEGGIATO */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          triggerHapticFeedback('selection');
          onSelectDay(firstMissingDate);
        }}
        className="stitched-card"
        style={{
          width: '100%',
          marginBottom: '16px',
          background: 'rgba(5, 17, 30, 0.92)',
          border: '2px dashed rgba(216, 198, 21, 0.85)',
          borderRadius: '20px',
          // Più spazio in alto e in basso (18px)
          padding: '18px 16px 18px 14px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(216, 198, 21, 0.22), inset 0 0 15px rgba(100, 80, 10, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          touchAction: 'manipulation',
          animation: 'mouseNoticeEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* SFONDO CIRCO DEI TOPI SALTATORI BEN VISIBILE (SENZA VORTICE) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${jumpingMiceCircusBg})`,
            backgroundPosition: 'center 40%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.82,
            filter: 'brightness(0.78) contrast(1.08)',
            WebkitFilter: 'brightness(0.78) contrast(1.08)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* VELATURA LEGGERA SFUMATA PER GARANTIRE PERFETTA LEGGIBILITÀ AI TESTI */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(5, 17, 30, 0.35) 0%, rgba(5, 17, 30, 0.45) 45%, rgba(5, 17, 30, 0.65) 100%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* LATO SINISTRO: TOPO SALTATORE ANCORA PIÙ GRANDE (96px) CHE SUONA LA TROMBA */}
        <div
          style={{
            flexShrink: 0,
            width: '96px',
            height: '96px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            if (audioSrc) {
              e.stopPropagation();
              handlePlayAudio();
            }
          }}
          title={audioSrc ? 'Tocca per ascoltare la tromba!' : undefined}
        >
          <img
            src={jumpingMouseImg}
            alt="Topo Saltatore del Circo di Bobinsky"
            className="jumping-mouse-animated"
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(216, 198, 21, 0.3))',
              willChange: 'transform',
              transform: 'translateZ(0)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* LATO DESTRO: TITOLO IN FONT CORALINE, SPIEGAZIONE E PULSANTE [✓ OK] ALLINEATI */}
        <div style={{ flex: 1, minWidth: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <h4
            style={{
              margin: '0 0 4px 0',
              color: 'var(--coraline-yellow)',
              fontSize: '18px',
              fontWeight: 'normal',
              letterSpacing: '0.8px',
              lineHeight: 1.15,
              fontFamily: 'var(--font-coraline)',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(216, 198, 21, 0.4)'
            }}
          >
            Topi Saltatori!
          </h4>

          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '11.5px',
              color: 'var(--coraline-parchment)',
              lineHeight: 1.35,
              opacity: 0.9,
              fontFamily: 'var(--font-body)',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)'
            }}
          >
            {missingCount === 1 ? (
              <>Manca <strong>1 giorno</strong> ({formatDateLabel(firstMissingDate)}) da registrare nel calendario!</>
            ) : (
              <>Mancano <strong>{missingCount} giorni</strong> (a partire dal {formatDateLabel(firstMissingDate)}) da completare!</>
            )}
          </p>

          {/* PULSANTE [✓ OK] RICHIESTO: Chiude la notifica per oggi e riappare domani se ci sono ancora giorni mancanti */}
          <button
            type="button"
            onClick={handleConfirmOk}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 24px',
              borderRadius: '10px',
              backgroundColor: 'rgba(216, 198, 21, 0.22)',
              border: '1.5px solid var(--coraline-yellow)',
              color: 'var(--coraline-yellow)',
              fontSize: '12px',
              fontFamily: 'var(--font-gothic)',
              fontWeight: 800,
              letterSpacing: '0.6px',
              cursor: 'pointer',
              touchAction: 'manipulation',
              boxShadow: '0 0 10px rgba(216, 198, 21, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            ✓ OK
          </button>
        </div>
      </div>

      <style>{`
        @keyframes mouseNoticeEnter {
          from {
            opacity: 0;
            transform: translate3d(0, -6px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .jumping-mouse-animated {
          animation: mouseTrumpetBlast 1.5s infinite ease-in-out;
          transform-origin: bottom center;
        }

        @keyframes mouseTrumpetBlast {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          15% {
            transform: translate3d(0, 2px, 0) rotate(-3deg) scale(0.96, 1.04);
          }
          35% {
            transform: translate3d(0, -9px, 0) rotate(6deg) scale(1.08, 0.94);
          }
          50% {
            transform: translate3d(0, -12px, 0) rotate(-3deg) scale(1.05, 0.96);
          }
          70% {
            transform: translate3d(0, -4px, 0) rotate(4deg) scale(1.02);
          }
          85% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.98, 1.02);
          }
        }
      `}</style>
    </>
  );
});

export default JumpingMouseNotice;
