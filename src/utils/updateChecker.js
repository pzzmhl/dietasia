/**
 * Servizio Ibrido di Aggiornamento Applicazione (Zero-Click OTA Live Update + Fallback APK)
 *
 * - Modalità Primaria (Zero-Click OTA su Android nativo):
 *   Scarica silenziosamente in background il pacchetto `coraline-ota-bundle.zip` da GitHub Releases
 *   tramite `@capgo/capacitor-updater` e lo imposta per il caricamento automatico (senza alcun
 *   pop-up, senza permessi di installazione APK e senza che Asia debba cliccare nulla).
 * - Anti-Brick Rollback Nativo:
 *   `notifyOtaAppReady()` conferma all'avvio che il bundle corrente è sano; in caso di errore
 *   critico entro 10s, il plugin nativo ripristina da solo la versione precedente funzionante.
 * - Modalità Fallback (APK):
 *   Se una release non contiene il bundle OTA o per chi aggiorna manualmente l'APK.
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { STORAGE_KEYS } from '../constants/storageKeys.js';

export const CURRENT_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.8.4';
export const GITHUB_OWNER = 'pzzmhl';
export const GITHUB_REPO = 'dietasia';
export const CHECK_INTERVAL_MS = 30 * 60 * 1000; // Controllo silenzioso ogni 30 minuti
export const OTA_BUNDLE_FILENAME = 'coraline-ota-bundle.zip';
export const FALLBACK_APK_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/Coraline-Tracker-Beta.apk`;

let isOtaDownloadInProgress = false;

/**
 * Notifica al motore nativo CapacitorUpdater che il bundle web si è avviato correttamente.
 * Deve essere invocato all'avvio di App.jsx per confermare la stabilità dell'aggiornamento OTA.
 */
export async function notifyOtaAppReady() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch (e) {
    // Fallback silenzioso su web o se non inizializzato
  }
}

/**
 * Confronto semantico delle versioni (SemVer).
 * Gestisce prefissi 'v' (es. v2.8.2 vs 2.8.1) e lunghezze arbitrarie di release.
 */
export function isNewerVersion(currentVersion, latestTag) {
  if (!latestTag || typeof latestTag !== 'string') return false;

  const cleanCurrent = String(currentVersion || '0.0.0').replace(/^v/, '').trim();
  const cleanLatest = String(latestTag).replace(/^v/, '').trim();

  const currentParts = cleanCurrent.split('.').map((p) => parseInt(p, 10) || 0);
  const latestParts = cleanLatest.split('.').map((p) => parseInt(p, 10) || 0);

  const maxLen = Math.max(currentParts.length, latestParts.length);
  for (let i = 0; i < maxLen; i++) {
    const cur = currentParts[i] || 0;
    const lat = latestParts[i] || 0;
    if (lat > cur) return true;
    if (lat < cur) return false;
  }

  return false;
}

/**
 * Scarica e prepara silenziosamente in background il bundle OTA senza chiedere alcun click all'utente.
 * - Se `applyImmediately === false` (controllo automatico in background), il nuovo bundle viene
 *   attivato da `CapacitorUpdater.next(...)` al successivo avvio o passaggio in background,
 *   così lo schermo non ricarica mai mentre Asia sta toccando l'app.
 * - Se `applyImmediately === true` (tasto manuale nelle Impostazioni), applica subito con `set(...)`.
 */
async function performSilentOtaUpdate(otaUrl, latestTag, applyImmediately = false) {
  if (!Capacitor.isNativePlatform() || !otaUrl || isOtaDownloadInProgress) {
    return false;
  }

  const cleanVersion = String(latestTag).replace(/^v/, '').trim();
  isOtaDownloadInProgress = true;

  try {
    // 1. Verifica se questo bundle è già stato scaricato in precedenza sul dispositivo
    const existingList = await CapacitorUpdater.list();
    const existingBundle = existingList && Array.isArray(existingList.bundles)
      ? existingList.bundles.find((b) => b && b.version === cleanVersion && b.status !== 'error')
      : null;

    if (existingBundle && existingBundle.id) {
      if (applyImmediately) {
        await CapacitorUpdater.set({ id: existingBundle.id });
      } else {
        await CapacitorUpdater.next({ id: existingBundle.id });
      }
      isOtaDownloadInProgress = false;
      return true;
    }

    // 2. Scarica il pacchetto zip OTA da GitHub Releases in background
    const downloadedBundle = await CapacitorUpdater.download({
      url: otaUrl,
      version: cleanVersion
    });

    if (downloadedBundle && downloadedBundle.id) {
      if (applyImmediately) {
        await CapacitorUpdater.set({ id: downloadedBundle.id });
      } else {
        await CapacitorUpdater.next({ id: downloadedBundle.id });
      }
      isOtaDownloadInProgress = false;
      return true;
    }
  } catch (err) {
    // Se il download OTA fallisce, lascia gestire il fallback senza bloccare l'app
  }

  isOtaDownloadInProgress = false;
  return false;
}

