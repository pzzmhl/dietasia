/**
 * Riproduttore Audio del Verso del Gatto Nero di Coraline
 * - Riproduce l'autentico miagolio ufficiale (/audio/cat/cat-meow.mp3)
 * - Audio precaricato in memoria per garantire risposta immediata al tocco
 */

const CAT_AUDIO_SRC = '/audio/cat/cat-meow.mp3';

let catAudioInstance = null;

function getCatAudio() {
  if (typeof window === 'undefined') return null;
  if (!catAudioInstance) {
    try {
      catAudioInstance = new Audio(CAT_AUDIO_SRC);
      catAudioInstance.preload = 'none';
      catAudioInstance.volume = 0.90;
    } catch (e) {
      console.warn('[CatAudio] Errore inizializzazione audio gatto:', e);
    }
  }
  return catAudioInstance;
}

/**
 * Riproduce il verso ufficiale del Gatto Nero
 */
function playCatMeow(volume = 0.90) {
  if (typeof window === 'undefined') return;
  const audio = getCatAudio();
  if (!audio) return;

  try {
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.debug('[CatAudio] Riproduzione audio ritardata o limitata:', err);
      });
    }
  } catch (err) {
    console.debug('[CatAudio] Errore esecuzione verso gatto:', err);
  }
}

// Alias per retro-compatibilità con le chiamate esistenti
export const playRandomCatSound = playCatMeow;
