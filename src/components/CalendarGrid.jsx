import React, { useMemo, useRef, useState } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import keyImg from '../assets/key.webp';
import gearBallImg from '../assets/gear-ball.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import starryBg from '../assets/coraline-starry-bg.webp';
import coralineDollBg from '../assets/coraline-doll-bg.webp';
import bobinskyWorkoutBg from '../assets/bobinsky-circus-calendar-bg.webp';
import DayWorkoutModal from './DayWorkoutModal';
import { triggerHapticFeedback } from '../services/haptics';

// Formato europeo ISO: settimana rigorosamente da Lunedì a Domenica
const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Cella vuota segnaposto per i giorni mancanti a inizio o fine mese.
 * Visualizza un quadratino discreto stilizzato a tema:
 * - Dieta: spago vintage (#786343) e pergamena (#DDCAB7)
 * - Palestra: legno scuro (#190A06), granata (#53150E) e bronzo (#8D6D52)
 */
const EmptyCell = React.memo(function EmptyCell({ calendarMode = 'diet' }) {
  const isWorkout = calendarMode === 'workout';
  return (
    <div
      aria-hidden="true"
      style={{
        aspectRatio: '1 / 1',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        borderRadius: '12px',
        backgroundColor: isWorkout ? 'rgba(26, 12, 10, 0.32)' : 'rgba(13, 44, 73, 0.22)',
        border: isWorkout ? '1px dashed rgba(141, 109, 82, 0.28)' : '1px dashed rgba(120, 99, 67, 0.32)',
        boxShadow: isWorkout ? 'inset 0 1px 0 0 rgba(197, 155, 109, 0.05)' : 'inset 0 1px 0 0 rgba(221, 202, 183, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-gothic)',
          fontSize: '13px',
          fontWeight: 600,
          color: isWorkout ? 'rgba(212, 210, 187, 0.22)' : 'rgba(221, 202, 183, 0.30)',
          lineHeight: 1
        }}
      >
        –
      </span>
    </div>
  );
});

/**
 * Singola Cella del Calendario memoizzata per azzerare re-render dell'intero mese.
 * Temi bivalenti:
 * - Modalità Dieta: Palette Coraline (#0D2C49, #DDCAB7, #786343, #C7A40E, #D8C615)
 * - Modalità Palestra: Palette Bobinsky (#53150E Granata Circo, #8D6D52 Bronzo, #C59B6D Ottone, #D4D2BB Pergamena, #190A06 Legno)
 */
const DayCell = React.memo(function DayCell({
  day,
  dateStr,
  isToday,
  isFuture = false,
  dietState,
  workoutState,
  calendarMode = 'diet',
  onSelectDate,
  onOpenWorkoutModal,
  onCatSpeak
}) {
  const isWorkout = calendarMode === 'workout';

  let cellBg = isWorkout ? 'rgba(32, 14, 11, 0.68)' : 'rgba(13, 44, 73, 0.58)';
  let cellBorder = isWorkout ? '1px solid rgba(141, 109, 82, 0.35)' : '1px solid rgba(120, 99, 67, 0.35)';
  let cellShadow = isWorkout 
    ? 'inset 0 1px 0 rgba(212, 210, 187, 0.08), 0 2px 6px rgba(0, 0, 0, 0.5)'
    : 'inset 0 1px 0 rgba(221, 202, 183, 0.08), 0 2px 6px rgba(0, 0, 0, 0.42)';

  if (isWorkout) {
    if (workoutState === 'yes') {
      // Allenamento completato: Vittoria circense in ottone dorato lucido e bronzo
      cellBg = 'rgba(48, 28, 16, 0.88)';
      cellBorder = '1.5px solid rgb(197, 155, 109)';
      cellShadow = 'inset 0 1px 0 rgba(212, 210, 187, 0.35), 0 0 12px rgba(141, 109, 82, 0.55), 0 2px 8px rgba(0, 0, 0, 0.65)';
    } else if (workoutState === 'no') {
      // Nessun allenamento: Sfondo legno scuro circense con bordo tratteggiato sobrio (senza X rossa aggressiva)
      cellBg = 'rgba(20, 8, 6, 0.45)';
      cellBorder = '1px dashed rgba(141, 109, 82, 0.32)';
      cellShadow = 'none';
    } else {
      cellBg = 'rgba(32, 14, 11, 0.68)';
      cellBorder = '1px solid rgba(141, 109, 82, 0.35)';
      cellShadow = 'inset 0 1px 0 rgba(212, 210, 187, 0.08), 0 2px 6px rgba(0, 0, 0, 0.5)';
    }
  } else {
    if (dietState === 'success') {
      cellBg = 'rgba(12, 52, 42, 0.65)';
      cellBorder = '1.5px solid rgba(74, 222, 128, 0.65)';
      cellShadow = 'inset 0 1px 0 rgba(139, 229, 116, 0.3), 0 2px 8px rgba(0, 0, 0, 0.45)';
    } else if (dietState === 'cheat') {
      cellBg = 'rgba(52, 18, 24, 0.65)';
      cellBorder = '1.5px solid rgba(239, 68, 68, 0.55)';
      cellShadow = 'inset 0 1px 0 rgba(239, 68, 68, 0.25), 0 2px 8px rgba(0, 0, 0, 0.45)';
    } else if (dietState === 'cheat_key') {
      cellBg = 'rgba(52, 42, 12, 0.65)';
      cellBorder = '1.5px solid #D8C615';
      cellShadow = 'inset 0 1px 0 rgba(216, 198, 21, 0.4), 0 0 10px rgba(199, 164, 14, 0.35)';
    }
  }

  // Giorno odierno (Oggi):
  // - Palestra: Ottone e Bronzo del Circo rgb(197, 155, 109)
  // - Dieta: Giallo Impermeabile Coraline #D8C615
  if (isToday) {
    if (isWorkout) {
      cellBorder = '2px solid rgb(197, 155, 109)';
      cellShadow = '0 0 14px rgba(197, 155, 109, 0.65), inset 0 0 6px rgba(141, 109, 82, 0.35)';
      if (!workoutState) {
        cellBg = 'rgba(48, 20, 14, 0.88)';
      }
    } else {
      cellBorder = '2px solid #D8C615';
      cellShadow = '0 0 14px rgba(216, 198, 21, 0.62), inset 0 0 6px rgba(216, 198, 21, 0.25)';
      if (!dietState) {
        cellBg = 'rgba(13, 44, 73, 0.88)';
      }
    }
  }

  // Micro-inclinazione artigianale stop-motion per gli oggetti reali
  const organicRotation = ((day * 7) % 5 - 2) * 1.2;

  const handleClick = () => {
    if (isFuture) {
      triggerHapticFeedback('selection');
      if (onCatSpeak) {
        onCatSpeak("Non puoi anticipare il tempo dell'Altro Mondo: registra solo oggi o i giorni passati.");
      }
      return;
    }
    triggerHapticFeedback('selection');
    if (isWorkout) {
      onOpenWorkoutModal(dateStr);
    } else {
      onSelectDate(dateStr);
    }
  };

  const dayNumberColor = isToday
    ? (isWorkout ? 'rgb(235, 195, 150)' : '#D8C615')
    : (isWorkout ? '#D4D2BB' : '#DDCAB7');

  return (
    <button
      onClick={handleClick}
      aria-label={isFuture ? `Giorno futuro non registrabile: ${day}` : `Giorno ${day}`}
      style={{
        aspectRatio: '1 / 1',
        width: '100%',
        minWidth: 0,
        padding: '2px',
        boxSizing: 'border-box',
        borderRadius: '12px',
        backgroundColor: cellBg,
        border: cellBorder,
        boxShadow: cellShadow,
        color: dayNumberColor,
        fontFamily: 'var(--font-gothic)',
        fontSize: '14px',
        fontWeight: isToday ? 800 : 600,
        cursor: isFuture ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        lineHeight: 1,
        touchAction: 'pan-y',
        willChange: 'transform',
        opacity: isFuture ? 0.35 : ((isWorkout && workoutState === 'no') ? 0.45 : 1),
        transform: 'translateZ(0)',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease'
      }}
    >
      {isWorkout ? (
        workoutState === 'yes' ? (
          <img
            src={gearBallImg}
            alt="Allenamento Fatto"
            loading="eager"
            decoding="async"
            className="stop-motion-icon"
            style={{
              width: '84%',
              height: '84%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 8px rgba(197, 155, 109, 0.55))',
              pointerEvents: 'none',
              transform: `rotate(${organicRotation}deg)`
            }}
          />
        ) : workoutState === 'no' ? (
          <span
            style={{
              color: 'rgba(197, 155, 109, 0.45)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: 1
            }}
          >
            {day}
          </span>
        ) : (
          <span>{day}</span>
        )
      ) : (
        dietState === 'success' ? (
          <img
            src={seeingStoneImg}
            alt="Dieta Rispettata"
            loading="eager"
            decoding="async"
            className="stop-motion-icon"
            style={{
              width: '84%',
              height: '84%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.5))',
              pointerEvents: 'none',
              transform: `rotate(${organicRotation}deg)`
            }}
          />
        ) : dietState === 'cheat' ? (
          <img
            src={blackButtonImg}
            alt="Sgarrato"
            loading="eager"
            decoding="async"
            className="stop-motion-icon"
            style={{
              width: '84%',
              height: '84%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.85))',
              pointerEvents: 'none',
              transform: `rotate(${organicRotation}deg)`
            }}
          />
        ) : dietState === 'cheat_key' ? (
          <img
            src={keyImg}
            alt="Chiave Jolly Usata"
            loading="eager"
            decoding="async"
            className="stop-motion-icon"
            style={{
              width: '86%',
              height: '86%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 12px rgba(225, 240, 255, 0.8)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))',
              pointerEvents: 'none',
              transform: `rotate(${organicRotation}deg)`
            }}
          />
        ) : (
          <span>{day}</span>
        )
      )}
    </button>
  );
});

/**
 * Calendario Mensile a Griglia stile Coraline (Hardware Accelerated, Gesture Swipe & 120 FPS)
 */
const CalendarGrid = React.memo(function CalendarGrid({ 
  selectedDate, 
  onSelectDate, 
  allLogs = {},
  workoutLogs = {},
  onSaveWorkout,
  displayYear,
  displayMonth,
  onPrevMonth,
  onNextMonth,
  onResetToCurrentMonth,
  onCatSpeak
}) {
  const touchStartRef = useRef(null);
  const [calendarMode, setCalendarMode] = useState('diet'); // 'diet' | 'workout'
  const [workoutModalState, setWorkoutModalState] = useState({ isOpen: false, dateStr: null });

  const { firstDayColumn, daysArray, todayStr, leadingDaysCount, trailingDaysCount } = useMemo(() => {
    const count = new Date(displayYear, displayMonth + 1, 0).getDate();
    const rawFirst = new Date(displayYear, displayMonth, 1).getDay();
    const col = rawFirst === 0 ? 7 : rawFirst;
    const arr = Array.from({ length: count }, (_, i) => i + 1);
    
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${now.getFullYear()}-${m}-${d}`;

    const leading = col - 1;
    const trailing = (7 - ((leading + count) % 7)) % 7;

    return {
      firstDayColumn: col,
      daysArray: arr,
      todayStr: today,
      leadingDaysCount: leading,
      trailingDaysCount: trailing
    };
  }, [displayYear, displayMonth]);

  // Gestione Swipe Orizzontale Naturale per Sfogliare i Mesi (Thumb Reach)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Riconosce swipe orizzontale intenzionale senza bloccare lo scroll verticale
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && deltaTime < 650) {
      if (deltaX < 0) {
        triggerHapticFeedback('swipe');
        onNextMonth();
      } else {
        triggerHapticFeedback('swipe');
        onPrevMonth();
      }
    }
  };

  const GRID_GAP = '4px';

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ 
        width: '100%',
        borderRadius: '24px',
        background: calendarMode === 'workout'
          ? 'linear-gradient(180deg, rgba(38, 16, 12, 0.96) 0%, rgba(24, 10, 8, 0.98) 55%, rgba(14, 6, 5, 1) 100%)'
          : 'linear-gradient(180deg, rgba(13, 44, 73, 0.95) 0%, rgba(8, 26, 44, 0.98) 55%, rgba(4, 14, 25, 1) 100%)',
        border: calendarMode === 'workout'
          ? '1.5px solid rgba(141, 109, 82, 0.65)'
          : '1.5px solid rgba(199, 164, 14, 0.45)',
        boxShadow: calendarMode === 'workout'
          ? '0 16px 40px rgba(0, 0, 0, 0.95), inset 0 1.5px 0 0 rgba(197, 155, 109, 0.45), inset 0 0 24px rgba(83, 21, 14, 0.55)'
          : '0 16px 40px rgba(0, 0, 0, 0.92), inset 0 1.5px 0 0 rgba(216, 198, 21, 0.38), inset 0 0 24px rgba(13, 44, 73, 0.65)',
        padding: '16px 12px 14px 12px', 
        marginBottom: '16px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-y',
        transition: 'border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease'
      }}
    >
      {/* SFONDO CON CIELO STELLATO MAGICO DI CORALINE */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${starryBg})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        opacity: 0.06,
        filter: 'blur(2px)',
        WebkitFilter: 'blur(2px)',
        maskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.15) 90%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.15) 90%)',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0
      }} />

      {/* SFONDO CON LA BAMBOLA DI CORALINE (PER IL CALENDARIO DIETA) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${coralineDollBg})`,
        backgroundPosition: 'center 35%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        opacity: calendarMode === 'diet' ? 0.35 : 0,
        filter: 'blur(0.5px) brightness(0.85) contrast(1.12)',
        WebkitFilter: 'blur(0.5px) brightness(0.85) contrast(1.12)',
        maskImage: 'radial-gradient(circle at 50% 45%, black 60%, rgba(0, 0, 0, 0.4) 95%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 60%, rgba(0, 0, 0, 0.4) 95%)',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0,
        transition: 'opacity 0.35s ease'
      }} />

      {/* SFONDO CON IL GRANDE BOBINSKY NEL CIRCO (PER IL CALENDARIO ALLENAMENTO) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${bobinskyWorkoutBg})`,
        backgroundPosition: 'center 25%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        opacity: calendarMode === 'workout' ? 0.34 : 0,
        filter: 'blur(1px) brightness(0.70) contrast(1.12)',
        WebkitFilter: 'blur(1px) brightness(0.70) contrast(1.12)',
        maskImage: 'radial-gradient(circle at 50% 45%, black 55%, rgba(0, 0, 0, 0.3) 90%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 55%, rgba(0, 0, 0, 0.3) 90%)',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0,
        transition: 'opacity 0.35s ease'
      }} />

      {/* TRAMA VORTICE / SPIRALE SFUMATA IN SECONDO PIANO */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${vortexBg})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        opacity: calendarMode === 'workout' ? 0.02 : 0.05,
        filter: 'blur(2px)',
        WebkitFilter: 'blur(2px)',
        maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0
      }} />

      {/* ALONE RADIALE SOTTILE */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '240px',
        height: '180px',
        background: calendarMode === 'workout'
          ? 'radial-gradient(circle, rgba(141, 109, 82, 0.24) 0%, rgba(83, 21, 14, 0.18) 50%, transparent 75%)'
          : 'radial-gradient(circle, rgba(216, 198, 21, 0.12) 0%, rgba(13, 44, 73, 0.25) 55%, transparent 75%)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.35s ease'
      }} />

      {/* Intestazione Mese con font Dashboard al centro e freccette ai lati */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        padding: '0 4px'
      }}>
        {/* Freccia Sinistra (Mese Precedente) */}
        <button
          onClick={() => {
            triggerHapticFeedback('swipe');
            onPrevMonth();
          }}
          aria-label="Mese precedente"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            backgroundColor: calendarMode === 'workout' ? 'rgba(38, 16, 12, 0.88)' : 'rgba(13, 44, 73, 0.85)',
            border: calendarMode === 'workout' 
              ? '1px solid rgba(141, 109, 82, 0.5)' 
              : '1px solid rgba(199, 164, 14, 0.38)',
            boxShadow: calendarMode === 'workout'
              ? '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(197, 155, 109, 0.25)'
              : '0 4px 12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(216, 198, 21, 0.22)',
            color: calendarMode === 'workout' ? '#D4D2BB' : '#DDCAB7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            touchAction: 'pan-y',
            transition: 'transform 0.1s ease, border-color 0.35s ease, background-color 0.35s ease'
          }}
        >
          ◀
        </button>

        {/* Nome del Mese Centrato in Font Ufficiale Coraline */}
        <h2
          role="button"
          tabIndex={0}
          onClick={() => {
            triggerHapticFeedback('selection');
            if (onResetToCurrentMonth) {
              onResetToCurrentMonth();
            }
          }}
          title="Tocca per tornare al mese corrente"
          aria-label={`Mese: ${MONTHS_IT[displayMonth]}. Tocca per tornare al mese corrente`}
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '22px',
            color: calendarMode === 'workout' ? 'rgb(215, 175, 130)' : '#D8C615',
            textAlign: 'center',
            margin: 0,
            letterSpacing: '0.8px',
            textShadow: calendarMode === 'workout'
              ? '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 14px rgba(197, 155, 109, 0.55)'
              : '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 14px rgba(216, 198, 21, 0.52)',
            lineHeight: 1.15,
            cursor: 'pointer',
            touchAction: 'manipulation',
            userSelect: 'none',
            padding: '4px 10px',
            borderRadius: '10px',
            transition: 'transform 0.15s ease, color 0.35s ease, text-shadow 0.35s ease'
          }}
        >
          {MONTHS_IT[displayMonth]}
        </h2>

        {/* Freccia Destra (Mese Successivo) */}
        <button
          onClick={() => {
            triggerHapticFeedback('swipe');
            onNextMonth();
          }}
          aria-label="Mese successivo"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            backgroundColor: calendarMode === 'workout' ? 'rgba(38, 16, 12, 0.88)' : 'rgba(13, 44, 73, 0.85)',
            border: calendarMode === 'workout' 
              ? '1px solid rgba(141, 109, 82, 0.5)' 
              : '1px solid rgba(199, 164, 14, 0.38)',
            boxShadow: calendarMode === 'workout'
              ? '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(197, 155, 109, 0.25)'
              : '0 4px 12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(216, 198, 21, 0.22)',
            color: calendarMode === 'workout' ? '#D4D2BB' : '#DDCAB7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            touchAction: 'pan-y',
            transition: 'transform 0.1s ease, border-color 0.35s ease, background-color 0.35s ease'
          }}
        >
          ▶
        </button>
      </div>

      {/* Intestazione Giorni della Settimana (LUN -> DOM) */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: GRID_GAP,
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        {DAYS_HEADER.map((dayName) => (
          <div 
            key={dayName} 
            style={{ 
              color: calendarMode === 'workout' ? '#D4D2BB' : '#DDCAB7',
              opacity: 0.85,
              fontSize: '11px',
              fontFamily: 'var(--font-gothic)',
              fontWeight: 700,
              padding: '2px 0'
            }}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Griglia Giorni del Mese con Celle Memoizzate e transizione fluida */}
      <div 
        key={`${displayYear}-${displayMonth}`}
        style={{ 
          position: 'relative',
          zIndex: 1,
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
          gap: GRID_GAP,
          width: '100%',
          boxSizing: 'border-box',
          animation: 'monthFadeSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Quadratini segnaposto discreti con trattino per i giorni che mancano a inizio mese */}
        {Array.from({ length: leadingDaysCount }).map((_, idx) => (
          <EmptyCell key={`lead-${idx}`} calendarMode={calendarMode} />
        ))}

        {/* Giorni effettivi del mese */}
        {daysArray.map((day) => {
          const m = String(displayMonth + 1).padStart(2, '0');
          const d = String(day).padStart(2, '0');
          const dateStr = `${displayYear}-${m}-${d}`;
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          const log = (allLogs && allLogs[dateStr]) || {};
          const dietState = log.dietState;
          const workoutState = (workoutLogs && workoutLogs[dateStr]) || null;

          return (
            <DayCell
              key={dateStr}
              day={day}
              dateStr={dateStr}
              isToday={isToday}
              isFuture={isFuture}
              dietState={dietState}
              workoutState={workoutState}
              calendarMode={calendarMode}
              onSelectDate={onSelectDate}
              onOpenWorkoutModal={(dStr) => setWorkoutModalState({ isOpen: true, dateStr: dStr })}
              onCatSpeak={onCatSpeak}
            />
          );
        })}

        {/* Quadratini segnaposto discreti con trattino per i giorni che mancano a fine mese */}
        {Array.from({ length: trailingDaysCount }).map((_, idx) => (
          <EmptyCell key={`trail-${idx}`} calendarMode={calendarMode} />
        ))}
      </div>

      {/* SLIDER / SEGMENTED CONTROL NEUTRO IN TONO BIANCO: DIETA / ALL. */}
      <div
        role="tablist"
        aria-label="Modalità calendario"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '144px',
          margin: '12px auto 2px auto',
          padding: '2px',
          backgroundColor: 'rgba(10, 14, 24, 0.85)',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.18)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.35)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3px',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={calendarMode === 'diet'}
          onClick={() => {
            if (calendarMode !== 'diet') {
              triggerHapticFeedback('selection');
              setCalendarMode('diet');
            }
          }}
          style={{
            padding: '5px 8px',
            borderRadius: '10px',
            border: calendarMode === 'diet'
              ? '1px solid rgba(226, 232, 240, 0.9)'
              : '1px solid transparent',
            background: calendarMode === 'diet'
              ? 'rgba(226, 232, 240, 0.88)'
              : 'transparent',
            boxShadow: calendarMode === 'diet'
              ? '0 0 8px rgba(226, 232, 240, 0.35), 0 2px 4px rgba(0, 0, 0, 0.4)'
              : 'none',
            color: calendarMode === 'diet' ? '#0a0f1d' : 'rgba(226, 232, 240, 0.55)',
            fontWeight: calendarMode === 'diet' ? 700 : 500,
            fontFamily: 'var(--font-gothic)',
            fontSize: '11px',
            letterSpacing: '0.4px',
            cursor: 'pointer',
            textAlign: 'center',
            lineHeight: 1.2,
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            touchAction: 'manipulation'
          }}
        >
          Dieta
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={calendarMode === 'workout'}
          onClick={() => {
            if (calendarMode !== 'workout') {
              triggerHapticFeedback('selection');
              setCalendarMode('workout');
            }
          }}
          style={{
            padding: '5px 8px',
            borderRadius: '10px',
            border: calendarMode === 'workout'
              ? '1px solid rgba(226, 232, 240, 0.9)'
              : '1px solid transparent',
            background: calendarMode === 'workout'
              ? 'rgba(226, 232, 240, 0.88)'
              : 'transparent',
            boxShadow: calendarMode === 'workout'
              ? '0 0 8px rgba(226, 232, 240, 0.35), 0 2px 4px rgba(0, 0, 0, 0.4)'
              : 'none',
            color: calendarMode === 'workout' ? '#0a0f1d' : 'rgba(226, 232, 240, 0.55)',
            fontWeight: calendarMode === 'workout' ? 700 : 500,
            fontFamily: 'var(--font-gothic)',
            fontSize: '11px',
            letterSpacing: '0.4px',
            cursor: 'pointer',
            textAlign: 'center',
            lineHeight: 1.2,
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            touchAction: 'manipulation'
          }}
        >
          All.
        </button>
      </div>

      {/* MODAL ALLENAMENTO RAPIDO PER DATA */}
      <DayWorkoutModal
        isOpen={workoutModalState.isOpen}
        dateStr={workoutModalState.dateStr}
        currentStatus={workoutModalState.dateStr && workoutLogs ? workoutLogs[workoutModalState.dateStr] : null}
        onSelectStatus={(status) => {
          if (workoutModalState.dateStr && onSaveWorkout) {
            onSaveWorkout(workoutModalState.dateStr, status);
          }
          setWorkoutModalState({ isOpen: false, dateStr: null });
        }}
        onClose={() => setWorkoutModalState({ isOpen: false, dateStr: null })}
      />
    </div>
  );
});

export default CalendarGrid;
