const STORAGE_KEY = 'coraline_asia_habit_tracker_v1';
const KEYS_CONFIG_KEY = 'coraline_asia_keys_per_month_v1';

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
 * Carica il numero di chiavi mensili configurato (default: 4)
 */
export function getKeysPerMonth() {
  try {
    const val = localStorage.getItem(KEYS_CONFIG_KEY);
    return val ? Math.max(1, parseInt(val, 10)) : 4;
  } catch (err) {
    return 4;
  }
}

/**
 * Salva il numero di chiavi mensili configurato
 */
export function setKeysPerMonth(count) {
  try {
    const safeCount = Math.max(1, count);
    localStorage.setItem(KEYS_CONFIG_KEY, String(safeCount));
    return safeCount;
  } catch (err) {
    return 4;
  }
}

/**
 * Carica l'intero database locale
 * @returns {Record<string, { dietState: 'neutral' | 'success' | 'cheat' | 'cheat_key', updatedAt: string }>}
 */
export function getAllLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Errore caricamento dati locali:", err);
    return {};
  }
}

/**
 * Ottiene i dati di un singolo giorno
 * @param {string} dateStr 'YYYY-MM-DD'
 */
export function getDayLog(dateStr) {
  const all = getAllLogs();
  return all[dateStr] || {
    dietState: 'neutral', // 'neutral' | 'success' | 'cheat' | 'cheat_key'
    updatedAt: null
  };
}

/**
 * Calcola quante chiavi sono state usate nel mese specificato
 */
export function getMonthUsedKeys(allLogs, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  let count = 0;
  Object.entries(allLogs).forEach(([dateStr, log]) => {
    if (dateStr.startsWith(prefix) && log.dietState === 'cheat_key') {
      count++;
    }
  });
  return count;
}

/**
 * Salva o aggiorna lo stato per una specifica data
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all[dateStr];
  } catch (err) {
    console.error("Errore salvataggio dati locali:", err);
    return null;
  }
}

/**
 * Trova i giorni passati (dal 1° del mese corrente a oggi) che non sono stati ancora contrassegnati
 * @param {Record<string, any>} allLogs
 * @returns {string[]} Elenco di date 'YYYY-MM-DD' non registrate
 */
export function getUnmarkedPastDays(allLogs) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const unmarked = [];

  // Scansiona dal primo giorno del mese fino a oggi
  for (let day = 1; day <= currentDay; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const log = allLogs[dateStr];
    if (!log || !log.dietState || log.dietState === 'neutral') {
      unmarked.push(dateStr);
    }
  }

  return unmarked;
}

