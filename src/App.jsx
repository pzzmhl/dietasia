import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { App as CapApp } from '@capacitor/app';
import ButtonMoonEclipse from './components/ButtonMoonEclipse';
import MonthStatsBar from './components/MonthStatsBar';
import CalendarGrid from './components/CalendarGrid';
import DaySelectionModal from './components/DaySelectionModal';
import CatModal from './components/CatModal';
import StoryEventModal from './components/StoryEventModal';
import SecretDoor from './components/SecretDoor';
import DailyCatGreetingModal from './components/DailyCatGreetingModal';
import FloatingJumpingMouse from './components/FloatingJumpingMouse';
import FloatingWybie from './components/FloatingWybie';
import BobinskyWorkoutCard from './components/BobinskyWorkoutCard';
import CoralineDivider from './components/CoralineDivider';
import UpdateAvailableModal from './components/UpdateAvailableModal';

// Code-splitting: il modale impostazioni (84 KB) viene scaricato on-demand
const SecretSettingsModal = lazy(() => import('./components/SecretSettingsModal'));
import { checkForAppUpdates } from './utils/updateChecker';
import { 
  scheduleDailyReminder,
  sendWybieStreakNotification,
  sendOtherMotherKeysDepletedNotification,
  initNotificationChannels
} from './utils/notifications';
import { triggerHapticFeedback, hapticLight } from './utils/haptics';
import { smoothScrollToElement } from './utils/scrollAnimation';
import { initBackgroundMusic, isMusicEnabled, pauseMusicImmediately, playMusicWithFadeIn } from './services/backgroundMusic';
import { playRandomCatSound } from './services/catAudio';
import { 
  WYBIE_MILESTONE_STREAKS, 
  canWybieSpeakToday, 
  recordWybieSpokenToday 
} from './data/wybieQuotes';

// Asset grafici critici per la vista principale
import catStandingImg from './assets/cat-success.webp';
import starryBg from './assets/coraline-starry-bg.webp';
import catCloudPattern from './assets/cat-cloud-pattern.webp';

import { 
  getTodayDateString, 
  getAllLogs, 
  saveDayLog, 
  getMonthUsedKeys,
  getUnmarkedPastDays,
  getConsecutiveDietStreak,
  getWorkoutLogs,
  saveWorkoutLog,
  exportFullCloudBackupPayload,
  restoreFullCloudBackupPayload,
  getCustomAvatar,
  saveCustomAvatar
} from './utils/storage';
import { 
  isSupabaseConfigured,
  getSupabaseUser,
  downloadBackupFromSupabase,
  triggerDebouncedCloudSync 
} from './services/supabase';
import { 
  initSyncQueueListeners, 
  triggerQueueFlush, 
  getPendingSyncCount 
} from './utils/syncQueue.js';
import { getRandomDailyCatQuote } from './data/dailyCatQuotes';
import { STORAGE_KEYS } from './constants/storageKeys.js';

// Lazy loading dinamico del database citazioni (207 KB):
// Non viene parsato all'avvio ma caricato in modo trasparente
let catQuotesModulePromise = null;
function getCatQuotesModule() {
  if (!catQuotesModulePromise) {
    catQuotesModulePromise = import('./data/catQuotes');
  }
  return catQuotesModulePromise;
}

