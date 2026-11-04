import React, { useState, useEffect, useRef } from 'react';
import jumpingMouseImg from '../assets/jumping-mouse.webp';
import catCloudPattern from '../assets/cat-cloud-pattern.webp';
import { hapticLight, hapticButtonStitch } from '../utils/haptics';
import { playTrumpetFanfare } from '../services/trumpetAudio';
import { STORAGE_KEYS } from '../constants/storageKeys.js';

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
      const dismissedDate = localStorage.getItem(STORAGE_KEYS.MOUSE_NOTICE_DISMISSED_DATE);
      return dismissedDate === todayStr;
    } catch (e) {
      return false;
    }
  });

  const [isCloudOpen, setIsCloudOpen] = useState(true);
  const [testForced, setTestForced] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('testMouse') || sessionStorage.getItem('test_coraline_mouse') === 'true';
      }
    } catch (e) {}
    return false;
  });
  const hasPlayedEntranceSoundRef = useRef(false);
  const testTimerRef = useRef(null);

  // Ascolta l'evento di test manuale per provare l'animazione e la trombetta
  useEffect(() => {
    const handleTestEvent = () => {
      try {
        localStorage.removeItem(STORAGE_KEYS.MOUSE_NOTICE_DISMISSED_DATE);
      } catch (err) {}
      setIsDismissed(false);
      setIsCloudOpen(true);
      setTestForced(true);
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
      testTimerRef.current = setTimeout(() => {
        playTrumpetFanfare(0.85);
      }, 250);
    };

    window.addEventListener('test-coraline-mouse', handleTestEvent);
    window.testCoralineMouse = handleTestEvent;

    return () => {
      window.removeEventListener('test-coraline-mouse', handleTestEvent);
      if (testTimerRef.current) {
        clearTimeout(testTimerRef.current);
      }
    };
  }, []);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const sampleDays = ['2026-10-30', '2026-10-31'];
  const effectiveDays = (Array.isArray(unmarkedDays) && unmarkedDays.length > 0)
    ? unmarkedDays
    : (testForced ? sampleDays : []);
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
    hapticLight();
    setIsDismissed(true);
    setTestForced(false);
    try {
      localStorage.setItem(STORAGE_KEYS.MOUSE_NOTICE_DISMISSED_DATE, todayStr);
    } catch (err) {}
  };

  const handleMouseClick = () => {
    hapticLight();
    playTrumpetFanfare(0.85);
    setIsCloudOpen((prev) => !prev);
  };

  const handleOpenDayModal = (e) => {
    if (e) e.stopPropagation();
    hapticButtonStitch();
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
        left: '18px',
        zIndex: 9980,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'translateZ(0)',
        pointerEvents: 'none'
      }}
    >
      {/* NUVOLETTA IDENTICA A QUELLA DEL GATTO: FUMETTO BIANCO PULITO CON TRAMA STELLATA DISSOLTA E PUNTA FUMETTO */}
      {isCloudOpen && (
        <div
          onClick={handleDismissToday}
          style={{
            position: 'absolute',
            bottom: '108px',
            left: '2px',
            width: 'max-content',
            maxWidth: 'min(175px, 44vw)',
            padding: '10px 14px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #0f172a',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.35)',
            color: '#0f172a',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'mouseCloudPop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards',
            userSelect: 'none',
            boxSizing: 'border-box'
          }}
        >
          {/* Texture Coraline tantissimo dissolta nel riempimento (opacità 10%) */}
          <div
            style={{
              position: 'absolute',
              inset: '1.5px',
              borderRadius: '14.5px',
              backgroundImage: `url(${catCloudPattern})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: 0.10,
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Puntatore / coda del fumetto in basso a sinistra verso il topo */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '32px',
              width: '10px',
              height: '10px',
              background: '#ffffff',
              borderLeft: '1.5px solid #0f172a',
              borderBottom: '1.5px solid #0f172a',
              transform: 'rotate(-45deg)',
              zIndex: 1
            }}
          />

          {/* CONTENUTO INFORMATIVO DELLA NUVOLETTA */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 650,
                lineHeight: 1.35,
                color: '#0f172a'
              }}
            >
              {missingCount === 1 ? (
                <>Pst! 🎺 C'è una pagina da sfogliare:<br/><strong>{formatDateLabel(firstMissingDate)}</strong></>
              ) : (
                <>Pst! 🎺 Ci sono <strong>{missingCount} pagine</strong> da sfogliare<br/><span style={{ fontSize: '10px', opacity: 0.8 }}>(la prima: {formatDateLabel(firstMissingDate)})</span></>
              )}
            </div>

            {/* PULSANTI: VAI AL GIORNO + PIÙ TARDI */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleOpenDayModal}
                title="Apri il diario per questa data"
                style={{
                  background: 'rgb(141, 109, 82)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-gothic)',
                  cursor: 'pointer',
                  letterSpacing: '0.4px',
                  boxShadow: '0 2px 6px rgba(141, 109, 82, 0.45)',
                  touchAction: 'manipulation'
                }}
              >
                Mostrami
              </button>
              <button
                type="button"
                onClick={handleDismissToday}
                title="Rimanda a più tardi"
                style={{
                  background: 'rgba(30, 41, 59, 0.85)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-gothic)',
                  cursor: 'pointer',
                  letterSpacing: '0.4px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.35)',
                  touchAction: 'manipulation'
                }}
              >
                Più tardi
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
            filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(250, 204, 21, 0.8)) drop-shadow(0 0 24px rgba(234, 179, 8, 0.5))',
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

