import React, { useMemo, useRef } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import keyImg from '../assets/key.webp';
import { triggerHapticFeedback } from '../services/haptics';

// Formato europeo ISO: settimana rigorosamente da Lunedì a Domenica
const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Singola Cella del Calendario memoizzata per azzerare re-render dell'intero mese.
 */
const DayCell = React.memo(function DayCell({
  day,
  dateStr,
  isFirstDay,
  firstDayColumn,
  isSelected,
  isToday,
  dietState,
  onSelectDate
}) {
  // Stili e colori calcolati localmente con trasparenza armoniosa sullo sfondo stellato
  let cellBg = 'rgba(6, 22, 37, 0.28)';
  let cellBorder = '1px solid var(--border-dark-blue-subtle)';
  let cellShadow = 'inset 0 1px 0 0 rgba(221, 202, 183, 0.12)';

  if (dietState === 'success') {
    cellBg = 'rgba(21, 128, 61, 0.32)';
    cellBorder = '1.5px solid rgba(52, 211, 153, 0.55)';
  } else if (dietState === 'cheat') {
    cellBg = 'rgba(69, 10, 10, 0.45)';
    cellBorder = '1.5px solid rgba(239, 68, 68, 0.5)';
  } else if (dietState === 'cheat_key') {
    cellBg = 'rgba(120, 99, 67, 0.38)';
    cellBorder = '1.5px solid rgba(199, 164, 14, 0.7)';
  } else if (isToday) {
    cellBg = 'rgba(120, 99, 67, 0.20)';
    cellBorder = '1.5px solid var(--coraline-gold)';
  }

  if (isSelected) {
    cellBorder = dietState === 'success' 
      ? '2px solid #34d399' 
      : dietState === 'cheat' 
      ? '2px solid #ef4444' 
      : '2px solid var(--coraline-yellow)';
    cellShadow = dietState === 'success'
      ? '0 0 14px rgba(52, 211, 153, 0.5)'
      : dietState === 'cheat'
      ? '0 0 14px rgba(239, 68, 68, 0.5)'
      : '0 0 14px rgba(216, 198, 21, 0.55)';
  }

  // Micro-inclinazione artigianale stop-motion per gli oggetti reali
  const organicRotation = ((day * 7) % 5 - 2) * 1.2;

  const handleClick = () => {
    triggerHapticFeedback('selection');
    onSelectDate(dateStr);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        ...(isFirstDay ? { gridColumnStart: firstDayColumn } : {}),
        aspectRatio: '1 / 1',
        width: '100%',
        minWidth: 0,
        padding: '2px',
        boxSizing: 'border-box',
        borderRadius: '10px',
        backgroundColor: cellBg,
        border: cellBorder,
        boxShadow: cellShadow,
        color: isSelected ? 'var(--coraline-yellow)' : 'var(--coraline-parchment)',
        fontFamily: 'var(--font-gothic)',
        fontSize: '14px',
        fontWeight: isSelected ? 800 : 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        lineHeight: 1,
        touchAction: 'pan-y',
        willChange: 'transform',
        transform: isSelected ? 'scale(1.06) translateZ(0)' : 'translateZ(0)',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {dietState === 'success' ? (
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
      )}
    </button>
  );
});

/**
 * Calendario Mensile a Griglia stile Coraline (Hardware Accelerated, Gesture Swipe & 120 FPS)
 */
export default function CalendarGrid({ 
  selectedDate, 
  onSelectDate, 
  allLogs = {},
  displayYear,
  displayMonth,
  onPrevMonth,
  onNextMonth
}) {
  const touchStartRef = useRef(null);

  const { firstDayColumn, daysArray, todayStr } = useMemo(() => {
    const count = new Date(displayYear, displayMonth + 1, 0).getDate();
    const rawFirst = new Date(displayYear, displayMonth, 1).getDay();
    const col = rawFirst === 0 ? 7 : rawFirst;
    const arr = Array.from({ length: count }, (_, i) => i + 1);
    
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${now.getFullYear()}-${m}-${d}`;

    return {
      firstDayColumn: col,
      daysArray: arr,
      todayStr: today
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
      className="stitched-card vortex-card" 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ 
        padding: '14px 10px', 
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box',
        touchAction: 'pan-y'
      }}
    >
      {/* Intestazione Mese con font Dashboard al centro e freccette ai lati */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
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
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(6, 22, 37, 0.55)',
            border: '1.5px solid var(--border-dark-blue)',
            boxShadow: 'inset 0 1px 0 rgba(221, 202, 183, 0.15), 0 2px 6px rgba(0, 0, 0, 0.35)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            touchAction: 'pan-y'
          }}
        >
          ◀
        </button>

        {/* Nome del Mese Centrato in Font Ufficiale Coraline */}
        <h2 style={{
          fontFamily: 'var(--font-coraline)',
          fontSize: '16px',
          color: 'var(--coraline-yellow)',
          textAlign: 'center',
          margin: 0,
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(216, 198, 21, 0.35)'
        }}>
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
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(6, 22, 37, 0.55)',
            border: '1.5px solid var(--border-dark-blue)',
            boxShadow: 'inset 0 1px 0 rgba(221, 202, 183, 0.15), 0 2px 6px rgba(0, 0, 0, 0.35)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            touchAction: 'pan-y'
          }}
        >
          ▶
        </button>
      </div>

      {/* Intestazione Giorni della Settimana (LUN -> DOM) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: GRID_GAP,
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        {DAYS_HEADER.map((dayName, idx) => {
          const isWeekend = idx >= 5;
          return (
            <div 
              key={dayName} 
              style={{ 
                color: isWeekend ? 'var(--coraline-gold)' : 'var(--coraline-parchment)',
                opacity: isWeekend ? 0.9 : 0.75,
                fontSize: '11px',
                fontFamily: 'var(--font-gothic)',
                fontWeight: 700,
                padding: '2px 0'
              }}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Griglia Giorni del Mese con Celle Memoizzate e transizione fluida */}
      <div 
        key={`${displayYear}-${displayMonth}`}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
          gap: GRID_GAP,
          width: '100%',
          boxSizing: 'border-box',
          animation: 'monthFadeSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {daysArray.map((day) => {
          const m = String(displayMonth + 1).padStart(2, '0');
          const d = String(day).padStart(2, '0');
          const dateStr = `${displayYear}-${m}-${d}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const log = (allLogs && allLogs[dateStr]) || {};
          const dietState = log.dietState;

          return (
            <DayCell
              key={dateStr}
              day={day}
              dateStr={dateStr}
              isFirstDay={day === 1}
              firstDayColumn={firstDayColumn}
              isSelected={isSelected}
              isToday={isToday}
              dietState={dietState}
              onSelectDate={onSelectDate}
            />
          );
        })}
      </div>
    </div>
  );
}
