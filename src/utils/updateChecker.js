/**
 * Servizio di Controllo Aggiornamenti Applicazione via GitHub Releases API
 * 
 * - Zero dipendenze esterne & Zero telemetria
 * - Non-intrusivo & Offline-Safe (timeout 5s, fallimento silenzioso in background)
 * - Throttling / Cache configurabile (massimo un controllo ogni 12 ore)
 * - Supporto per ignorare temporaneamente la release ("Più tardi")
 * - Download nativo dell'APK tramite browser/installer di sistema Android
 */

import { STORAGE_KEYS } from '../constants/storageKeys.js';

export const CURRENT_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.7.0';
export const GITHUB_OWNER = 'pzzmhl';
export const GITHUB_REPO = 'dietasia';
export const CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 ore
export const FALLBACK_APK_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/Coraline-Tracker-Beta.apk`;

/**
 * Confronto semantico delle versioni (SemVer).
 * Gestisce prefissi 'v' (es. v2.8.0 vs 2.7.0) e lunghezze arbitrarie di release.
 * 
 * @param {string} currentVersion - Es. '2.7.0'
 * @param {string} latestTag - Es. 'v2.8.0'
 * @returns {boolean} True se latestTag è strettamente più recente di currentVersion
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
 * Interroga l'API GitHub Releases per verificare se è disponibile una nuova versione.
 * 
 * @param {{ force?: boolean }} options 
 *   force: true per bypassare la cache delle 12 ore (usato dal tasto manuale)
 * @returns {Promise<{
 *   updateAvailable: boolean,
 *   currentVersion: string,
 *   latestVersion?: string,
 *   releaseNotes?: string,
 *   apkUrl?: string,
 *   releaseUrl?: string,
 *   reason?: string
 * }>}
 */
export async function checkForAppUpdates({ force = false } = {}) {
  // 1. Controllo connettività offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, reason: 'offline' };
  }

  // 2. Throttling temporale per non stressare l'API rate-limit di GitHub
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

    // Aggiorna timestamp ultimo controllo riuscito
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE_CHECK, String(Date.now()));
    } catch (e) {}

    const isNewer = isNewerVersion(CURRENT_APP_VERSION, latestTag);

    if (isNewer) {
      // Se l'utente ha scelto "Più tardi" per questa esatta versione e non è un check forzato manuale
      if (!force) {
        try {
          const ignored = localStorage.getItem(STORAGE_KEYS.IGNORED_UPDATE_VERSION);
          if (ignored === latestTag) {
            return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, latestVersion: latestTag, reason: 'ignored' };
          }
        } catch (e) {}
      }

      // Estrai l'asset APK se disponibile, altrimenti fallback all'URL di download diretto
      const apkAsset = Array.isArray(release.assets) 
        ? release.assets.find((a) => a && a.name && a.name.toLowerCase().endsWith('.apk')) 
        : null;

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
    // Fallimento silenzioso di background (nessuna notifica o crash)
    return { updateAvailable: false, currentVersion: CURRENT_APP_VERSION, reason: err.message || 'network_error' };
  }
}

/**
 * Memorizza la versione ignorata per evitare pop-up fastidiosi durante la giornata
 * @param {string} versionTag 
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
 * @param {string} apkUrl 
 */
export function downloadAndInstallUpdate(apkUrl) {
  const targetUrl = apkUrl || FALLBACK_APK_URL;
  if (typeof window !== 'undefined') {
    window.open(targetUrl, '_system');
  }
}

