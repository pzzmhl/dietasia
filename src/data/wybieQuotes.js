/**
 * Database Frasi di Wybie Lovat (Fedele al personaggio e alla Lore di Coraline)
 * 
 * Wybie parla con il suo tono caratteristico: curioso, strambo, impacciato,
 * leale, cameratesco ed energico. Supporta Asia come un vero compagno
 * d'avventura tra il Pink Palace e il vecchio pozzo: con battute sulle lumache
 * banana, la maschera da saldatore a teschio, la moto truccata, la bacchetta
 * da rabdomante e i fischi della nonna dal portico. Zero giudizi, massima grinta!
 */

import { STORAGE_KEYS } from '../constants/storageKeys.js';

/**
 * Traguardi di streak ufficiali di Wybie:
 * Spaziati rigorosamente a giorni alterni o a intervalli superiori (1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 75, 90, 100).
 * Non vi sono mai giorni consecutivi!
 */
export const WYBIE_MILESTONE_STREAKS = [1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 75, 90, 100];

/**
 * Verifica se Wybie può parlare nella data indicata (todayStr).
 * Regola: Wybie parla a giorni alterni. Non deve MAI parlare per due giorni consecutivi!
 * Tra due comparse deve esserci sempre almeno 1 giorno intermedio di silenzio (diffDays >= 2).
 */
export function canWybieSpeakToday(todayStr) {
  if (!todayStr) return false;
  try {
    const lastDate = localStorage.getItem(STORAGE_KEYS.WYBIE_LAST_SPOKEN_DATE);
    if (!lastDate) return true; // Primo utilizzo: può parlare
    if (lastDate === todayStr) {
      // Ha già parlato oggi
      return false;
    }
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const [lY, lM, lD] = lastDate.split('-').map(Number);
    const tTime = Date.UTC(tY, tM - 1, tD);
    const lTime = Date.UTC(lY, lM - 1, lD);
    const diffDays = Math.round((tTime - lTime) / (1000 * 60 * 60 * 24));

    // diffDays deve essere almeno 2 (es. parlato il 2, oggi è il 4 -> diff = 2 -> OK)
    // Se diffDays < 2 (es. parlato ieri, diff = 1) -> SILENZIO
    return diffDays >= 2;
  } catch (e) {
    return true;
  }
}

/**
 * Registra che Wybie ha parlato oggi
 */
export function recordWybieSpokenToday(todayStr) {
  if (!todayStr) return;
  try {
    localStorage.setItem(STORAGE_KEYS.WYBIE_LAST_SPOKEN_DATE, todayStr);
  } catch (e) {}
}

