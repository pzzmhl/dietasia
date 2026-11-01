import React from 'react';
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
 * Calendario Mensile a Griglia stile Coraline:
 * - Pietra Verde per Dieta Rispettata (simbolo grande).
 * - Bottone Nero per Dieta Non Rispettata (simbolo grande).
 * - Chiave Nera per Sgarro Programmato con Jolly (simbolo grande).
 */
export default function CalendarGrid({ 
  selectedDate, 
  onSelectDate, 
  allLogs = {},
  displayYear,
  displayMonth,
  onPrevMonth,
  onNextMonth,
  onTodayClick
}) {
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  const rawFirstDay = new Date(displayYear, displayMonth, 1).getDay();
  const firstDayColumn = rawFirstDay === 0 ? 7 : rawFirstDay;

  const formatYMD = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
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
            color: 'var(--coraline-parchment)',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            {MONTHS_IT[displayMonth]} {displayYear}
          </h2>
          <button
            onClick={onTodayClick}
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-gothic)',
              padding: '2px 8px',
              backgroundColor: 'rgba(216, 198, 21, 0.18)',
              border: '1px solid var(--coraline-gold)',
              borderRadius: '6px',
              color: 'var(--coraline-yellow)',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Oggi
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onPrevMonth}
            aria-label="Mese precedente"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 22, 37, 0.85)',
              border: '1px solid var(--border-dark-blue)',
              color: 'var(--coraline-parchment)',
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
            onClick={onNextMonth}
            aria-label="Mese successivo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 22, 37, 0.85)',
              border: '1px solid var(--border-dark-blue)',
              color: 'var(--coraline-parchment)',
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
          const log = (allLogs && allLogs[dateStr]) || {};
          const dietState = log.dietState;

          // Sfondo e bordo in base alla palette Coraline e allo stato
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
              : dietState === 'cheat_key'
              ? '2px solid var(--coraline-yellow)'
              : '2px solid var(--coraline-yellow)';
            cellShadow = dietState === 'success'
              ? '0 0 14px rgba(52, 211, 153, 0.5)'
              : dietState === 'cheat'
              ? '0 0 14px rgba(239, 68, 68, 0.5)'
              : dietState === 'cheat_key'
              ? '0 0 14px rgba(216, 198, 21, 0.6)'
              : '0 0 14px rgba(216, 198, 21, 0.5)';
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
                color: isSelected ? 'var(--coraline-yellow)' : 'var(--coraline-parchment)',
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
                /* SIMBOLO GRANDE: PIETRA DELLA VISTA VERDE */
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
                      filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.5))'
                    }}
                  />
                </div>
              ) : dietState === 'cheat' ? (
                /* SIMBOLO GRANDE: BOTTONE NERO ORIGINALE */
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
                      filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.85))'
                    }}
                  />
                </div>
              ) : dietState === 'cheat_key' ? (
                /* SIMBOLO GRANDE: CHIAVE NERA JOLLY INGRANDITA CON AURA BIANCA SPETTRALE */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '1px'
                }}>
                  <img
                    src={keyImg}
                    alt="Chiave Nera Jolly Usata"
                    style={{
                      width: '86%',
                      height: '86%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 12px rgba(225, 240, 255, 0.8)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))'
                    }}
                  />
                </div>
              ) : (
                /* GIORNO NON COMPILATO: Mostra il numero in pergamena */
                <span>{day}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
