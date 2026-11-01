import React, { useState, useRef, useEffect } from 'react';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Calendario Scorrevole e Griglia Mensile stile Coraline.
 * Permette ad Asia di scorrere tra i giorni e vedere a colpo d'occhio
 * lo stato (Dieta seguita, Bottone Nero o Acqua registrata).
 */
export default function CalendarStrip({ selectedDate, onSelectDate, allLogs = {} }) {
  const [viewMode, setViewMode] = useState('strip'); // 'strip' | 'grid'
  const scrollContainerRef = useRef(null);

  // Data di navigazione mese
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const [displayYear, setDisplayYear] = useState(selectedDateObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(selectedDateObj.getMonth());

  // Manteniamo sincronizzato il mese quando cambia la data selezionata
  useEffect(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    setDisplayYear(d.getFullYear());
    setDisplayMonth(d.getMonth());
  }, [selectedDate]);

  // Genera i giorni per il mese corrente
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay(); // 0 è Domenica

  // Format YYYY-MM-DD
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

  // Autoscroll sul giorno selezionato nella visualizzazione striscia
  useEffect(() => {
    if (viewMode === 'strip' && scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector('.is-selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate, viewMode, displayMonth]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="stitched-card" style={{ padding: '16px', marginBottom: '20px' }}>
      {/* Intestazione Mese & Comandi */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: '17px',
            color: '#f8fafc',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            {MONTHS_IT[displayMonth]} {displayYear}
          </h2>
          <button
            onClick={handleTodayClick}
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-gothic)',
              padding: '3px 8px',
              backgroundColor: 'rgba(224, 159, 62, 0.15)',
              border: '1px solid rgba(224, 159, 62, 0.4)',
              borderRadius: '8px',
              color: '#e09f3e',
              cursor: 'pointer'
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
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(35, 25, 66, 0.7)',
              border: '1px solid rgba(224, 159, 62, 0.3)',
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
            onClick={() => setViewMode((prev) => (prev === 'strip' ? 'grid' : 'strip'))}
            aria-label="Cambia visualizzazione calendario"
            style={{
              height: '30px',
              padding: '0 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(35, 25, 66, 0.7)',
              border: '1px solid rgba(224, 159, 62, 0.3)',
              color: '#e09f3e',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'var(--font-gothic)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {viewMode === 'strip' ? '📅 Mese' : '↔ Striscia'}
          </button>

          <button
            onClick={handleNextMonth}
            aria-label="Mese successivo"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(35, 25, 66, 0.7)',
              border: '1px solid rgba(224, 159, 62, 0.3)',
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

      {/* MODALITÀ 1: STRISCIA SCORREVOLE ORIZZONTALE */}
      {viewMode === 'strip' ? (
        <div
          ref={scrollContainerRef}
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {daysArray.map((day) => {
            const dateStr = formatYMD(displayYear, displayMonth, day);
            const isSelected = dateStr === selectedDate;
            const dayOfWeek = new Date(displayYear, displayMonth, day).getDay();
            const log = allLogs[dateStr] || {};
            const dietState = log.dietState;
            const waterGlasses = log.waterGlasses || 0;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={isSelected ? 'is-selected' : ''}
                style={{
                  minWidth: '58px',
                  flexShrink: 0,
                  scrollSnapAlign: 'center',
                  padding: '10px 4px',
                  borderRadius: '14px',
                  backgroundColor: isSelected ? 'rgba(224, 159, 62, 0.22)' : 'rgba(20, 16, 42, 0.6)',
                  border: isSelected ? '2px solid #e09f3e' : '1px dashed rgba(224, 159, 62, 0.25)',
                  boxShadow: isSelected ? '0 0 12px rgba(224, 159, 62, 0.35)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  fontSize: '10px',
                  color: isSelected ? '#e09f3e' : '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  {DAYS_SHORT[dayOfWeek]}
                </span>

                <span style={{
                  fontSize: '17px',
                  fontFamily: 'var(--font-gothic)',
                  fontWeight: 800,
                  color: isSelected ? '#ffffff' : '#e2e8f0'
                }}>
                  {day}
                </span>

                {/* Indicatori stato dieta / acqua */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '14px', marginTop: '2px' }}>
                  {dietState === 'success' && (
                    <span title="Dieta seguita" style={{ color: '#e09f3e', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
                  )}
                  {dietState === 'cheat' && (
                    <span
                      title="Bottone nero"
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#090a0f',
                        border: '1.2px solid #e2e8f0'
                      }}
                    />
                  )}
                  {dietState === 'neutral' && (
                    <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(148, 163, 184, 0.3)' }} />
                  )}

                  {waterGlasses > 0 && (
                    <span title={`${waterGlasses} bicchieri`} style={{ color: '#38bdf8', fontSize: '9px' }}>💧</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* MODALITÀ 2: GRIGLIA MENSILE */
        <div>
          {/* Giorni della settimana header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            marginBottom: '8px',
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: 600
          }}>
            {DAYS_SHORT.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Griglia giorni */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Caselle vuote prima dell'inizio del mese */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {daysArray.map((day) => {
              const dateStr = formatYMD(displayYear, displayMonth, day);
              const isSelected = dateStr === selectedDate;
              const log = allLogs[dateStr] || {};
              const dietState = log.dietState;

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(224, 159, 62, 0.25)' : 'rgba(15, 16, 38, 0.5)',
                    border: isSelected ? '2px solid #e09f3e' : '1px dashed rgba(224, 159, 62, 0.2)',
                    color: isSelected ? '#ffffff' : '#e2e8f0',
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    position: 'relative'
                  }}
                >
                  <span>{day}</span>
                  {/* Badge minimo */}
                  {dietState === 'success' && (
                    <span style={{ fontSize: '9px', color: '#e09f3e', lineHeight: 1 }}>✓</span>
                  )}
                  {dietState === 'cheat' && (
                    <span style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#090a0f',
                      border: '1px solid #e2e8f0'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
