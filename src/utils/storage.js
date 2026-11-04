import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { enqueueSyncOperation } from './syncQueue.js';

const STORAGE_KEY = STORAGE_KEYS.HABIT_TRACKER_LOGS;
const BACKUP_SNAPSHOT_KEY = STORAGE_KEYS.BACKUP_SNAPSHOT;

// Cache in memoria RAM per azzerare I/O sincrono bloccante
let logsMemoryCache = null;

/**
 * Ottiene la data corrente formattata in YYYY-MM-DD
 */
export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const formatYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseYMD = (str) => {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
};

/**
 * Carica l'intero database locale con cache in RAM e auto-ripristino da snapshot
 * @returns {Record<string, { dietState: 'neutral' | 'success' | 'cheat' | 'cheat_key', updatedAt: string }>}
 */
export function getAllLogs() {
  if (logsMemoryCache !== null) return logsMemoryCache;

  // 1. Tentativo di lettura da chiave primaria
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        logsMemoryCache = parsed;
        return logsMemoryCache;
      }
    }
  } catch (err) {
    console.error("Errore lettura chiave primaria storage:", err);
  }

  // 2. Auto-ripristino trasparente dallo Snapshot di emergenza (Dual-Write Recovery)
  try {
    const snapshotRaw = localStorage.getItem(BACKUP_SNAPSHOT_KEY);
    if (snapshotRaw) {
      const recovered = JSON.parse(snapshotRaw);
      if (recovered && typeof recovered === 'object' && !Array.isArray(recovered)) {
        console.warn("✦ Auto-ripristino eseguito con successo dallo snapshot di emergenza! ✦");
        logsMemoryCache = recovered;
        try {
          localStorage.setItem(STORAGE_KEY, snapshotRaw);
        } catch (e) {}
        return logsMemoryCache;
      }
    }
  } catch (snapErr) {
    console.error("Errore lettura snapshot:", snapErr);
  }

  logsMemoryCache = {};
  return logsMemoryCache;
}

/**
 * Calcola quante chiavi sono state usate nel mese specificato
 */
export function getMonthUsedKeys(allLogs, year, month) {
  if (!allLogs || typeof allLogs !== 'object') return 0;
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  let count = 0;
  Object.entries(allLogs).forEach(([dateStr, log]) => {
    if (dateStr.startsWith(prefix) && log && log.dietState === 'cheat_key') {
      count++;
    }
  });
  return count;
}

/**
 * Salva o aggiorna lo stato per una specifica data in modo atomico e immutabile
 * su storage primario e snapshot. Se lo stato torna a 'neutral', rimuove la chiave
 * per mantenere il database pulito e i conteggi esatti.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {object} updates
 */
export function saveDayLog(dateStr, updates) {
  try {
    const prevAll = getAllLogs();
    const nextAll = { ...prevAll };

    if (updates && updates.dietState === 'neutral') {
      delete nextAll[dateStr];
    } else {
      const current = nextAll[dateStr] || { dietState: 'neutral' };
      nextAll[dateStr] = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }

    logsMemoryCache = nextAll;

    // Sincronizzazione atomica ridondante (doppio snapshot)
    try {
      const serialized = JSON.stringify(nextAll);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_SNAPSHOT_KEY, serialized);
    } catch (writeErr) {
      console.error("Errore scrittura localStorage/snapshot:", writeErr);
    }

    // Accoda l'operazione nella Coda Offline Persistente (Offline-First Sync)
    try {
      enqueueSyncOperation({
        type: 'diet_log',
        key: dateStr,
        payload: updates
      });
    } catch (qErr) {}

    return nextAll[dateStr] || { dietState: 'neutral', updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error("Errore salvataggio dati locali:", err);
    return null;
  }
}

/**
 * Genera il payload completo di backup esportabile (JSON)
 * @returns {string} Stringa JSON formattata
 */
export function exportBackupData() {
  const payload = exportFullCloudBackupPayload();
  return JSON.stringify(payload, null, 2);
}

/**
 * Ottiene la foto profilo personalizzata salvata (base64)
 */
export function getCustomAvatar() {
  try {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_AVATAR) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Salva o rimuove la foto profilo personalizzata (base64)
 */
export function saveCustomAvatar(base64Data) {
  try {
    if (base64Data) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_AVATAR, base64Data);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_AVATAR);
    }

    try {
      enqueueSyncOperation({
        type: 'profile_avatar',
        key: 'custom_avatar',
        payload: { hasAvatar: Boolean(base64Data) }
      });
    } catch (qErr) {}

    return true;
  } catch (e) {
    console.error('Errore salvataggio avatar:', e);
    return false;
  }
}

