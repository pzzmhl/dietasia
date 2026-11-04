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
let needsReflush = false;
let flushTimeout = null;
let currentSyncStatus = 'synced'; // 'synced' | 'pending' | 'syncing' | 'offline' | 'error'
const listeners = new Set();

/**
 * Notifica tutti i listener registrati del cambio di stato di sincronizzazione
 */
function notifyStatusChange(status) {
  if (currentSyncStatus === status) return;
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
function getPendingQueue() {
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
  // Se Supabase non è configurato affatto, il salvataggio è puramente locale (istantaneo)
  if (!isSupabaseConfigured()) {
    notifyStatusChange('synced');
    return;
  }

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

  if (isFlushing) {
    needsReflush = true;
    return;
  }

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
  return remaining.length;
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
  if (typeof navigator !== 'undefined' && !navigator.onLine && isSupabaseConfigured() && getPendingQueue().length > 0) {
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
 * Esegue il flush della coda verso Supabase con protezione atomica da race condition
 * e ri-accodamento automatico nel blocco finally.
 */
export async function flushSyncQueue() {
  if (isFlushing) {
    needsReflush = true;
    return;
  }

  const initialQueue = getPendingQueue();

  // 1. Se Supabase non è configurato, siamo in modalità locale pura: stato 'synced'
  if (!isSupabaseConfigured()) {
    if (initialQueue.length > 0) {
      persistQueue([]);
    }
    notifyStatusChange('synced');
    return;
  }

  // 2. Se la coda è già vuota, siamo allineati
  if (initialQueue.length === 0) {
    notifyStatusChange('synced');
    return;
  }

  // 3. Controllo connettività
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    notifyStatusChange('offline');
    return;
  }

  // 4. Controllo autenticazione utente: se non c'è account Cloud attivo,
  // i dati sono già salvati in sicurezza nel dispositivo locale -> stato 'synced'
  let user = null;
  try {
    user = await getSupabaseUser();
  } catch (e) {
    notifyStatusChange('synced');
    return;
  }
  if (!user) {
    notifyStatusChange('synced');
    return;
  }

  const queue = getPendingQueue();
  if (queue.length === 0) {
    notifyStatusChange('synced');
    return;
  }

  // Snapshot atomico degli ID in elaborazione per non perdere
  // eventuali nuove modifiche arrivate mentre il flush è in corso
  const processingIds = queue.map((item) => item.id);
  let flushSucceeded = false;

  try {
    isFlushing = true;
    needsReflush = false;
    notifyStatusChange('syncing');

    // Genera il payload consolidato aggiornato
    const fullPayload = exportFullCloudBackupPayload();
    if (!fullPayload) {
      throw new Error('Payload di backup vuoto.');
    }

    // Invia a Supabase (operazione idempotente con upsert su user_id)
    await uploadBackupToSupabase(fullPayload);

    // Rimozione atomica degli elementi inviati
    const remainingCount = removeSyncedItems(processingIds);
    flushSucceeded = true;

    if (remainingCount === 0 && !needsReflush) {
      notifyStatusChange('synced');
    } else {
      notifyStatusChange('pending');
    }
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
    // Se durante l'upload sono arrivate nuove modifiche dall'utente, pianifica il ciclo successivo
    if (flushSucceeded && (needsReflush || getPendingQueue().length > 0)) {
      needsReflush = false;
      notifyStatusChange('pending');
      triggerQueueFlush(600);
    }
  }
}

/**
 * Trigger debounced non bloccante per il flush della coda
 */
export function triggerQueueFlush(delayMs = 1500) {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushSyncQueue();
  }, delayMs);
}

let isSyncListenersInitialized = false;

/**
 * Inizializza i listener automatici per il recupero della connessione
 * e il ritorno in primo piano dell'app (idempotente: evita duplicazioni)
 */
export function initSyncQueueListeners() {
  if (isSyncListenersInitialized) return;
  isSyncListenersInitialized = true;

  // Allinea lo stato iniziale se erano rimasti elementi dalla sessione precedente
  if (isSupabaseConfigured() && getPendingQueue().length > 0) {
    currentSyncStatus = (typeof navigator !== 'undefined' && !navigator.onLine) ? 'offline' : 'pending';
  } else {
    currentSyncStatus = 'synced';
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      if (isSupabaseConfigured() && getPendingQueue().length > 0) {
        notifyStatusChange('pending');
        triggerQueueFlush(500);
      } else {
        notifyStatusChange('synced');
      }
    });

    window.addEventListener('offline', () => {
      if (isSupabaseConfigured() && getPendingQueue().length > 0) {
        notifyStatusChange('offline');
      }
    });
  }

  if (Capacitor.isNativePlatform()) {
    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive && isSupabaseConfigured() && getPendingQueue().length > 0) {
          triggerQueueFlush(800);
        }
      });
    } catch (e) {}
  }
}

