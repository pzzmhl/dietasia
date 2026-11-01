import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AnimatedBanner from './components/AnimatedBanner';
import MonthStatsBar from './components/MonthStatsBar';
import CalendarGrid from './components/CalendarGrid';
import DaySelectionModal from './components/DaySelectionModal';
import SettingsModal from './components/SettingsModal';
import CatModal from './components/CatModal';
import JumpingMouseNotice from './components/JumpingMouseNotice';
import NotificationSettingsModal from './components/NotificationSettingsModal';

// Immagini critiche per il rendering immediato e il preloading
import catStandingImg from './assets/cat-standing.png';
import catSuccessImg from './assets/cat-success.png';
import catFailImg from './assets/cat-fail.png';
import catCheatKeyImg from './assets/cat-cheat-key.png';
import blackButtonImg from './assets/black-button.png';
import seeingStoneImg from './assets/seeing-stone.png';
import keyImg from './assets/key.png';
import jumpingMouseImg from './assets/jumping-mouse.png';
import catModalBg from './assets/cat-modal-bg.jpg';

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
  const todayObj = useMemo(() => new Date(todayStr + 'T00:00:00'), [todayStr]);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [displayYear, setDisplayYear] = useState(() => todayObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(() => todayObj.getMonth());
  const [allLogs, setAllLogs] = useState({});
  const [keysPerMonth, setKeysPerMonthState] = useState(4);

  // Modal Impostazioni
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal Notifiche Quotidiane (Topi Saltatori)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Modal Selezione Esito Giorno
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dateStr: null
  });

  // Modal del Tutor Gatto Nero e Memorizzazione Ultima Frase
  const [catModalState, setCatModalState] = useState(() => {
    try {
      const savedQuote = localStorage.getItem('coraline_last_cat_quote');
      const savedContext = localStorage.getItem('coraline_last_cat_context') || 'success';
      return {
        isOpen: false,
        quote: savedQuote || "I gatti non hanno bisogno di nomi. Noi sappiamo già chi siamo... ma tu ricordati di segnare il tuo diario.",
        context: savedContext
      };
    } catch (e) {
      return {
        isOpen: false,
        quote: "I gatti non hanno bisogno di nomi. Noi sappiamo già chi siamo.",
        context: 'success'
      };
    }
  });

  // Trigger per aggiornare istantaneamente la GIF nel banner animato
  const [outcomeTrigger, setOutcomeTrigger] = useState(null);

  // Carica i dati salvati e precarica le immagini critiche in memoria RAM all'avvio
  useEffect(() => {
    setAllLogs(getAllLogs());
    setKeysPerMonthState(getKeysPerMonth());

    // Preload rapido delle immagini di interfaccia per azzerare flash o ritardi al tocco
    const criticalImages = [
      catStandingImg,
      catSuccessImg,
      catFailImg,
      catCheatKeyImg,
      blackButtonImg,
      seeingStoneImg,
      keyImg,
      jumpingMouseImg,
      catModalBg
    ];

    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Navigazione mese memoizzata
  const handlePrevMonth = useCallback(() => {
    setDisplayMonth((prev) => {
      if (prev === 0) {
        setDisplayYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayMonth((prev) => {
      if (prev === 11) {
        setDisplayYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const handleTodayClick = useCallback(() => {
    const now = new Date();
    setDisplayYear(now.getFullYear());
    setDisplayMonth(now.getMonth());
    setSelectedDate(todayStr);
  }, [todayStr]);

  // Quando l'utente tocca un giorno del calendario
  const handleDayClick = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    setDayModalState({
      isOpen: true,
      dateStr
    });
  }, []);

  // Calcolo memoizzato delle chiavi usate nel mese selezionato
  const usedKeysForMonth = useMemo(() => {
    return getMonthUsedKeys(allLogs, displayYear, displayMonth);
  }, [allLogs, displayYear, displayMonth]);

  const remainingKeys = useMemo(() => {
    return Math.max(0, keysPerMonth - usedKeysForMonth);
  }, [keysPerMonth, usedKeysForMonth]);

  // Modalità simulazione Topo Saltatore (attiva su richiesta utente)
  const [simulatedMouseAlert] = useState(true);

  // Calcola i giorni passati non ancora contrassegnati per il Topo Saltatore memoizzato
  const unmarkedDays = useMemo(() => {
    const realUnmarkedDays = getUnmarkedPastDays(allLogs);
    return realUnmarkedDays.length > 0 
      ? realUnmarkedDays 
      : (simulatedMouseAlert ? ['2026-11-01', '2026-10-31', '2026-10-30'] : []);
  }, [allLogs, simulatedMouseAlert]);

  // Salvataggio impostazioni chiavi al mese
  const handleSaveKeysPerMonth = useCallback((newCount) => {
    setKeysPerMonth(newCount);
    setKeysPerMonthState(newCount);
  }, []);

  // Selezione esito dal pop-up ottimizzata
  const handleSelectStatusFromModal = useCallback((newStatus) => {
    const targetDate = dayModalState.dateStr || selectedDate;
    const oldLog = allLogs[targetDate] || {};
    const wasAlreadyKey = oldLog.dietState === 'cheat_key';

    const updated = saveDayLog(targetDate, { dietState: newStatus });
    if (updated) {
      setAllLogs((prev) => ({ ...prev, [targetDate]: updated }));
    }

    // 1. Chiude il modal di selezione del giorno
    setDayModalState({ isOpen: false, dateStr: null });

    // 2. Trigger per cambiare la GIF del banner in base all'esito
    setOutcomeTrigger({ status: newStatus, timestamp: Date.now() });

    // 3. Logica reattiva del Gatto Nero
    if (newStatus === 'cheat_key') {
      const isNowLastKey = !wasAlreadyKey && (remainingKeys - 1 <= 0);
      const quoteContext = isNowLastKey ? 'last_key' : 'key';
      const quote = getRandomCatQuote(quoteContext);

      try {
        localStorage.setItem('coraline_last_cat_quote', quote);
        localStorage.setItem('coraline_last_cat_context', quoteContext);
      } catch (e) {}

      setTimeout(() => {
        setCatModalState({
          isOpen: true,
          quote,
          context: quoteContext
        });
      }, 120);
    } else if (newStatus === 'success' || newStatus === 'cheat') {
      const quote = getRandomCatQuote(newStatus);

      try {
        localStorage.setItem('coraline_last_cat_quote', quote);
        localStorage.setItem('coraline_last_cat_context', newStatus);
      } catch (e) {}

      setTimeout(() => {
        setCatModalState({
          isOpen: true,
          quote,
          context: newStatus
        });
      }, 120);
    }
  }, [dayModalState.dateStr, selectedDate, allLogs, remainingKeys]);

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

        {/* Pulsanti Header: Gestione Notifiche (Topo Statico), Impostazioni (Ingranaggio) & Bottone Nero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Tasto Gestione Promemoria Giornaliero (Topolino Statico) */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            aria-label="Gestisci Notifiche Quotidiane"
            title="Promemoria Giornaliero dei Topi Saltatori"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 22, 37, 0.85)',
              border: '1.5px solid var(--border-dark-blue)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={jumpingMouseImg}
              alt="Promemoria Topo"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain'
              }}
            />
          </button>

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

      {/* GATTO NERO GRANDINO FLOTTANTE IN BASSO A DESTRA */}
      <button
        onClick={() => setCatModalState((prev) => ({ ...prev, isOpen: true }))}
        aria-label="Ascolta il Gatto Nero"
        title="Tocca per riascoltare l'ultima frase del Gatto"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '12px',
          zIndex: 9980,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'catCornerBreathe 3s ease-in-out infinite',
          willChange: 'transform',
          transform: 'translateZ(0)',
          touchAction: 'manipulation'
        }}
      >
        <img
          src={catStandingImg}
          alt="Gatto Nero di Coraline"
          loading="eager"
          decoding="async"
          style={{
            height: '130px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(13, 44, 73, 0.6))',
            pointerEvents: 'none'
          }}
        />
      </button>

      <style>{`
        @keyframes catCornerBreathe {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(1.2deg);
          }
        }
      `}</style>

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

      {/* MODAL PROMEMORIA QUOTIDIANO: TOPI SALTATORI */}
      <NotificationSettingsModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
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
