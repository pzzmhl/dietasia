import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import AnimatedBanner from './components/AnimatedBanner';
import MonthStatsBar from './components/MonthStatsBar';
import CalendarGrid from './components/CalendarGrid';
import DaySelectionModal from './components/DaySelectionModal';
import CatModal from './components/CatModal';
import StoryEventModal from './components/StoryEventModal';
import SecretDoor from './components/SecretDoor';
import SecretSettingsModal from './components/SecretSettingsModal';
import DailyCatGreetingModal from './components/DailyCatGreetingModal';
import JumpingMouseNotice from './components/JumpingMouseNotice';
import { 
  requestNotificationPermission, 
  scheduleDailyReminder,
  sendWybieStreakNotification,
  sendOtherMotherKeysDepletedNotification,
  initNotificationChannels
} from './services/notifications';
import { triggerHapticFeedback } from './services/haptics';

// Immagini critiche per il rendering immediato e il preloading
import catStandingImg from './assets/cat-standing.webp';
import catSuccessImg from './assets/cat-success.webp';
import catFailImg from './assets/cat-fail.webp';
import catCheatKeyImg from './assets/cat-cheat-key.webp';
import blackButtonImg from './assets/black-button.webp';
import seeingStoneImg from './assets/seeing-stone.webp';
import keyImg from './assets/key.webp';
import streakStarImg from './assets/streak-star.webp';
import jumpingMouseImg from './assets/jumping-mouse.webp';
import otherMotherImg from './assets/other-mother-key.webp';
import wybieImg from './assets/wybie-proud.webp';
import catModalBg from './assets/cat-modal-bg.webp';
import secretDoorImg from './assets/secret-door.webp';
import vortexBg from './assets/coraline-vortex-bg.webp';

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
  const [keysPerMonth, setKeysPerMonth] = useState(() => {
    try {
      return Number(localStorage.getItem('coraline_keys_per_month')) || 4;
    } catch (e) {
      return 4;
    }
  });

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

  // Schermata Minimale Quotidiana del Gatto (Primo Accesso del Giorno)
  const [isDailyGreetingOpen, setIsDailyGreetingOpen] = useState(() => {
    try {
      const lastGreetingDate = localStorage.getItem('coraline_last_daily_greeting_date');
      return lastGreetingDate !== todayStr;
    } catch (e) {
      return false;
    }
  });

  const handleDismissDailyGreeting = useCallback(() => {
    try {
      localStorage.setItem('coraline_last_daily_greeting_date', todayStr);
    } catch (e) {}
    setIsDailyGreetingOpen(false);
  }, [todayStr]);

  // Modal Gestione Impostazioni della Porticina Segreta (include Diario & Backup)
  const [isSecretSettingsOpen, setIsSecretSettingsOpen] = useState(false);

  // Trigger per aggiornare istantaneamente la GIF nel banner animato
  const [outcomeTrigger, setOutcomeTrigger] = useState(null);

  // Riferimento sempre fresco per intercettare il tasto/gesto Indietro nativo di Android
  const activeModalsRef = useRef({
    dailyGreeting: false,
    settings: false,
    day: false,
    story: false,
    cat: false
  });

  activeModalsRef.current = {
    dailyGreeting: isDailyGreetingOpen,
    settings: isSecretSettingsOpen,
    day: dayModalState.isOpen,
    story: storyModalState.isOpen,
    cat: catModalState.isOpen
  };

  // Gestione nativa del tasto indietro Android (Hardware & Gesture navigation)
  useEffect(() => {
    let backListener = null;
    const registerBackHandler = async () => {
      try {
        backListener = await CapApp.addListener('backButton', () => {
          const { dailyGreeting, settings, day, story, cat } = activeModalsRef.current;
          if (dailyGreeting) {
            handleDismissDailyGreeting();
          } else if (settings) {
            setIsSecretSettingsOpen(false);
          } else if (day) {
            setDayModalState({ isOpen: false, dateStr: null });
          } else if (story) {
            setStoryModalState((prev) => ({ ...prev, isOpen: false }));
          } else if (cat) {
            setCatModalState((prev) => ({ ...prev, isOpen: false }));
          } else {
            // Se nessun pop-up è aperto, minimizza/esce dall'app in modo pulito
            CapApp.exitApp();
          }
        });
      } catch (err) {
        // Ambiente web standard
      }
    };
    registerBackHandler();

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, []);

  // Carica i dati salvati, applica le preferenze visive e ottimizza il rendering iniziale
  useEffect(() => {
    setAllLogs(getAllLogs());

    try {
      if (typeof document !== 'undefined') {
        const floatOff = localStorage.getItem('coraline_floating_fx') === 'false';
        const vortexOff = localStorage.getItem('coraline_vortex_enabled') === 'false';
        document.body.classList.toggle('no-floating-fx', floatOff);
        document.body.classList.toggle('no-vortex-bg', vortexOff);
      }
    } catch (e) {}

    // 1. Decodifica immediata delle sole immagini visibili nel primo viewport (Dashboard & Gatto)
    [catStandingImg, keyImg, vortexBg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // 2. Precaricamento in background a bassa priorità (Idle time) per i popup secondari
    const deferredImages = [
      catSuccessImg,
      catFailImg,
      catCheatKeyImg,
      blackButtonImg,
      seeingStoneImg,
      streakStarImg,
      otherMotherImg,
      wybieImg,
      jumpingMouseImg,
      catModalBg,
      secretDoorImg
    ];

    const preloadDeferred = () => {
      deferredImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadDeferred, { timeout: 2000 });
    } else {
      setTimeout(preloadDeferred, 1200);
    }
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

  // Quando l'utente tocca un giorno del calendario o dell'avviso
  const handleDayClick = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    if (y && m) {
      setDisplayYear(y);
      setDisplayMonth(m - 1);
    }
    setDayModalState({
      isOpen: true,
      dateStr
    });
  }, []);

  // Calcolo memoizzato delle chiavi usate nel mese selezionato per la Dashboard
  const usedKeysForMonth = useMemo(() => {
    return getMonthUsedKeys(allLogs, displayYear, displayMonth);
  }, [allLogs, displayYear, displayMonth]);

  const remainingKeys = useMemo(() => {
    return Math.max(0, keysPerMonth - usedKeysForMonth);
  }, [keysPerMonth, usedKeysForMonth]);

  // Calcolo rigoroso delle chiavi residue specifiche per il mese del giorno aperto
  const remainingKeysForModal = useMemo(() => {
    const target = dayModalState.dateStr || selectedDate;
    if (!target) return remainingKeys;
    const [y, m] = target.split('-').map(Number);
    if (!y || !m) return remainingKeys;
    const used = getMonthUsedKeys(allLogs, y, m - 1);
    return Math.max(0, keysPerMonth - used);
  }, [dayModalState.dateStr, selectedDate, allLogs, keysPerMonth, remainingKeys]);

  // Calcola i giorni passati non ancora contrassegnati per il Topo Saltatore memoizzato (nessuna falsa simulazione)
  const unmarkedDays = useMemo(() => {
    return getUnmarkedPastDays(allLogs);
  }, [allLogs]);

  // Controlla se la giornata odierna è già stata registrata
  const isTodayAlreadyLogged = useMemo(() => {
    const todayLog = allLogs[todayStr];
    return !!(todayLog && todayLog.dietState && todayLog.dietState !== 'neutral');
  }, [allLogs, todayStr]);

  // Inizializza i canali di notifica per Android e pianifica il promemoria
  useEffect(() => {
    initNotificationChannels();
  }, []);

  // Pianifica o aggiorna la notifica quotidiana rispettando l'orario e lo stato scelto nelle Opzioni:
  // Se oggi è già segnato, la notifica per oggi viene evitata e programmata per domani!
  useEffect(() => {
    scheduleDailyReminder(undefined, isTodayAlreadyLogged);
  }, [isTodayAlreadyLogged]);

  // Selezione esito dal pop-up ottimizzata
  const handleSelectStatusFromModal = useCallback((newStatus) => {
    const targetDate = dayModalState.dateStr || selectedDate;
    const oldLog = allLogs[targetDate] || {};
    const wasAlreadyKey = oldLog.dietState === 'cheat_key';

    // Calcola le chiavi residue del mese del targetDate prima dell'aggiornamento
    const [y, m] = targetDate.split('-').map(Number);
    const usedBefore = getMonthUsedKeys(allLogs, y, m - 1);
    const keysLeftInTargetMonth = Math.max(0, keysPerMonth - usedBefore);

    saveDayLog(targetDate, { dietState: newStatus });
    const updatedLogs = getAllLogs();
    setAllLogs(updatedLogs);

    // 1. Chiude il modal di selezione del giorno
    setDayModalState({ isOpen: false, dateStr: null });

    // 2. Trigger per cambiare la GIF del banner in base all'esito
    setOutcomeTrigger({ status: newStatus, timestamp: Date.now() });

    // 3. Logica Notifiche & Reazioni Evento
    if (newStatus === 'cheat_key') {
      const isNowLastKey = !wasAlreadyKey && (keysLeftInTargetMonth - 1 <= 0);

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
      // Calcola il nuovo streak di dieta consecutiva ancorato alla data selezionata
      const newStreak = getConsecutiveDietStreak(updatedLogs, targetDate);
      const lastCelebrated = Number(localStorage.getItem('coraline_last_celebrated_streak') || 0);

      // NOTIFICA 1: Wybie celebra traguardi di costanza (3 giorni, ogni settimana 7/14/21/28... o 30 giorni)
      // Negli altri giorni interviene il Gatto con le sue frasi incoraggianti!
      const isMilestoneDay = newStreak === 3 || (newStreak >= 7 && newStreak % 7 === 0) || (newStreak >= 30 && newStreak % 30 === 0);
      const isMilestone = isMilestoneDay && newStreak !== lastCelebrated;

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
    } else if (newStatus === 'neutral') {
      // Se si azzera una data, resettiamo il tracker di celebrazione per permettere nuovi test
      try {
        localStorage.setItem('coraline_last_celebrated_streak', '0');
      } catch (e) {}
    }
  }, [dayModalState.dateStr, selectedDate, allLogs, keysPerMonth, remainingKeys]);

  const currentDayLog = dayModalState.dateStr 
    ? (allLogs[dayModalState.dateStr] || { dietState: 'neutral' })
    : { dietState: 'neutral' };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 16px calc(env(safe-area-inset-bottom, 24px) + 60px) 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        touchAction: 'pan-y'
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

      {/* 5. LA PORTICINA SEGRETA DELL'ALTRO MONDO (IMPOSTAZIONI, DIARIO & BACKUP) */}
      <SecretDoor onOpenSettings={() => setIsSecretSettingsOpen(true)} />

      {/* GATTO NERO GRANDINO FLOTTANTE IN BASSO A DESTRA */}
      <button
        onClick={() => {
          triggerHapticFeedback('selection');
          setCatModalState((prev) => ({ ...prev, isOpen: true }));
        }}
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
        remainingKeys={remainingKeysForModal}
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

      {/* OVERLAY IMPOSTAZIONI DELLA PORTICINA SEGRETA & DIARIO */}
      <SecretSettingsModal
        isOpen={isSecretSettingsOpen}
        onClose={() => setIsSecretSettingsOpen(false)}
        keysPerMonth={keysPerMonth}
        onChangeKeysPerMonth={(newKeys) => setKeysPerMonth(newKeys)}
        onRestoreSuccess={(restoredLogs) => {
          setAllLogs(restoredLogs);
        }}
        onOpenDailyGreeting={() => setIsDailyGreetingOpen(true)}
      />

      {/* SCHERMATA MINIMALE GIORNALIERA DEL GATTO (PRIMO ACCESSO DEL GIORNO) */}
      <DailyCatGreetingModal
        isOpen={isDailyGreetingOpen}
        onClose={handleDismissDailyGreeting}
        dateStr={todayStr}
      />
      </div>
    </>
  );
}
