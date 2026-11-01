const STORAGE_KEY = 'coraline_asia_habit_tracker_v1';

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
 * Carica l'intero database locale
 * @returns {Record<string, { dietState: 'neutral' | 'success' | 'cheat', waterGlasses: number, updatedAt: string }>}
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
    dietState: 'neutral', // 'neutral' | 'success' | 'cheat'
    waterGlasses: 0,
    updatedAt: null
  };
}

/**
 * Salva o aggiorna i dati per una specifica data
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {object} updates
 */
export function saveDayLog(dateStr, updates) {
  try {
    const all = getAllLogs();
    const current = all[dateStr] || {
      dietState: 'neutral',
      waterGlasses: 0
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
