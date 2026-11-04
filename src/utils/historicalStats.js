import { getConsecutiveDietStreak } from './storage';

/**
 * Calcola la serie record storica assoluta (All-Time Best Streak) di giorni consecutivi rispettati
 * @param {Record<string, { dietState: string }>} allLogs 
 * @returns {number}
 */
export function getAllTimeBestStreak(allLogs = {}) {
  const dates = Object.keys(allLogs || {})
    .filter((d) => allLogs[d] && (allLogs[d].dietState === 'success' || allLogs[d].dietState === 'cheat_key'))
    .sort();

  if (dates.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  dates.forEach((dStr) => {
    const [y, m, d] = dStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);
    currentDate.setHours(12, 0, 0, 0);

    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffMs = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays === 0) {
        // Stessa data duplicata (sicurezza)
      } else {
        currentStreak = 1;
      }
    }
    prevDate = currentDate;
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
  });

  const activeStreak = getConsecutiveDietStreak(allLogs);
  return Math.max(maxStreak, activeStreak);
}

/**
 * Calcola il confronto completo tra il mese corrente visualizzato e la media storica di tutti i mesi
 * @param {Record<string, { dietState: string }>} allLogs 
 * @param {Record<string, 'yes' | 'no'>} workoutLogs
 * @param {number} displayYear 
 * @param {number} displayMonth 0-indexed (0 per Gennaio, 11 per Dicembre)
 */
export function calculateHistoricalComparison(allLogs = {}, workoutLogs = {}, displayYear, displayMonth) {
  const currentPrefix = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;

  let currentSuccessCount = 0;
  let currentCheatCount = 0;
  let currentKeyCount = 0;
  let currentLoggedDays = 0;

  let totalSuccessCount = 0;
  let totalCheatCount = 0;
  let totalKeyCount = 0;
  let totalLoggedDays = 0;
  const recordedMonthsSet = new Set();

  Object.entries(allLogs || {}).forEach(([dateStr, log]) => {
    if (!log || typeof log !== 'object') return;
    const { dietState } = log;
    if (!dietState || dietState === 'neutral') return;

    totalLoggedDays++;
    const monthKey = dateStr.slice(0, 7);
    recordedMonthsSet.add(monthKey);

    const isCurrentMonth = dateStr.startsWith(currentPrefix);

    if (dietState === 'success') {
      totalSuccessCount++;
      if (isCurrentMonth) currentSuccessCount++;
    } else if (dietState === 'cheat') {
      totalCheatCount++;
      if (isCurrentMonth) currentCheatCount++;
    } else if (dietState === 'cheat_key') {
      totalKeyCount++;
      totalSuccessCount++; // Jolly salvato
      if (isCurrentMonth) {
        currentKeyCount++;
        currentSuccessCount++;
      }
    }

    if (isCurrentMonth) {
      currentLoggedDays++;
    }
  });

  // Calcolo Allenamenti Bobinsky
  let currentWorkoutCount = 0;
  let totalWorkoutCount = 0;

  Object.entries(workoutLogs || {}).forEach(([dateStr, status]) => {
    if (status === 'yes') {
      totalWorkoutCount++;
      const monthKey = dateStr.slice(0, 7);
      recordedMonthsSet.add(monthKey);
      if (dateStr.startsWith(currentPrefix)) {
        currentWorkoutCount++;
      }
    }
  });

  const totalRecordedMonths = Math.max(1, recordedMonthsSet.size);

  // Tassi di Aderenza
  const currentAdherence = currentLoggedDays > 0
    ? Math.round((currentSuccessCount / currentLoggedDays) * 100)
    : 100;

  const historicalAdherence = totalLoggedDays > 0
    ? Math.round((totalSuccessCount / totalLoggedDays) * 100)
    : 100;

  const adherenceDelta = currentAdherence - historicalAdherence;

  // Medie Mensili
  const avgMonthlySuccess = totalRecordedMonths > 0
    ? (totalSuccessCount / totalRecordedMonths).toFixed(1).replace('.0', '')
    : '0';

  const avgMonthlyCheats = totalRecordedMonths > 0
    ? (totalCheatCount / totalRecordedMonths).toFixed(1).replace('.0', '')
    : '0';

  const avgMonthlyWorkouts = totalRecordedMonths > 0
    ? (totalWorkoutCount / totalRecordedMonths).toFixed(1).replace('.0', '')
    : '0';

  // Streak
  const bestStreak = getAllTimeBestStreak(allLogs);
  const currentStreak = getConsecutiveDietStreak(allLogs);

  // Micro-copy Gatto Nero
  const isFirstMonth = totalRecordedMonths <= 1 && totalLoggedDays <= 14;
  let catQuote = '';
  if (isFirstMonth) {
    catQuote = "Stai scrivendo l'inizio della tua storia: ogni giorno tracciato costruisce la tua media.";
  } else if (currentAdherence >= historicalAdherence) {
    catQuote = "Il cammino procede a passo sicuro, Asia. Il mondo vero ha sempre una bella luce.";
  } else {
    catQuote = "Ogni mese ha il suo passo e la sua aria: ciò che conta è continuare con calma e gentilezza verso di te.";
  }

  return {
    currentAdherence,
    historicalAdherence,
    adherenceDelta,
    currentSuccessCount,
    totalSuccessCount,
    avgMonthlySuccess,
    currentCheatCount,
    totalCheatCount,
    avgMonthlyCheats,
    currentWorkoutCount,
    totalWorkoutCount,
    avgMonthlyWorkouts,
    currentKeyCount,
    totalKeyCount,
    bestStreak,
    currentStreak,
    totalLoggedDays,
    currentLoggedDays,
    totalRecordedMonths,
    isFirstMonth,
    catQuote
  };
}

