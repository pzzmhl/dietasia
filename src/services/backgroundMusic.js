/**
 * Servizio Audio di Sottofondo Stile Coraline:
 * Gestisce la riproduzione in loop continuo della colonna sonora "Exploration" (Bruno Coulais),
 * con dissolvenza in entrata (fade-in) e in uscita (fade-out), gestione soft del volume d'atmosfera,
 * rispetto delle policy autoplay mobile e persistenza tra tutte le sessioni.
 */

import { STORAGE_KEYS } from '../constants/storageKeys.js';

const STORAGE_KEY = STORAGE_KEYS.BG_MUSIC_ENABLED;
const AUDIO_SRC = '/audio/coraline-exploration.m4a';
const TARGET_VOLUME = 0.066; // Volume abbassato del 70% per un sottofondo sussurrato e discreto
const FADE_STEP_MS = 50;
const FADE_DURATION_MS = 2400;

let audioElement = null;
let fadeInterval = null;
let hasUserInteracted = false;
let listeners = new Set();

/**
 * Verifica se la musica è abilitata dall'utente
 * Di default è attiva (true) a meno che non sia stata esplicitamente disattivata
 */
export function isMusicEnabled() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val !== 'false';
  } catch (e) {
    return true;
  }
}

function notifyListeners() {
  const enabled = isMusicEnabled();
  listeners.forEach((cb) => {
    try {
      cb(enabled);
    } catch (e) {
      console.error('Errore listener musica:', e);
    }
  });
}

/**
 * Iscrive un componente ai cambi di stato della musica
 */
export function subscribeMusicState(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Inizializza l'elemento audio (singola istanza riutilizzabile)
 */
function getOrCreateAudio() {
  if (!audioElement && typeof window !== 'undefined') {
    audioElement = new Audio(AUDIO_SRC);
    audioElement.loop = true;
    audioElement.volume = 0;
    audioElement.preload = 'auto';

    // Gestione cambio visibilità scheda/app: pausa in background e ripresa in primo piano
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (audioElement && !audioElement.paused) {
          audioElement.pause();
        }
      } else {
        if (isMusicEnabled() && audioElement && audioElement.paused && hasUserInteracted) {
          playMusicWithFadeIn();
        }
      }
    });
  }
  return audioElement;
}

/**
 * Sfuma il volume gradualmente verso il target desiderato
 */
function fadeVolumeTo(targetVol, durationMs, onComplete) {
  const audio = getOrCreateAudio();
  if (!audio) return;

  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  const startVol = audio.volume;
  const delta = targetVol - startVol;
  if (Math.abs(delta) < 0.01) {
    audio.volume = targetVol;
    if (onComplete) onComplete();
    return;
  }

  const steps = Math.max(1, Math.floor(durationMs / FADE_STEP_MS));
  const stepIncrement = delta / steps;
  let currentStep = 0;

  fadeInterval = setInterval(() => {
    currentStep++;
    let nextVol = startVol + (stepIncrement * currentStep);

    if (nextVol > 1) nextVol = 1;
    if (nextVol < 0) nextVol = 0;

    audio.volume = nextVol;

    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      fadeInterval = null;
      audio.volume = targetVol;
      if (onComplete) onComplete();
    }
  }, FADE_STEP_MS);
}

/**
 * Avvia la riproduzione con dissolvenza in entrata (fade-in)
 */
export function playMusicWithFadeIn() {
  const audio = getOrCreateAudio();
  if (!audio) return;

  if (audio.paused) {
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasUserInteracted = true;
          fadeVolumeTo(TARGET_VOLUME, FADE_DURATION_MS);
        })
        .catch((err) => {
          // Autoplay bloccato dal browser: aspetta la prima interazione
          setupAutoplayUnlock();
        });
    }
  } else {
    // Già in riproduzione: assicurati che il volume sia sfumato al livello target
    fadeVolumeTo(TARGET_VOLUME, FADE_DURATION_MS);
  }
}

/**
 * Ferma la riproduzione con dissolvenza in uscita (fade-out)
 */
export function stopMusicWithFadeOut() {
  const audio = getOrCreateAudio();
  if (!audio || audio.paused) return;

  fadeVolumeTo(0, 1800, () => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
  });
}

/**
 * Mette in pausa immediata la musica quando l'app va in background su Android (risparmio CPU/batteria)
 */
export function pauseMusicImmediately() {
  const audio = getOrCreateAudio();
  if (audio && !audio.paused) {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
    audio.pause();
  }
}

/**
 * Sblocca l'audio al primo tocco o click dello schermo (risolve la restrizione Autoplay di Chrome/Android)
 */
function setupAutoplayUnlock() {
  if (hasUserInteracted) return;

  const unlockHandler = () => {
    hasUserInteracted = true;
    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((evt) => {
      window.removeEventListener(evt, unlockHandler, { capture: true });
    });

    if (isMusicEnabled()) {
      playMusicWithFadeIn();
    }
  };

  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, unlockHandler, { capture: true, once: true });
  });
}

/**
 * Inizializza il sistema di musica di sottofondo all'avvio dell'applicazione
 */
export function initBackgroundMusic() {
  if (typeof window === 'undefined') return;

  const audio = getOrCreateAudio();
  if (!audio) return;

  if (isMusicEnabled()) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasUserInteracted = true;
          fadeVolumeTo(TARGET_VOLUME, FADE_DURATION_MS);
        })
        .catch(() => {
          // Autoplay richiede interazione
          setupAutoplayUnlock();
        });
    } else {
      setupAutoplayUnlock();
    }
  }
}

/**
 * Imposta e memorizza lo stato della musica (attiva/disattiva con dissolvenza)
 * Salva la scelta in localStorage per renderla persistente tra tutte le sessioni.
 */
export function setMusicEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Errore salvataggio impostazione musica:', e);
  }

  if (enabled) {
    playMusicWithFadeIn();
  } else {
    stopMusicWithFadeOut();
  }

  notifyListeners();
}

