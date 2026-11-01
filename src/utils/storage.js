const STORAGE_KEY = 'coraline_asia_habit_tracker_v1';

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
 * Carica l'intero database locale con cache in RAM (zero parsing ridondante)
 * @returns {Record<string, { dietState: 'neutral' | 'success' | 'cheat' | 'cheat_key', updatedAt: string }>}
 */
export function getAllLogs() {
  if (logsMemoryCache !== null) return logsMemoryCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    logsMemoryCache = raw ? JSON.parse(raw) : {};
    return logsMemoryCache;
  } catch (err) {
    console.error("Errore caricamento dati locali:", err);
    logsMemoryCache = {};
    return logsMemoryCache;
  }
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
 * Salva o aggiorna lo stato per una specifica data in modo atomico e istantaneo
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

    // Sincronizzazione atomica senza bloccare il thread UI
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (writeErr) {
      console.error("Errore scrittura localStorage:", writeErr);
    }

    return all[dateStr];
  } catch (err) {
    console.error("Errore salvataggio dati locali:", err);
    return null;
  }
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
 * Calcola i giorni di dieta consecutivi (streak attuale di successi)
 * @param {Record<string, any>} allLogs
 * @returns {number} Numero di giorni consecutivi di dieta rispettata
 */
export function getConsecutiveDietStreak(allLogs) {
  if (!allLogs || typeof allLogs !== 'object') return 0;

  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(now);
  const todayLog = allLogs[todayStr];
  
  let checkDate = new Date(now);
  let streak = 0;

  // Se oggi è segnato come 'success', contiamo partendo da oggi
  if (todayLog && todayLog.dietState === 'success') {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (!todayLog || todayLog.dietState === 'neutral') {
    // Se oggi non è ancora stato segnato, verifichiamo la serie a ritroso da ieri
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Se oggi è già segnato con uno sgarro, la serie è interrotta
    return 0;
  }

  // Conta i giorni consecutivi a ritroso fino a trovare un'interruzione (con tetto di sicurezza)
  while (streak < 3650) {
    const dateStr = formatYMD(checkDate);
    const log = allLogs[dateStr];
    if (log && log.dietState === 'success') {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
