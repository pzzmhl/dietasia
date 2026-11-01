import React, { useState, useEffect } from 'react';
import MonthStatsBar from './components/MonthStatsBar';
import CalendarGrid from './components/CalendarGrid';
import DaySelectionModal from './components/DaySelectionModal';
import CatModal from './components/CatModal';
import seeingStoneImg from './assets/seeing-stone.png';
import blackButtonImg from './assets/black-button.png';
import { getTodayDateString, getAllLogs, saveDayLog } from './utils/storage';
import { getRandomCatQuote } from './data/catQuotes';

export default function App() {
  const todayStr = getTodayDateString();
  const todayObj = new Date(todayStr + 'T00:00:00');

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [displayYear, setDisplayYear] = useState(todayObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(todayObj.getMonth());
  const [allLogs, setAllLogs] = useState({});

  // Stato per il Pop-up di Selezione Esito Giorno
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dateStr: null
  });

  // Stato per il Pop-up del Tutor Gatto Nero
  const [catModalState, setCatModalState] = useState({
    isOpen: false,
    quote: '',
    context: 'success'
  });

  // Carica i dati salvati all'avvio
  useEffect(() => {
    setAllLogs(getAllLogs());
  }, []);

  // Navigazione mese
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
    setDisplayYear(now.getFullYear());
    setDisplayMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Quando l'utente tocca un giorno del calendario: apre il pop-up compatto
  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setDayModalState({
      isOpen: true,
      dateStr
    });
  };

  // Selezione esito dal pop-up
  const handleSelectStatusFromModal = (newStatus) => {
    const targetDate = dayModalState.dateStr || selectedDate;
    const updated = saveDayLog(targetDate, { dietState: newStatus });
    if (updated) {
      setAllLogs((prev) => ({ ...prev, [targetDate]: updated }));
    }

    // 1. Chiude il modal di selezione del giorno
    setDayModalState({ isOpen: false, dateStr: null });

    // 2. Se è stato scelto successo o sgarro, compare il Gatto Nero
    if (newStatus === 'success' || newStatus === 'cheat') {
      const quote = getRandomCatQuote(newStatus);
      // Breve ritardo fluido per far sfumare il primo modal
      setTimeout(() => {
        setCatModalState({
          isOpen: true,
          quote,
          context: newStatus
        });
      }, 180);
    }
  };

  const currentDayLog = dayModalState.dateStr 
    ? (allLogs[dayModalState.dateStr] || { dietState: 'neutral' })
    : { dietState: 'neutral' };

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      padding: 'env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 24px) 16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER COMPATTO CON IDENTITÀ CORALINE */}
      <header style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '2px dashed var(--coraline-gold)',
        borderRadius: '16px',
        backgroundColor: 'rgba(13, 44, 73, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 14px rgba(6, 22, 37, 0.6)',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🪡</span>
          <span style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--coraline-parchment)',
            letterSpacing: '0.8px'
          }}>
            Diario di Asia
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-gothic)',
            color: 'var(--coraline-yellow)',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Beta
          </span>
          <img
            src={blackButtonImg}
            alt="Bottone Coraline"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.85))'
            }}
          />
        </div>
      </header>

      {/* 1. BARRA STATISTICHE & PROIEZIONE MENSILE (AGO E FILO) */}
      <MonthStatsBar
        displayYear={displayYear}
        displayMonth={displayMonth}
        allLogs={allLogs}
      />

      {/* 2. GRIGLIA MENSILE DEL CALENDARIO (TRIGGER SU CLICK PER POP-UP) */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={handleDayClick}
        allLogs={allLogs}
        displayYear={displayYear}
        displayMonth={displayMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onTodayClick={handleTodayClick}
      />

      {/* FOOTER GOTICO MINIMALISTA */}
      <footer style={{
        marginTop: 'auto',
        textAlign: 'center',
        padding: '16px 0 8px 0',
        fontSize: '11px',
        color: 'var(--coraline-brown)',
        borderTop: '1px dashed rgba(199, 164, 14, 0.25)'
      }}>
        ✦ Tocca un giorno per cucire il tuo destino ✦
      </footer>

      {/* POP-UP COMPATTO PER LA SELEZIONE ESITO DEL GIORNO */}
      <DaySelectionModal
        isOpen={dayModalState.isOpen}
        dateStr={dayModalState.dateStr}
        currentStatus={currentDayLog.dietState}
        onSelectStatus={handleSelectStatusFromModal}
        onClose={() => setDayModalState({ isOpen: false, dateStr: null })}
      />

      {/* OVERLAY DEL TUTOR (IL GATTO NERO DI CORALINE) */}
      <CatModal
        isOpen={catModalState.isOpen}
        quote={catModalState.quote}
        context={catModalState.context}
        onClose={() => setCatModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
