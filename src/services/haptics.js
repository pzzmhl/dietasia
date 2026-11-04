import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { STORAGE_KEYS } from '../constants/storageKeys.js';

/**
 * Servizio Haptic Engine Nativo per Android & Web
 * Offre micro-vibrazioni tattili differenziate a bassissimo consumo energetico.
 */

export const isHapticsEnabled = () => {
  return true;
};

export const setHapticsEnabled = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, 'true');
  } catch (e) {}
};

export const triggerHapticFeedback = async (type = 'selection') => {
  if (!isHapticsEnabled()) return;
  try {
    if (Capacitor.isNativePlatform()) {
      switch (type) {
        case 'success': // Pietra verde (Dieta rispettata)
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'key': // Chiave Jolly (Sgarro salvato)
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'cheat': // Bottone nero (Sgarro non rispettato)
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'swipe': // Cambio mese
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'selection': // Tocco ordinario
        default:
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          break;
      }
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // Fallback per test in browser/dev
      switch (type) {
        case 'success':
          navigator.vibrate(25);
          break;
        case 'key':
          navigator.vibrate([20, 40, 30]);
          break;
        case 'cheat':
          navigator.vibrate(60);
          break;
        case 'swipe':
          navigator.vibrate(15);
          break;
        case 'selection':
        default:
          navigator.vibrate(10);
          break;
      }
    }
  } catch (e) {
    // Silenzioso su dispositivi senza hardware aptico
  }
};

