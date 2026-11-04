/**
 * Offline Sync Queue Engine per Supabase (Local-First / Offline-First)
 * 
 * Garantisce che nessuna modifica effettuata offline vada mai persa.
 * - Deduplicazione & Coalescing per chiave (tipo, data)
 * - Persistenza atomica su localStorage + cache in RAM
 * - Flush automatico su trigger: azione utente, 'online' event, 'appStateChange' (Capacitor)
 * - Lock di concorrenza anti-race-condition
 * - Idempotenza su Supabase (upsert su user_id)
 */

import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { 
  getSupabaseUser, 
  uploadBackupToSupabase, 
  isSupabaseConfigured 
} from '../services/supabase.js';
import { exportFullCloudBackupPayload } from './storage.js';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

let memoryQueue = null;
let isFlushing = false;
let flushTimeout = null;
let currentSyncStatus = 'synced'; // 'synced' | 'pending' | 'syncing' | 'offline' | 'error'
const listeners = new Set();

/**
 * Notifica tutti i listener registrati del cambio di stato di sincronizzazione
 */
function notifyStatusChange(status) {
  currentSyncStatus = status;
  listeners.forEach((fn) => {
    try {
      fn(status);
    } catch (e) {}
  });
}

/**
 * Ottiene la coda persistente delle modifiche pendenti
 * @returns {Array<{ id: string, type: string, key: string, payload: any, updatedAt: string }>}
 */
export function getPendingQueue() {
  if (memoryQueue !== null) return memoryQueue;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryQueue = parsed;
        return memoryQueue;
      }
    }
  } catch (e) {
    console.error('Errore lettura coda di sync da storage:', e);
  }

  memoryQueue = [];
  return memoryQueue;
}

/**
 * Salva la coda sia in memoria RAM sia su localStorage in modo atomico
 */
function persistQueue(queue) {
  memoryQueue = queue;
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Errore persistenza coda di sync:', e);
  }
}

/**
 * Aggiunge o aggiorna un'operazione nella coda con Deduplicazione/Coalescing.
 * Se esiste già un'operazione per la stessa coppia (type, key), viene sovrascritta
 * con lo stato più recente mantenendo la coda snella e priva di ridondanze.
 * 
 * @param {{ type: string, key: string, payload: any }} item
 */
export function enqueueSyncOperation({ type, key, payload }) {
  const queue = [...getPendingQueue()];
  const now = new Date().toISOString();
  const existingIndex = queue.findIndex((q) => q.type === type && q.key === key);

  const operation = {
    id: `${type}_${key}_${Date.now()}`,
    type,
    key,
    payload,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    // Coalescing: rimpiazza l'elemento esistente con lo stato più recente
    queue[existingIndex] = operation;
  } else {
    queue.push(operation);
  }

  persistQueue(queue);

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    notifyStatusChange('offline');
  } else {
    notifyStatusChange('pending');
    triggerQueueFlush(1200);
  }
}

/**
 * Rimuove dalla coda gli elementi sincronizzati con successo tramite il loro ID univoco
 */
function removeSyncedItems(syncedIds) {
  const current = getPendingQueue();
  const idSet = new Set(syncedIds);
  const remaining = current.filter((item) => !idSet.has(item.id));
  persistQueue(remaining);

  if (remaining.length === 0) {
    notifyStatusChange('synced');
  } else {
    notifyStatusChange('pending');
  }
}

/**
 * Restituisce il numero di operazioni ancora pendenti in coda
 */
export function getPendingSyncCount() {
  return getPendingQueue().length;
}

/**
 * Restituisce lo stato attuale della sincronizzazione
 */
export function getSyncStatus() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'offline';
  }
  return currentSyncStatus;
}

/**
 * Sottoscrive un componente React o servizio ai cambi di stato della sync
 */
export function subscribeSyncStatus(callback) {
  listeners.add(callback);
  callback(getSyncStatus());
  return () => listeners.delete(callback);
}

/**
 * Esegue il flush della coda verso Supabase con protezione da race condition
 */
export async function flushSyncQueue() {
  if (isFlushing) return;

  // 1. Controllo connettività
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    notifyStatusChange('offline');
    return;
  }

  // 2. Controllo configurazione Supabase
  if (!isSupabaseConfigured()) {
    return;
  }

  // 3. Controllo autenticazione utente
  let user = null;
  try {
    user = await getSupabaseUser();
  } catch (e) {
    return;
  }
  if (!user) return;

  const queue = getPendingQueue();
  if (queue.length === 0) {
    notifyStatusChange('synced');
    return;
  }

  // Snapshot atomico degli ID in elaborazione per non perdere
  // eventuali nuove modifiche arrivate mentre il flush è in corso
  const processingIds = queue.map((item) => item.id);

  try {
    isFlushing = true;
    notifyStatusChange('syncing');

    // Genera il payload consolidato aggiornato
    const fullPayload = exportFullCloudBackupPayload();
    if (!fullPayload) {
      throw new Error('Payload di backup vuoto.');
    }

    // Invia a Supabase (operazione idempotente con upsert su user_id)
    await uploadBackupToSupabase(fullPayload);

    // Rimozione atomica degli elementi inviati
    removeSyncedItems(processingIds);
    notifyStatusChange('synced');
  } catch (err) {
    console.warn('[SyncQueue] Invio a Supabase non riuscito (retry al prossimo ciclo):', err);
    // Gli elementi restano al sicuro nella coda locale
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      notifyStatusChange('offline');
    } else {
      notifyStatusChange('error');
    }
  } finally {
    isFlushing = false;
  }
}

/**
 * Trigger debounced non bloccante per il flush della coda
 */
export function triggerQueueFlush(delayMs = 1500) {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(() => {
    flushSyncQueue();
  }, delayMs);
}

/**
 * Inizializza i listener automatici per il recupero della connessione
 * e il ritorno in primo piano dell'app
 */
export function initSyncQueueListeners() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      notifyStatusChange('pending');
      triggerQueueFlush(500);
    });

    window.addEventListener('offline', () => {
      notifyStatusChange('offline');
    });
  }

  if (Capacitor.isNativePlatform()) {
    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          triggerQueueFlush(800);
        }
      });
    } catch (e) {}
  }
}

