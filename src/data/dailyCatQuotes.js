/**
 * Archivio Frasi Quotidiane del Gatto Nero di Coraline per Asia
 * 
 * NOTA: Questo elenco contiene le frasi iniziali del Gatto.
 * Può essere facilmente esteso o sostituito con il set di 300 frasi
 * aggiungendo le stringhe all'array DAILY_CAT_QUOTES.
 */

export const DAILY_CAT_QUOTES = [
  "Non tutti i labirinti sono fatti per farti perdere, Asia. Alcuni esistono per farti capire di cosa sei capace.",
  "I bottoni sono per le bambole, non per chi decide ogni giorno quale strada percorrere.",
  "Non fidarti mai di chi ti promette un mondo troppo perfetto. La perfezione è sempre una trappola dell'Altra Madre.",
  "Muoviti leggera come un'ombra, ma con passi decisi. Oggi il controllo è solo tuo.",
  "Non servono chiavi d'oro per aprire le porte giuste. Basta saper dire di no quando conta.",
  "Il fumo e gli specchi ingannano solo chi ha paura di guardarsi dentro. Tu sei molto più forte di così.",
  "I topi saltatori suonano per distrarre, ma tu guarda sempre oltre la tenda del circo.",
  "Anche la notte più fitta deve cedere il passo quando decidi di camminare a testa alta.",
  "Non puoi cambiare il passato, ma puoi sempre decidere cosa mettere nel tuo piatto oggi.",
  "C'è un motivo se i gatti non hanno paura del buio: sappiamo che le ombre fuggono quando avanzi.",
  "L'Altro Mondo offre sempre scorciatoie facili. Ma la vera vittoria è costruire il tuo mondo reale.",
  "Un passo alla volta, fanciulla. La costanza batte sempre la magia degli inganni.",
  "Oggi guarda avanti, respira e lascia che siano le tentazioni a doversi preoccupare di te.",
  "La pioggia alla Pink Palace lava via i dubbi. Oggi è un foglio pulito per il tuo diario.",
  "Se incontri un vicolo cieco, salta sul tetto. C'è sempre un punto di vista migliore.",
  "Non servono formule magiche per resistere: basta ricordarsi chi sei e dove vuoi arrivare.",
  "Qualcuno aspetta che tu inciampi. Fagli vedere come sa atterrare sempre sulle zampe una vera guerriera.",
  "La vera astuzia non è evitare la fatica, ma renderla il tuo punto di forza.",
  "Ascolta il silenzio prima della tempesta. Dentro di te c'è tutta la calma necessaria.",
  "L'Altra Madre cuce bottoni solo a chi rinuncia a vedere. Tu tieni gli occhi ben aperti.",
  "Oggi concediti solo ciò che ti fa bene davvero. Tutto il resto è solo polvere e cartapesta.",
  "I sogni sono pericolosi solo se dimentichi di svegliarti per realizzarli.",
  "Ogni giorno che porti a termine con successo è un filo in meno nelle mani dell'Altro Mondo.",
  "Non c'è niente di male a sentire il peso del cammino, purché tu non smetta di camminare.",
  "Tu hai qualcosa che l'Altra Madre non avrà mai: il coraggio di essere te stessa.",
  "Mettiti in ascolto, Asia. La tua determinazione fa più rumore di qualsiasi dubbio.",
  "Oggi cammina fiera: le ombre si allungano solo quando il sole è pronto a sorgere.",
  "Non lasciare che nessuno scelga i tuoi confini. Il tuo destino lo disegni tu.",
  "Un giorno alla volta si vince una storia intera. E questa storia la stai scrivendo tu.",
  "Se persino un gatto come me ha stima di te, allora puoi conquistare qualsiasi giornata."
];

/**
 * Restituisce il saluto appropriato in base all'orario odierno
 * @param {Date} [now]
 * @returns {string} Saluto personalizzato
 */
export function getTimeOfDayGreeting(now = new Date()) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;

  // Dalle 05:00 alle 12:59 -> Buongiorno
  if (timeVal >= 5 && timeVal < 13) {
    return 'Buongiorno Asia';
  }
  // Dalle 13:00 alle 18:29 -> Buon pomeriggio
  if (timeVal >= 13 && timeVal < 18.5) {
    return 'Buon pomeriggio Asia';
  }
  // Dalle 18:30 alle 04:59 -> Buonasera
  return 'Buonasera Asia';
}

/**
 * Restituisce la frase del giorno (consistente per l'intera giornata)
 * @param {string} dateStr Data in formato 'YYYY-MM-DD'
 * @returns {string} Frase del gatto
 */
export function getDailyCatQuoteForDate(dateStr) {
  if (!dateStr) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  // Hash deterministico semplice basato sulla stringa della data
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DAILY_CAT_QUOTES.length;
  return DAILY_CAT_QUOTES[index];
}

