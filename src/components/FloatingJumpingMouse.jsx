import React, { useState, useEffect, useRef } from 'react';
import jumpingMouseImg from '../assets/jumping-mouse.webp';
import catCloudPattern from '../assets/cat-cloud-pattern.webp';
import { hapticLight } from '../utils/haptics';
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
  unmarkedDays = []
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
  const [isPausedByWybie, setIsPausedByWybie] = useState(false);
  const [testForced, setTestForced] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('testMouse') || sessionStorage.getItem(STORAGE_KEYS.TEST_MOUSE_SESSION) === 'true';
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
      setIsPausedByWybie(false);
      setIsCloudOpen(true);
      setTestForced(true);
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
      testTimerRef.current = setTimeout(() => {
        playTrumpetFanfare(0.85);
      }, 250);
    };

    const handleWybieVisibility = (e) => {
      setIsPausedByWybie(Boolean(e?.detail?.visible));
    };

    window.addEventListener('test-coraline-mouse', handleTestEvent);
    window.addEventListener('coraline-wybie-visibility', handleWybieVisibility);
    window.testCoralineMouse = handleTestEvent;

    return () => {
      window.removeEventListener('test-coraline-mouse', handleTestEvent);
      window.removeEventListener('coraline-wybie-visibility', handleWybieVisibility);
      delete window.testCoralineMouse;
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
  const missingCount = effectiveDays.length;

  // Riproduce la trombetta all'avvio quando il topo appare
  useEffect(() => {
    if (effectiveDays.length > 0 && !isDismissed && !isPausedByWybie && !hasPlayedEntranceSoundRef.current) {
      hasPlayedEntranceSoundRef.current = true;
      const timer = setTimeout(() => {
        playTrumpetFanfare(0.85);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [effectiveDays.length, isDismissed, isPausedByWybie]);

  if (isDismissed || isPausedByWybie || effectiveDays.length === 0) {
    return null;
  }

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

  return (
    <aside
      aria-label="Avviso Topo Saltatore del Circo"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)',
        left: '18px',
        zIndex: 10005, // In primo piano assoluto per i test ripetuti
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
          style={{
            position: 'absolute',
            bottom: '108px',
            left: '2px',
            width: 'max-content',
            maxWidth: 'min(195px, 52vw)',
            padding: '11px 14px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #0f172a',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.35)',
            color: '#0f172a',
            fontFamily: 'var(--font-body)',
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

          {/* CONTENUTO INFORMATIVO DELLA NUVOLETTA: SOLO FRASE DEI GIORNI MANCANTI E TASTO OKAY IN GRIGIO */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 650,
                lineHeight: 1.4,
                color: '#0f172a',
                padding: '0 2px'
              }}
            >
              {missingCount === 1
                ? 'Hai 1 giorno da compilare nel diario.'
                : `Hai ${missingCount} giorni da compilare nel diario.`}
            </div>

            {/* UNICO PULSANTE: OKAY IN GRIGIO CHE LO FA SCOMPARIRE FINO AL GIORNO SEGUENTE */}
            <button
              type="button"
              onClick={handleDismissToday}
              aria-label="Okay, ho capito"
              style={{
                background: '#64748b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '4px 18px',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font-gothic)',
                cursor: 'pointer',
                letterSpacing: '0.4px',
                boxShadow: '0 2px 6px rgba(100, 116, 139, 0.4)',
                touchAction: 'manipulation',
                transition: 'background-color 0.18s ease'
              }}
            >
              Okay
            </button>
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
          width={95}
          height={95}
          loading="eager"
          decoding="async"
          draggable={false}
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

