/**
 * Mappa Deterministica 1:1 delle Spiegazioni del Gatto per gli Elementi UI.
 * Ogni elemento cliccabile della Dashboard e degli Slot Statistiche possiede
 * una singola spiegazione puntuale, funzionale e immutabile (Zero Random).
 * 
 * Separato in questo modulo leggero per consentire a CalendarGrid, MonthStatsBar
 * e ButtonMoonEclipse di importare solo le spiegazioni senza caricare l'intero
 * database delle citazioni (200+ KB) all'avvio.
 */

const CAT_EXPLANATIONS_MAP = {
  // --- DASHBOARD PRINCIPALE ---
  dashboard_moon_eclipse: "Mostra il ritmo dei tuoi ultimi 7 giorni: la luna resta limpida se segui la dieta e si oscura come un bottone nero se perdi il ritmo.",
  dashboard_overview: "Il taccuino delle tue metriche mensili: tocca ogni riquadro per capire esattamente cosa misura e come viene calcolato.",

  // --- SLOT DELLE STATISTICHE (MonthStatsBar) ---
  stat_success_days: "Giorni di dieta seguita questo mese. Sotto trovi il confronto con la media degli altri mesi negli stessi giorni trascorsi.",
  stat_cheat_days: "Giorni fuori programma registrati questo mese. Sotto vedi la media degli altri mesi a parità di giorni passati.",
  stat_keys: "Chiavi jolly rimaste sul totale mensile: ti permettono un pasto libero speciale senza interrompere la serie.",
  stat_workout_days: "Sessioni di allenamento completate questo mese. Sotto trovi la media degli altri mesi a parità di giorni trascorsi.",
  stat_streak_record: "I tuoi giorni consecutivi di dieta attuali, confrontati sotto con il tuo record storico assoluto di sempre.",
  stat_adherence_rate: "Percentuale di riuscita del mese visualizzato, calcolata sui giorni compilati e confrontata sotto con la tua media storica.",

  // --- ELEMENTI ACCESSORI ---
  calendar_future_day: "Non puoi registrare giorni futuri: il diario accetta solo la giornata di oggi o i giorni già trascorsi."
};

/**
 * Restituisce l'unica spiegazione fissa, puntuale e funzionale del Gatto (Determinismo 1:1)
 * @param {string} key ID univoco UI
 * @returns {string} Spiegazione immutabile
 */
export function getUIElementExplanation(key) {
  if (!key) return CAT_EXPLANATIONS_MAP.dashboard_moon_eclipse;
  return CAT_EXPLANATIONS_MAP[key] || CAT_EXPLANATIONS_MAP.dashboard_moon_eclipse;
}