// 1. TRAGUARDI DI STREAK E STEP CONSECUTIVI (Rigorosamente a giorni alterni o intervalli distanziati)
const WYBIE_STREAK_QUOTES = [
  {
    id: 'streak_1',
    streakRequired: 1,
    title: 'Il Primo Passo col Pozzo',
    text: "Ehi Asia! Il primo giorno è andato! Anche per scovare il vecchio pozzo coperto di fango serviva fare il primo passo con la bacchetta di nocciolo, no? Grande inizio!"
  },
  {
    id: 'streak_3',
    streakRequired: 3,
    title: '3 Giorni di Fila',
    text: "3 giorni consecutivi! Caspita, persino quel gatto randagio si è fermato a guardare dallo steccato con gli occhi sgranati. E fidati, quello lì non si impressiona per niente!"
  },
  {
    id: 'streak_5',
    streakRequired: 5,
    title: 'Cinque Giorni a Tutta Birra',
    text: "Cinque giorni di fila! Sei più veloce della mia bici truccata quando scendo a rotta di collo per le colline del Pink Palace! Manca pochissimo a chiudere una settimana, tieni duro!"
  },
  {
    id: 'streak_7',
    streakRequired: 7,
    title: 'Una Settimana Piena',
    text: "Una settimana piena, Asia! Sette giorni puliti! La nonna fischia sempre dal portico che la costanza è più rara delle lumache blu: beh, tu ne hai da vendere!"
  },
  {
    id: 'streak_10',
    streakRequired: 10,
    title: 'Doppia Cifra nel Fango',
    text: "10 giorni di fila! Doppia cifra tonda tonda! Sei più tosta dei sentieri di quercia velenosa sotto la pioggia dell'Oregon. Grandissima!"
  },
  {
    id: 'streak_14',
    streakRequired: 14,
    title: 'Due Settimane d\'Acciaio',
    text: "Due settimane consecutive! 14 giorni senza farti incantare da nessuna trappola con gli occhi di bottone. Sei un osso duro vero, Asia!"
  },
  {
    id: 'streak_21',
    streakRequired: 21,
    title: '21 Giorni di Ferro',
    text: "21 giorni di fila! Dicono che ci vogliano tre settimane per forgiare un'abitudine d'acciaio: eccola qua, missione compiuta! Neanche la Beldam saprebbe spezzarla!"
  },
  {
    id: 'streak_30',
    streakRequired: 30,
    title: 'Un Mese nel Mondo Reale',
    text: "30 giorni consecutivi! Un mese intero di pura rotta! Niente trucchi finti dell'Altra Madre: questa vittoria è tutta tua, farina del tuo sacco nel mondo reale!"
  },
  {
    id: 'streak_45',
    streakRequired: 45,
    title: '45 Giorni nella Nebbia',
    text: "45 giorni di fila! Ormai conosci la strada a memoria a occhi chiusi, persino nella nebbia più fitta di Ashland e senza accendere il fanale della moto!"
  },
  {
    id: 'streak_60',
    streakRequired: 60,
    title: 'Due Mesi da Fuoriclasse',
    text: "Due mesi interi! 60 giorni di fila... comincio a pensare che tu abbia una bacchetta da rabdomante magica nello zaino, mica un rametto qualunque come il mio!"
  },
  {
    id: 'streak_75',
    streakRequired: 75,
    title: '75 Giorni Inarrestabile',
    text: "75 giorni consecutivi! Sei inarrestabile, Asia! Nemmeno la mia moto con il motore potenziato e le tre marce tiene un ritmo così costante!"
  },
  {
    id: 'streak_90',
    streakRequired: 90,
    title: 'Tre Mesi da Campionessa',
    text: "Tre mesi di fila! 90 giorni da fuoriclasse assoluta! Guarda che cammino incredibile hai costruito fin qui, senza mai cadere nelle scorciatoie!"
  },
  {
    id: 'streak_100',
    streakRequired: 100,
    title: 'Cento Giorni da Leggenda',
    text: "CENTO GIORNI DI FILA! Un traguardo leggendario! Persino Bobinsky e tutta la brigata dei suoi topi saltatori stanno applaudendo dal tetto con le trombette. Mitica Asia!"
  }
];

