import React, { useState, useEffect } from 'react';
import BlackButtonIcon from './BlackButtonIcon';

// Formato europeo ISO: settimana rigorosamente da Lunedì a Domenica
const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Calendario Mensile a Griglia ultra-ottimizzato per schermi Android e iOS.
 * - Stesso gap sia per intestazione che per celle (allineamento millimetrico delle colonne).
 * - Uso di gridColumnStart sul giorno 1: elimina i disallineamenti di altezza e offset.
 * - min-width: 0 per prevenire overflow orizzontale su schermi stretti (es. 360px).
 */
export default function CalendarGrid({ selectedDate, onSelectDate, allLogs = {} }) {
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const [displayYear, setDisplayYear] = useState(selectedDateObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(selectedDateObj.getMonth());

  useEffect(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    setDisplayYear(d.getFullYear());
    setDisplayMonth(d.getMonth());
  }, [selectedDate]);

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  // In JavaScript: 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato.
  // Converte a colonna CSS Grid (1..7) per Lunedì..Domenica:
  // Lunedì (1) -> 1
  // Martedì (2) -> 2
  // Domenica (0) -> 7
  const rawFirstDay = new Date(displayYear, displayMonth, 1).getDay();
  const firstDayColumn = rawFirstDay === 0 ? 7 : rawFirstDay;

  const formatYMD = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((prev) => prev - 1);
    } else {
      setDisplayMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonth((prev) => prev + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    const todayStr = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
    onSelectDate(todayStr);
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const now = new Date();
  const todayStr = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());

  // Gap comune uniforme per evitare qualsiasi sfasamento tra header e griglia
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
      {/* Intestazione Mese & Pulsanti Navigazione */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: '17px',
            color: '#f8fafc',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            {MONTHS_IT[displayMonth]} {displayYear}
          </h2>
          <button
            onClick={handleTodayClick}
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-gothic)',
              padding: '2px 8px',
              backgroundColor: 'rgba(224, 159, 62, 0.2)',
              border: '1px solid rgba(224, 159, 62, 0.5)',
              borderRadius: '6px',
              color: '#e09f3e',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Oggi
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handlePrevMonth}
            aria-label="Mese precedente"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(35, 25, 66, 0.85)',
              border: '1px solid rgba(224, 159, 62, 0.35)',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px'
            }}
          >
            ◀
          </button>

          <button
            onClick={handleNextMonth}
            aria-label="Mese successivo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(35, 25, 66, 0.85)',
              border: '1px solid rgba(224, 159, 62, 0.35)',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px'
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Intestazione Giorni della Settimana (LUN -> DOM) con identico gap */}
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
                color: isWeekend ? '#cbd5e1' : '#94a3b8',
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

      {/* Griglia Giorni del Mese con identico gap e colonne allineate al millimetro */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
        gap: GRID_GAP,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {daysArray.map((day) => {
          const dateStr = formatYMD(displayYear, displayMonth, day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const log = allLogs[dateStr] || {};
          const dietState = log.dietState;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              style={{
                // Il primo giorno del mese si posiziona esattamente nella sua colonna CSS
                ...(day === 1 ? { gridColumnStart: firstDayColumn } : {}),
                aspectRatio: '1 / 1',
                width: '100%',
                minWidth: 0,
                padding: '2px',
                boxSizing: 'border-box',
                borderRadius: '10px',
                backgroundColor: isSelected
                  ? 'rgba(224, 159, 62, 0.28)'
                  : dietState === 'success'
                  ? 'rgba(224, 159, 62, 0.12)'
                  : dietState === 'cheat'
                  ? 'rgba(40, 15, 25, 0.5)'
                  : isToday
                  ? 'rgba(35, 25, 66, 0.7)'
                  : 'rgba(15, 16, 38, 0.6)',
                border: isSelected
                  ? '2px solid #e09f3e'
                  : isToday
                  ? '1.5px solid rgba(224, 159, 62, 0.5)'
                  : '1px dashed rgba(224, 159, 62, 0.22)',
                boxShadow: isSelected
                  ? '0 0 12px rgba(224, 159, 62, 0.45)'
                  : 'none',
                color: isSelected ? '#ffffff' : '#e2e8f0',
                fontFamily: 'var(--font-gothic)',
                fontSize: '14px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                lineHeight: 1
              }}
            >
              {dietState === 'success' ? (
                /* SIMBOLO GRANDE DIETA SEGUITA: Sostituisce completamente il numero del giorno */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M 4 12 L 9.5 17.5 L 20 6"
                      stroke="#e09f3e"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 4 12 L 9.5 17.5 L 20 6"
                      stroke="#f8fafc"
                      strokeWidth="1.2"
                      strokeDasharray="2 1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : dietState === 'cheat' ? (
                /* SIMBOLO GRANDE BOTTONE NERO: Sostituisce completamente il numero del giorno */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}>
                  <BlackButtonIcon size={26} />
                </div>
              ) : (
                /* GIORNO NON COMPILATO: Mostra il numero standard */
                <span>{day}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
