import React, { useState, useEffect } from 'react';

// Formato europeo ISO: settimana da Lunedì a Domenica
const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Calendario Mensile a Griglia stile Coraline.
 * - Settimana con inizio rigoroso da Lunedì (formato ISO europeo).
 * - Vista unica a griglia senza selettori o strisce.
 * - Indicazione visiva immediata dello stato (Spunta o Bottone Nero).
 */
export default function CalendarGrid({ selectedDate, onSelectDate, allLogs = {} }) {
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const [displayYear, setDisplayYear] = useState(selectedDateObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(selectedDateObj.getMonth());

  // Sincronizza mese/anno se cambia dall'esterno la data selezionata
  useEffect(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    setDisplayYear(d.getFullYear());
    setDisplayMonth(d.getMonth());
  }, [selectedDate]);

  // Numero di giorni nel mese corrente
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  // Offset per il primo giorno del mese con settimana iniziante da LUNEDÌ
  // In JavaScript: getDay() -> 0 = Dom, 1 = Lun, 2 = Mar, ..., 6 = Sab
  // Converte a: Lun = 0, Mar = 1, ..., Sab = 5, Dom = 6
  const rawFirstDay = new Date(displayYear, displayMonth, 1).getDay();
  const startOffset = (rawFirstDay + 6) % 7;

  // Formattazione YYYY-MM-DD
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

  return (
    <div className="stitched-card" style={{ padding: '18px 14px', marginBottom: '20px' }}>
      {/* Intestazione Mese & Comandi */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: '18px',
            color: '#f8fafc',
            fontWeight: 800,
            letterSpacing: '0.8px'
          }}>
            {MONTHS_IT[displayMonth]} {displayYear}
          </h2>
          <button
            onClick={handleTodayClick}
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-gothic)',
              padding: '3px 9px',
              backgroundColor: 'rgba(224, 159, 62, 0.18)',
              border: '1px solid rgba(224, 159, 62, 0.5)',
              borderRadius: '8px',
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
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(35, 25, 66, 0.8)',
              border: '1px solid rgba(224, 159, 62, 0.35)',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
          >
            ◀
          </button>

          <button
            onClick={handleNextMonth}
            aria-label="Mese successivo"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(35, 25, 66, 0.8)',
              border: '1px solid rgba(224, 159, 62, 0.35)',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Intestazione Giorni della Settimana (Inizio da LUNEDÌ) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '12px',
        color: '#94a3b8',
        fontFamily: 'var(--font-gothic)',
        fontWeight: 700,
        letterSpacing: '0.5px'
      }}>
        {DAYS_HEADER.map((dayName, idx) => {
          // Evidenzia sabato e domenica con una sfumatura più tenue
          const isWeekend = idx >= 5;
          return (
            <div key={dayName} style={{ color: isWeekend ? '#cbd5e1' : '#94a3b8' }}>
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Griglia Giorni del Mese */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {/* Offset celle vuote fino a Lunedì */}
        {Array.from({ length: startOffset }).map((_, idx) => (
          <div key={`offset-${idx}`} style={{ minHeight: '44px' }} />
        ))}

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
                minHeight: '48px',
                aspectRatio: '1',
                borderRadius: '12px',
                backgroundColor: isSelected
                  ? 'rgba(224, 159, 62, 0.25)'
                  : 'rgba(15, 16, 38, 0.55)',
                border: isSelected
                  ? '2px solid #e09f3e'
                  : isToday
                  ? '1px solid rgba(224, 159, 62, 0.6)'
                  : '1px dashed rgba(224, 159, 62, 0.2)',
                boxShadow: isSelected
                  ? '0 0 14px rgba(224, 159, 62, 0.4)'
                  : 'none',
                color: isSelected ? '#ffffff' : '#e2e8f0',
                fontFamily: 'var(--font-gothic)',
                fontSize: '14px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{day}</span>

              {/* Indicatore visivo dello stato */}
              <div style={{ height: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {dietState === 'success' && (
                  <span
                    title="Dieta seguita"
                    style={{
                      color: '#e09f3e',
                      fontSize: '11px',
                      fontWeight: 900,
                      lineHeight: 1
                    }}
                  >
                    ✓
                  </span>
                )}
                {dietState === 'cheat' && (
                  <span
                    title="Bottone nero (sgarrato)"
                    style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#050508',
                      border: '1.2px solid #cbd5e1',
                      boxShadow: '0 0 4px rgba(0,0,0,0.9)'
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
