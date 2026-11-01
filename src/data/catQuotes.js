// Database delle battute del Gatto Nero di Coraline per Asia
export const CAT_QUOTES = {
  // Quando Asia segue la dieta o registra l'acqua (Successo / Idratazione)
  success: [
    "Vedo che sai muoverti nel buio senza inciampare nei dolciumi, Asia. Continua così.",
    "Non c'è nessun trucco qui, Asia: solo pura forza di volontà. L'Altra Madre oggi resta a bocca asciutta.",
    "Un passo alla volta tra le nebbie. Stai mantenendo la rotta, fanciulla.",
    "I topi ballerini cercavano di distrarti con tentazioni proibite, ma tu sei stata più svelta.",
    "Cammini sui tetti della costanza con la grazia di un felino. Ben fatto, Asia.",
    "L'acqua scorre e spazza via le illusioni. Il tuo corpo ringrazia, e io approvo (non capita spesso).",
    "Persino in questo strambo mondo sottosopra, hai scelto la via più luminosa. Splendida mossa, Asia.",
    "Seguire le regole quando nessuno ti guarda è il vero segreto per non finire dietro lo specchio.",
    "Ogni bicchiere d'acqua è come un sortilegio che ti rende più forte. Non fermarti qui.",
    "Oggi meriteresti una chiave d'oro. Ma accontentati del mio raro cenno di ammirazione, Asia."
  ],

  // Quando Asia registra uno sgarro (Bottone Nero)
  cheat: [
    "Un momento di debolezza, Asia? Ricorda: qui offrono sempre dolci prima di cucirti i bottoni negli occhi...",
    "Hai assaggiato la torta dell'Altra Madre? Attenta: nulla in quel banchetto è gratis.",
    "Il Bottone Nero è comparso sulla tela. Ma un punto scucito si può sempre riannodare domani.",
    "Non guardarmi così, Asia. Non ti giudico, ma ti tengo d'occhio. Domani niente scuse.",
    "Una scivolata nell'Altro Mondo può capitare a chiunque, ma non farti intrappolare dietro lo specchio.",
    "Senti quel ticchettio d'aghi da cucito in lontananza? Domani è il giorno perfetto per correre via da quelle trappole.",
    "Oggi è andata così. Ma tu sei Coraline, non la bambola di pezza. Domani riprenditi la tua storia.",
    "Hai ceduto alle tentazioni? Bevi un gran sorso d'acqua e prepara il contrattacco per l'alba.",
    "Un bottone non fa l'intero cappotto nero. Domani ripuliamo le tracce e si torna in riga, intesi?",
    "Le illusioni hanno un sapore dolce solo per i primi tre secondi, Asia. Domani dimostra di che pasta sei fatta davvero."
  ],

  // Quando registra l'acqua specificamente
  water: [
    "L'acqua è l'unico vero elisir che scaccia le nebbie dell'Altro Mondo. Ottimo lavoro, Asia.",
    "Idratarsi a dovere rende i tuoi riflessi agili come i miei. Continua a bere!",
    "Acqua fresca registrata. Anche il pozzo più buio e profondo oggi è fiero di te.",
    "Un altro bicchiere per mantenere la mente affilata come gli artigli. Brava, Asia."
  ]
};

/**
 * Restituisce una citazione casuale in base al contesto
 * @param {'success' | 'cheat' | 'water'} context
 */
export function getRandomCatQuote(context) {
  const pool = CAT_QUOTES[context] || CAT_QUOTES.success;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
