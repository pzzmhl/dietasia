/**
 * Modello Matematico a 7 Giorni per l'Eclissi del Bottone (Coraline Moon Gamification).
 * 
 * Regola:
 * - Finestra mobile delle ultime 7 giornate (da t-6 a t=Oggi).
 * - 7 Fasi esatte (0 a 6).
 * - Ogni giornata di dieta rispettata (success) o chiave (cheat_key) spinge il bottone
 *   indietro verso la Fase 0 (Luna libera).
 * - Ogni giornata di sgarro (cheat) spinge il bottone avanti di 1 posto verso la Fase 6 (Eclissi totale).
 * - I giorni passati non segnati contano come saltati (+1 passo).
 * - Se oggi non è ancora segnato, non penalizza anzitempo.
 */
import { getConsecutiveDietStreak, getTodayDateString } from './storage.js';

export const WINDOW_DAYS = 7;

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export const PHASE_CONFIG_7 = [
  {
    phaseIndex: 0,
    title: 'Luna Chiara di Giada',
    status: 'Libera al 100%',
    color: '#8be574',
    bgBadge: 'rgba(58, 140, 48, 0.25)',
    description: 'La luna risplende intatta. Nessun bottone oscura il tuo cammino!'
  },
  {
    phaseIndex: 1,
    title: 'Bordo del Bottone',
    status: 'Fase 1 di 7',
    color: '#a7df7a',
    bgBadge: 'rgba(75, 130, 45, 0.25)',
    description: 'Il bordo scuro del bottone sfiora il margine destro della luna.'
  },
  {
    phaseIndex: 2,
    title: 'Due Fori d\'Ombra',
    status: 'Fase 2 di 7',
    color: '#c7e682',
    bgBadge: 'rgba(95, 135, 45, 0.25)',
    description: 'L\'ombra avanza rivelando i primi due fori verticali.'
  },
  {
    phaseIndex: 3,
    title: 'I Quattro Fori',
    status: 'Fase 3 di 7',
    color: '#e5c158',
    bgBadge: 'rgba(160, 120, 20, 0.25)',
    description: 'Tutti e quattro i fori sono visibili nel disco della luna.'
  },
  {
    phaseIndex: 4,
    title: 'Mezza Eclissi',
    status: 'Fase 4 di 7',
    color: '#e69845',
    bgBadge: 'rgba(170, 90, 20, 0.25)',
    description: 'Metà della luna è coperta. La scanalatura centrale è ben visibile.'
  },
  {
    phaseIndex: 5,
    title: 'Eclissi Avanzata',
    status: 'Fase 5 di 7',
    color: '#e66545',
    bgBadge: 'rgba(180, 55, 25, 0.25)',
    description: 'L\'Altra Madre stringe la presa: quasi tutta la superficie è in ombra.'
  },
  {
    phaseIndex: 6,
    title: 'Eclissi Totale del Bottone',
    status: 'Fase 6 di 7 (Totale)',
    color: '#e64555',
    bgBadge: 'rgba(190, 25, 35, 0.35)',
    description: 'Eclissi Totale! Il bottone copre tutta la luna: solo i 4 fori brillano!'
  }
];

/**
 * Calcola l'esatta fase (da 0 a 6) e i dettagli dei 7 giorni.
 * 
 * @param {Record<string, any>} allLogs 
 * @param {string} [referenceDateStr] Data di riferimento (default: oggi)
 */
export function calculateEclipseState(allLogs = {}, referenceDateStr = null) {
  const refDateStr = referenceDateStr || getTodayDateString();
  const dateParts = (refDateStr && typeof refDateStr === 'string') ? refDateStr.split('-').map(Number) : [];
  const baseDate = (dateParts.length === 3 && !isNaN(dateParts[0]) && !isNaN(dateParts[1]) && !isNaN(dateParts[2]))
    ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    : new Date();

  // Troviamo la prima data mai registrata nel database per non penalizzare giorni antecedenti all'installazione
  const recordedDates = Object.keys(allLogs || {}).filter((dateKey) => {
    const entry = allLogs[dateKey];
    return entry && typeof entry === 'object' && entry.dietState && entry.dietState !== 'neutral';
  });
  recordedDates.sort();
  const earliestDateStr = recordedDates.length > 0 ? recordedDates[0] : null;

  const daysBreakdown = [];
  let missedCount = 0;

  // Analisi ordinata dal giorno più vecchio (t-6) al più recente (t=0 Oggi)
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const log = allLogs[dateStr] || {};
    const state = log.dietState || 'neutral';

    let dayLabel = `${day}/${month}`;
    if (i === 0) dayLabel = 'Oggi';
    else if (i === 1) dayLabel = 'Ieri';

    let isMissed = false;
    if (state === 'cheat') {
      isMissed = true;
      missedCount += 1;
    } else if (state === 'neutral') {
      // Un giorno passato conta come 'missed' SOLO se l'utente aveva già iniziato a usare l'app (post-earliestDate)
      // I giorni precedenti all'installazione dell'app non vengono mai penalizzati
      if (i > 0 && earliestDateStr && dateStr >= earliestDateStr) {
        isMissed = true;
        missedCount += 1;
      }
    }

    daysBreakdown.push({
      dateStr,
      dayLabel,
      dayNumber: day,
      dayOfWeek: DAY_NAMES_SHORT[d.getDay()],
      dietState: state,
      isMissed,
      isToday: i === 0,
      indexFromToday: i
    });
  }

  // L'indice della fase corrisponde esattamente al numero di sgarri (0..6)
  const phaseIndex = Math.min(6, Math.max(0, missedCount));
  const phaseInfo = PHASE_CONFIG_7[phaseIndex];
  const eclipsePercentage = Math.round((phaseIndex / 6) * 100);

  // Calcolo streak consecutivi
  const streakDays = getConsecutiveDietStreak(allLogs, refDateStr);

  return {
    phaseIndex,
    phaseInfo,
    eclipsePercentage,
    missedCount,
    streakDays,
    daysBreakdown
  };
}