/**
 * Interroga l'API GitHub Releases per verificare se è disponibile una nuova versione.
 * Su Android nativo, se la release contiene `coraline-ota-bundle.zip`, scarica e applica
 * l'aggiornamento in modo 100% silenzioso senza mostrare pop-up a Asia.
 */
export async function checkForAppUpdates({ force = false } = {}) {
  // 1. Controllo connettività offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, reason: 'offline' };
  }

  // 2. Throttling temporale (30 min) per non stressare il rate-limit GitHub
  if (!force) {
    try {
      const lastCheck = Number(localStorage.getItem(STORAGE_KEYS.LAST_UPDATE_CHECK) || 0);
      if (lastCheck && (Date.now() - lastCheck < CHECK_INTERVAL_MS)) {
        return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, reason: 'throttled' };
      }
    } catch (e) {}
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, reason: `HTTP ${response.status}` };
    }

    const release = await response.json();
    const latestTag = (release.tag_name || '').trim();

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE_CHECK, String(Date.now()));
    } catch (e) {}

    const isNewer = isNewerVersion(CURRENT_APP_VERSION, latestTag);

    if (isNewer) {
      const assets = Array.isArray(release.assets) ? release.assets : [];

      // Cerca il pacchetto OTA (.zip) per l'aggiornamento silenzioso Zero-Click
      const otaAsset = assets.find(
        (a) => a && a.name && (a.name === OTA_BUNDLE_FILENAME || a.name.toLowerCase().endsWith('.zip'))
      );

      // Se siamo su Android nativo e la release ha il bundle OTA, aggiorna in silenzio senza alcun click!
      if (Capacitor.isNativePlatform() && otaAsset && otaAsset.browser_download_url) {
        const otaSuccess = await performSilentOtaUpdate(
          otaAsset.browser_download_url,
          latestTag,
          force
        );

        if (otaSuccess) {
          return {
            updateAvailable: false,
            otaAppliedSilently: true,
            currentVersion: CURRENT_APP_VERSION,
            latestVersion: latestTag
          };
        }
      }

      // Fallback APK: solo se non è presente il bundle OTA o se siamo fuori dal runtime nativo
      if (!force) {
        try {
          const ignored = localStorage.getItem(STORAGE_KEYS.IGNORED_UPDATE_VERSION);
          if (ignored === latestTag) {
            return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, latestVersion: latestTag, reason: 'ignored' };
          }
        } catch (e) {}
      }

      const apkAsset = assets.find((a) => a && a.name && a.name.toLowerCase().endsWith('.apk'));
      const apkUrl = apkAsset ? apkAsset.browser_download_url : FALLBACK_APK_URL;

      return {
        updateAvailable: true,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: latestTag,
        releaseNotes: release.body || '',
        apkUrl,
        releaseUrl: release.html_url || FALLBACK_APK_URL
      };
    }

    return {
      updateAvailable: false,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: latestTag
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, reason: err.message || 'network_error' };
  }
}

/**
 * Memorizza la versione ignorata per evitare pop-up fastidiosi durante la giornata
 */
export function ignoreUpdateVersion(versionTag) {
  try {
    if (versionTag) {
      localStorage.setItem(STORAGE_KEYS.IGNORED_UPDATE_VERSION, versionTag);
    }
  } catch (e) {}
}

/**
 * Avvia il download nativo dell'APK tramite l'intento di sistema Android (_system)
 */
export function downloadAndInstallUpdate(apkUrl) {
  const targetUrl = apkUrl || FALLBACK_APK_URL;
  if (typeof window !== 'undefined') {
    window.open(targetUrl, '_system');
  }
}