/**
 * Genera l'oggetto completo di tutti i dati per il salvataggio nel Cloud Supabase
 * @returns {object}
 */
export function exportFullCloudBackupPayload() {
  const logs = getAllLogs();
  const workoutLogs = getWorkoutLogs();
  let keysPerMonth = 4;
  let reminderTime = '20:00';
  let reminderEnabled = true;

  try {
    keysPerMonth = Number(localStorage.getItem(STORAGE_KEYS.KEYS_PER_MONTH)) || 4;
    reminderTime = localStorage.getItem(STORAGE_KEYS.REMINDER_TIME) || '20:00';
    reminderEnabled = localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED) !== 'false';
  } catch (e) {}

  const activeLogsCount = Object.values(logs).filter(
    (entry) => entry && entry.dietState && entry.dietState !== 'neutral'
  ).length;

  return {
    app: 'coraline-diet-tracker-asia',
    version: 2,
    exportedAt: new Date().toISOString(),
    totalDaysLogged: activeLogsCount,
    streak: getConsecutiveDietStreak(logs),
    logs,
    workoutLogs,
    keysPerMonth,
    profileAvatar: getCustomAvatar(),
    preferences: {
      reminderTime,
      reminderEnabled
    }
  };
}

/**
 * Ripristina un payload completo dal Cloud Supabase (dieta, allenamento, chiavi, foto profilo, preferenze)
 * @param {object} payload
 */
export function restoreFullCloudBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('I dati di backup non sono validi o sono vuoti.');
  }

  // 1. Ripristina log dieta
  let importedLogs = {};
  if (payload.logs && typeof payload.logs === 'object') {
    const res = importBackupData(JSON.stringify({ logs: payload.logs }));
    importedLogs = res.logs || {};
  } else {
    // Prova se il payload è direttamente una mappa di date o contiene logs a livello radice
    try {
      const res = importBackupData(JSON.stringify(payload));
      importedLogs = res.logs || {};
    } catch (e) {
      // Se non contiene logs validi, prosegue con gli altri campi
    }
  }

  // 2. Ripristina log allenamento
  let importedWorkouts = {};
  if (payload.workoutLogs && typeof payload.workoutLogs === 'object') {
    try {
      localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(payload.workoutLogs));
      workoutLogsMemoryCache = payload.workoutLogs;
      importedWorkouts = payload.workoutLogs;
    } catch (e) {}
  }

  // 3. Ripristina chiavi per mese
  if (payload.keysPerMonth) {
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS_PER_MONTH, String(payload.keysPerMonth));
    } catch (e) {}
  }

  // 4. Ripristina foto profilo personalizzata
  if (payload.profileAvatar !== undefined) {
    saveCustomAvatar(payload.profileAvatar);
  }

  // 5. Ripristina preferenze
  if (payload.preferences) {
    try {
      if (payload.preferences.reminderTime) {
        localStorage.setItem(STORAGE_KEYS.REMINDER_TIME, payload.preferences.reminderTime);
      }
      if (payload.preferences.reminderEnabled !== undefined) {
        localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, payload.preferences.reminderEnabled ? 'true' : 'false');
      }
    } catch (e) {}
  }

  return {
    success: true,
    logs: importedLogs,
    workoutLogs: importedWorkouts,
    keysPerMonth: payload.keysPerMonth || 4,
    profileAvatar: payload.profileAvatar || null
  };
}

/**
 * Importa e valida un file o testo di backup, ripristinando storage e snapshot
 * @param {string} jsonString
 * @returns {{ success: boolean, count: number, importedCount: number, logs: object, allLogs: object }}
 */
