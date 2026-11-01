/**
 * Sistema di Gestione GIF Coraline (LAIKA Studios)
 * Gestisce l'estrazione randomica per categoria senza ripetizioni (Shuffle Bag / Deck),
 * la persistenza dello stato in localStorage e la rotazione dopo 10 ripetizioni.
 */

import fallbackBanner from '../assets/coraline-banner.gif';

// Catalogo delle GIF suddivise per categoria d'esito
export const CORALINE_GIF_REGISTRY = {
  // Sgarri programmati (Jolly / Chiave Nera)
  key: [
    { id: 'I5ovfL4RNFSPGJ2y6q', title: 'Coraline Sgarro 1' },
    { id: 'bulbsNX9dtfUo6vAqZ', title: 'Coraline Sgarro 2' },
    { id: 'hyI15Ahjjchp7UHfyU', title: 'Coraline Sgarro 3' },
    { id: '7Dtt1i8qZmYmNo1X42', title: 'Coraline Sgarro 4' },
    { id: 'lOa5vmmAGfSkk846Q0', title: 'Coraline Sgarro 5' },
    { id: 'Rw65l7FLpuo6LCRsAJ', title: 'Coraline Sgarro 6' }
  ],

  // Dieta rispettata (Pietra Verde / Successo)
  success: [
    { id: '69Abrzka4fGHcDCtpV', title: 'Coraline Successo 1' },
    { id: 'eNCSyH6V9Utf2fZBI5', title: 'Coraline Successo 2' },
    { id: 'PcGMeFVvmCgIkxpIwz', title: 'Coraline Successo 3' },
    { id: '5nHgjRkeLr0C5Axnig', title: 'Coraline Successo 4' },
    { id: '4t7BTP92Tus3S8Isry', title: 'Coraline Successo 5' },
    { id: 'zxrPIj9vS6q5or6PDs', title: 'Coraline Successo 6' },
    { id: 'UuBNIbPJ0seB57TNuY', title: 'Coraline Successo 7' },
    { id: 'Wqg8AyunU6jciIccTf', title: 'Coraline Successo 8' },
    { id: 'lV8ZDFAjcRNSdjgyBC', title: 'Coraline Successo 9' },
    { id: 'JKspX8WAaKc9b9ZnQX', title: 'Coraline Successo 10' },
    { id: 'cs9PJTxvSO4T6UQ0aa', title: 'Coraline Successo 11' },
    { id: 'b808MHnIMBkCgmnck1', title: 'Coraline Successo 12' }
  ],

  // Dieta non rispettata (Bottone Nero / Caduta)
  cheat: [
    { id: '2oi8VjpB3recadAiTQ', title: 'Coraline Bottone Nero 1' },
    { id: '4b7PmLNCXEbed4IXnY', title: 'Coraline Bottone Nero 2' },
    { id: '6oV1x6zrcJemySFG8I', title: 'Coraline Bottone Nero 3' },
    { id: '5Ha3bMDAGqUHao9cLQ', title: 'Coraline Bottone Nero 4' },
    { id: 'ALQXQwB0dT0GHT4GWQ', title: 'Coraline Bottone Nero 5' },
    { id: 'GNDQAYl86V141JllgU', title: 'Coraline Bottone Nero 6' },
    { id: 'mylzcTxAmZ1csB0s8J', title: 'Coraline Bottone Nero 7' },
    { id: 'UjB7puB4mk1thG24Yc', title: 'Coraline Bottone Nero 8' },
    { id: 'ErX4kTvnH80YZ3rDSG', title: 'Coraline Bottone Nero 9' },
    { id: 'TzRxjXf0AOx626owJz', title: 'Coraline Bottone Nero 10' }
  ],

  // GIF extra di apertura / neutre
  extra: [
    { id: 'GGvY01t71eu0I5Ywq6', title: 'Coraline Sopracciglio Curioso' },
    { id: 'nsJZspaP5l7BNAJbKJ', title: 'Coraline Intro' }
  ]
};

// Genera l'URL diretto ad alta definizione da Giphy CDN
export function getGiphyUrl(id) {
  if (!id) return fallbackBanner;
  return `https://i.giphy.com/media/${id}/giphy.gif`;
}

// Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Mappatura tra lo stato dell'app e la categoria di GIF
export function mapStatusToCategory(status) {
  if (status === 'success') return 'success';
  if (status === 'cheat') return 'cheat';
  if (status === 'cheat_key') return 'key';
  return 'neutral';
}

/**
 * Ottiene la prossima GIF dalla categoria senza ripetizioni.
 * Una volta esaurite tutte le GIF della categoria, il mazzo si rimescola automaticamente.
 */
export function getNextGifForCategory(category) {
  const targetCategory = (category === 'key' || category === 'success' || category === 'cheat')
    ? category
    : 'all';

  let pool = [];
  if (targetCategory === 'all') {
    pool = [
      ...CORALINE_GIF_REGISTRY.key,
      ...CORALINE_GIF_REGISTRY.success,
      ...CORALINE_GIF_REGISTRY.cheat,
      ...CORALINE_GIF_REGISTRY.extra
    ];
  } else {
    pool = CORALINE_GIF_REGISTRY[targetCategory] || CORALINE_GIF_REGISTRY.extra;
  }

  const storageKey = `coraline_deck_${targetCategory}`;
  let remainingIds = [];

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        remainingIds = parsed;
      }
    }
  } catch (e) {
    console.error('Errore lettura deck da localStorage', e);
  }

  // Se il mazzo è vuoto o non inizializzato, ricarica tutte le GIF e mescola
  if (!remainingIds || !Array.isArray(remainingIds) || remainingIds.length === 0) {
    remainingIds = shuffleArray(pool.map((item) => item.id));
  }

  // Estrae la prima GIF dal mazzo (con fallback di sicurezza)
  const chosenId = remainingIds.shift() || (pool[0] && pool[0].id) || 'GGvY01t71eu0I5Ywq6';

  // Salva il rimanente aggiornato
  try {
    localStorage.setItem(storageKey, JSON.stringify(remainingIds));
    localStorage.setItem('coraline_last_active_category', targetCategory);
    localStorage.setItem('coraline_last_gif_id', chosenId);
  } catch (e) {
    console.error('Errore salvataggio deck in localStorage', e);
  }

  return {
    id: chosenId,
    url: getGiphyUrl(chosenId),
    category: targetCategory
  };
}

// GIF ufficiale di apertura neutra con Coraline (sopracciglio alzato / pigiama blu)
export const CORALINE_DEFAULT_STARTUP_GIF = {
  id: 'GGvY01t71eu0I5Ywq6',
  url: fallbackBanner, // Asset locale istantaneo e fluido a zero attesa
  title: 'Coraline Neutra',
  category: 'neutral'
};

/**
 * All'avvio / riapertura dell'app in stato neutro:
 * Mostra ESCLUSIVAMENTE la GIF ufficiale di Coraline.
 */
export function getNeutralStartupGif() {
  return CORALINE_DEFAULT_STARTUP_GIF;
}

export function getRandomStartupGif() {
  return CORALINE_DEFAULT_STARTUP_GIF;
}

/**
 * Precarica una GIF nel browser per una transizione immediata senza sfarfallio
 */
export function preloadGif(url) {
  if (!url) return;
  const img = new Image();
  img.src = url;
}

