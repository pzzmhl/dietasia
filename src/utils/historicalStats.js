import { getConsecutiveDietStreak, getTodayDateString } from './storage.js';

let cachedLogsRef = null;
let cachedTodayRef = null;
let cachedBestStreak = 0;

/**
 * Calcola la serie record storica assoluta (All-Time Best Streak) di giorni consecutivi rispettati.
 * Unificata con la logica rigorosa di getConsecutiveDietStreak:
 * - Le giornate con 'success' incrementano la serie (+1).
 * - Le giornate con 'cheat_key' (Chiave Jolly) proteggono/congelano la serie senza incrementarla (+0) e senza azzerarla.
 * - Le giornate con 'cheat' o i buchi di giorni non registrati spezzano e azzerano la serie.
 * - Esclude eventuali date future anomale (> todayStr).
 *
 * @param {Record<string, { dietState: string }>} allLogs 
 * @param {string} effectiveTodayStr
 * @returns {number}
 */
function getAllTimeBestStreak(allLogs = {}, effectiveTodayStr = getTodayDateString()) {
  if (allLogs && allLogs === cachedLogsRef && effectiveTodayStr === cachedTodayRef) {
    return cachedBestStreak;
  }

  const validEntries = [];
  Object.entries(allLogs || {}).forEach(([dStr, log]) => {
    if (!log || typeof log !== 'object' || dStr > effectiveTodayStr) return;
    const { dietState } = log;
    if (dietState === 'success' || dietState === 'cheat' || dietState === 'cheat_key') {
      const parts = dStr.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const epoch = Math.round(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
        validEntries.push({ dateStr: dStr, epoch, state: dietState });
      }
    }
  });

  if (validEntries.length === 0) {
    cachedLogsRef = allLogs;
    cachedTodayRef = effectiveTodayStr;
    cachedBestStreak = 0;
    return 0;
  }

  validEntries.sort((a, b) => a.epoch - b.epoch);

  let maxStreak = 0;
  let currentStreak = 0;
  let prevEpoch = null;

  for (let i = 0; i < validEntries.length; i++) {
    const entry = validEntries[i];
    
    if (prevEpoch !== null) {
      const gap = entry.epoch - prevEpoch;
      if (gap > 1) {
        // C'è stato un buco di uno o più giorni non registrati nel calendario: la serie si interrompe!
        currentStreak = 0;
      }
    }

    if (entry.state === 'success') {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (entry.state === 'cheat_key') {
      // La chiave jolly protegge la serie congelandola: non incrementa e non azzera
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      // 'cheat' (bottone nero): azzera la serie
      currentStreak = 0;
    }

    prevEpoch = entry.epoch;
  }

  const activeStreak = getConsecutiveDietStreak(allLogs, effectiveTodayStr);
  const result = Math.max(maxStreak, activeStreak);
  cachedLogsRef = allLogs;
  cachedTodayRef = effectiveTodayStr;
  cachedBestStreak = result;
  return result;
}

/**
 * Calcola il confronto Month-To-Date (MTD) normalizzato sui giorni trascorsi nel mese.
 * Esclude rigorosamente:
 * - Mesi futuri (> mese odierno locale)
 * - Il mese corrente incompleto quando si consulta un mese passato
 * - Finestre MTD non vissute (0 registrazioni nella finestra 1..limitDay) o mesi privi di log dieta,
 *   evitando qualsiasi media falsata al ribasso.
 *
 * @param {Record<string, { dietState: string }>} allLogs 
 * @param {Record<string, 'yes' | 'no'>} workoutLogs 
 * @param {number} displayYear 
 * @param {number} displayMonth 0-indexed
 * @param {string} [todayStr] Data odierna locale 'YYYY-MM-DD'
 */
export function calculateMTDComparison(allLogs = {}, workoutLogs = {}, displayYear, displayMonth, todayStr) {
  const effectiveTodayStr = (todayStr && /^\d{4}-\d{2}-\d{2}$/.test(todayStr))
    ? todayStr
    : getTodayDateString();
  const [nowYear, nowMonthOneBased, nowDay] = effectiveTodayStr.split('-').map(Number);
  const nowMonth = nowMonthOneBased - 1;

  const year = typeof displayYear === 'number' ? displayYear : nowYear;
  const month = typeof displayMonth === 'number' ? displayMonth : nowMonth;
  const currentPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const actualCurrentPrefix = `${nowYear}-${String(nowMonth + 1).padStart(2, '0')}`;

  const isCurrentMonth = year === nowYear && month === nowMonth;
  const isFutureMonth = year > nowYear || (year === nowYear && month > nowMonth);

  // Giorni trascorsi da considerare: se è il mese corrente, fino ad oggi; se futuro 0; altrimenti l'intero mese
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const maxDay = isFutureMonth
    ? 0
    : isCurrentMonth
      ? Math.min(nowDay, daysInCurrentMonth)
      : daysInCurrentMonth;

  // Identifica tutti i mesi vissuti (<= actualCurrentPrefix) con almeno 1 registrazione valida
  const candidateMonthsSet = new Set();
  Object.entries(allLogs || {}).forEach(([dStr, log]) => {
    if (dStr && typeof dStr === 'string' && dStr.length >= 10 && dStr <= effectiveTodayStr && log && typeof log === 'object') {
      if (log.dietState === 'success' || log.dietState === 'cheat' || log.dietState === 'cheat_key') {
        const mPref = dStr.slice(0, 7);
        if (mPref <= actualCurrentPrefix) candidateMonthsSet.add(mPref);
      }
    }
  });
  Object.entries(workoutLogs || {}).forEach(([dStr, status]) => {
    if (dStr && typeof dStr === 'string' && dStr.length >= 10 && dStr <= effectiveTodayStr && (status === 'yes' || status === 'no')) {
      const mPref = dStr.slice(0, 7);
      if (mPref <= actualCurrentPrefix) candidateMonthsSet.add(mPref);
    }
  });

  // Esclusione del mese visualizzato e, se stiamo visualizzando un mese passato,
  // esclusione dell'eventuale mese corrente incompleto per non abbassare la media storica
  let otherMonths = Array.from(candidateMonthsSet).filter((m) => m !== currentPrefix && m <= actualCurrentPrefix);
  if (!isCurrentMonth) {
    otherMonths = otherMonths.filter((m) => m < actualCurrentPrefix);
  }

  // MTD del mese visualizzato (fino a maxDay)
  let currentSuccess = 0;
  let currentCheats = 0;
  let currentWorkouts = 0;

  for (let day = 1; day <= maxDay; day++) {
    const dayStr = `${currentPrefix}-${String(day).padStart(2, '0')}`;
    const log = allLogs[dayStr];
    if (log && typeof log === 'object') {
      if (log.dietState === 'success') {
        currentSuccess++;
      } else if (log.dietState === 'cheat') {
        currentCheats++;
      }
    }
    if (workoutLogs[dayStr] === 'yes') {
      currentWorkouts++;
    }
  }

  // MTD per tutti gli altri mesi: include nel denominatore solo i mesi con almeno 1 giorno vissuto
  // nella finestra 1..limitDay, evitando medie falsate su periodi precedenti all'installazione dell'app
  let sumOtherSuccess = 0;
  let sumOtherCheats = 0;
  let sumOtherWorkouts = 0;
  let dietMonthsCount = 0;
  let workoutMonthsCount = 0;

  otherMonths.forEach((mPrefix) => {
    const [mYear, mMonth] = mPrefix.split('-').map(Number);
    const daysInThatMonth = new Date(mYear, mMonth, 0).getDate();
    const limitDay = isCurrentMonth ? Math.min(maxDay, daysInThatMonth) : daysInThatMonth;

    let mSuccess = 0;
    let mCheats = 0;
    let mDietLogged = 0;
    let mWorkouts = 0;
    let mAnyActivity = 0;

    for (let day = 1; day <= limitDay; day++) {
      const dayStr = `${mPrefix}-${String(day).padStart(2, '0')}`;
      const log = allLogs[dayStr];
      if (log && typeof log === 'object') {
        if (log.dietState === 'success') {
          mSuccess++;
          mDietLogged++;
          mAnyActivity++;
        } else if (log.dietState === 'cheat') {
          mCheats++;
          mDietLogged++;
          mAnyActivity++;
        } else if (log.dietState === 'cheat_key') {
          mDietLogged++;
          mAnyActivity++;
        }
      }
      const wStatus = workoutLogs[dayStr];
      if (wStatus === 'yes') {
        mWorkouts++;
        mAnyActivity++;
      } else if (wStatus === 'no') {
        mAnyActivity++;
      }
    }

    if (mDietLogged > 0) {
      sumOtherSuccess += mSuccess;
      sumOtherCheats += mCheats;
      dietMonthsCount++;
    }
    if (mAnyActivity > 0) {
      sumOtherWorkouts += mWorkouts;
      workoutMonthsCount++;
    }
  });

  const avgOtherSuccess = dietMonthsCount > 0 ? (sumOtherSuccess / dietMonthsCount) : 0;
  const avgOtherCheats = dietMonthsCount > 0 ? (sumOtherCheats / dietMonthsCount) : 0;
  const avgOtherWorkouts = workoutMonthsCount > 0 ? (sumOtherWorkouts / workoutMonthsCount) : 0;

  // Formattatore del delta percentuale protetto da NaN / Infinity
  const formatDelta = (current, avg, validMonthsCount, invertBetter = false) => {
    if (isFutureMonth || validMonthsCount === 0 || !Number.isFinite(avg)) {
      return {
        avg: '—',
        delta: 0,
        deltaText: '',
        color: 'rgba(208, 207, 205, 0.72)',
        hasComparison: false
      };
    }

    const avgFormatted = avg.toFixed(1).replace('.0', '');
    let deltaPerc = 0;
    if (avg > 0) {
      deltaPerc = Math.round(((current - avg) / avg) * 100);
    } else if (current > 0) {
      deltaPerc = 100;
    } else {
      deltaPerc = 0;
    }

    const isBetter = invertBetter ? deltaPerc < 0 : deltaPerc > 0;
    const isWorse = invertBetter ? deltaPerc > 0 : deltaPerc < 0;
    const sign = deltaPerc > 0 ? '+' : '';
    const deltaText = `${sign}${deltaPerc}%`;
    const color = isBetter ? '#8be574' : isWorse ? '#f87171' : 'rgba(208, 207, 205, 0.72)';

    return {
      avg: avgFormatted,
      delta: deltaPerc,
      deltaText,
      color,
      hasComparison: true
    };
  };

  const successComparison = formatDelta(currentSuccess, avgOtherSuccess, dietMonthsCount, false);
  const cheatsComparison = formatDelta(currentCheats, avgOtherCheats, dietMonthsCount, true); // Meno imprevisti = verde
  const workoutsComparison = formatDelta(currentWorkouts, avgOtherWorkouts, workoutMonthsCount, false);

  // Aderenza Storica Globale (stesso identico criterio matematico di MonthStatsBar: (success + cheat_key) / loggedDays)
  let totalSuccessDays = 0;
  let totalLoggedDays = 0;
  Object.entries(allLogs || {}).forEach(([dStr, log]) => {
    if (dStr <= effectiveTodayStr && log && typeof log === 'object' && log.dietState && log.dietState !== 'neutral') {
      totalLoggedDays++;
      if (log.dietState === 'success' || log.dietState === 'cheat_key') {
        totalSuccessDays++;
      }
    }
  });
  const historicalAdherence = totalLoggedDays > 0 ? Math.round((totalSuccessDays / totalLoggedDays) * 100) : null;

  // All-time best streak
  const allTimeBestStreak = getAllTimeBestStreak(allLogs, effectiveTodayStr);

  return {
    otherMonthsCount: dietMonthsCount,
    maxDay,
    currentSuccess,
    currentCheats,
    currentWorkouts,
    successComparison,
    cheatsComparison,
    workoutsComparison,
    historicalAdherence,
    allTimeBestStreak,
    isFutureMonth
  };
}