export default function App() {
  const [todayStr, setTodayStr] = useState(() => getTodayDateString());
  const todayObj = useMemo(() => new Date(todayStr + 'T12:00:00'), [todayStr]);

  // Heartbeat a basso consumo per il cambio di data a mezzanotte (60s invece di 20s per risparmiare CPU/batteria)
  useEffect(() => {
    const checkTransition = () => {
      const freshToday = getTodayDateString();
      setTodayStr((prev) => (prev !== freshToday ? freshToday : prev));
    };

    const interval = setInterval(checkTransition, 60000);
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const msToMidnight = Math.max(1000, midnight.getTime() - now.getTime());
    const midnightTimeout = setTimeout(checkTransition, msToMidnight);

    // Warm-up trasparente in idle per le citazioni del gatto
    let idleHandle = null;
    const useNativeIdle = typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function';
    if (typeof window !== 'undefined') {
      if (useNativeIdle) {
        idleHandle = window.requestIdleCallback(() => {
          getCatQuotesModule();
        });
      } else {
        idleHandle = setTimeout(() => {
          getCatQuotesModule();
        }, 1500);
      }
    }

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
      if (idleHandle !== null && typeof window !== 'undefined') {
        if (useNativeIdle && typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(idleHandle);
        } else {
          clearTimeout(idleHandle);
        }
      }
    };
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [displayYear, setDisplayYear] = useState(() => todayObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(() => todayObj.getMonth());
  const [allLogs, setAllLogs] = useState(() => getAllLogs());
  const [workoutLogs, setWorkoutLogs] = useState(() => getWorkoutLogs());
  const [customAvatar, setCustomAvatar] = useState(() => getCustomAvatar());
  const [keysPerMonth, setKeysPerMonth] = useState(() => {
    try {
      return Number(localStorage.getItem(STORAGE_KEYS.KEYS_PER_MONTH)) || 4;
    } catch (e) {
      return 4;
    }
  });

  const wybieWorkoutTimerRef = useRef(null);

  const handleSaveWorkout = useCallback((dateStr, status) => {
    const updated = saveWorkoutLog(dateStr, status);
    setWorkoutLogs(updated);
    triggerDebouncedCloudSync(exportFullCloudBackupPayload);

    // Se ha completato l'allenamento "Sì" oggi, e Wybie non ha parlato ieri (giorni alterni):
    if (dateStr === todayStr && status === 'yes' && canWybieSpeakToday(todayStr)) {
      recordWybieSpokenToday(todayStr);
      if (wybieWorkoutTimerRef.current) clearTimeout(wybieWorkoutTimerRef.current);
      wybieWorkoutTimerRef.current = setTimeout(() => {
        wybieWorkoutTimerRef.current = null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trigger-wybie', { detail: { type: 'workout' } }));
        }
      }, 1500);
    }
  }, [todayStr]);

  const handleAvatarChange = useCallback((newAvatar) => {
    saveCustomAvatar(newAvatar);
    setCustomAvatar(newAvatar);
    triggerDebouncedCloudSync(exportFullCloudBackupPayload);
  }, []);

  // Modal Selezione Esito Giorno
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dateStr: null
  });

  // Modal Selezione Allenamento per data (da Calendario)
  const [workoutModalState, setWorkoutModalState] = useState({
    isOpen: false,
    dateStr: null
  });

  // Modal Eventi di Trama Speciali (Altra Madre chiavi esaurite)
  const [storyModalState, setStoryModalState] = useState({
    isOpen: false,
    type: 'other_mother_keys'
  });

  // Modal del Tutor Gatto Nero e Memorizzazione Ultima Frase
  const [catModalState, setCatModalState] = useState(() => {
    try {
      const savedQuote = localStorage.getItem(STORAGE_KEYS.LAST_CAT_QUOTE);
      const savedContext = localStorage.getItem(STORAGE_KEYS.LAST_CAT_CONTEXT) || 'success';
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
  const [dailyGreetingQuoteOverride, setDailyGreetingQuoteOverride] = useState(null);
  const [isDailyGreetingOpen, setIsDailyGreetingOpen] = useState(() => {
    try {
      const lastGreetingDate = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_GREETING_DATE);
      return lastGreetingDate !== todayStr;
    } catch (e) {
      return false;
    }
  });

  const handleDismissDailyGreeting = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_DAILY_GREETING_DATE, todayStr);
    } catch (e) {}
    setIsDailyGreetingOpen(false);
    setDailyGreetingQuoteOverride(null);
  }, [todayStr]);

  // Nuvoletta del Gatto Fluttuante (in stile Pokémon / Coraline per spiegazioni contestuali)
  const [catSpeech, setCatSpeech] = useState(null);
  const catSpeechTimerRef = useRef(null);

  const handleCatSpeak = useCallback((text) => {
    hapticLight();
    playRandomCatSound();
    if (catSpeechTimerRef.current) {
      clearTimeout(catSpeechTimerRef.current);
    }
    setCatSpeech({ id: Date.now(), text });
    catSpeechTimerRef.current = setTimeout(() => {
      setCatSpeech(null);
      catSpeechTimerRef.current = null;
    }, 6000);
  }, []);

  const modalOpenTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (modalOpenTimerRef.current) clearTimeout(modalOpenTimerRef.current);
      if (catSpeechTimerRef.current) clearTimeout(catSpeechTimerRef.current);
      if (wybieWorkoutTimerRef.current) clearTimeout(wybieWorkoutTimerRef.current);
    };
  }, []);

  // Modal Impostazioni / Profilo aperto dal tasto profilo in alto a destra
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('settings');

  // Modal Notifica Aggiornamento Disponibile via GitHub Releases
  const [updateAvailableInfo, setUpdateAvailableInfo] = useState(null);

  const handleOpenSettings = useCallback((tab = 'settings') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleScrollToDashboard = useCallback(() => {
    smoothScrollToElement('dashboard-stats-section', 1400);
  }, []);

  const handleCloseDayModal = useCallback(() => {
    setDayModalState({ isOpen: false, dateStr: null });
  }, []);

  const handleCloseCatModal = useCallback(() => {
    setCatModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCloseStoryModal = useCallback(() => {
    setStoryModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCloseUpdateModal = useCallback(() => {
    setUpdateAvailableInfo(null);
  }, []);

  const handleOpenDailyGreetingPreview = useCallback(() => {
    setDailyGreetingQuoteOverride(getRandomDailyCatQuote());
    setIsDailyGreetingOpen(true);
  }, []);

  const handleChangeKeysPerMonth = useCallback((newCount) => {
    setKeysPerMonth(newCount);
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS_PER_MONTH, String(newCount));
    } catch (e) {}
    triggerDebouncedCloudSync(exportFullCloudBackupPayload);
  }, []);

  const handleRestoreSuccess = useCallback(() => {
    setAllLogs(getAllLogs());
    setWorkoutLogs(getWorkoutLogs());
    setCustomAvatar(getCustomAvatar());
    try {
      const k = Number(localStorage.getItem(STORAGE_KEYS.KEYS_PER_MONTH)) || 4;
      setKeysPerMonth(k);
    } catch (e) {}
  }, []);

  // Riferimento sempre fresco per intercettare il tasto/gesto Indietro nativo di Android
  const activeModalsRef = useRef({
    update: false,
    workout: false,
    settings: false,
    dailyGreeting: false,
    day: false,
    story: false,
    cat: false
  });

  activeModalsRef.current = {
    update: !!updateAvailableInfo,
    workout: workoutModalState.isOpen,
    settings: isSettingsOpen,
    dailyGreeting: isDailyGreetingOpen,
    day: dayModalState.isOpen,
    story: storyModalState.isOpen,
    cat: catModalState.isOpen
  };

  // Gestione nativa del tasto indietro Android e ciclo di vita app (Lifecycle & Batteria)
  const dismissGreetingRef = useRef(handleDismissDailyGreeting);
  dismissGreetingRef.current = handleDismissDailyGreeting;

  useEffect(() => {
    let isDisposed = false;
    let backListener = null;
    let appStateListener = null;

    const registerNativeHandlers = async () => {
      try {
        const backHandle = await CapApp.addListener('backButton', () => {
          const { update, workout, settings, dailyGreeting, day, story, cat } = activeModalsRef.current;
          if (update) {
            setUpdateAvailableInfo(null);
          } else if (workout) {
            setWorkoutModalState({ isOpen: false, dateStr: null });
          } else if (settings) {
            setIsSettingsOpen(false);
          } else if (dailyGreeting) {
            dismissGreetingRef.current();
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
        if (isDisposed) {
          backHandle.remove();
          return;
        }
        backListener = backHandle;

        // Quando l'app va in background su Android, sospende l'audio per preservare la batteria
        // e al ritorno in primo piano riprende SOLO se l'utente non aveva messo la musica in muto
        const stateHandle = await CapApp.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            pauseMusicImmediately();
          } else {
            if (isMusicEnabled()) {
              playMusicWithFadeIn();
            }
            // Verifica transizione mezzanotte se l'app è rimasta aperta in background
            const freshToday = getTodayDateString();
            setTodayStr((prev) => (prev !== freshToday ? freshToday : prev));
          }
        });
        if (isDisposed) {
          stateHandle.remove();
          return;
        }
        appStateListener = stateHandle;
      } catch (err) {
        // Ambiente web standard
      }
    };
    registerNativeHandlers();

    // Ascolto visibilità per browser/PWA (transizione mezzanotte)
    const handleVisibility = () => {
      if (!document.hidden) {
        const freshToday = getTodayDateString();
        setTodayStr((prev) => (prev !== freshToday ? freshToday : prev));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (backListener && backListener.remove) {
        backListener.remove();
      }
      if (appStateListener && appStateListener.remove) {
        appStateListener.remove();
      }
    };
  }, []);

  // Carica i dati salvati, applica le preferenze visive e ottimizza il rendering iniziale
  useEffect(() => {
    setAllLogs(getAllLogs());
    initBackgroundMusic();
    initSyncQueueListeners();
    triggerQueueFlush(1500);

    // Sincronizzazione automatica trasparente dal Cloud Supabase al primo avvio su nuovo dispositivo/browser
    const checkCloudSyncOnStartup = async () => {
      try {
        if (!isSupabaseConfigured()) return;
        const user = await getSupabaseUser();
        if (!user) return;

        const cloudRes = await downloadBackupFromSupabase();
        if (cloudRes && cloudRes.data) {
          const localLogs = getAllLogs();
          const localCount = Object.keys(localLogs).length;
          const cloudLogs = cloudRes.data.logs || {};
          const cloudCount = Object.keys(cloudLogs).length;

          const localLastTime = localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME) || '';
          const pendingCount = getPendingSyncCount();
          const shouldRestore = pendingCount === 0 && (localCount === 0 || (cloudRes.updatedAt && cloudRes.updatedAt > localLastTime && cloudCount >= localCount));

          if (shouldRestore) {
            const restored = restoreFullCloudBackupPayload(cloudRes.data);
            if (restored && restored.success) {
              setAllLogs(restored.logs);
              setWorkoutLogs(restored.workoutLogs);
              if (restored.keysPerMonth) setKeysPerMonth(restored.keysPerMonth);
              if (restored.profileAvatar) setCustomAvatar(restored.profileAvatar);
            }
          }
        }
      } catch (err) {
        // Fallimento silenzioso di background: i dati locali restano intatti
      }
    };

    checkCloudSyncOnStartup();

    try {
      if (typeof document !== 'undefined') {
        const floatOff = localStorage.getItem(STORAGE_KEYS.FLOATING_FX) === 'false';
        const vortexOff = localStorage.getItem(STORAGE_KEYS.VORTEX_ENABLED) === 'false';
        document.body.classList.toggle('no-floating-fx', floatOff);
        document.body.classList.toggle('no-vortex-bg', vortexOff);
      }
      // Pulizia una tantum di eventuali vecchie chiavi giornaliere accumulate
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_KEYS.CAT_CLICKS_LEGACY_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}

    // Controllo aggiornamenti non invasivo in background (rispetta la cache di 12 ore)
    const updateCheckTimer = setTimeout(() => {
      checkForAppUpdates({ force: false })
        .then((res) => {
          if (res && res.updateAvailable) {
            setUpdateAvailableInfo(res);
          }
        })
        .catch(() => {});
    }, 2800);

    return () => {
      clearTimeout(updateCheckTimer);
    };
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

  // Ritorna al mese e anno della data odierna al clic sul nome del mese
  const handleResetToCurrentMonth = useCallback(() => {
    const now = new Date();
    setDisplayYear(now.getFullYear());
    setDisplayMonth(now.getMonth());
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

  // Calcola i giorni passati non ancora contrassegnati per il Topo Saltatore memoizzato (reattivo anche a mezzanotte)
  const unmarkedDays = useMemo(() => {
    return getUnmarkedPastDays(allLogs);
  }, [allLogs, todayStr]);

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

  // Selezione esito dal pop-up o dalla dashboard ottimizzata
  const handleSelectStatusFromModal = useCallback(async (newStatus, optionalDateStr = null) => {
    const targetDate = optionalDateStr || dayModalState.dateStr || selectedDate;
    const oldLog = allLogs[targetDate] || {};
    const wasAlreadyKey = oldLog.dietState === 'cheat_key';

    // Calcola le chiavi residue del mese del targetDate prima dell'aggiornamento
    const [y, m] = targetDate.split('-').map(Number);
    const usedBefore = getMonthUsedKeys(allLogs, y, m - 1);
    const keysLeftInTargetMonth = Math.max(0, keysPerMonth - usedBefore);

    saveDayLog(targetDate, { dietState: newStatus });
    const updatedLogs = getAllLogs();
    setAllLogs(updatedLogs);
    triggerDebouncedCloudSync(exportFullCloudBackupPayload);

    // 1. Chiude il modal di selezione del giorno se aperto
    setDayModalState({ isOpen: false, dateStr: null });

    // Se l'aggiornamento proviene da una data passata (sia calendario che topo saltatore),
    // aggiorniamo i dati in silenzio senza inviare notifiche push intrusive né aprire popup a sorpresa
    const isPastEdit = targetDate !== todayStr;
    if (isPastEdit) {
      return;
    }
    if (newStatus === 'cheat_key') {
      const isNowLastKey = !wasAlreadyKey && (keysLeftInTargetMonth - 1 <= 0);

      if (isNowLastKey) {
        // NOTIFICA 2: Chiavi mensili esaurite (L'Altra Madre vorrebbe un copione perfetto)
        sendOtherMotherKeysDepletedNotification();
        if (modalOpenTimerRef.current) clearTimeout(modalOpenTimerRef.current);
        modalOpenTimerRef.current = setTimeout(() => {
          setStoryModalState({
            isOpen: true,
            type: 'other_mother_keys',
            streak: 0
          });
        }, 120);
      } else {
        // Ancora qualche chiave rimasta: parla il Gatto
        const { getRandomCatQuote } = await getCatQuotesModule();
        const quote = getRandomCatQuote('key');
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CAT_QUOTE, quote);
          localStorage.setItem(STORAGE_KEYS.LAST_CAT_CONTEXT, 'key');
        } catch (e) {}

        if (modalOpenTimerRef.current) clearTimeout(modalOpenTimerRef.current);
        modalOpenTimerRef.current = setTimeout(() => {
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
      const lastCelebrated = Number(localStorage.getItem(STORAGE_KEYS.LAST_CELEBRATED_STREAK) || 0);

      // NOTIFICA 1: Wybie celebra traguardi di costanza a giorni alterni (mai per due giorni consecutivi!)
      // Traguardi calibrati: 1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 75, 90, 100
      const isMilestoneDay = WYBIE_MILESTONE_STREAKS.includes(newStreak);
      const isMilestone = isMilestoneDay && newStreak !== lastCelebrated && canWybieSpeakToday(todayStr);

      if (isMilestone) {
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CELEBRATED_STREAK, String(newStreak));
        } catch (e) {}

        recordWybieSpokenToday(todayStr);
        sendWybieStreakNotification(newStreak);
        if (modalOpenTimerRef.current) clearTimeout(modalOpenTimerRef.current);
        modalOpenTimerRef.current = setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trigger-wybie', { detail: { streak: newStreak } }));
          }
        }, 120);
      } else {
        // Negli altri giorni o se Wybie ha parlato ieri (giorni alterni), interviene il Gatto!
        const { getRandomCatQuote } = await getCatQuotesModule();
        const quote = getRandomCatQuote('success');
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CAT_QUOTE, quote);
          localStorage.setItem(STORAGE_KEYS.LAST_CAT_CONTEXT, 'success');
        } catch (e) {}

        if (modalOpenTimerRef.current) clearTimeout(modalOpenTimerRef.current);
        modalOpenTimerRef.current = setTimeout(() => {
          setCatModalState({
            isOpen: true,
            quote,
            context: 'success'
          });
        }, 120);
      }
    } else if (newStatus === 'cheat') {
      // Se registra un giorno fuori piano, resetta il tracker del traguardo streak locale
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_CELEBRATED_STREAK, '0');
      } catch (e) {}

      const { getRandomCatQuote } = await getCatQuotesModule();
      const quote = getRandomCatQuote('cheat');
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_CAT_QUOTE, quote);
        localStorage.setItem(STORAGE_KEYS.LAST_CAT_CONTEXT, 'cheat');
      } catch (e) {}

      if (modalOpenTimerRef.current) clearTimeout(modalOpenTimerRef.current);
      modalOpenTimerRef.current = setTimeout(() => {
        setCatModalState({
          isOpen: true,
          quote,
          context: 'cheat'
        });
      }, 120);
    } else if (newStatus === 'neutral') {
      // Se si azzera una data, resettiamo il tracker di celebrazione per permettere nuovi test
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_CELEBRATED_STREAK, '0');
      } catch (e) {}
    }
  }, [dayModalState.dateStr, selectedDate, allLogs, keysPerMonth, todayStr]);

  const currentDayLog = dayModalState.dateStr 
    ? (allLogs[dayModalState.dateStr] || { dietState: 'neutral' })
    : { dietState: 'neutral' };

  return (
    <>
      {/* SFONDO GLOBALE NOTTURNO STELLATO CON PUNTI LUCE SOFFUSI SFOCATI */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: '#0a0b1a'
        }}
      >
        {/* Livello 1: texture cielo stellato di Coraline a bassa opacità e sfocato */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${starryBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat',
            opacity: 0.14,
            filter: 'blur(1.6px)',
            WebkitFilter: 'blur(1.6px)'
          }}
        />

        {/* Livello 2: Punti luce stellari sfocati (1px - 2px) sparsi con eleganza */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 15% 12%, rgba(221, 202, 183, 0.75), transparent),
              radial-gradient(2px 2px at 78% 18%, rgba(216, 198, 21, 0.65), transparent),
              radial-gradient(1.2px 1.2px at 42% 28%, rgba(255, 255, 255, 0.7), transparent),
              radial-gradient(2.2px 2.2px at 88% 42%, rgba(139, 229, 116, 0.55), transparent),
              radial-gradient(1.5px 1.5px at 22% 52%, rgba(221, 202, 183, 0.6), transparent),
              radial-gradient(2px 2px at 64% 65%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1.8px 1.8px at 12% 76%, rgba(216, 198, 21, 0.55), transparent),
              radial-gradient(2.4px 2.4px at 82% 84%, rgba(221, 202, 183, 0.7), transparent),
              radial-gradient(1.4px 1.4px at 48% 92%, rgba(139, 229, 116, 0.6), transparent)
            `,
            filter: 'blur(1.2px)',
            WebkitFilter: 'blur(1.2px)',
            opacity: 0.85,
            animation: 'coralineStarsSubtlePulse 6s ease-in-out infinite'
          }}
        />
      </div>

      <div style={{
        minHeight: '100%',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 16px calc(env(safe-area-inset-bottom, 24px) + 110px) 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 1. COMPONENTE PRINCIPALE DASHBOARD: BUTTON MOON ECLIPSE */}
        <div style={{ marginBottom: '16px' }}>
          <ButtonMoonEclipse
            allLogs={allLogs}
            todayStr={todayStr}
            onOpenSettings={handleOpenSettings}
            customAvatar={customAvatar}
            onScrollToDashboard={handleScrollToDashboard}
            onCatSpeak={handleCatSpeak}
          />
        </div>

        {/* 1. PRIMA LINEA DI DEMARCAZIONE IN STILE CORALINE: MANO DELL'ALTRA MADRE */}
        <CoralineDivider variant="hand" />

        <BobinskyWorkoutCard 
          todayStr={todayStr} 
          workoutLogs={workoutLogs}
          onSaveWorkout={handleSaveWorkout}
        />

        {/* 3. IL CALENDARIO: GRIGLIA MENSILE */}
        <CalendarGrid
          onSelectDate={handleDayClick}
          allLogs={allLogs}
          workoutLogs={workoutLogs}
          onSaveWorkout={handleSaveWorkout}
          displayYear={displayYear}
          displayMonth={displayMonth}
          todayStr={todayStr}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onResetToCurrentMonth={handleResetToCurrentMonth}
          onCatSpeak={handleCatSpeak}
          workoutModalState={workoutModalState}
          onWorkoutModalStateChange={setWorkoutModalState}
        />

        {/* SECONDA LINEA DI DEMARCAZIONE IN STILE CORALINE: SCARAFAGGIO-BOTTONE VIOLA */}
        <CoralineDivider variant="beetle" />

        {/* 4. LA DASHBOARD: CHIAVI GIGANTI E STATISTICHE */}
        <MonthStatsBar
          displayYear={displayYear}
          displayMonth={displayMonth}
          todayStr={todayStr}
          allLogs={allLogs}
          workoutLogs={workoutLogs}
          keysPerMonth={keysPerMonth}
          onCatSpeak={handleCatSpeak}
        />

        {/* 3. TERZA LINEA DI DEMARCAZIONE IN STILE CORALINE: INSETTO-ARMADIO ARANCIO */}
        <div style={{ position: 'relative', zIndex: 30 }}>
          <CoralineDivider variant="wardrobe" />
        </div>

        {/* 5. LA PORTICINA SEGRETA DELL'ALTRO MONDO (PORTALE SPOTIFY) */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SecretDoor />
        </div>

        {/* 6. DEDICA NELLA NOTTE STELLATA */}


      {/* TOPO SALTATORE FLOTTANTE IN BASSO A SINISTRA CON NUVOLETTA CARTONATA */}
      <FloatingJumpingMouse
        unmarkedDays={unmarkedDays}
      />

      {/* WYBIE LOVAT FLOTTANTE IN BASSO A SINISTRA CON NUVOLETTA SPECCHIATA VERSO L'INTERNO */}
      <FloatingWybie />

      {/* GATTO NERO GRANDINO FLOTTANTE IN BASSO A DESTRA CON NUVOLETTA POKÉMON/CORALINE */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)',
          right: '18px',
          zIndex: 9980,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'catCornerFloat 3.2s ease-in-out infinite',
          willChange: 'transform',
          transform: 'translateZ(0)',
          pointerEvents: 'none'
        }}
      >
        {/* NUVOLETTA DIALOGO DEL GATTO: FUMETTO BIANCO PULITO CON TRAMA STELLATA DISSOLTA E PUNTA FUMETTO */}
        {catSpeech && (
          <div
            key={catSpeech.id}
            onClick={(e) => {
              e.stopPropagation();
              triggerHapticFeedback('selection');
              if (catSpeechTimerRef.current) clearTimeout(catSpeechTimerRef.current);
              setCatSpeech(null);
            }}
            style={{
              position: 'absolute',
              bottom: '122px',
              right: '2px',
              width: 'max-content',
              maxWidth: 'min(175px, 44vw)',
              padding: '10px 14px',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.35)',
              color: '#0f172a',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              lineHeight: 1.42,
              fontWeight: 600,
              textAlign: 'left',
              userSelect: 'none',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'catBubblePop 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards',
              boxSizing: 'border-box'
            }}
          >
            {/* Texture Coraline tantissimo dissolta nel riempimento (opacità 10%) */}
            <div
              style={{
                position: 'absolute',
                inset: '1.5px',
                borderRadius: '14.5px',
                backgroundImage: `url(${catCloudPattern})`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                opacity: 0.10,
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* Puntatore / coda del fumetto in basso a destra verso il gatto */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '32px',
                width: '10px',
                height: '10px',
                background: '#ffffff',
                borderRight: '1.5px solid #0f172a',
                borderBottom: '1.5px solid #0f172a',
                transform: 'rotate(45deg)',
                zIndex: 1
              }}
            />

            {/* Testo del gatto - chiaro e ben visibile */}
            <div
              style={{
                position: 'relative',
                zIndex: 2
              }}
            >
              {catSpeech.text}
            </div>
          </div>
        )}

        <button
          onClick={async () => {
            hapticLight();
            const todayStatus = (typeof allLogs[todayStr] === 'object' ? allLogs[todayStr]?.dietState : allLogs[todayStr]) || null;
            
            const yesterdayDate = new Date(todayObj);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
            const yesterdayStatus = (typeof allLogs[yStr] === 'object' ? allLogs[yStr]?.dietState : allLogs[yStr]) || null;

            const consecutiveDiet = getConsecutiveDietStreak(allLogs, todayStr);

            let consecutiveCheat = 0;
            let checkD = new Date(todayObj);
            if (!todayStatus || todayStatus === 'neutral') {
              checkD.setDate(checkD.getDate() - 1);
            }
            for (let i = 0; i < 30; i++) {
              const cStr = `${checkD.getFullYear()}-${String(checkD.getMonth() + 1).padStart(2, '0')}-${String(checkD.getDate()).padStart(2, '0')}`;
              const state = (typeof allLogs[cStr] === 'object' ? allLogs[cStr]?.dietState : allLogs[cStr]) || null;
              if (state === 'cheat') {
                consecutiveCheat++;
                checkD.setDate(checkD.getDate() - 1);
              } else {
                break;
              }
            }

            const hasAbsence = unmarkedDays.length > 0;

            let openCount = 1;
            try {
              const rawClicks = localStorage.getItem(STORAGE_KEYS.CAT_DAILY_CLICKS);
              let parsedClicks = null;
              if (rawClicks) {
                parsedClicks = JSON.parse(rawClicks);
              }
              const prev = (parsedClicks && parsedClicks.date === todayStr && Number.isFinite(parsedClicks.count))
                ? parsedClicks.count + 1
                : 1;
              localStorage.setItem(STORAGE_KEYS.CAT_DAILY_CLICKS, JSON.stringify({ date: todayStr, count: prev }));
              openCount = prev;
            } catch (e) {}

            const { getSmartSituationalCatQuote } = await getCatQuotesModule();
            const quote = getSmartSituationalCatQuote({
              todayStatus,
              yesterdayStatus,
              consecutiveSuccess: consecutiveDiet,
              consecutiveCheat,
              hasAbsence,
              openCountToday: openCount,
              now: new Date()
            });

            handleCatSpeak(quote);
          }}
          aria-label="Ascolta il Gatto Nero"
          title="Tocca per ascoltare il Gatto"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'auto',
            touchAction: 'manipulation'
          }}
        >
          <img
            src={catStandingImg}
            alt="Gatto Nero di Coraline"
            width={73}
            height={130}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            style={{
              height: '130px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.75)) drop-shadow(0 0 24px rgba(139, 92, 246, 0.45))',
              pointerEvents: 'none'
            }}
          />
        </button>
      </div>

      <style>{`
        @keyframes catBubblePop {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes catCornerFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -9px, 0) rotate(1.8deg);
          }
        }

        @keyframes coralineStarsSubtlePulse {
          0%, 100% {
            opacity: 0.72;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.015);
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
        onClose={handleCloseDayModal}
      />

      {/* OVERLAY DEL TUTOR (IL GATTO NERO DI CORALINE) */}
      <CatModal
        isOpen={catModalState.isOpen}
        quote={catModalState.quote}
        context={catModalState.context}
        onClose={handleCloseCatModal}
      />

      {/* OVERLAY EVENTI SPECIALI DI TRAMA (ALTRA MADRE CHIAVI FINITE & WYBIE STREAK) */}
      <StoryEventModal
        isOpen={storyModalState.isOpen}
        onClose={handleCloseStoryModal}
      />

      {/* MODAL IMPOSTAZIONI COMPLETO APERTO DAL PROFILO IN ALTO A DESTRA (Lazy Loaded con Suspense) */}
      <Suspense fallback={null}>
        {isSettingsOpen && (
          <SecretSettingsModal
            isOpen={isSettingsOpen}
            onClose={handleCloseSettings}
            initialTab={settingsTab}
            keysPerMonth={keysPerMonth}
            onChangeKeysPerMonth={handleChangeKeysPerMonth}
            onRestoreSuccess={handleRestoreSuccess}
            onOpenDailyGreeting={handleOpenDailyGreetingPreview}
            customAvatar={customAvatar}
            onAvatarChange={handleAvatarChange}
          />
        )}
      </Suspense>

      {/* SCHERMATA MINIMALE GIORNALIERA DEL GATTO (PRIMO ACCESSO DEL GIORNO) */}
      <DailyCatGreetingModal
        isOpen={isDailyGreetingOpen}
        onClose={handleDismissDailyGreeting}
        dateStr={todayStr}
        initialQuote={dailyGreetingQuoteOverride}
      />

      {/* MODAL NOTIFICA AGGIORNAMENTO DISPONIBILE (GITHUB RELEASES) */}
      <UpdateAvailableModal
        isOpen={!!updateAvailableInfo}
        updateInfo={updateAvailableInfo}
        onClose={handleCloseUpdateModal}
      />
      </div>
    </>
  );
}
