import React, { useState, useEffect, useRef } from 'react';
import jumpingMouseImg from '../assets/jumping-mouse.png';

/**
 * Avviso Topo Saltatore del Circo di Bobinsky:
 * Appare a schermo quando ci sono giorni passati (del mese corrente) non ancora contrassegnati.
 * Include animazione a tremolio (il topo che squilla energicamente la tromba)
 * e predisposizione per traccia audio (suono di tromba / voce di avviso).
 */
export default function JumpingMouseNotice({
  unmarkedDays = [],
  onSelectDay = () => {},
  audioSrc = null // Predisposto per ricevere file audio (es. /src/assets/mouse-audio.mp3)
}) {
  // 1. TUTTI GLI HOOKS DEVONO ESSERE DICHIARATI RIGOROSAMENTE IN CIMA SENZA ALCUN EARLY RETURN
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

  const hasUnmarked = Array.isArray(unmarkedDays) && unmarkedDays.length > 0;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      localStorage.setItem('coraline_mouse_notice_dismissed_date', todayStr);
    } catch (e) {}
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

  // Tenta riproduzione audio non appena il componente appare (chiamato sempre incondizionatamente)
  useEffect(() => {
    if (hasUnmarked && audioSrc && audioRef.current && !isDismissed) {
      handlePlayAudio();
    }
  }, [hasUnmarked, audioSrc, isDismissed]);

  // 2. SOLO DOPO TUTTI GLI HOOKS: EARLY RETURN SE NON CI SONO GIORNI DA NOTIFICARE O SE È STATO CHIUSO
  if (!hasUnmarked || isDismissed) {
    return null;
  }

  // Il primo giorno mancante in ordine cronologico
  const firstMissingDate = unmarkedDays[0];
  if (!firstMissingDate) return null;

  const missingCount = unmarkedDays.length;

  // Formattazione manuale sicura senza dipendere da locale engine
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

  return (
    <>
      {/* Audio tag predisposto per traccia utente */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => setIsPlayingAudio(false)}
        />
      )}

      {/* BANNER / AVVISO DEL TOPO SALTATORE */}
      <div
        style={{
          width: '100%',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(13, 44, 73, 0.96) 0%, rgba(6, 22, 37, 0.98) 100%)',
          border: '2px solid var(--coraline-yellow)',
          borderRadius: '20px',
          padding: '14px 16px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85), 0 0 20px rgba(216, 198, 21, 0.3)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'mouseNoticeEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Pulsantino Chiusura / Riduci "✕" */}
        <button
          onClick={handleDismiss}
          aria-label="Chiudi avviso"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--coraline-parchment)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7
          }}
        >
          ✕
        </button>

        {/* CONTENITORE DEL TOPO PIÙ GRANDE CHE TREMA E SQUILLA LA TROMBA */}
        <div
          style={{
            flexShrink: 0,
            width: '108px',
            height: '108px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: audioSrc ? 'pointer' : 'default',
            margin: '-4px 0 -4px -6px'
          }}
          onClick={handlePlayAudio}
          title={audioSrc ? 'Tocca per ascoltare la tromba!' : undefined}
        >
          {/* Micro onde sonore che escono dal padiglione della tromba */}
          <div className="sound-pulse-ring ring-1" />
          <div className="sound-pulse-ring ring-2" />

          {/* Immagine con animazione di squillo e vibrazione stop-motion */}
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
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.95))',
              willChange: 'transform',
              transform: 'translateZ(0)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* SOLO TITOLO E SOTTOTITOLO */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: '14px' }}>
          <h4
            style={{
              margin: '0 0 4px 0',
              color: 'var(--coraline-yellow)',
              fontSize: '13.5px',
              fontWeight: 'normal',
              letterSpacing: '0.8px',
              fontFamily: 'var(--font-coraline)'
            }}
          >
            Allarme Topi Saltatori!
          </h4>

          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'var(--coraline-parchment)',
              lineHeight: 1.4,
              opacity: 0.92
            }}
          >
            {missingCount === 1 ? (
              <>C'è <strong>1 giorno</strong> non contrassegnato che deve essere completato.</>
            ) : (
              <>Ci sono <strong>{missingCount} giorni</strong> non contrassegnati che devono essere completati.</>
            )}
          </p>
        </div>
      </div>

      <style>{`
        /* Animazione d'ingresso del banner */
        @keyframes mouseNoticeEnter {
          from {
            opacity: 0;
            transform: translate3d(0, -8px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* Tremolio e squillo energico della tromba */
        .jumping-mouse-animated {
          animation: mouseTrumpetBlast 1.4s infinite cubic-bezier(0.25, 1, 0.5, 1);
          transform-origin: bottom center;
        }

        @keyframes mouseTrumpetBlast {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          8% {
            transform: translate3d(0, 2px, 0) rotate(-2deg) scale(0.97, 1.03);
          }
          16% {
            transform: translate3d(0, -4px, 0) rotate(5deg) scale(1.07, 0.95);
          }
          22% {
            transform: translate3d(0, -2px, 0) rotate(-4deg) scale(1.03, 0.98);
          }
          28% {
            transform: translate3d(0, -4px, 0) rotate(4deg) scale(1.06, 0.95);
          }
          34% {
            transform: translateY(-2px) rotate(-3deg) scale(1.02, 0.98);
          }
          40% {
            transform: translateY(-4px) rotate(3deg) scale(1.05, 0.96);
          }
          46% {
            transform: translateY(-1px) rotate(-2deg) scale(1.02, 0.99);
          }
          54% {
            /* Pausa respiro */
            transform: translateY(0) rotate(0deg) scale(1);
          }
          64% {
            /* Secondo squillo di tromba con tremolio */
            transform: translateY(-3px) rotate(4deg) scale(1.05, 0.96);
          }
          70% {
            transform: translateY(-1px) rotate(-3deg) scale(1.02, 0.98);
          }
          76% {
            transform: translateY(-3px) rotate(3deg) scale(1.04, 0.97);
          }
          84% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }

        /* Onde concentriche sonore attorno al padiglione */
        .sound-pulse-ring {
          position: absolute;
          top: 18px;
          left: 4px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--coraline-yellow);
          pointer-events: none;
          opacity: 0;
        }

        .ring-1 {
          animation: trumpetRings 1.4s ease-out infinite;
          animation-delay: 0.2s;
        }

        .ring-2 {
          animation: trumpetRings 1.4s ease-out infinite;
          animation-delay: 0.65s;
        }

        @keyframes trumpetRings {
          0% {
            transform: scale(0.4);
            opacity: 0.8;
          }
          60% {
            opacity: 0.4;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
