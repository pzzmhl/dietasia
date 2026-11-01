import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AnimatedBanner from './components/AnimatedBanner';
import MonthStatsBar from './components/MonthStatsBar';
import CalendarGrid from './components/CalendarGrid';
import DaySelectionModal from './components/DaySelectionModal';
import CatModal from './components/CatModal';
import StoryEventModal from './components/StoryEventModal';
import JumpingMouseNotice from './components/JumpingMouseNotice';
import { 
  requestNotificationPermission, 
  scheduleDailyReminder,
  sendDailyReminderImmediateTest,
  sendWybieStreakNotification,
  sendOtherMotherKeysDepletedNotification 
} from './services/notifications';

// Immagini critiche per il rendering immediato e il preloading
import catStandingImg from './assets/cat-standing.png';
import catSuccessImg from './assets/cat-success.png';
import catFailImg from './assets/cat-fail.png';
import catCheatKeyImg from './assets/cat-cheat-key.png';
import blackButtonImg from './assets/black-button.png';
import seeingStoneImg from './assets/seeing-stone.png';
import keyImg from './assets/key.png';
import streakStarImg from './assets/streak-star.png';
import jumpingMouseImg from './assets/jumping-mouse.png';
import otherMotherImg from './assets/other-mother-key.png';
import wybieImg from './assets/wybie-proud.png';
import catModalBg from './assets/cat-modal-bg.jpg';

import { 
  getTodayDateString, 
  getAllLogs, 
  saveDayLog, 
  getMonthUsedKeys,
  getUnmarkedPastDays,
  getConsecutiveDietStreak 
} from './utils/storage';
import { getRandomCatQuote } from './data/catQuotes';

