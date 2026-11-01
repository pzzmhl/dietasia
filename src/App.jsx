import React, { useState, useEffect } from 'react';
import AnimatedBanner from './components/AnimatedBanner';
import MonthStatsBar from './components/MonthStatsBar';
import CalendarGrid from './components/CalendarGrid';
import DaySelectionModal from './components/DaySelectionModal';
import SettingsModal from './components/SettingsModal';
import CatModal from './components/CatModal';
import JumpingMouseNotice from './components/JumpingMouseNotice';
import blackButtonImg from './assets/black-button.png';
import { 
  getTodayDateString, 
  getAllLogs, 
  saveDayLog, 
  getKeysPerMonth, 
  setKeysPerMonth, 
  getMonthUsedKeys,
  getUnmarkedPastDays 
} from './utils/storage';
import { getRandomCatQuote } from './data/catQuotes';

export default function App() {
  const todayStr = getTodayDateString();
  const todayObj = new Date(todayStr + 'T00:00:00');

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [displayYear, setDisplayYear] = useState(todayObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(todayObj.getMonth());
  const [allLogs, setAllLogs] = useState({});
  const [keysPerMonth, setKeysPerMonthState] = useState(4);

  // Modal Impostazioni
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal Selezione Esito Giorno
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dateStr: null
  });

  // Modal del Tutor Gatto Nero
  const [catModalState, setCatModalState] = useState({
    isOpen: false,
    quote: '',
    context: 'success'
  });

  // Trigger per aggiornare istantaneamente la GIF nel banner animato
  const [outcomeTrigger, setOutcomeTrigger] = useState(null);

  // Carica i dati salvati e le impostazioni all'avvio
  useEffect(() => {
    setAllLogs(getAllLogs());
    setKeysPerMonthState(getKeysPerMonth());
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

  // Quando l'utente tocca un giorno del calendario
  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setDayModalState({
      isOpen: true,
      dateStr
    });
  };

  // Calcola quante chiavi sono state usate e quante ne restano nel mese selezionato
  const usedKeysForMonth = getMonthUsedKeys(allLogs, displayYear, displayMonth);
  const remainingKeys = Math.max(0, keysPerMonth - usedKeysForMonth);

  // Calcola i giorni passati non ancora contrassegnati per il Topo Saltatore
  const unmarkedDays = getUnmarkedPastDays(allLogs);

  // Salvataggio impostazioni chiavi al mese
  const handleSaveKeysPerMonth = (newCount) => {
    setKeysPerMonth(newCount);
    setKeysPerMonthState(newCount);
  };

  // Selezione esito dal pop-up
  const handleSelectStatusFromModal = (newStatus) => {
    const targetDate = dayModalState.dateStr || selectedDate;
    const oldLog = allLogs[targetDate] || {};
    const wasAlreadyKey = oldLog.dietState === 'cheat_key';

    const updated = saveDayLog(targetDate, { dietState: newStatus });
    if (updated) {
      setAllLogs((prev) => ({ ...prev, [targetDate]: updated }));
    }

    // 1. Chiude il modal di selezione del giorno
    setDayModalState({ isOpen: false, dateStr: null });

    // 2. Trigger per cambiare la GIF del banner in base all'esito (random senza ripetizioni)
    setOutcomeTrigger({ status: newStatus, timestamp: Date.now() });

    // 3. Logica reattiva del Gatto Nero
    if (newStatus === 'cheat_key') {
      // Calcolo se questa è l'ULTIMA chiave disponibile del mese
      const isNowLastKey = !wasAlreadyKey && (remainingKeys - 1 <= 0);

      const quoteContext = isNowLastKey ? 'last_key' : 'key';
      const quote = getRandomCatQuote(quoteContext);

      setTimeout(() => {
        setCatModalState({
          isOpen: true,
          quote,
          context: quoteContext
        });
      }, 180);
    } else if (newStatus === 'success' || newStatus === 'cheat') {
      const quote = getRandomCatQuote(newStatus);
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
      {/* HEADER COMPATTO CON IDENTITÀ CORALINE & PULSANTE IMPOSTAZIONI */}
      <header style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1.5px solid var(--border-dark-blue-light)',
        borderRadius: '16px',
        backgroundColor: 'rgba(13, 44, 73, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 14px rgba(6, 22, 37, 0.6)',
        marginBottom: '14px'
      }}>
        {/* Titolo e icona */}
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

        {/* Pulsanti Header: Impostazioni (Ingranaggio) & Bottone Nero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Pulsante Ingranaggio Impostazioni */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Apri Impostazioni Regole"
            title="Regole dell'Altro Mondo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 22, 37, 0.85)',
              border: '1px solid var(--border-dark-blue)',
              color: 'var(--coraline-yellow)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.15s ease'
            }}
          >
            ⚙️
          </button>

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

      {/* BANNER ANIMATO SOPRA AL CALENDARIO (ROTAZIONE RANDOMICA & CATEGORIZZATA) */}
      <AnimatedBanner latestOutcomeTrigger={outcomeTrigger} />

      {/* AVVISO DEI TOPI SALTATORI PER GIORNI NON CONTRASSEGNATI */}
      <JumpingMouseNotice
        unmarkedDays={unmarkedDays}
        onSelectDay={handleDayClick}
      />

      {/* 1. GRIGLIA MENSILE DEL CALENDARIO (CON SUPPORTO CHIAVI JOLLY) */}
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

      {/* 2. DASHBOARD INGRANDITA SOTTO IL CALENDARIO (CHIAVI GRANDI, METRICHE E PROIEZIONE) */}
      <MonthStatsBar
        displayYear={displayYear}
        displayMonth={displayMonth}
        allLogs={allLogs}
        keysPerMonth={keysPerMonth}
      />

      {/* FOOTER GOTICO MINIMALISTA */}
      <footer style={{
        marginTop: 'auto',
        textAlign: 'center',
        padding: '16px 0 8px 0',
        fontSize: '11px',
        color: 'var(--coraline-brown)',
        borderTop: '1px solid var(--border-dark-blue-subtle)'
      }}>
        ✦ Tocca un giorno per cucire il tuo destino ✦
      </footer>

      {/* POP-UP COMPATTO PER LA SELEZIONE ESITO DEL GIORNO */}
      <DaySelectionModal
        isOpen={dayModalState.isOpen}
        dateStr={dayModalState.dateStr}
        currentStatus={currentDayLog.dietState}
        remainingKeys={remainingKeys}
        onSelectStatus={handleSelectStatusFromModal}
        onClose={() => setDayModalState({ isOpen: false, dateStr: null })}
      />

      {/* MODAL IMPOSTAZIONI: REGOLE DELL'ALTRO MONDO */}
      <SettingsModal
        isOpen={isSettingsOpen}
        keysPerMonth={keysPerMonth}
        onSaveKeysPerMonth={handleSaveKeysPerMonth}
        onClose={() => setIsSettingsOpen(false)}
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
