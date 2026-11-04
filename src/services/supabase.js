import { createClient } from '@supabase/supabase-js';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { triggerQueueFlush } from '../utils/syncQueue.js';

// Fallback pubblico client-side (protetto da policy RLS su Supabase) per garantire
// il funzionamento del Cloud Sync anche negli APK compilati da GitHub Actions (dove .env non è tracciato)
const DEFAULT_SUPABASE_URL = 'https://pcsdihhbctvdtrolojmd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjc2RpaGhiY3R2ZHRyb2xvam1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTY3MjUsImV4cCI6MjEwOTE5MjcyNX0.3MFtRWCScum4i94eFWipIR9F3okTPHV7l_NW4kaXixo';

// Chiavi da variabili d'ambiente Vite, configurazione dinamica in localStorage o fallback predefinito
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
    localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || '';
  } catch (e) {}

  const url = (envUrl && envUrl.trim()) || localUrl.trim() || DEFAULT_SUPABASE_URL;
  const anonKey = (envKey && envKey.trim()) || localKey.trim() || DEFAULT_SUPABASE_ANON_KEY;

  return { url, anonKey };
};

let supabaseInstance = null;
let currentConfigKey = '';

/**
 * Ottiene o inizializza l'istanza del client Supabase
 */
export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  const keySignature = `${url}_${anonKey}`;
  if (supabaseInstance && currentConfigKey === keySignature) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    currentConfigKey = keySignature;
    return supabaseInstance;
  } catch (err) {
    console.error('Errore inizializzazione Supabase:', err);
    return null;
  }
}

/**
 * Verifica se Supabase è configurato con URL e Chiave Anonima
 */
export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

/**
 * Salva le credenziali Supabase inserite manualmente dall'utente
 */
export function saveCustomSupabaseConfig(url, anonKey) {
  try {
    if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEYS.SUPABASE_ANON_KEY);

    // Reset istanza per applicare i nuovi dati
    supabaseInstance = null;
    currentConfigKey = '';
    return true;
  } catch (e) {
    console.error('Errore salvataggio credenziali Supabase:', e);
    return false;
  }
}

/**
 * Registrazione nuovo utente con Email e Password
 */
export async function supabaseSignUp(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Configura prima URL e Anon Key di Supabase.');

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Accesso con Email e Password
 */
export async function supabaseSignIn(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Configura prima URL e Anon Key di Supabase.');

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Disconnessione
 */
export async function supabaseSignOut() {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) console.error('Errore durante disconnessione Supabase:', error);
}

/**
 * Ottiene l'utente correntemente autenticato
 */
export async function getSupabaseUser() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (e) {
    return null;
  }
}

/**
 * Salva il backup completo nel Cloud Supabase
 * @param {object} backupPayload - Dati completi dell'app (dieta, workout, impostazioni)
 */
export async function uploadBackupToSupabase(backupPayload) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configurato.');

  const user = await getSupabaseUser();
  if (!user) throw new Error('Nessun utente autenticato. Effettua prima l\'accesso.');

  const payload = {
    user_id: user.id,
    backup_data: backupPayload,
    updated_at: new Date().toISOString()
  };

  const { error } = await client
    .from('user_backups')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('Errore upload backup Supabase:', error);
    throw error;
  }

  // Memorizza timestamp ultimo backup cloud in locale
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME, payload.updated_at);
  } catch (e) {}

  return payload.updated_at;
}

/**
 * Scarica l'ultimo backup dal Cloud Supabase
 */
export async function downloadBackupFromSupabase() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configurato.');

  const user = await getSupabaseUser();
  if (!user) throw new Error('Nessun utente autenticato. Effettua prima l\'accesso.');

  const { data, error } = await client
    .from('user_backups')
    .select('backup_data, updated_at')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Nessun backup trovato nel cloud per questo account.');
    }
    throw error;
  }

  if (!data || !data.backup_data) {
    throw new Error('I dati del backup cloud sono vuoti o non validi.');
  }

  try {
    localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME, data.updated_at);
  } catch (e) {}

  return {
    data: data.backup_data,
    updatedAt: data.updated_at
  };
}

/**
 * Sincronizzazione automatica unificata con la Coda Offline Persistente
 */
export function triggerDebouncedCloudSync(getBackupFn, delayMs = 1500) {
  try {
    const isAutoSyncEnabled = localStorage.getItem(STORAGE_KEYS.CLOUD_AUTOSYNC) !== 'false';
    if (!isAutoSyncEnabled || !isSupabaseConfigured()) return;
    triggerQueueFlush(delayMs);
  } catch (e) {}
}

