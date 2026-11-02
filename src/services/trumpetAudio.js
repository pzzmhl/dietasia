/**
 * Riproduttore Audio della Trombetta dei Topi Saltatori del Circo di Bobinsky
 * - Suono veloce e brillante di fanfara d'ottone (0.59s)
 * - Eseguito all'apparizione del topo a sinistra e al tocco
 */

export const TRUMPET_AUDIO_SRC = '/audio/trumpet.wav';

let trumpetAudioInstance = null;

function getTrumpetAudio() {
  if (typeof window === 'undefined') return null;
  if (!trumpetAudioInstance) {
    try {
      trumpetAudioInstance = new Audio(TRUMPET_AUDIO_SRC);
      trumpetAudioInstance.preload = 'auto';
      trumpetAudioInstance.volume = 0.85;
    } catch (e) {
      console.warn('[TrumpetAudio] Errore inizializzazione trombetta:', e);
    }
  }
  return trumpetAudioInstance;
}

/**
 * Riproduce la fanfara veloce di trombetta del topo saltatore
 */
export function playTrumpetFanfare(volume = 0.85) {
  if (typeof window === 'undefined') return;
  const audio = getTrumpetAudio();
  if (!audio) return;

  try {
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    const p = audio.play();
    if (p !== undefined) {
      p.catch((err) => {
        console.debug('[TrumpetAudio] Riproduzione limitata dalle policy del browser:', err);
      });
    }
  } catch (err) {
    console.debug('[TrumpetAudio] Errore riproduzione trombetta:', err);
  }
}

