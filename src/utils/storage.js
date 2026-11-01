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
 * Salva o aggiorna lo stato per una specifica data in modo atomico su storage primario e snapshot
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {object} updates
 */
export function saveDayLog(dateStr, updates) {
  try {
    const all = getAllLogs();
    const current = all[dateStr] || {
      dietState: 'neutral'
    };

    all[dateStr] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    logsMemoryCache = all;

    // Sincronizzazione atomica ridondante (doppio snapshot)
    try {
      const serialized = JSON.stringify(all);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_SNAPSHOT_KEY, serialized);
    } catch (writeErr) {
      console.error("Errore scrittura localStorage/snapshot:", writeErr);
    }

    return all[dateStr];
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
  const payload = {
    app: 'coraline-diet-tracker-asia',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalDaysLogged: Object.keys(logs).length,
    streak: getConsecutiveDietStreak(logs),
    logs
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Importa e valida un file o testo di backup, ripristinando storage e snapshot
 * @param {string} jsonString
 * @returns {{ success: boolean, count: number, logs: object }}
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

  // Validazione rigorosa e sanitizzazione di ogni data
  const sanitized = {};
  const validStates = ['neutral', 'success', 'cheat', 'cheat_key'];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  Object.entries(candidateLogs).forEach(([dateStr, entry]) => {
    if (dateRegex.test(dateStr) && entry && typeof entry === 'object') {
      const state = validStates.includes(entry.dietState) ? entry.dietState : 'neutral';
      sanitized[dateStr] = {
        dietState: state,
        updatedAt: entry.updatedAt || new Date().toISOString()
      };
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
    logs: sanitized
  };
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
 * - Se viene fornita una data di riferimento (es. il giorno appena contrassegnato con 'success'),
 *   calcola la catena continua di successi che include quella data (sia a ritroso che in avanti).
 * - Se non viene fornita una referenceDateStr, calcola la catena continua legata a oggi (o ieri),
 *   tenendo conto anche di eventuali giorni pre-registrati / testati in avanti.
 * - Inoltre, restituisce il valore più significativo fra la catena attiva e la sequenza
 *   consecutiva massima presente nei log.
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

  // 1. Se viene indicata una data di riferimento specifica (es. giorno cliccato dall'utente):
  if (referenceDateStr && typeof referenceDateStr === 'string') {
    const refLog = allLogs[referenceDateStr];
    if (refLog && refLog.dietState === 'success') {
      let streak = 1;
      const refDate = parseYMD(referenceDateStr);
      if (refDate) {
        // A ritroso (giorni precedenti)
        const pastDate = new Date(refDate);
        while (streak < 3650) {
          pastDate.setDate(pastDate.getDate() - 1);
          const pStr = formatYMD(pastDate);
          if (allLogs[pStr] && allLogs[pStr].dietState === 'success') {
            streak++;
          } else {
            break;
          }
        }
        // In avanti (giorni successivi se pre-registrati o testati)
        const futureDate = new Date(refDate);
        while (streak < 3650) {
          futureDate.setDate(futureDate.getDate() + 1);
          const fStr = formatYMD(futureDate);
          if (allLogs[fStr] && allLogs[fStr].dietState === 'success') {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      }
    }
  }

  // 2. Se non c'è una data di riferimento, calcola la catena continua legata a oggi (o ieri)
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const todayStr = formatYMD(now);
  const todayLog = allLogs[todayStr];

  let chainToday = 0;
  if (todayLog && todayLog.dietState === 'success') {
    chainToday = 1;
    // Indietro
    const pDate = new Date(now);
    while (chainToday < 3650) {
      pDate.setDate(pDate.getDate() - 1);
      const pStr = formatYMD(pDate);
      if (allLogs[pStr] && allLogs[pStr].dietState === 'success') {
        chainToday++;
      } else {
        break;
      }
    }
    // Avanti
    const fDate = new Date(now);
    while (chainToday < 3650) {
      fDate.setDate(fDate.getDate() + 1);
      const fStr = formatYMD(fDate);
      if (allLogs[fStr] && allLogs[fStr].dietState === 'success') {
        chainToday++;
      } else {
        break;
      }
    }
  } else if (!todayLog || todayLog.dietState === 'neutral') {
    // Oggi non è ancora segnato: verifica catena a ritroso da ieri
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = formatYMD(yesterday);
    if (allLogs[yStr] && allLogs[yStr].dietState === 'success') {
      chainToday = 1;
      const pDate = new Date(yesterday);
      while (chainToday < 3650) {
        pDate.setDate(pDate.getDate() - 1);
        const pStr = formatYMD(pDate);
        if (allLogs[pStr] && allLogs[pStr].dietState === 'success') {
          chainToday++;
        } else {
          break;
        }
      }
    }
  }

  // 3. Calcola la massima serie consecutiva presente in tutti i dati registrati
  const successDates = Object.keys(allLogs)
    .filter((dStr) => allLogs[dStr] && allLogs[dStr].dietState === 'success')
    .sort();

  let maxStreak = 0;
  let curStreak = 0;
  let prevDateObj = null;

  for (const dStr of successDates) {
    const dObj = parseYMD(dStr);
    if (!dObj) continue;

    if (prevDateObj) {
      const diffMs = dObj.getTime() - prevDateObj.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        curStreak++;
      } else {
        curStreak = 1;
      }
    } else {
      curStreak = 1;
    }

    prevDateObj = dObj;
    if (curStreak > maxStreak) {
      maxStreak = curStreak;
    }
  }

  return Math.max(chainToday, maxStreak);
}
