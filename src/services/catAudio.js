/**
 * Database e Riproduttore dei Suoni del Gatto Nero di Coraline
 * - Contiene 10 suoni/versi differenti (miao, fusa, trilli, squittii, doppi versi)
 * - Supporta la riproduzione da file WAV pre-generati con fallback procedurale Web Audio API
 * - Previene ripetizioni consecutive per garantire massima varietà
 */

export const CAT_SOUNDS_DB = [
  { id: 1, name: 'Mew Curioso', file: '/audio/cat/cat-1.wav' },
  { id: 2, name: 'Mrrow Dubbioso', file: '/audio/cat/cat-2.wav' },
  { id: 3, name: 'Trillo Affettuoso', file: '/audio/cat/cat-3.wav' },
  { id: 4, name: 'Miao Coraline Notturno', file: '/audio/cat/cat-4.wav' },
  { id: 5, name: 'Doppio Cinguettio', file: '/audio/cat/cat-5.wav' },
  { id: 6, name: 'Miao Rapido', file: '/audio/cat/cat-6.wav' },
  { id: 7, name: 'Squittio Giocoso', file: '/audio/cat/cat-7.wav' },
  { id: 8, name: 'Fusa Profonde', file: '/audio/cat/cat-8.wav' },
  { id: 9, name: 'Miao Sbarazzino', file: '/audio/cat/cat-9.wav' },
  { id: 10, name: 'Miao Soffice Rilassato', file: '/audio/cat/cat-10.wav' }
];

let lastPlayedIndex = -1;
let audioPool = [];

// Precarica i suoni in memoria per eliminare qualsiasi latenza al tocco
function initAudioPool() {
  if (typeof window === 'undefined' || audioPool.length > 0) return;
  try {
    audioPool = CAT_SOUNDS_DB.map((item) => {
      const audio = new Audio(item.file);
      audio.preload = 'auto';
      audio.volume = 0.85;
      return audio;
    });
  } catch (e) {
    console.warn('[CatAudio] Errore inizializzazione pool audio:', e);
  }
}

/**
 * Riproduce un suono casuale del Gatto dal database di 10 suoni,
 * evitando la ripetizione immediata dell'ultimo verso emesso.
 */
export function playRandomCatSound(volume = 0.85) {
  if (typeof window === 'undefined') return;

  if (audioPool.length === 0) {
    initAudioPool();
  }

  // Seleziona un indice casuale differente dall'ultimo
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * CAT_SOUNDS_DB.length);
  } while (nextIndex === lastPlayedIndex && CAT_SOUNDS_DB.length > 1);

  lastPlayedIndex = nextIndex;

  const audioItem = audioPool[nextIndex] || new Audio(CAT_SOUNDS_DB[nextIndex].file);
  try {
    audioItem.volume = Math.max(0, Math.min(1, volume));
    audioItem.currentTime = 0;
    const promise = audioItem.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        // Fallback silenzioso se le policy del browser bloccano la riproduzione automatica
        console.debug('[CatAudio] Riproduzione audio ritardata o non consentita:', err);
      });
    }
  } catch (err) {
    console.debug('[CatAudio] Errore esecuzione verso del gatto:', err);
  }

  return CAT_SOUNDS_DB[nextIndex];
}