export default function App() {
  const todayStr = getTodayDateString();
  const todayObj = useMemo(() => new Date(todayStr + 'T00:00:00'), [todayStr]);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [displayYear, setDisplayYear] = useState(() => todayObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(() => todayObj.getMonth());
  const [allLogs, setAllLogs] = useState({});
  const keysPerMonth = 4; // Fisse a 4 di default, non modificabili

  // Modal Selezione Esito Giorno
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dateStr: null
  });

  // Modal Eventi di Trama Speciali (Altra Madre sgarri esauriti & Wybie traguardo streak)
  const [storyModalState, setStoryModalState] = useState({
    isOpen: false,
    type: 'wybie_streak',
    streak: 0
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

    // Preload rapido delle immagini di interfaccia per azzerare flash o ritardi al tocco
    const criticalImages = [
      catStandingImg,
      catSuccessImg,
      catFailImg,
      catCheatKeyImg,
      blackButtonImg,
      seeingStoneImg,
      streakStarImg,
      otherMotherImg,
      wybieImg,
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

  // Calcola i giorni passati non ancora contrassegnati per il Topo Saltatore memoizzato (nessuna falsa simulazione)
  const unmarkedDays = useMemo(() => {
    return getUnmarkedPastDays(allLogs);
  }, [allLogs]);

  // Controlla se la giornata odierna è già stata registrata
  const isTodayAlreadyLogged = useMemo(() => {
    const todayLog = allLogs[todayStr];
    return !!(todayLog && todayLog.dietState && todayLog.dietState !== 'neutral');
  }, [allLogs, todayStr]);

  // Pianifica o aggiorna la notifica quotidiana delle 20:00:
  // Se oggi è già segnato, la notifica per oggi viene evitata e programmata per domani!
  useEffect(() => {
    scheduleDailyReminder('20:00', isTodayAlreadyLogged);
  }, [isTodayAlreadyLogged]);

  // Selezione esito dal pop-up ottimizzata
  const handleSelectStatusFromModal = useCallback((newStatus) => {
    const targetDate = dayModalState.dateStr || selectedDate;
    const oldLog = allLogs[targetDate] || {};
    const wasAlreadyKey = oldLog.dietState === 'cheat_key';

    const updated = saveDayLog(targetDate, { dietState: newStatus });
    const updatedLogs = { ...allLogs, [targetDate]: updated || { dietState: newStatus } };
    if (updated) {
      setAllLogs(updatedLogs);
    }

    // 1. Chiude il modal di selezione del giorno
    setDayModalState({ isOpen: false, dateStr: null });

    // 2. Trigger per cambiare la GIF del banner in base all'esito
    setOutcomeTrigger({ status: newStatus, timestamp: Date.now() });

    // 3. Logica Notifiche & Reazioni Evento
    if (newStatus === 'cheat_key') {
      const isNowLastKey = !wasAlreadyKey && (remainingKeys - 1 <= 0);

      if (isNowLastKey) {
        // NOTIFICA 2: Sgarri terminati! L'Altra Madre ingoia l'ultima chiave
        sendOtherMotherKeysDepletedNotification();
        setTimeout(() => {
          setStoryModalState({
            isOpen: true,
            type: 'other_mother_keys',
            streak: 0
          });
        }, 120);
      } else {
        // Ancora qualche chiave rimasta: parla il Gatto
        const quote = getRandomCatQuote('key');
        try {
          localStorage.setItem('coraline_last_cat_quote', quote);
          localStorage.setItem('coraline_last_cat_context', 'key');
        } catch (e) {}

        setTimeout(() => {
          setCatModalState({
            isOpen: true,
            quote,
            context: 'key'
          });
        }, 120);
      }
    } else if (newStatus === 'success') {
      // Calcola il nuovo streak di dieta consecutiva
      const newStreak = getConsecutiveDietStreak(updatedLogs);
      const lastCelebrated = Number(localStorage.getItem('coraline_last_celebrated_streak') || 0);

      // NOTIFICA 1: Wybie celebra traguardi di costanza (es. 3, 5, 7, 10, 14, 21, 30 giorni o nuovo record >= 3)
      const isMilestone = newStreak >= 3 && (newStreak > lastCelebrated || [3, 5, 7, 10, 14, 21, 30].includes(newStreak));

      if (isMilestone) {
        try {
          localStorage.setItem('coraline_last_celebrated_streak', String(newStreak));
        } catch (e) {}

        sendWybieStreakNotification(newStreak);
        setTimeout(() => {
          setStoryModalState({
            isOpen: true,
            type: 'wybie_streak',
            streak: newStreak
          });
        }, 120);
      } else {
        const quote = getRandomCatQuote('success');
        try {
          localStorage.setItem('coraline_last_cat_quote', quote);
          localStorage.setItem('coraline_last_cat_context', 'success');
        } catch (e) {}

        setTimeout(() => {
          setCatModalState({
            isOpen: true,
            quote,
            context: 'success'
          });
        }, 120);
      }
    } else if (newStatus === 'cheat') {
      // Se registra uno sgarro non autorizzato, resetta il tracker del traguardo streak
      try {
        localStorage.setItem('coraline_last_celebrated_streak', '0');
      } catch (e) {}

      const quote = getRandomCatQuote('cheat');
      try {
        localStorage.setItem('coraline_last_cat_quote', quote);
        localStorage.setItem('coraline_last_cat_context', 'cheat');
      } catch (e) {}

      setTimeout(() => {
        setCatModalState({
          isOpen: true,
          quote,
          context: 'cheat'
        });
      }, 120);
    }
  }, [dayModalState.dateStr, selectedDate, allLogs, remainingKeys]);

  // Funzioni di Test e Anteprima Notifiche
  const testReminder20 = useCallback(() => {
    sendDailyReminderImmediateTest();
  }, []);

  const testWybie = useCallback(() => {
    sendWybieStreakNotification(7);
    setStoryModalState({
      isOpen: true,
      type: 'wybie_streak',
      streak: 7
    });
  }, []);

  const testOtherMother = useCallback(() => {
    sendOtherMotherKeysDepletedNotification();
    setStoryModalState({
      isOpen: true,
      type: 'other_mother_keys',
      streak: 0
    });
  }, []);

  const testAllSequence = useCallback(() => {
    // 1. Notifica Ore 20:00
    sendDailyReminderImmediateTest();

    // 2. Notifica Wybie e popup dopo 1.2s
    setTimeout(() => {
      sendWybieStreakNotification(7);
      setStoryModalState({
        isOpen: true,
        type: 'wybie_streak',
        streak: 7
      });
    }, 1200);

    // 3. Notifica Altra Madre dopo 4.5s
    setTimeout(() => {
      sendOtherMotherKeysDepletedNotification();
    }, 4500);
  }, []);

  const currentDayLog = dayModalState.dateStr 
    ? (allLogs[dayModalState.dateStr] || { dietState: 'neutral' })
    : { dietState: 'neutral' };

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 16px env(safe-area-inset-bottom, 24px) 16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. ZONA GIF: BANNER ANIMATO (SPAZIATO DALL'ALTO, NON ANCORATO AL BORDO SUPERIORE) */}
      <div style={{ marginTop: '6px', marginBottom: '14px' }}>
        <AnimatedBanner latestOutcomeTrigger={outcomeTrigger} />
      </div>

      {/* 2. ZONA NOTIFICHE: AVVISO TOPI SALTATORI PER GIORNI NON CONTRASSEGNATI */}
      <JumpingMouseNotice
        unmarkedDays={unmarkedDays}
        onSelectDay={handleDayClick}
      />

      {/* 3. IL CALENDARIO: GRIGLIA MENSILE */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={handleDayClick}
        allLogs={allLogs}
        displayYear={displayYear}
        displayMonth={displayMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* 4. LA DASHBOARD: CHIAVI GIGANTI E STATISTICHE */}
      <MonthStatsBar
        displayYear={displayYear}
        displayMonth={displayMonth}
        allLogs={allLogs}
        keysPerMonth={keysPerMonth}
      />

      {/* SEZIONE BANCO DI PROVA NOTIFICHE */}
      <div 
        style={{
          marginTop: '6px',
          marginBottom: '80px',
          padding: '14px 12px',
          borderRadius: '16px',
          border: '1.5px dashed var(--coraline-brown)',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          textAlign: 'center'
        }}
      >
        <p style={{
          fontFamily: 'var(--font-coraline)',
          fontSize: '11.5px',
          color: 'var(--coraline-yellow)',
          margin: '0 0 10px 0',
          letterSpacing: '0.8px'
        }}>
          ✦ Banco di Prova Notifiche ✦
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={testReminder20}
            style={{
              padding: '9px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(13, 44, 73, 0.85)',
              border: '1px solid var(--border-dark-blue)',
              color: 'var(--coraline-parchment)',
              fontFamily: 'var(--font-coraline)',
              fontSize: '10px',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            ⏰ Notifica Ore 20:00
          </button>

          <button
            onClick={testWybie}
            style={{
              padding: '9px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(48, 38, 22, 0.85)',
              border: '1px solid rgba(216, 198, 21, 0.5)',
              color: 'var(--coraline-yellow)',
              fontFamily: 'var(--font-coraline)',
              fontSize: '10px',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            👦 Wybie (Streak)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={testOtherMother}
            style={{
              padding: '9px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(48, 18, 22, 0.85)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              fontFamily: 'var(--font-coraline)',
              fontSize: '10px',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            🗝️ Altra Madre (Chiavi)
          </button>

          <button
            onClick={testAllSequence}
            style={{
              padding: '9px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(18, 48, 35, 0.85)',
              border: '1px solid rgba(74, 222, 128, 0.5)',
              color: '#86efac',
              fontFamily: 'var(--font-coraline)',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            ▶️ Mostra Tutte in Sequenza
          </button>
        </div>
      </div>

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

      {/* OVERLAY DEL TUTOR (IL GATTO NERO DI CORALINE) */}
      <CatModal
        isOpen={catModalState.isOpen}
        quote={catModalState.quote}
        context={catModalState.context}
        onClose={() => setCatModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* OVERLAY EVENTI SPECIALI DI TRAMA (ALTRA MADRE CHIAVI FINITE & WYBIE STREAK) */}
      <StoryEventModal
        isOpen={storyModalState.isOpen}
        type={storyModalState.type}
        streak={storyModalState.streak}
        onClose={() => setStoryModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
