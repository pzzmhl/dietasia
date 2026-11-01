import React, { useState, useEffect } from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';

// Formato europeo ISO: settimana rigorosamente da Lunedì a Domenica
const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Calendario Mensile a Griglia stile Coraline.
 * - Simboli ufficiali: Pietra Verde (Dieta Rispettata) & Bottone Nero Reale (Sgarro).
 * - Sfondo cella verde per dieta rispettata, bordeaux scuro per sgarro.
 * - Inizio settimana da Lunedì.
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
  // Lunedì (1) -> colonna 1, ..., Domenica (0) -> colonna 7
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

      {/* Griglia Giorni del Mese */}
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

          // Sfondo e bordo in base allo stato (Verde per successo, Bordeaux scuro per sgarro)
          let cellBg = 'rgba(15, 16, 38, 0.6)';
          let cellBorder = '1px dashed rgba(224, 159, 62, 0.22)';
          let cellShadow = 'none';

          if (dietState === 'success') {
            cellBg = 'rgba(18, 54, 38, 0.55)';
            cellBorder = '1.5px dashed rgba(52, 211, 153, 0.45)';
          } else if (dietState === 'cheat') {
            cellBg = 'rgba(46, 11, 16, 0.65)';
            cellBorder = '1.5px dashed rgba(220, 38, 38, 0.4)';
          } else if (isToday) {
            cellBg = 'rgba(35, 25, 66, 0.7)';
            cellBorder = '1.5px solid rgba(224, 159, 62, 0.5)';
          }

          if (isSelected) {
            cellBorder = dietState === 'success' 
              ? '2px solid #34d399' 
              : dietState === 'cheat' 
              ? '2px solid #ef4444' 
              : '2px solid #e09f3e';
            cellShadow = dietState === 'success'
              ? '0 0 14px rgba(52, 211, 153, 0.5)'
              : dietState === 'cheat'
              ? '0 0 14px rgba(220, 38, 38, 0.5)'
              : '0 0 12px rgba(224, 159, 62, 0.45)';
          }

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              style={{
                ...(day === 1 ? { gridColumnStart: firstDayColumn } : {}),
                aspectRatio: '1 / 1',
                width: '100%',
                minWidth: 0,
                padding: '2px',
                boxSizing: 'border-box',
                borderRadius: '10px',
                backgroundColor: cellBg,
                border: cellBorder,
                boxShadow: cellShadow,
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
                /* SIMBOLO GRANDE: PIETRA DELLA VISTA VERDE DI CORALINE */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '1px'
                }}>
                  <img
                    src={seeingStoneImg}
                    alt="Dieta Rispettata - Pietra Verde"
                    style={{
                      width: '84%',
                      height: '84%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.45))'
                    }}
                  />
                </div>
              ) : dietState === 'cheat' ? (
                /* SIMBOLO GRANDE: BOTTONE NERO ORIGINALE DI CORALINE */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '1px'
                }}>
                  <img
                    src={blackButtonImg}
                    alt="Sgarrato - Bottone Nero"
                    style={{
                      width: '84%',
                      height: '84%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8))'
                    }}
                  />
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
