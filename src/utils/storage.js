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
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('I dati di backup non sono validi o sono vuoti.');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // 1. Ripristina log dieta (supporta anche oggetto logs vuoto {} senza crashare)
  let importedLogs = {};
  let importedCount = 0;

  if (payload.logs && typeof payload.logs === 'object' && !Array.isArray(payload.logs)) {
    if (Object.keys(payload.logs).length > 0) {
      try {
        const res = importBackupData(JSON.stringify({ logs: payload.logs }));
        importedLogs = res.logs || {};
        importedCount = res.importedCount || 0;
      } catch (e) {
        // payload.logs non conteneva stati validi: ripristina mappa vuota pulita
        const emptyStr = JSON.stringify({});
        try {
          localStorage.setItem(STORAGE_KEY, emptyStr);
          localStorage.setItem(BACKUP_SNAPSHOT_KEY, emptyStr);
        } catch (err) {}
        logsMemoryCache = {};
      }
    } else {
      const emptyStr = JSON.stringify({});
      try {
        localStorage.setItem(STORAGE_KEY, emptyStr);
        localStorage.setItem(BACKUP_SNAPSHOT_KEY, emptyStr);
      } catch (err) {}
      logsMemoryCache = {};
    }
  } else {
    // Prova se il payload è direttamente una mappa di date a livello radice
    try {
      const res = importBackupData(JSON.stringify(payload));
      importedLogs = res.logs || {};
      importedCount = res.importedCount || 0;
    } catch (e) {
      // Se non contiene neppure altri campi noti del backup, segnala file non valido
      const hasAnyBackupField = Boolean(
        payload.workoutLogs ||
        payload.keysPerMonth !== undefined ||
        payload.profileAvatar !== undefined ||
        payload.preferences
      );
      if (!hasAnyBackupField) {
        throw new Error('Nessuna registrazione valida trovata nel file di backup.');
      }
    }
  }

  // 2. Ripristina log allenamento con validazione strutturale rigorosa
  let importedWorkouts = {};
  if (payload.workoutLogs && typeof payload.workoutLogs === 'object' && !Array.isArray(payload.workoutLogs)) {
    Object.entries(payload.workoutLogs).forEach(([dStr, st]) => {
      if (dateRegex.test(dStr) && (st === 'yes' || st === 'no')) {
        importedWorkouts[dStr] = st;
      }
    });
    try {
      localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(importedWorkouts));
      workoutLogsMemoryCache = importedWorkouts;
    } catch (e) {}
  }

  // 3. Ripristina chiavi per mese
  const safeKeys = Number(payload.keysPerMonth);
  if (Number.isFinite(safeKeys) && safeKeys >= 0 && safeKeys <= 31) {
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS_PER_MONTH, String(Math.round(safeKeys)));
    } catch (e) {}
  }

  // 4. Ripristina foto profilo personalizzata
  if (payload.profileAvatar !== undefined) {
    saveCustomAvatar(payload.profileAvatar);
  }

  // 5. Ripristina preferenze
  if (payload.preferences && typeof payload.preferences === 'object') {
    try {
      if (typeof payload.preferences.reminderTime === 'string' && /^\d{2}:\d{2}$/.test(payload.preferences.reminderTime)) {
        localStorage.setItem(STORAGE_KEYS.REMINDER_TIME, payload.preferences.reminderTime);
      }
      if (payload.preferences.reminderEnabled !== undefined) {
        localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, payload.preferences.reminderEnabled ? 'true' : 'false');
      }
    } catch (e) {}
  }

  const totalImportedDays = new Set([
    ...Object.keys(importedLogs),
    ...Object.keys(importedWorkouts)
  ]).size;

  return {
    success: true,
    importedCount: totalImportedDays || importedCount,
    logs: importedLogs,
    workoutLogs: importedWorkouts,
    keysPerMonth: Number.isFinite(safeKeys) ? Math.round(safeKeys) : 4,
    profileAvatar: payload.profileAvatar || null
  };
}

/**
 * Importa e valida un file o testo di backup, ripristinando storage e snapshot
 * @param {string} jsonString
 * @returns {{ success: boolean, count: number, importedCount: number, logs: object, allLogs: object }}
 */
function importBackupData(jsonString) {
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
 * Trova i giorni passati non contrassegnati per l'avviso del Topo Saltatore.
 * Regola:
 * Include i giorni passati non compilati a partire da ieri (periodo di grazia visivo per la luna,
 * ma segnalato con delicatezza dal Topo per ricordare di completare il diario).
 * Usa mezzogiorno locale (12:00:00) per immunità totale al cambio Ora Legale / Ora Solare.
 *
 * @param {Record<string, any>} allLogs
 * @returns {string[]} Elenco di date 'YYYY-MM-DD' non registrate
 */
export function getUnmarkedPastDays(allLogs) {
  if (!allLogs || typeof allLogs !== 'object') return [];

  const now = new Date();
  now.setHours(12, 0, 0, 0);

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

  // Troviamo la data più vecchia registrata dall'utente (a mezzogiorno locale anti-DST)
  recordedDates.sort();
  const [ey, em, ed] = recordedDates[0].split('-').map(Number);
  if (!ey || !em || !ed) return [];
  const earliestRecordedDate = new Date(ey, em - 1, ed, 12, 0, 0, 0);

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
  const cursor = new Date(yesterday);
  while (cursor >= minDate) {
    const dateStr = formatYMD(cursor);
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