export function importBackupData(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error("Il file o il testo fornito è vuoto.");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString.trim());
  } catch (e) {
    throw new Error("Formato non valido: assicurati di usare un file .json o il codice di backup corretto.");
  }

  // Estrai il dizionario logs (supporta sia il formato esportato con metadati, sia l'oggetto grezzo)
  const candidateLogs = (parsed && typeof parsed.logs === 'object' && parsed.logs !== null)
    ? parsed.logs
    : parsed;

  if (!candidateLogs || typeof candidateLogs !== 'object' || Array.isArray(candidateLogs)) {
    throw new Error("La struttura del backup non contiene registrazioni valide.");
  }

  // Validazione rigorosa e sanitizzazione di ogni data (esclude stati 'neutral' vuoti)
  const sanitized = {};
  const validStates = ['success', 'cheat', 'cheat_key'];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  Object.entries(candidateLogs).forEach(([dateStr, entry]) => {
    if (dateRegex.test(dateStr) && entry && typeof entry === 'object') {
      if (validStates.includes(entry.dietState)) {
        sanitized[dateStr] = {
          ...entry,
          dietState: entry.dietState,
          updatedAt: entry.updatedAt || new Date().toISOString()
        };
      }
    }
  });

  const importedCount = Object.keys(sanitized).length;
  if (importedCount === 0) {
    throw new Error("Nessuna data valida trovata nel file di backup.");
  }

  // Scrittura atomica sia sulla chiave primaria sia sullo snapshot
  const serialized = JSON.stringify(sanitized);
  localStorage.setItem(STORAGE_KEY, serialized);
  localStorage.setItem(BACKUP_SNAPSHOT_KEY, serialized);
  logsMemoryCache = sanitized;

  return {
    success: true,
    count: importedCount,
    importedCount,
    logs: sanitized,
    allLogs: sanitized
  };
}

/**
 * Cancella tutti i log registrati (Reset completo del diario di dieta e allenamento)
 */
export function clearAllLogs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  localStorage.setItem(BACKUP_SNAPSHOT_KEY, JSON.stringify({}));
  localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify({}));
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
  } catch (e) {}
  logsMemoryCache = {};
  workoutLogsMemoryCache = {};
  return {};
}

/**
 * Trova i giorni passati non contrassegnati per l'avviso del Topo Saltatore.
 * Regola:
 * Include i giorni passati non compilati a partire da ieri (periodo di grazia visivo per la luna,
 * ma segnalato con delicatezza dal Topo per ricordare di completare il diario).
 *
 * @param {Record<string, any>} allLogs
 * @returns {string[]} Elenco di date 'YYYY-MM-DD' non registrate
 */
