import React, { useMemo } from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import keyImg from '../assets/key.png';

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
  // Stili e colori calcolati localmente
  let cellBg = 'rgba(6, 22, 37, 0.65)';
  let cellBorder = '1px solid var(--border-dark-blue-subtle)';
  let cellShadow = 'none';

  if (dietState === 'success') {
    cellBg = 'rgba(21, 128, 61, 0.4)';
    cellBorder = '1.5px solid rgba(52, 211, 153, 0.55)';
  } else if (dietState === 'cheat') {
    cellBg = 'rgba(69, 10, 10, 0.6)';
    cellBorder = '1.5px solid rgba(239, 68, 68, 0.5)';
  } else if (dietState === 'cheat_key') {
    cellBg = 'rgba(120, 99, 67, 0.45)';
    cellBorder = '1.5px solid rgba(199, 164, 14, 0.7)';
  } else if (isToday) {
    cellBg = 'rgba(120, 99, 67, 0.35)';
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

  return (
    <button
      onClick={() => onSelectDate(dateStr)}
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
        touchAction: 'manipulation',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      {dietState === 'success' ? (
        <img
          src={seeingStoneImg}
          alt="Dieta Rispettata"
          loading="eager"
          decoding="async"
          style={{
            width: '84%',
            height: '84%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.5))',
            pointerEvents: 'none'
          }}
        />
      ) : dietState === 'cheat' ? (
        <img
          src={blackButtonImg}
          alt="Sgarrato"
          loading="eager"
          decoding="async"
          style={{
            width: '84%',
            height: '84%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.85))',
            pointerEvents: 'none'
          }}
        />
      ) : dietState === 'cheat_key' ? (
        <img
          src={keyImg}
          alt="Chiave Jolly Usata"
          loading="eager"
          decoding="async"
          style={{
            width: '86%',
            height: '86%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 12px rgba(225, 240, 255, 0.8)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))',
            pointerEvents: 'none'
          }}
        />
      ) : (
        <span>{day}</span>
      )}
    </button>
  );
});

/**
 * Calendario Mensile a Griglia stile Coraline (Hardware Accelerated & 120 FPS)
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

  const GRID_GAP = '4px';

  return (
    <div 
      className="stitched-card" 
      style={{ 
        padding: '14px 10px', 
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box'
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
          onClick={onPrevMonth}
          aria-label="Mese precedente"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(6, 22, 37, 0.85)',
            border: '1.5px solid var(--border-dark-blue)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            touchAction: 'manipulation'
          }}
        >
          ◀
        </button>

        {/* Nome del Mese Centrato in Font Ufficiale Coraline (Identico alla Dashboard) */}
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
          onClick={onNextMonth}
          aria-label="Mese successivo"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(6, 22, 37, 0.85)',
            border: '1.5px solid var(--border-dark-blue)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            touchAction: 'manipulation'
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

      {/* Griglia Giorni del Mese con Celled Memozzate */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
        gap: GRID_GAP,
        width: '100%',
        boxSizing: 'border-box'
      }}>
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
