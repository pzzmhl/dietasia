import React, { useState, useRef, useEffect } from 'react';
import bobinskyImg from '../assets/bobinsky-training.webp';
import circusBg from '../assets/bobinsky-circus-bg.webp';
import { hapticSuccess, hapticLight } from '../utils/haptics';
import { saveWorkoutLog } from '../utils/storage';
import { useInViewport } from '../hooks/useInViewport.js';

/**
 * Scheda Giornaliera di Allenamento del Grande Bobinsky:
 * - Appare ogni giorno con i pulsanti [Sì] e [No]
 * - Al tocco di [Sì] o [No], il pulsante cambia tonalità mostrando l'icona di conferma
 * - Nessun pop-up invasivo a schermo intero o scritta "Attività completata"
 * - Dopo 3 secondi la scheda svanisce dolcemente con transizione fluida e scompare
 */
const BobinskyWorkoutCard = React.memo(function BobinskyWorkoutCard({ 
  todayStr,
  workoutLogs: propWorkoutLogs,
  onSaveWorkout
}) {
  const isSubmittingRef = useRef(false);
  const submitUnlockTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const prevTodayStrRef = useRef(todayStr);

  const workoutLogs = propWorkoutLogs || {};
  const todayStatus = workoutLogs[todayStr] || null;

  // Se la giornata odierna è già stata registrata in passato, la card non compare
  const [isDismissed, setIsDismissed] = useState(() => {
    return !!(todayStatus === 'yes' || todayStatus === 'no');
  });

  const [selectedOption, setSelectedOption] = useState(() => todayStatus);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [cardViewportRef, isCardInViewport] = useInViewport(true);

  // Riallinea lo stato al cambio giorno (mezzanotte) o in caso di modifiche dal Calendario / ripristino Backup
  useEffect(() => {
    if (prevTodayStrRef.current !== todayStr) {
      prevTodayStrRef.current = todayStr;
      isSubmittingRef.current = false;
      if (submitUnlockTimerRef.current) clearTimeout(submitUnlockTimerRef.current);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      setIsFadingOut(false);
      setSelectedOption(todayStatus);
      setIsDismissed(todayStatus === 'yes' || todayStatus === 'no');
      return;
    }

    // Se lo stato esterno viene azzerato (es. deselezione dal Calendario), annulla eventuali timer e riapre la card
    if (!todayStatus) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      setSelectedOption(null);
      setIsDismissed(false);
      setIsFadingOut(false);
      return;
    }

    // Se non è in corso l'animazione locale dei 3 secondi, sincronizza con lo stato esterno
    if (!dismissTimerRef.current && !fadeTimerRef.current) {
      setSelectedOption(todayStatus);
      setIsDismissed(todayStatus === 'yes' || todayStatus === 'no');
    }
  }, [todayStr, todayStatus]);

  // Pulizia rigorosa di tutti i timer allo smontaggio
  useEffect(() => {
    return () => {
      if (submitUnlockTimerRef.current) clearTimeout(submitUnlockTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // Formatta data odierna in italiano senza accenti su "i" (es. "Lunedi 2 Novembre")
  const formatItalianDate = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0);
      const daysOfWeek = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
      const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
      const dayName = daysOfWeek[date.getDay()];
      const monthName = months[m - 1];
      return `${dayName} ${d} ${monthName}`;
    } catch (e) {
      return dStr;
    }
  };

  const handleSelectOption = (status) => {
    if (isSubmittingRef.current || isFadingOut) return;

    // Se l'utente tocca l'opzione già attiva con la spunta (entro i 3s), annulla la selezione
    if (selectedOption === status) {
      hapticLight();
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      setSelectedOption(null);
      setIsFadingOut(false);
      if (onSaveWorkout) {
        onSaveWorkout(todayStr, null);
      } else {
        saveWorkoutLog(todayStr, null);
      }
      return;
    }

    isSubmittingRef.current = true;
    if (submitUnlockTimerRef.current) clearTimeout(submitUnlockTimerRef.current);
    submitUnlockTimerRef.current = setTimeout(() => {
      isSubmittingRef.current = false;
      submitUnlockTimerRef.current = null;
    }, 400);

    if (status === 'yes') {
      hapticSuccess();
    } else {
      hapticLight();
    }

    setSelectedOption(status);

    // Salva l'allenamento per oggi mantenendo cache RAM + localStorage sincronizzati
    if (onSaveWorkout) {
      onSaveWorkout(todayStr, status);
    } else {
      saveWorkoutLog(todayStr, status);
    }

    // Dopo esattamente 3 secondi avvia la transizione di svanimento fluida
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    dismissTimerRef.current = setTimeout(() => {
      dismissTimerRef.current = null;
      setIsFadingOut(true);
      fadeTimerRef.current = setTimeout(() => {
        fadeTimerRef.current = null;
        setIsDismissed(true);
      }, 650);
    }, 3000);
  };

  // Colore Bobinsky Coraline: R:141 G:109 B:82
  const bobinskyColor = 'rgb(141, 109, 82)';

  if (isDismissed) {
    return null;
  }

  const isYesChosen = selectedOption === 'yes';
  const isNoChosen = selectedOption === 'no';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: isFadingOut ? '0fr' : '1fr',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(0.96) translate3d(0, -10px, 0)' : 'scale(1) translate3d(0, 0, 0)',
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), grid-template-rows 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto'
      }}
    >
      <div style={{ overflow: 'hidden', minHeight: 0 }}>
        <div
          ref={cardViewportRef}
          role="region"
          aria-label="Avviso Allenamento Bobinsky"
          className={`stitched-card perf-contain-card${isCardInViewport ? '' : ' offscreen-anim-paused'}`}
          style={{
            width: '100%',
            marginBottom: '16px',
            borderRadius: '20px',
            background: 'rgba(5, 17, 30, 0.92)',
            border: `2px dashed ${bobinskyColor}`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(141, 109, 82, 0.28), inset 0 0 15px rgba(141, 109, 82, 0.15)',
            padding: '18px 16px 18px 14px',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            touchAction: 'manipulation',
            animation: 'bobinskyNoticeEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
      {/* SFONDO CIRCO DI TOPI DI BOBINSKY */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${circusBg})`,
          backgroundPosition: 'center 46%',
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

      {/* VELATURA SFUMATA PER LEGGIBILITÀ */}
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

      {/* LATO SINISTRO: IL GRANDE BOBINSKY (92px) */}
      <div
        style={{
          flexShrink: 0,
          width: '92px',
          height: '92px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          animation: 'bobinskyNoticeFloat 3.5s ease-in-out infinite',
          willChange: 'transform'
        }}
      >
        <img
          src={bobinskyImg}
          alt="Il Grande Bobinsky"
          width={92}
          height={92}
          loading="eager"
          decoding="async"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(141, 109, 82, 0.35))',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* LATO DESTRO: TITOLO, DATA E PULSANTI SÌ/NO */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left'
        }}
      >
        {/* Titolo in Font Coraline */}
        <div
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '18px',
            color: bobinskyColor,
            letterSpacing: '0.8px',
            lineHeight: 1.15,
            marginBottom: '4px',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(141, 109, 82, 0.45)'
          }}
        >
          Allenamento?
        </div>

        {/* Specifica del giorno in italiano */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11.5px',
            color: 'var(--coraline-parchment)',
            opacity: 0.9,
            lineHeight: 1.35,
            marginBottom: '10px',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)'
          }}
        >
          <span style={{ color: bobinskyColor, fontWeight: 700 }}>
            {formatItalianDate(todayStr)}
          </span>
          <span style={{ opacity: 0.75 }}>
            {' — Oggi acrobazie o riposo per la brigata?'}
          </span>
        </div>

        {/* Pulsanti Sì e No con feedback cromatico immediato */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSelectOption('yes')}
            disabled={isFadingOut}
            aria-label="Sì, allenamento completato"
            style={{
              minWidth: '82px',
              height: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxSizing: 'border-box',
              padding: '6px 16px',
              borderRadius: '12px',
              border: isYesChosen
                ? '1.8px solid #4ade80'
                : '1px solid rgba(141, 109, 82, 0.55)',
              backgroundColor: isYesChosen
                ? 'rgba(16, 54, 30, 0.95)'
                : 'rgba(6, 20, 34, 0.8)',
              boxShadow: isYesChosen
                ? '0 0 16px rgba(74, 222, 128, 0.45), inset 0 1px 0 rgba(74, 222, 128, 0.4)'
                : '0 2px 8px rgba(0, 0, 0, 0.4)',
              color: isYesChosen ? '#86efac' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: isFadingOut ? 'default' : 'pointer',
              touchAction: 'manipulation',
              transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.12s ease',
              opacity: isNoChosen ? 0.45 : 1
            }}
          >
            {isYesChosen && (
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>
                ✓
              </span>
            )}
            <span>Sì</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectOption('no')}
            disabled={isFadingOut}
            aria-label="No, giorno di riposo"
            style={{
              minWidth: '82px',
              height: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxSizing: 'border-box',
              padding: '6px 16px',
              borderRadius: '12px',
              border: isNoChosen
                ? '1.8px solid rgba(239, 68, 68, 0.75)'
                : '1px solid rgba(141, 109, 82, 0.55)',
              backgroundColor: isNoChosen
                ? 'rgba(48, 18, 24, 0.95)'
                : 'rgba(6, 20, 34, 0.8)',
              boxShadow: isNoChosen
                ? '0 0 16px rgba(239, 68, 68, 0.45), inset 0 1px 0 rgba(239, 68, 68, 0.4)'
                : '0 2px 8px rgba(0, 0, 0, 0.4)',
              color: isNoChosen ? '#fca5a5' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: isFadingOut ? 'default' : 'pointer',
              touchAction: 'manipulation',
              transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.12s ease',
              opacity: isYesChosen ? 0.45 : 1
            }}
          >
            {isNoChosen && (
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#f87171', lineHeight: 1 }}>
                ✕
              </span>
            )}
            <span>No</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bobinskyNoticeEnter {
          from {
            opacity: 0;
            transform: translate3d(0, -6px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes bobinskyNoticeFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -8px, 0) rotate(2.2deg);
          }
        }
      `}</style>
        </div>
      </div>
    </div>
  );
});

export default BobinskyWorkoutCard;