// 2. FRASI MOTIVAZIONALI & IN BASE AGLI EVENTI
export const WYBIE_ACTION_QUOTES = [
  // Successo (Pietra verde)
  {
    id: 'action_success_1',
    type: 'diet_success',
    title: 'Pietra Verde al Suo Posto',
    text: "Pietra verde al suo posto! Guardaci attraverso: rotta pulita e niente bottoni neri neanche oggi. Ottimo lavoro Asia!"
  },
  {
    id: 'action_success_2',
    type: 'diet_success',
    title: 'Giorno Conquistato',
    text: "Un'altra giornata perfetta segnata sul diario! Stai facendo sembrare tutto facile, persino sotto il diluvio dell'Oregon!"
  },
  {
    id: 'action_success_3',
    type: 'diet_success',
    title: 'Senza Nebbia',
    text: "Visto? Quando decidi dove andare non c'è nebbia fitta del Pink Palace che possa fermarti. Grande giornata!"
  },
  {
    id: 'action_success_4',
    type: 'diet_success',
    title: 'La Bussola Segna Giusto',
    text: "Un altro tassello al posto giusto. La tua bussola punta dritto al bersaglio, proprio come la mia bacchetta dell'acqua!"
  },

  // Imprevisto / Conforto (Bottone nero - cameratesco, zero colpevolizzazioni)
  {
    id: 'action_cheat_1',
    type: 'diet_cheat',
    title: 'Testa Alta e Maschera Su',
    text: "Ehi Asia, frena con la moto! Non è successo niente! Sono caduto dentro i rovi di more e nel fango mille volte. Ci si dà una ripulita alla visiera e domani si riparte più veloci di prima!"
  },
  {
    id: 'action_cheat_2',
    type: 'diet_cheat',
    title: 'Nessun Dramma sul Fango',
    text: "Tranquilla! Pure la mia bici truccata si ingolfa in salita ogni tanto. Non guardare indietro: una giornata storta non cancella mica tutti i chilometri che hai fatto!"
  },
  {
    id: 'action_cheat_3',
    type: 'diet_cheat',
    title: 'Sentiero Ripreso',
    text: "Niente drammi! Anche i migliori esploratori sbagliano sentiero tra i boschi ogni tanto. L'importante è riprendere il manubrio e pedalare sereni!"
  },
  {
    id: 'action_cheat_4',
    type: 'diet_cheat',
    title: 'Zero Pensieri Tossici',
    text: "Ehi, niente musi lunghi! Un giorno no ci sta, fa parte del viaggio nel mondo vero. Respira, bevi un goccio d'acqua fresca e domani siamo di nuovo in pista!"
  },

  // Chiave Jolly (Giorno di libertà speciale)
  {
    id: 'action_key_1',
    type: 'diet_key',
    title: 'Giorno di Libertà',
    text: "Chiave della libertà usata al momento perfetto! Goditi ogni singolo morso senza pensieri: te lo sei straguadagnata, ci vediamo al vecchio pozzo!"
  },
  {
    id: 'action_key_2',
    type: 'diet_key',
    title: 'Pausa Meritata',
    text: "Hai girato la chiave nella toppa giusta! Ogni tanto serve tirare il freno a mano e guardarsi il panorama, altrimenti si diventa matti come Bobinsky lassù!"
  },

  // Allenamento Brigata Bobinsky
  {
    id: 'action_workout_1',
    type: 'workout',
    title: 'Che Scatto da Campionessa',
    text: "Woah Asia! Che scatto oggi! Sembrava che stessi seminando la nonna quando fischia forte dal portico. Grandissimo allenamento!"
  },
  {
    id: 'action_workout_2',
    type: 'workout',
    title: 'Fino al Pink Palace',
    text: "Allenamento completato! La tua energia oggi si sentiva fino all'ultimo piano del Pink Palace, tra i topi e le travi!"
  },
  {
    id: 'action_workout_3',
    type: 'workout',
    title: 'Agilità da Topo Acrobata',
    text: "Forte questa! Ti sei mossa alla grande: sembravi uno di quei topi acrobati del circo di sopra, ma con molta più grinta!"
  }
];

