// Database delle battute del Gatto Nero di Coraline per Asia
export const CAT_QUOTES = {
  // Quando Asia segue la dieta (Successo)
  success: [
    "Vedo che sai muoverti nel buio senza inciampare nei dolciumi, Asia. Continua così.",
    "Non c'è nessun trucco qui, Asia: solo pura forza di volontà. L'Altra Madre oggi resta a bocca asciutta.",
    "Un passo alla volta tra le nebbie. Stai mantenendo la rotta, fanciulla.",
    "I topi ballerini cercavano di distrarti con tentazioni proibite, ma tu sei stata più svelta.",
    "Cammini sui tetti della costanza con la grazia di un felino. Ben fatto, Asia.",
    "Persino in questo strambo mondo sottosopra, hai scelto la via più luminosa. Splendida mossa, Asia.",
    "Seguire le regole quando nessuno ti guarda è il vero segreto per non finire dietro lo specchio.",
    "Oggi meriteresti una chiave d'oro. Ma accontentati del mio raro cenno di ammirazione, Asia.",
    "Nessuna trappola ti ha catturata oggi. La tua determinazione è affilata come i miei artigli.",
    "Hai vinto tu, fanciulla. L'Altra Madre non ha potere su chi sa dire di no."
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
    "Un bottone non fa l'intero cappotto nero. Domani ripuliamo le tracce e si torna in riga, intesi?",
    "Le illusioni hanno un sapore dolce solo per i primi tre secondi, Asia. Domani dimostra di che pasta sei fatta davvero.",
    "Il tunnel verso casa è ancora aperto. Lascia perdere i rimorsi e riparti domani a testa alta."
  ],

  // Quando Asia usa una Chiave Nera Jolly (Sgarro Programmato con ancora chiavi disponibili)
  key: [
    "Hai girato la Chiave Nera nella toppa, Asia. Questo sgarro era calcolato: nessun bottone cucito per oggi.",
    "Una fuga controllata nell'Altro Mondo. La chiave ti protegge, ma usala con parsimonia.",
    "Oggi hai evitato la trappola usando il tuo lasciapassare. Mossa astuta, fanciulla.",
    "Il lucchetto ha scattato: sgarro concesso senza conseguenze. Ma non abbassare la guardia.",
    "Hai sfoderato la Chiave Nera. L'Altra Madre mastica amaro, per oggi niente aghi."
  ],

  // Quote speciale per l'ESAURIMENTO dell'ultima chiave
  last_key: [
    "Hai usato la tua ultima Chiave per questo mese, Asia. La porta verso l'Altro Mondo è sigillata fino al prossimo mese: da qui in poi ogni sgarro cucirà un Bottone Nero!"
  ]
};

/**
 * Restituisce una citazione casuale in base al contesto
 * @param {'success' | 'cheat' | 'key' | 'last_key'} context
 */
export function getRandomCatQuote(context) {
  const pool = CAT_QUOTES[context] || CAT_QUOTES.success;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
