const STORAGE_KEY = 'coraline_asia_habit_tracker_v1';
const BACKUP_SNAPSHOT_KEY = 'coraline_asia_habit_tracker_backup_snapshot';

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
      logsMemoryCache = JSON.parse(raw);
      return logsMemoryCache;
    }
  } catch (err) {
    console.error("Errore lettura chiave primaria storage:", err);
  }

  // 2. Auto-ripristino trasparente dallo Snapshot di emergenza (Dual-Write Recovery)
  try {
    const snapshotRaw = localStorage.getItem(BACKUP_SNAPSHOT_KEY);
    if (snapshotRaw) {
      const recovered = JSON.parse(snapshotRaw);
      if (recovered && typeof recovered === 'object') {
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

    return nextAll[dateStr] || { dietState: 'neutral', updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error("Errore salvataggio dati locali:", err);
    return null;
  }
}

/**
 * Genera il payload completo di backup esportabile
 * @returns {string} Stringa JSON formattata
 */
export function exportBackupData() {
  const logs = getAllLogs();
  const activeLogsCount = Object.values(logs).filter(
    (entry) => entry && entry.dietState && entry.dietState !== 'neutral'
  ).length;
  const payload = {
    app: 'coraline-diet-tracker-asia',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalDaysLogged: activeLogsCount,
    streak: getConsecutiveDietStreak(logs),
    logs
  };
  return JSON.stringify(payload, null, 2);
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
 * Cancella tutti i log registrati (Reset completo del diario)
 */
export function clearAllLogs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  localStorage.setItem(BACKUP_SNAPSHOT_KEY, JSON.stringify({}));
  logsMemoryCache = {};
  return {};
}

/**
 * Trova i giorni passati (dal 1° del mese corrente a oggi) che richiedono attenzione.
 * - I giorni precedenti a oggi sono considerati non contrassegnati se sono 'neutral' o assenti.
 * - Il giorno odierno viene considerato non contrassegnato SOLO se sono già passate le 20:00.
 * @param {Record<string, any>} allLogs
 * @returns {string[]} Elenco di date 'YYYY-MM-DD' non registrate
 */
export function getUnmarkedPastDays(allLogs) {
  if (!allLogs || typeof allLogs !== 'object') return [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const currentHour = today.getHours();

  const unmarked = [];

  // Scansiona dal primo giorno del mese fino a ieri
  for (let day = 1; day < currentDay; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const log = allLogs[dateStr];
    if (!log || typeof log !== 'object' || !log.dietState || log.dietState === 'neutral') {
      unmarked.push(dateStr);
    }
  }

  // Per il giorno odierno: allarma solo se sono già passate le ore 20:00 e non è ancora registrato
  if (currentHour >= 20) {
    const dayStr = String(currentDay).padStart(2, '0');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const todayDateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const todayLog = allLogs[todayDateStr];
    if (!todayLog || typeof todayLog !== 'object' || !todayLog.dietState || todayLog.dietState === 'neutral') {
      unmarked.push(todayDateStr);
    }
  }

  return unmarked;
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

    // Scansione in avanti (per date già compilate o testate nel calendario)
    const futureDate = new Date(anchorDate);
    steps = 0;
    while (steps < 3650) {
      steps++;
      futureDate.setDate(futureDate.getDate() + 1);
      const fStr = formatYMD(futureDate);
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
    // Se oggi ha registrato un Bottone Nero, lo streak attuale è interrotto (a meno che non stia testando date future)
    const futureCheck = new Date(now);
    futureCheck.setDate(futureCheck.getDate() + 1);
    const tomorrowStr = formatYMD(futureCheck);
    if (!allLogs[tomorrowStr] || allLogs[tomorrowStr].dietState === 'neutral') {
      return 0;
    }
  }

  if (todayState === 'success' || todayState === 'cheat_key') {
    return computeChainAroundDate(todayStr);
  }

  // Oggi non è ancora compilato: controlliamo ieri
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);
  const yesterdayState = allLogs[yesterdayStr]?.dietState;

  if (yesterdayState === 'success' || yesterdayState === 'cheat_key') {
    return computeChainAroundDate(yesterdayStr);
  }

  // 3. Fallback per test su altri giorni/mesi del calendario:
  // Prende l'ultima data cronologicamente compilata. Se è un Bottone Nero ('cheat'), lo streak è 0.
  const activeDates = Object.keys(allLogs)
    .filter((dStr) => allLogs[dStr] && allLogs[dStr].dietState && allLogs[dStr].dietState !== 'neutral')
    .sort();

  if (activeDates.length === 0) return 0;

  const latestDateStr = activeDates[activeDates.length - 1];
  const latestState = allLogs[latestDateStr]?.dietState;

  if (latestState === 'cheat') {
    return 0;
  }

  return computeChainAroundDate(latestDateStr);
}