export function getUnmarkedPastDays(allLogs) {
  if (!allLogs || typeof allLogs !== 'object') return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // La soglia parte da ieri: include ieri se non ancora compilato
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // Verifica le date in cui l'utente ha effettivamente registrato qualcosa
  const recordedDates = Object.keys(allLogs).filter((dateKey) => {
    const entry = allLogs[dateKey];
    return entry && typeof entry === 'object' && entry.dietState && entry.dietState !== 'neutral';
  });

  if (recordedDates.length === 0) {
    return [];
  }

  // Troviamo la data più vecchia registrata dall'utente
  recordedDates.sort();
  const [ey, em, ed] = recordedDates[0].split('-').map(Number);
  const earliestRecordedDate = new Date(ey, em - 1, ed);

  // Se ieri è precedente alla prima data mai registrata, niente da allertare
  if (yesterday < earliestRecordedDate) {
    return [];
  }

  // Non andiamo indietro per più di 45 giorni nel passato per non allarmare vecchi periodi remoti
  const maxLookback = new Date(now);
  maxLookback.setDate(now.getDate() - 45);
  const minDate = earliestRecordedDate > maxLookback ? earliestRecordedDate : maxLookback;

  const unmarked = [];

  // Scansioniamo a ritroso da ieri indietro fino a minDate
  let cursor = new Date(yesterday);
  while (cursor >= minDate) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const log = allLogs[dateStr];
    const isUnmarked = !log || typeof log !== 'object' || !log.dietState || log.dietState === 'neutral';

    if (isUnmarked) {
      unmarked.push(dateStr);
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  // Ordina cronologicamente dal giorno mancante più vecchio al più recente
  return unmarked.sort();
}

/**
 * Calcola i giorni di dieta consecutivi (streak di successi).
 * - Le giornate con 'success' incrementano il contatore (+1).
 * - Le giornate con 'cheat_key' (Chiave Nera Jolly) congelano/proteggono la catena senza spezzarla
 *   (ma senza incrementare il contatore dei giorni di dieta pura).
 * - Le giornate con 'cheat' (Bottone Nero) o buchi non registrati spezzano la serie e la azzerano.
 * - Se viene fornita `referenceDateStr`, calcola la catena attiva attorno a quella data.
 * - Se non viene fornita, calcola la catena attiva fino a oggi (o ieri, o l'ultima data compilata).
 * 
 * @param {Record<string, any>} allLogs
 * @param {string} [referenceDateStr] Data opzionale in formato 'YYYY-MM-DD'
 * @returns {number} Numero di giorni consecutivi di dieta rispettata
 */
export function getConsecutiveDietStreak(allLogs, referenceDateStr) {
  if (!allLogs || typeof allLogs !== 'object') return 0;

  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseYMD = (str) => {
    if (!str || typeof str !== 'string') return null;
    const parts = str.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  };

  const computeChainAroundDate = (anchorDateStr) => {
    const anchorLog = allLogs[anchorDateStr];
    if (!anchorLog || (anchorLog.dietState !== 'success' && anchorLog.dietState !== 'cheat_key')) {
      return 0;
    }

    const anchorDate = parseYMD(anchorDateStr);
    if (!anchorDate) return 0;

    let streak = anchorLog.dietState === 'success' ? 1 : 0;
    let steps = 0;

    // Scansione a ritroso
    const pastDate = new Date(anchorDate);
    while (steps < 3650) {
      steps++;
      pastDate.setDate(pastDate.getDate() - 1);
      const pStr = formatYMD(pastDate);
      const state = allLogs[pStr]?.dietState;
      if (state === 'success') {
        streak++;
      } else if (state === 'cheat_key') {
        // La Chiave Jolly protegge la serie senza incrementarla
        continue;
      } else {
        break;
      }
    }

    // Scansione in avanti (fino ad un massimo di oggi - non conta mai giorni futuri)
    const futureDate = new Date(anchorDate);
    steps = 0;
    const nowLimit = new Date();
    const todayLimitStr = formatYMD(nowLimit);
    while (steps < 365) {
      steps++;
      futureDate.setDate(futureDate.getDate() + 1);
      const fStr = formatYMD(futureDate);
      if (fStr > todayLimitStr) break;
      const state = allLogs[fStr]?.dietState;
      if (state === 'success') {
        streak++;
      } else if (state === 'cheat_key') {
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  // 1. Se viene indicata una data di riferimento specifica (es. giorno appena cliccato o oggi):
  if (referenceDateStr && typeof referenceDateStr === 'string') {
    const targetLog = allLogs[referenceDateStr];
    if (targetLog && (targetLog.dietState === 'success' || targetLog.dietState === 'cheat_key')) {
      return computeChainAroundDate(referenceDateStr);
    }
    // Se la data indicata è oggi ed è ancora non compilata, recupera la serie attiva fino a ieri
    const now = new Date();
    const todayStr = formatYMD(now);
    if (referenceDateStr === todayStr) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatYMD(yesterday);
      const yesterdayState = allLogs[yesterdayStr]?.dietState;
      if (yesterdayState === 'success' || yesterdayState === 'cheat_key') {
        return computeChainAroundDate(yesterdayStr);
      }
    }
    return 0;
  }

  // 2. Verifica la catena attiva legata a oggi o ieri
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const todayStr = formatYMD(now);
  const todayState = allLogs[todayStr]?.dietState;

  if (todayState === 'cheat') {
    return 0;
  }

  if (todayState === 'success' || todayState === 'cheat_key') {
    return computeChainAroundDate(todayStr);
  }

  // Oggi non è ancora compilato: controlliamo se ieri faceva parte di una serie attiva
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);
  const yesterdayState = allLogs[yesterdayStr]?.dietState;

  if (yesterdayState === 'success' || yesterdayState === 'cheat_key') {
    return computeChainAroundDate(yesterdayStr);
  }

  // Se né oggi né ieri sono parte di una serie attiva (es. trascorsi 2 o più giorni vuoti),
  // la serie attuale è 0 (elimina lo streak "zombie" dal passato remoto)
  return 0;
}

/**
 * Calcola la serie migliore di giorni consecutivi di dieta rispettata (Best Streak) all'interno di un mese specifico.
 * Usata coerentemente sia per i mesi passati che per il mese corrente (pallina con la stella in MonthStatsBar).
 * - Se la serie era attiva alla fine del mese precedente, viene ereditata all'inizio del mese.
 * - L'uso di una chiave jolly (cheat_key) al giorno 1 o in qualunque giorno protegge la serie senza azzerarla.
 * - Restituisce 0 se il mese non ha alcun giorno compilato.
 * 
 * @param {Record<string, any>} allLogs 
 * @param {number} year 
 * @param {number} month 0-indexed
 * @returns {number}
 */
export function getMonthBestStreak(allLogs, year, month) {
  if (!allLogs || typeof allLogs !== 'object') return 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mStr = String(month + 1).padStart(2, '0');

  // Conta i giorni effettivamente registrati in questo mese
  let loggedDaysInMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${mStr}-${String(d).padStart(2, '0')}`;
    const st = allLogs[dStr]?.dietState;
    if (st && st !== 'neutral') {
      loggedDaysInMonth++;
    }
  }

  // Se il mese non ha alcun giorno compilato (es. mese futuro o completamente vuoto), il record del mese è 0
  if (loggedDaysInMonth === 0) {
    return 0;
  }

  // 1. Calcola l'eventuale serie attiva che entra dal mese precedente
  let streakLeadingIn = 0;
  try {
    const lastDayPrevMonth = new Date(year, month, 0, 12, 0, 0);
    const prevDateStr = formatYMD(lastDayPrevMonth);
    const prevState = allLogs[prevDateStr]?.dietState;

    if (prevState === 'success' || prevState === 'cheat_key') {
      let checkDate = new Date(lastDayPrevMonth);
      let steps = 0;
      while (steps < 3650) {
        const dStr = formatYMD(checkDate);
        const st = allLogs[dStr]?.dietState;
        if (st === 'success') {
          streakLeadingIn++;
        } else if (st === 'cheat_key') {
          // La chiave jolly protegge la serie senza incrementarla
        } else {
          break;
        }
        steps++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  } catch (e) {}

  let currentStreak = streakLeadingIn;
  let maxStreak = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${mStr}-${String(d).padStart(2, '0')}`;
    const state = allLogs[dStr]?.dietState;

    if (state === 'success') {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (state === 'cheat_key') {
      // La chiave jolly protegge la serie attiva senza azzerarla e senza incrementarla.
      // Se la serie attuale era > 0 (es. ereditata dal mese precedente o iniziata prima),
      // viene mantenuta e concorre al record del mese.
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      // Giorno con bottone nero o giorno non segnato interrompe la serie attiva
      currentStreak = 0;
    }
  }

  return maxStreak;
}

// =========================================================
// GESTIONE ALLENAMENTI ASIA (IL GRANDE BOBINSKY)
// =========================================================
const WORKOUT_STORAGE_KEY = STORAGE_KEYS.WORKOUT_LOGS;
let workoutLogsMemoryCache = null;

/**
 * Ottiene tutti i log di allenamento registrati con cache in memoria RAM (zero blocco I/O)
 * @returns {Record<string, 'yes' | 'no'>}
 */
export function getWorkoutLogs() {
  if (workoutLogsMemoryCache !== null) return workoutLogsMemoryCache;
  try {
    const raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      workoutLogsMemoryCache = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      return workoutLogsMemoryCache;
    }
  } catch (e) {
    workoutLogsMemoryCache = {};
    return workoutLogsMemoryCache;
  }
  workoutLogsMemoryCache = {};
  return workoutLogsMemoryCache;
}

/**
 * Salva o aggiorna lo stato di allenamento per una data con sincronizzazione cache atomica
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {'yes' | 'no' | null} status 
 * @returns {Record<string, 'yes' | 'no'>}
 */
export function saveWorkoutLog(dateStr, status) {
  try {
    const logs = getWorkoutLogs();
    const updated = { ...logs };
    if (!status) {
      delete updated[dateStr];
    } else {
      updated[dateStr] = status;
    }
    workoutLogsMemoryCache = updated;
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(updated));

    try {
      enqueueSyncOperation({
        type: 'workout_log',
        key: dateStr,
        payload: { status }
      });
    } catch (qErr) {}

    return updated;
  } catch (e) {
    console.error('Errore salvataggio workout:', e);
    return getWorkoutLogs();
  }
}

/**
 * Calcola i giorni di allenamento ('yes') per un determinato mese
 * @param {Record<string, 'yes' | 'no'>} workoutLogs 
 * @param {number} year 
 * @param {number} month 0-indexed
 * @returns {number}
 */
export function getMonthWorkoutCount(workoutLogs, year, month) {
  if (!workoutLogs || typeof workoutLogs !== 'object') return 0;
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  let count = 0;
  Object.entries(workoutLogs).forEach(([dateStr, status]) => {
    if (dateStr.startsWith(prefix) && status === 'yes') {
      count++;
    }
  });
  return count;
}