// 3. FRASI SPONTANEE & RANDOMICHE IN STILE WYBIE (Curioso, fedele compagno)
export const WYBIE_LOVE_QUOTES = [
  {
    id: 'spontaneous_1',
    title: 'In Perlustrazione',
    text: "Ehi Asia! Passavo in perlustrazione con la moto e la maschera da saldatore: volevo solo vedere come andava. Sei in gamba, continua così!"
  },
  {
    id: 'spontaneous_2',
    title: 'Dal Trespolo del Pozzo',
    text: "Ti tengo d'occhio dal trespolo del vecchio pozzo! Mi raccomando, niente scorciatoie e niente bottoni: sei forte così come sei nel mondo vero!"
  },
  {
    id: 'spontaneous_3',
    title: 'Lumache e Grinta',
    text: "Ho trovato una lumaca banana gigante stamattina con la macchina fotografica... ma la cosa più tosta che ho visto oggi resta la tua determinazione!"
  },
  {
    id: 'spontaneous_4',
    title: 'Salita Ripida',
    text: "Se la salita ti sembra ripida, ricordati che hai già superato un sacco di trappole. Un passo alla volta col manubrio saldo, Asia!"
  },
  {
    id: 'spontaneous_5',
    title: 'La Saggezza della Nonna',
    text: "Mia nonna dice sempre: 'Chi ha pazienza trova l'acqua pura anche sotto la roccia più dura'. Mi sa che parlava proprio di te!"
  },
  {
    id: 'spontaneous_6',
    title: 'Il Gatto Fa il Tifo',
    text: "Occhio a quel gatto nero se ti gira attorno: fa tanto il filosofo snob, ma sotto sotto fa un tifo sfegatato per te pure lui!"
  },
  {
    id: 'spontaneous_7',
    title: 'Punto d\'Appoggio',
    text: "Se hai bisogno di una mano o di un pezzo di ricambio per la bici, sai dove trovarmi. Fai un bel respiro e vai avanti a testa alta!"
  },
  {
    id: 'spontaneous_8',
    title: 'Costruzione Solida',
    text: "Ogni volta che guardo questo diario vedo che stai costruendo qualcosa di solido e vero. Non mollare, Asia!"
  },
  {
    id: 'spontaneous_9',
    title: 'Fatti un Complimento',
    text: "Ehi! Volevo solo ricordarti che stai facendo un percorso incredibile. Fatti un complimento sincero oggi, te lo meriti tutto!"
  },
  {
    id: 'spontaneous_10',
    title: 'Mondo Reale Libero',
    text: "Niente trucchi, niente stanze fittizie dell'Altra Madre: i tuoi risultati sono tutti reali, farina del tuo sacco. Grande Asia!"
  },
  {
    id: 'spontaneous_11',
    title: 'Fai il Pieno',
    text: "Ricordati di bere un goccio d'acqua fresca e di riposare: anche i motori truccati fondono se non gli dai un po' di refrigerio!"
  },
  {
    id: 'spontaneous_12',
    title: 'Pedalare Forte',
    text: "Stai tenendo la rotta meglio di chiunque altro qui intorno al Pink Palace. Abbassa la visiera e continua a pedalare forte!"
  }
];

// LISTA COMPLETA ORDINATA PER IL CICLO AL TOCCO O PER IL TEST
export const ALL_WYBIE_QUOTES = [
  ...WYBIE_STREAK_QUOTES,
  ...WYBIE_ACTION_QUOTES,
  ...WYBIE_LOVE_QUOTES
];

/**
 * Seleziona la citazione più adeguata per uno streak numerico
 */
export function getWybieStreakQuote(streakNum) {
  if (typeof streakNum !== 'number' || streakNum <= 0) {
    return WYBIE_STREAK_QUOTES[0];
  }

  // Cerca un match esatto
  const exact = WYBIE_STREAK_QUOTES.find((q) => q.streakRequired === streakNum);
  if (exact) return exact;

  // Altrimenti prendi il traguardo raggiunto più alto
  const eligible = WYBIE_STREAK_QUOTES
    .filter((q) => q.streakRequired <= streakNum)
    .sort((a, b) => b.streakRequired - a.streakRequired);

  return eligible[0] || WYBIE_STREAK_QUOTES[0];
}

/**
 * Seleziona una citazione casuale per un tipo di evento o spontanea
 */
export function getRandomWybieQuote(type = 'love') {
  if (type === 'love' || type === 'spontaneous') {
    const idx = Math.floor(Math.random() * WYBIE_LOVE_QUOTES.length);
    return WYBIE_LOVE_QUOTES[idx];
  }

  const matching = WYBIE_ACTION_QUOTES.filter((q) => q.type === type);
  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }

  return WYBIE_LOVE_QUOTES[0];
}
