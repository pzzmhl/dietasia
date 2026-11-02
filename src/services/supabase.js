import { createClient } from '@supabase/supabase-js';

// Chiavi da variabili d'ambiente Vite o da configurazione dinamica in localStorage
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem('coraline_supabase_url') || '';
    localKey = localStorage.getItem('coraline_supabase_anon_key') || '';
  } catch (e) {}

  const url = (envUrl && envUrl.trim()) || localUrl.trim();
  const anonKey = (envKey && envKey.trim()) || localKey.trim();

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
    if (url) localStorage.setItem('coraline_supabase_url', url.trim());
    else localStorage.removeItem('coraline_supabase_url');

    if (anonKey) localStorage.setItem('coraline_supabase_anon_key', anonKey.trim());
    else localStorage.removeItem('coraline_supabase_anon_key');

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
    localStorage.setItem('coraline_last_cloud_backup_time', payload.updated_at);
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
    localStorage.setItem('coraline_last_cloud_backup_time', data.updated_at);
  } catch (e) {}

  return {
    data: data.backup_data,
    updatedAt: data.updated_at
  };
}

/**
 * Sincronizzazione automatica silenziosa (chiamata dopo le modifiche se attiva)
 */
let autoSyncTimeout = null;
export function triggerDebouncedCloudSync(getBackupFn, delayMs = 3000) {
  try {
    const isAutoSyncEnabled = localStorage.getItem('coraline_cloud_autosync') !== 'false';
    if (!isAutoSyncEnabled || !isSupabaseConfigured()) return;

    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);

    autoSyncTimeout = setTimeout(async () => {
      try {
        const user = await getSupabaseUser();
        if (!user) return;
        const payload = getBackupFn();
        if (payload) {
          await uploadBackupToSupabase(payload);
          console.log('[Supabase] Auto-sync completato con successo!');
        }
      } catch (err) {
        console.warn('[Supabase] Auto-sync fallito silenziosamente:', err.message);
      }
    }, delayMs);
  } catch (e) {}
}

