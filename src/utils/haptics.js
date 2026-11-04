import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { STORAGE_KEYS } from '../constants/storageKeys.js';

/**
 * Servizio Haptic Engine Nativo per Android & Web
 * Offre micro-vibrazioni tattili differenziate a bassissimo consumo energetico.
 */

export const isHapticsEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED) !== 'false';
  } catch (e) {
    return true;
  }
};

export const setHapticsEnabled = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, enabled ? 'true' : 'false');
  } catch (e) {}
};

/**
 * Vibrazione per la cucitura di un bottone nero dei pasti o la spunta di un progresso.
 * Feedback deciso (Medium Impact) con stile stop-motion di Coraline.
 */
export const hapticButtonStitch = async () => {
  if (!isHapticsEnabled()) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(35);
    }
  } catch (e) {}
};

/**
 * Vibrazione di successo per il completamento dell'intera giornata,
 * l'allenamento di Bobinsky o lo sblocco di chiavi e segreti.
 */
export const hapticSuccess = async () => {
  if (!isHapticsEnabled()) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([25, 40, 25]);
    }
  } catch (e) {}
};

/**
 * Micro-vibrazione leggera (Light Impact) per interazioni discrete:
 * tap su tab, cambio mese nel calendario, tocco del Gatto o del Topo Saltatore.
 */
export const hapticLight = async () => {
  if (!isHapticsEnabled()) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  } catch (e) {}
};

/**
 * Vibrazione di allerta/avviso (Warning Notification) per cheat-day,
 * esaurimento chiavi o azioni distruttive di reset/azzeramento.
 */
export const hapticWarning = async () => {
  if (!isHapticsEnabled()) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40]);
    }
  } catch (e) {}
};

/**
 * Funzione polimorfa per retrocompatibilità con tutte le chiamate esistenti nel progetto.
 */
export const triggerHapticFeedback = async (type = 'selection') => {
  switch (type) {
    case 'stitch':
    case 'cheat':
      await hapticButtonStitch();
      break;
    case 'success':
    case 'key':
      await hapticSuccess();
      break;
    case 'warning':
    case 'reset':
      await hapticWarning();
      break;
    case 'swipe':
    case 'light':
    case 'selection':
    default:
      await hapticLight();
      break;
  }
};

