import React, { useState, useEffect, useRef } from 'react';
import jumpingMouseImg from '../assets/jumping-mouse.webp';
import catCloudPattern from '../assets/cat-cloud-pattern.webp';
import { triggerHapticFeedback } from '../services/haptics';
import { playTrumpetFanfare } from '../services/trumpetAudio';

/**
 * Topo Saltatore Fluttuante del Circo di Bobinsky:
 * - Posizionato in basso a sinistra (a sinistra del gatto)
 * - Appare quando ci sono giorni passati non segnati (unmarkedDays.length > 0)
 * - All'avvio dell'app suona una rapida fanfara di trombetta
 * - Ha una nuvoletta identica a quella del gatto (nuvola cartoon a lobi con tratteggi,
 *   fondo bianco e trama dissolta) con le informazioni sui giorni mancanti
 * - Animazione saltellante originale (mouseTrumpetBlast)
 */
const FloatingJumpingMouse = React.memo(function FloatingJumpingMouse({
  unmarkedDays = [],
  onSelectDay = () => {}
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

  const [isCloudOpen, setIsCloudOpen] = useState(true);
  const hasPlayedEntranceSoundRef = useRef(false);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const effectiveDays = Array.isArray(unmarkedDays) ? unmarkedDays : [];
  const firstMissingDate = effectiveDays[0];
  const missingCount = effectiveDays.length;

  // Riproduce la trombetta all'avvio quando il topo appare
  useEffect(() => {
    if (effectiveDays.length > 0 && !isDismissed && !hasPlayedEntranceSoundRef.current) {
      hasPlayedEntranceSoundRef.current = true;
      const timer = setTimeout(() => {
        playTrumpetFanfare(0.85);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [effectiveDays.length, isDismissed]);

  if (isDismissed || effectiveDays.length === 0) {
    return null;
  }

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

  const handleDismissToday = (e) => {
    if (e) e.stopPropagation();
    triggerHapticFeedback('selection');
    setIsDismissed(true);
    try {
      localStorage.setItem('coraline_mouse_notice_dismissed_date', todayStr);
    } catch (err) {}
  };

  const handleMouseClick = () => {
    triggerHapticFeedback('key');
    playTrumpetFanfare(0.85);
    setIsCloudOpen((prev) => !prev);
  };

  const handleOpenDayModal = (e) => {
    if (e) e.stopPropagation();
    triggerHapticFeedback('selection');
    if (firstMissingDate) {
      onSelectDay(firstMissingDate);
    }
  };

  return (
    <aside
      aria-label="Avviso Topo Saltatore del Circo"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)',
        left: '12px',
        zIndex: 9980,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'translateZ(0)',
        pointerEvents: 'none'
      }}
    >
      {/* NUVOLETTA IDENTICA A QUELLA DEL GATTO: NUVOLA CARTOON A LOBI CON TRATTEGGI */}
      {isCloudOpen && (
        <div
          onClick={handleOpenDayModal}
          style={{
            position: 'absolute',
            bottom: '108px',
            left: '2px',
            width: 'max-content',
            maxWidth: '240px',
            minWidth: '185px',
            minHeight: '92px',
            filter: 'drop-shadow(0 10px 22px rgba(0, 0, 0, 0.65)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))',
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'mouseCloudPop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
          }}
        >
          {/* SFONDO VETTORIALE DELLA VERA NUVOLA A LOBI ARROTONDATI CON TRATTEGGI */}
          <svg
            viewBox="0 0 260 140"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            <defs>
              <clipPath id="mouse-speech-cloud-clip">
                <path d="M 65,115 C 38,115 16,96 16,72 C 16,50 32,32 55,28 C 65,10 98,4 128,12 C 148,4 184,5 204,20 C 228,28 244,52 242,75 C 248,96 230,118 205,116 C 185,124 150,124 130,116 C 112,122 85,122 65,115 Z" />
              </clipPath>
            </defs>

            {/* Corpo bianco a lobi della nuvola con tratteggi */}
            <path
              d="M 65,115 C 38,115 16,96 16,72 C 16,50 32,32 55,28 C 65,10 98,4 128,12 C 148,4 184,5 204,20 C 228,28 244,52 242,75 C 248,96 230,118 205,116 C 185,124 150,124 130,116 C 112,122 85,122 65,115 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2.2"
              strokeDasharray="5,4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Texture stellata di Coraline tantissimo dissolta (10%) */}
            <image
              href={catCloudPattern}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#mouse-speech-cloud-clip)"
              opacity="0.10"
              style={{ mixBlendMode: 'multiply' }}
            />

            {/* Coda a batuffoli discendenti a sinistra verso il topo */}
            <circle
              cx="52"
              cy="126"
              r="6.5"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2"
              strokeDasharray="3.5,3"
              strokeLinecap="round"
            />
            <circle
              cx="42"
              cy="135"
              r="4"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.8"
              strokeDasharray="2.5,2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* CONTENUTO INFORMATIVO DELLA NUVOLETTA */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '16px 20px 22px 20px',
              color: '#0f172a',
              fontFamily: 'var(--font-body)',
              textAlign: 'center',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-coraline)',
                fontSize: '13.5px',
                color: '#b45309',
                marginBottom: '2px',
                letterSpacing: '0.4px'
              }}
            >
              Topi Saltatori!
            </div>

            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 650,
                lineHeight: 1.35,
                marginBottom: '6px'
              }}
            >
              {missingCount === 1 ? (
                <>Manca <strong>1 giorno</strong> ({formatDateLabel(firstMissingDate)}) da registrare!</>
              ) : (
                <>Mancano <strong>{missingCount} giorni</strong> da completare!</>
              )}
            </div>

            {/* PULSANTI DI AZIONE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleOpenDayModal}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '3px 9px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-gothic)',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  touchAction: 'manipulation'
                }}
              >
                Segna
              </button>

              <button
                type="button"
                onClick={handleDismissToday}
                title="Chiudi per oggi"
                style={{
                  background: 'rgba(15, 23, 42, 0.12)',
                  color: '#0f172a',
                  border: '1px solid rgba(15, 23, 42, 0.25)',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-gothic)',
                  cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                ✓ OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PULSANTE CON IL TOPO SALTATORE CHE BALLA E SUONA LA TROMBA */}
      <button
        type="button"
        onClick={handleMouseClick}
        aria-label="Topo Saltatore del Circo di Bobinsky"
        title="Tocca per ascoltare la trombetta e vedere i giorni mancanti"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto',
          touchAction: 'manipulation'
        }}
      >
        <img
          src={jumpingMouseImg}
          alt="Topo Saltatore del Circo"
          className="jumping-mouse-animated"
          loading="eager"
          decoding="async"
          style={{
            height: '95px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 10px rgba(216, 198, 21, 0.35))',
            willChange: 'transform',
            transform: 'translateZ(0)',
            pointerEvents: 'none'
          }}
        />
      </button>

      <style>{`
        @keyframes mouseCloudPop {
          0% {
            opacity: 0;
            transform: scale(0.65) translate3d(-10px, 15px, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
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
    </aside>
  );
});

export default FloatingJumpingMouse;
