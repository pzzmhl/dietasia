import React, { useState, useEffect, useRef } from 'react';
import profileAvatarImg from '../assets/profile-avatar.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { 
  getAllLogs, 
  exportFullCloudBackupPayload,
  restoreFullCloudBackupPayload
} from '../utils/storage';
import {
  isSupabaseConfigured,
  getSupabaseUser,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  uploadBackupToSupabase,
  downloadBackupFromSupabase,
  saveCustomSupabaseConfig
} from '../services/supabase';
import { 
  scheduleDailyReminder, 
  cancelDailyReminder, 
  sendTestReminderNotification 
} from '../services/notifications';
import { 
  triggerHapticFeedback 
} from '../services/haptics';
import { 
  isMusicEnabled, 
  setMusicEnabled, 
  subscribeMusicState 
} from '../services/backgroundMusic';

/**
 * CoralineButtonSwitch:
 * Slider toggle con cursore a forma di vero Bottone di Coraline con 4 fori da cucito,
 * animazione fluida stop-motion, luce rim e feedback aptico integrato.
 */
function CoralineButtonSwitch({ checked, onChange, ariaLabel, accentColor = '#8be574' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        triggerHapticFeedback('selection');
        onChange(!checked);
      }}
      style={{
        position: 'relative',
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: checked ? 'rgba(14, 58, 30, 0.95)' : 'rgba(8, 20, 33, 0.9)',
        border: checked ? `1.5px solid ${accentColor}` : '1.5px solid rgba(139, 229, 116, 0.22)',
        boxShadow: checked
          ? `0 0 10px rgba(139, 229, 116, 0.38), inset 0 2px 4px rgba(0, 0, 0, 0.6)`
          : 'inset 0 2px 4px rgba(0, 0, 0, 0.7)',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        touchAction: 'manipulation',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Bottoncino Coraline che scorre come cursore dello slider */}
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '21px',
          height: '21px',
          borderRadius: '50%',
          transform: checked ? 'translateX(24px)' : 'translateX(0px)',
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
          background: checked
            ? 'radial-gradient(circle at 35% 35%, #2a4734 0%, #11271a 70%, #06110a 100%)'
            : 'radial-gradient(circle at 35% 35%, #273b4e 0%, #122130 70%, #080f16 100%)',
          border: checked ? `1.5px solid ${accentColor}` : '1.5px solid rgba(221, 202, 183, 0.4)',
          boxShadow: checked
            ? '0 2px 6px rgba(0, 0, 0, 0.85), 0 0 8px rgba(139, 229, 116, 0.6)'
            : '0 2px 5px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Scanalatura interna del bottone */}
        <span
          style={{
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            border: checked ? '1px solid rgba(139, 229, 116, 0.55)' : '1px solid rgba(221, 202, 183, 0.25)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2px',
            padding: '2px',
            boxSizing: 'border-box'
          }}
        >
          {/* I 4 fori del bottone cucito */}
          <span style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: checked ? accentColor : '#050a0f', margin: 'auto' }} />
          <span style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: checked ? accentColor : '#050a0f', margin: 'auto' }} />
          <span style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: checked ? accentColor : '#050a0f', margin: 'auto' }} />
          <span style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: checked ? accentColor : '#050a0f', margin: 'auto' }} />
        </span>
      </span>
    </button>
  );
}

export default function SecretSettingsModal({ 
  isOpen, 
  onClose, 
  initialTab = 'settings',
  keysPerMonth = 4,
  onChangeKeysPerMonth = () => {},
  onRestoreSuccess = () => {},
  onOpenDailyGreeting = () => {},
  customAvatar = null,
  onAvatarChange = () => {}
}) {
  const normalizeTab = (tab) => {
    if (tab === 'preferences') return 'settings';
    if (tab === 'profile') return 'backup';
    return tab;
  };

  const targetTab = normalizeTab(initialTab);
  const [activeTab, setActiveTab] = useState(targetTab);
  const prevIsOpenRef = useRef(isOpen);
  const prevInitialTabRef = useRef(initialTab);
  const modalScrollRef = useRef(null);
  const avatarFileInputRef = useRef(null);
  const timersRef = useRef([]);

  const addTimer = (id) => {
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // Sincronizzazione sincrona durante il render per eliminare QUALSIASI ritardo o glitch di 1 frame
  if (isOpen && (!prevIsOpenRef.current || initialTab !== prevInitialTabRef.current)) {
    prevIsOpenRef.current = isOpen;
    prevInitialTabRef.current = initialTab;
    if (activeTab !== targetTab) {
      setActiveTab(targetTab);
    }
  } else if (!isOpen && prevIsOpenRef.current) {
    prevIsOpenRef.current = false;
  }

  // Animazione d'ingresso e dissolvenza controllata
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);
  
  // STATI IMPOSTAZIONI
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED) !== 'false';
    } catch (e) {
      return true;
    }
  });

  const [reminderTime, setReminderTime] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMINDER_TIME) || '20:00';
    } catch (e) {
      return '20:00';
    }
  });

  const [musicOn, setMusicOn] = useState(() => isMusicEnabled());
  const [testNotificationStatus, setTestNotificationStatus] = useState(null);

  // GESTIONE CARICAMENTO FOTO PROFILO ASIA
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCloudMessage({ type: 'error', text: '✕ Seleziona un file immagine valido (JPG, PNG o WEBP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensionamento su Canvas a 256x256 max per mantenere il backup leggero (~20KB) e compatibile con localStorage e Supabase
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Data = canvas.toDataURL('image/jpeg', 0.85);
        if (onAvatarChange) {
          onAvatarChange(base64Data);
        }
        triggerHapticFeedback('selection');
        setCloudMessage({ type: 'success', text: '✓ Foto profilo aggiornata! Sincronizzata su Cloud e Dashboard.' });
        addTimer(setTimeout(() => setCloudMessage(null), 4000));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // STATI SUPABASE CLOUD BACKUP
  const [cloudUser, setCloudUser] = useState(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudMode, setCloudMode] = useState('signin'); // 'signin' | 'signup'
  const [cloudMessage, setCloudMessage] = useState(null);
  const [lastCloudBackup, setLastCloudBackup] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME) || null;
    } catch (e) {
      return null;
    }
  });
  const [autoSyncOn, setAutoSyncOn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CLOUD_AUTOSYNC) !== 'false';
    } catch (e) {
      return true;
    }
  });
  const [showConfigInputs, setShowConfigInputs] = useState(false);
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || import.meta.env.VITE_SUPABASE_URL || '';
    } catch (e) {
      return '';
    }
  });
  const [customSupabaseKey, setCustomSupabaseKey] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    } catch (e) {
      return '';
    }
  });

  // STATI AGGIORNAMENTO APP
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    return subscribeMusicState((enabled) => {
      setMusicOn(enabled);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMusicOn(isMusicEnabled());
      setTestNotificationStatus(null);
      setCloudMessage(null);
      setUpdateStatus(null);
      setUpdateLoading(false);
      getSupabaseUser().then((u) => setCloudUser(u)).catch(() => {});
      try {
        const last = localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME);
        if (last) setLastCloudBackup(last);
      } catch (e) {}
    }
  }, [isOpen]);

  const handleSelectTab = (tab) => {
    triggerHapticFeedback('selection');
    setActiveTab(tab);
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  const currentLogs = getAllLogs();
  let successCount = 0;
  let cheatCount = 0;
  let keyCount = 0;
  Object.values(currentLogs).forEach((log) => {
    if (log && typeof log === 'object') {
      if (log.dietState === 'success') successCount++;
      else if (log.dietState === 'cheat') cheatCount++;
      else if (log.dietState === 'cheat_key') keyCount++;
    }
  });
  const totalDays = successCount + cheatCount + keyCount;

  // GESTIONE PROMEMORIA
  const handleToggleReminder = async (enabled) => {
    setReminderEnabled(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, enabled ? 'true' : 'false');
      if (enabled) {
        await scheduleDailyReminder(reminderTime, false);
      } else {
        await cancelDailyReminder();
      }
    } catch (e) {}
    triggerHapticFeedback('selection');
  };

  const handleChangeReminderTime = async (newTime) => {
    setReminderTime(newTime);
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER_TIME, newTime);
      if (reminderEnabled) {
        await scheduleDailyReminder(newTime, false);
      }
    } catch (e) {}
  };

  const handleTestNotification = async () => {
    triggerHapticFeedback('selection');
    setTestNotificationStatus('invio...');
    const ok = await sendTestReminderNotification();
    if (ok) {
      setTestNotificationStatus('✓ Notifica inviata! Controlla la tendina del telefono.');
    } else {
      setTestNotificationStatus('✕ Permesso notifiche non concesso. Abilitalo nelle impostazioni Android.');
    }
    addTimer(setTimeout(() => setTestNotificationStatus(null), 5000));
  };

  // GESTIONE CHIAVI MENSILI
  const handleUpdateKeys = (delta) => {
    const nextVal = Math.min(10, Math.max(1, keysPerMonth + delta));
    onChangeKeysPerMonth(nextVal);
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS_PER_MONTH, String(nextVal));
    } catch (e) {}
    triggerHapticFeedback('selection');
  };

  // GESTIONE MUSICA D'ATMOSFERA
  const handleToggleMusic = (enabled) => {
    setMusicOn(enabled);
    setMusicEnabled(enabled);
    triggerHapticFeedback('selection');
  };

  // ==========================================
  // GESTIONE SUPABASE CLOUD BACKUP & AUTH
  // ==========================================
  const formatCloudBackupDate = (isoStr) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  const handleCloudAuth = async (e) => {
    if (e) e.preventDefault();
    if (cloudLoading) return;
    if (!cloudEmail || !cloudPassword) {
      setCloudMessage({ type: 'error', text: 'Inserisci sia email che password.' });
      return;
    }

    if (!isSupabaseConfigured()) {
      setShowConfigInputs(true);
      setCloudMessage({ type: 'error', text: 'Configura prima le credenziali Supabase qui sotto.' });
      return;
    }

    setCloudLoading(true);
    setCloudMessage(null);
    triggerHapticFeedback('selection');

    try {
      if (cloudMode === 'signup') {
        const res = await supabaseSignUp(cloudEmail, cloudPassword);
        setCloudMessage({ 
          type: 'success', 
          text: '✓ Account creato! Se il tuo progetto richiede conferma email, controlla la posta.' 
        });
        if (res?.user) {
          setCloudUser(res.user);
          try {
            const payload = exportFullCloudBackupPayload();
            const updatedTime = await uploadBackupToSupabase(payload);
            setLastCloudBackup(updatedTime);
          } catch (e) {}
        }
      } else {
        const res = await supabaseSignIn(cloudEmail, cloudPassword);
        setCloudUser(res.user);
        // Ripristino o sincronizzazione automatica all'accesso
        try {
          const cloudData = await downloadBackupFromSupabase();
          if (cloudData && cloudData.data) {
            restoreFullCloudBackupPayload(cloudData.data);
            if (cloudData.updatedAt) setLastCloudBackup(cloudData.updatedAt);
            if (onRestoreSuccess) onRestoreSuccess();
            setCloudMessage({ type: 'success', text: `✓ Accesso effettuato! Dati sincronizzati dal Cloud.` });
          } else {
            const payload = exportFullCloudBackupPayload();
            const updatedTime = await uploadBackupToSupabase(payload);
            setLastCloudBackup(updatedTime);
            setCloudMessage({ type: 'success', text: `✓ Accesso effettuato! Primo salvataggio Cloud completato.` });
          }
        } catch (syncErr) {
          console.warn('Sync automatico iniziale:', syncErr);
          setCloudMessage({ type: 'success', text: `✓ Accesso effettuato come ${res.user.email}!` });
        }
      }
      setCloudPassword('');
    } catch (err) {
      console.error('Errore auth Supabase:', err);
      let errMsg = err.message || 'Errore durante l\'autenticazione.';
      if (errMsg.includes('Invalid login credentials')) {
        errMsg = 'Email o password non corretti.';
      } else if (errMsg.includes('User already registered')) {
        errMsg = 'Questo indirizzo email è già registrato. Prova ad accedere.';
      }
      setCloudMessage({ type: 'error', text: `✕ ${errMsg}` });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCloudBackup = async () => {
    if (!cloudUser || cloudLoading) return;
    setCloudLoading(true);
    setCloudMessage(null);
    triggerHapticFeedback('selection');

    try {
      const payload = exportFullCloudBackupPayload();
      const updatedTime = await uploadBackupToSupabase(payload);
      setLastCloudBackup(updatedTime);
      setCloudMessage({ type: 'success', text: '✓ Dati salvati nel Cloud con successo!' });
    } catch (err) {
      console.error('Errore backup cloud:', err);
      setCloudMessage({ type: 'error', text: `✕ Errore salvataggio: ${err.message}` });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!cloudUser || cloudLoading) return;
    if (!window.confirm("Vuoi ripristinare i dati dal Cloud? Questo sovrascriverà i dati locali con l'ultimo salvataggio cloud.")) {
      return;
    }

    setCloudLoading(true);
    setCloudMessage(null);
    triggerHapticFeedback('key');

    try {
      const { data, updatedAt } = await downloadBackupFromSupabase();
      restoreFullCloudBackupPayload(data);
      setLastCloudBackup(updatedAt);
      onRestoreSuccess();
      setCloudMessage({ type: 'success', text: '✓ Dati ripristinati con successo dal Cloud!' });
    } catch (err) {
      console.error('Errore ripristino cloud:', err);
      setCloudMessage({ type: 'error', text: `✕ Errore ripristino: ${err.message}` });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCloudSignOut = async () => {
    if (cloudLoading) return;
    triggerHapticFeedback('selection');
    setCloudLoading(true);
    try {
      await supabaseSignOut();
      setCloudUser(null);
      setCloudMessage({ type: 'success', text: '✓ Disconnesso dal Cloud.' });
    } catch (err) {
      setCloudMessage({ type: 'error', text: `✕ ${err.message}` });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e) => {
    if (e) e.preventDefault();
    if (!customSupabaseUrl || !customSupabaseKey) {
      setCloudMessage({ type: 'error', text: 'Inserisci sia URL che Anon Key di Supabase.' });
      return;
    }
    triggerHapticFeedback('selection');
    const ok = saveCustomSupabaseConfig(customSupabaseUrl, customSupabaseKey);
    if (ok) {
      setCloudMessage({ type: 'success', text: '✓ Credenziali Supabase salvate con successo!' });
      setShowConfigInputs(false);
    } else {
      setCloudMessage({ type: 'error', text: '✕ Impossibile salvare le credenziali.' });
    }
  };

  const handleToggleAutoSync = (enabled) => {
    setAutoSyncOn(enabled);
    triggerHapticFeedback('selection');
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_AUTOSYNC, enabled ? 'true' : 'false');
    } catch (e) {}
  };

  const handleUpdateApp = async () => {
    if (updateLoading) return;
    triggerHapticFeedback('selection');
    setUpdateLoading(true);
    setUpdateStatus(null);
    const CURRENT_APP_VERSION = '2.7.0';
    const GITHUB_REPO = 'pzzmhl/dietasia';
    const FALLBACK_APK_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/Coraline-Tracker-Beta.apk`;

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        signal: controller.signal,
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      clearTimeout(abortTimeout);
      if (res.ok) {
        const release = await res.json();
        const latestTag = (release.tag_name || '').replace(/^v/, '').trim();
        
        // Se la versione remota coincide con quella corrente installata
        if (latestTag && latestTag === CURRENT_APP_VERSION) {
          setUpdateStatus({ 
            type: 'info', 
            text: `✓ L'applicazione è già aggiornata all'ultima versione (v${CURRENT_APP_VERSION}).` 
          });
          setUpdateLoading(false);
          return;
        }

        const apkAsset = release.assets && release.assets.find(a => a.name && a.name.endsWith('.apk'));
        const downloadUrl = apkAsset ? apkAsset.browser_download_url : FALLBACK_APK_URL;

        setUpdateStatus({ 
          type: 'success', 
          text: `✦ Nuova versione ${release.tag_name || ''} trovata! Download avviato...` 
        });
        addTimer(setTimeout(() => {
          window.open(downloadUrl, '_system');
        }, 400));
      } else {
        // Fallback diretto se l'endpoint API non è raggiungibile o rate-limited
        setUpdateStatus({ 
          type: 'info', 
          text: "✦ Avvio del download dell'aggiornamento APK..." 
        });
        window.open(FALLBACK_APK_URL, '_system');
      }
    } catch (err) {
      clearTimeout(abortTimeout);
      setUpdateStatus({ 
        type: 'info', 
        text: "✦ Avvio del download dell'aggiornamento APK..." 
      });
      window.open(FALLBACK_APK_URL, '_system');
    } finally {
      addTimer(setTimeout(() => {
        setUpdateLoading(false);
      }, 1500));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#030b14',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden',
        touchAction: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease-out'
      }}
      onClick={onClose}
    >
      {/* SFONDO VORTICE DELL'ALTRO MONDO DIETRO LA MODALE */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at center, rgba(4, 16, 28, 0.5) 0%, rgba(2, 8, 15, 0.96) 80%),
            url(${vortexBg})
          `,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.14,
          filter: 'blur(3px)',
          WebkitFilter: 'blur(3px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div
        ref={modalScrollRef}
        className="stitched-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: 'min(535px, 88vh)',
          minHeight: 'min(535px, 88vh)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.94) 0%, rgba(5, 17, 30, 0.97) 65%, rgba(3, 10, 18, 0.98) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(107, 142, 85, 0.32)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(154, 185, 123, 0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '18px 16px',
          position: 'relative',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          boxSizing: 'border-box',
          touchAction: 'pan-y',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 14px, 0) scale(0.97)',
          transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease-out',
          willChange: 'transform, opacity'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TRAMA VORTICE DI CORALINE SULLO SFONDO DELLA SCHEDA IMPOSTAZIONI (SFOCATO E OMOGENEO) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.07,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* HEADER MODALE (PULSANTE CHIUSURA CIRCOLARE IN ALTO A DESTRA) */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(3, 10, 18, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--coraline-parchment)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              lineHeight: 1,
              touchAction: 'manipulation',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* NAVIGAZIONE A DUE TAB (CAPSULA INCASTRATA TEMA CALENDARIO DIETA/ALLENAMENTO) */}
        <div 
          role="tablist"
          aria-label="Modalità impostazioni"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            padding: '3px',
            backgroundColor: 'rgba(4, 14, 25, 0.88)',
            borderRadius: '13px',
            border: '1px solid rgba(220, 240, 255, 0.14)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.65)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3px',
            boxSizing: 'border-box',
            marginBottom: '16px',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'settings'}
            onClick={() => handleSelectTab('settings')}
            style={{
              padding: '8px 6px',
              borderRadius: '10px',
              border: activeTab === 'settings'
                ? '1px solid rgba(255, 255, 255, 0.38)'
                : '1px solid transparent',
              background: activeTab === 'settings'
                ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12) 0%, rgba(220, 235, 245, 0.05) 60%, rgba(6, 20, 34, 0.4) 100%)'
                : 'transparent',
              boxShadow: activeTab === 'settings'
                ? '0 0 6px rgba(255, 255, 255, 0.22), inset 0 0 4px rgba(225, 240, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.5)'
                : 'none',
              color: activeTab === 'settings' ? '#e6edf3' : 'var(--coraline-parchment)',
              opacity: activeTab === 'settings' ? 0.95 : 0.5,
              textShadow: activeTab === 'settings' ? '0 0 5px rgba(255, 255, 255, 0.4)' : 'none',
              fontFamily: 'var(--font-gothic)',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textAlign: 'center',
              lineHeight: 1.2,
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            Opzioni
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'backup'}
            onClick={() => handleSelectTab('backup')}
            style={{
              padding: '8px 6px',
              borderRadius: '10px',
              border: activeTab === 'backup'
                ? '1px solid rgba(255, 255, 255, 0.38)'
                : '1px solid transparent',
              background: activeTab === 'backup'
                ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12) 0%, rgba(220, 235, 245, 0.05) 60%, rgba(6, 20, 34, 0.4) 100%)'
                : 'transparent',
              boxShadow: activeTab === 'backup'
                ? '0 0 6px rgba(255, 255, 255, 0.22), inset 0 0 4px rgba(225, 240, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.5)'
                : 'none',
              color: activeTab === 'backup' ? '#e6edf3' : 'var(--coraline-parchment)',
              opacity: activeTab === 'backup' ? 0.95 : 0.5,
              textShadow: activeTab === 'backup' ? '0 0 5px rgba(255, 255, 255, 0.4)' : 'none',
              fontFamily: 'var(--font-gothic)',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textAlign: 'center',
              lineHeight: 1.2,
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            Profilo
          </button>
        </div>

        {/* TAB 1: IMPOSTAZIONI OPERATIVE */}
        {activeTab === 'settings' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            zIndex: 1,
            animation: 'coralineSettingsTabFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
          }}>
            {/* 1. NOTIFICHE PROMEMORIA */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1.2px solid rgba(139, 229, 116, 0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ 
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '12.5px', 
                    fontWeight: 700, 
                    color: '#f3f4f6',
                    letterSpacing: '0.4px'
                  }}>
                    Promemoria Topi Saltatori
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px', 
                    color: 'var(--coraline-parchment)', 
                    opacity: 0.75,
                    marginTop: '2px'
                  }}>
                    Notifica serale se non hai ancora segnato la giornata
                  </div>
                </div>

                <CoralineButtonSwitch
                  checked={reminderEnabled}
                  onChange={handleToggleReminder}
                  ariaLabel="Attiva o disattiva promemoria giornaliero"
                />
              </div>

              {reminderEnabled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px dashed rgba(139, 229, 116, 0.25)'
                }}>
                  <span style={{ 
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: 'var(--coraline-parchment)' 
                  }}>
                    Orario Notifica:
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleChangeReminderTime(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(6, 22, 37, 0.9)',
                      border: '1.5px solid rgba(139, 229, 116, 0.35)',
                      borderRadius: '8px',
                      color: 'var(--coraline-yellow)',
                      padding: '4px 8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              )}

              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(139, 229, 116, 0.4)',
                    borderRadius: '8px',
                    color: '#8be574',
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  ✦ Invia notifica di prova adesso
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('key');
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('test-coraline-mouse'));
                    }
                    onClose();
                  }}
                  style={{
                    background: 'rgba(216, 198, 21, 0.15)',
                    border: '1px solid rgba(216, 198, 21, 0.5)',
                    borderRadius: '8px',
                    color: '#D8C615',
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  🎺 Testa Topo a sinistra
                </button>
              </div>

              {testNotificationStatus && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  color: testNotificationStatus.startsWith('✓') ? '#8be574' : '#ef4444',
                  textAlign: 'center'
                }}>
                  {testNotificationStatus}
                </div>
              )}
            </div>

            {/* 2. CHIAVI DI SGARRO MENSILI */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1.2px solid rgba(139, 229, 116, 0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ 
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '12.5px', 
                  fontWeight: 700, 
                  color: '#f3f4f6',
                  letterSpacing: '0.4px'
                }}>
                  Chiavi Jolly per Mese
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px', 
                  color: 'var(--coraline-parchment)', 
                  opacity: 0.75,
                  marginTop: '2px'
                }}>
                  Sgarri speciali consentiti prima dell'Altra Madre
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateKeys(-1)}
                  disabled={keysPerMonth <= 1}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(6, 22, 37, 0.8)',
                    border: '1px solid rgba(139, 229, 116, 0.3)',
                    color: 'var(--coraline-parchment)',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: keysPerMonth <= 1 ? 'not-allowed' : 'pointer',
                    opacity: keysPerMonth <= 1 ? 0.3 : 1
                  }}
                >
                  -
                </button>
                <span style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '16px',
                  fontWeight: 900,
                  color: 'var(--coraline-yellow)',
                  minWidth: '22px',
                  textAlign: 'center'
                }}>
                  {keysPerMonth}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateKeys(1)}
                  disabled={keysPerMonth >= 10}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(6, 22, 37, 0.8)',
                    border: '1px solid rgba(139, 229, 116, 0.3)',
                    color: 'var(--coraline-parchment)',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: keysPerMonth >= 10 ? 'not-allowed' : 'pointer',
                    opacity: keysPerMonth >= 10 ? 0.3 : 1
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* 3. MUSICA D'ATMOSFERA (EXPLORATION) */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1.2px solid rgba(139, 229, 116, 0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <div style={{ 
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '12.5px', 
                  fontWeight: 700, 
                  color: '#f3f4f6',
                  letterSpacing: '0.4px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}>
                  <span>🎵 Musica d'Atmosfera</span>
                  {musicOn && (
                    <span style={{ 
                      fontSize: '9px', 
                      backgroundColor: 'rgba(139, 229, 116, 0.2)', 
                      color: '#8be574', 
                      padding: '1px 6px', 
                      borderRadius: '6px', 
                      fontFamily: 'var(--font-gothic)',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}>
                      ATTIVA
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px', 
                  color: 'var(--coraline-parchment)', 
                  opacity: 0.75,
                  marginTop: '2px', 
                  lineHeight: 1.3 
                }}>
                  "Exploration" (Bruno Coulais) in loop soffuso con dissolvenza sonora
                </div>
              </div>

              <CoralineButtonSwitch
                checked={musicOn}
                onChange={handleToggleMusic}
                ariaLabel="Attiva o disattiva musica d'atmosfera"
              />
            </div>
          </div>
        )}

        {/* TAB 2: PROFILO & CLOUD */}
        {activeTab === 'backup' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'relative',
            zIndex: 1,
            animation: 'coralineSettingsTabFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
          }}>
            {/* MESSAGGIO DI STATO */}
            {cloudMessage && (
              <div style={{
                padding: '9px 12px',
                borderRadius: '12px',
                backgroundColor: cloudMessage.type === 'success' ? 'rgba(16, 80, 45, 0.85)' : 'rgba(65, 15, 20, 0.85)',
                border: cloudMessage.type === 'success' ? '1px solid #8be574' : '1px solid #ef4444',
                color: cloudMessage.type === 'success' ? '#8be574' : '#fca5a5',
                fontFamily: 'var(--font-body)',
                fontSize: '11.5px',
                lineHeight: 1.3
              }}>
                {cloudMessage.text}
              </div>
            )}

            {/* SEZIONE PROFILO & FOTO DI ASIA */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1.2px solid rgba(139, 229, 116, 0.35)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              {/* Avatar ricamato direttamente cliccabile */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  avatarFileInputRef.current && avatarFileInputRef.current.click();
                }}
                aria-label="Tocca la foto per cambiarla"
                title="Tocca per scegliere un'altra foto profilo"
                style={{
                  width: '58px',
                  height: '58px',
                  minWidth: '58px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#091c2f',
                  border: '1.8px solid #8be574',
                  boxShadow: '0 0 12px rgba(139, 229, 116, 0.38), inset 0 0 8px rgba(0, 0, 0, 0.8)',
                  padding: 0,
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <img
                  src={customAvatar || profileAvatarImg}
                  alt="Foto Profilo Asia"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {/* Badge visivo fotocamera per indicare interattività */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  insetInline: 0,
                  backgroundColor: 'rgba(3, 10, 18, 0.72)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px 0'
                }}>
                  <span style={{ fontSize: '10px', lineHeight: 1 }}>📷</span>
                </div>
              </button>

              {/* Informazioni profilo (senza pulsante testuale separato) */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#8be574',
                  letterSpacing: '0.4px',
                  marginBottom: '2px'
                }}>
                  Foto Profilo di Asia
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--coraline-parchment)',
                  opacity: 0.82,
                  marginBottom: '4px',
                  lineHeight: 1.3
                }}>
                  {customAvatar ? 'Tocca la foto per cambiarla' : 'Tocca la foto per personalizzarla'}
                </div>

                {customAvatar && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback('selection');
                      if (onAvatarChange) onAvatarChange(null);
                      setCloudMessage({ type: 'success', text: '✓ Foto profilo ripristinata.' });
                      addTimer(setTimeout(() => setCloudMessage(null), 3000));
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(65, 15, 20, 0.5)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '2px'
                    }}
                  >
                    Ripristina predefinita
                  </button>
                )}

                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileSelect}
                />
              </div>
            </div>

            {cloudUser ? (
              /* STATO: UTENTE CONNESSO */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Stato Account Connesso */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(6, 20, 34, 0.85)',
                  border: '1.2px solid rgba(139, 229, 116, 0.35)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '12px',
                      color: '#8be574',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      <span style={{ color: '#8be574', fontSize: '10px' }}>●</span>
                      {cloudUser.email}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10.5px',
                      color: 'var(--coraline-parchment)',
                      opacity: 0.75,
                      marginTop: '3px'
                    }}>
                      {lastCloudBackup 
                        ? `Ultimo sync: ${formatCloudBackupDate(lastCloudBackup)}` 
                        : 'Sincronizzato e protetto'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloudSignOut}
                    disabled={cloudLoading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      backgroundColor: 'rgba(65, 15, 20, 0.6)',
                      color: '#fca5a5',
                      fontSize: '11px',
                      fontFamily: 'var(--font-gothic)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginLeft: '10px'
                    }}
                  >
                    Esci
                  </button>
                </div>

                {/* Auto-sync continuo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(6, 20, 34, 0.85)',
                  border: '1.2px solid rgba(139, 229, 116, 0.25)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)'
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '12px',
                      color: '#ffffff',
                      fontWeight: 700,
                      letterSpacing: '0.3px'
                    }}>
                      Auto-sync continuo
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10.5px',
                      color: 'var(--coraline-parchment)',
                      opacity: 0.75,
                      marginTop: '2px'
                    }}>
                      Salva in tempo reale ogni progresso sul cloud
                    </div>
                  </div>
                  <CoralineButtonSwitch
                    checked={autoSyncOn}
                    onChange={handleToggleAutoSync}
                    ariaLabel="Auto-sync continuo"
                  />
                </div>
              </div>
            ) : (
              /* STATO: FORM ACCESSO / REGISTRAZIONE */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <form onSubmit={handleCloudAuth} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                  borderRadius: '18px',
                  padding: '14px',
                  border: '1.2px solid rgba(216, 198, 21, 0.35)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 14px rgba(0, 0, 0, 0.5)'
                }}>
                  {/* Selettore Accedi / Registrati */}
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    backgroundColor: 'rgba(6, 20, 34, 0.85)',
                    padding: '3px',
                    borderRadius: '12px',
                    border: '1px solid rgba(107, 142, 85, 0.25)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setCloudMode('signin')}
                      style={{
                        flex: 1,
                        padding: '7px',
                        borderRadius: '9px',
                        border: 'none',
                        backgroundColor: cloudMode === 'signin' ? 'rgba(216, 198, 21, 0.25)' : 'transparent',
                        color: cloudMode === 'signin' ? 'var(--coraline-yellow)' : 'var(--coraline-parchment)',
                        fontFamily: 'var(--font-gothic)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Accedi
                    </button>
                    <button
                      type="button"
                      onClick={() => setCloudMode('signup')}
                      style={{
                        flex: 1,
                        padding: '7px',
                        borderRadius: '9px',
                        border: 'none',
                        backgroundColor: cloudMode === 'signup' ? 'rgba(216, 198, 21, 0.25)' : 'transparent',
                        color: cloudMode === 'signup' ? 'var(--coraline-yellow)' : 'var(--coraline-parchment)',
                        fontFamily: 'var(--font-gothic)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Nuovo Account
                    </button>
                  </div>

                  {/* Input Email e Password */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="email"
                      value={cloudEmail}
                      onChange={(e) => setCloudEmail(e.target.value)}
                      placeholder="Email (es. asia@email.com)"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(6, 20, 34, 0.95)',
                        border: '1px solid rgba(107, 142, 85, 0.35)',
                        borderRadius: '11px',
                        color: '#ffffff',
                        padding: '10px 12px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="password"
                      value={cloudPassword}
                      onChange={(e) => setCloudPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(6, 20, 34, 0.95)',
                        border: '1px solid rgba(107, 142, 85, 0.35)',
                        borderRadius: '11px',
                        color: '#ffffff',
                        padding: '10px 12px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Pulsante Conferma */}
                  <button
                    type="submit"
                    disabled={cloudLoading}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(216, 198, 21, 0.25)',
                      border: '1.5px solid var(--coraline-yellow)',
                      borderRadius: '12px',
                      color: 'var(--coraline-yellow)',
                      padding: '11px',
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: cloudLoading ? 'wait' : 'pointer',
                      touchAction: 'manipulation',
                      boxShadow: '0 4px 14px rgba(216, 198, 21, 0.25)'
                    }}
                  >
                    {cloudLoading 
                      ? 'Operazione in corso...' 
                      : (cloudMode === 'signin' ? '✦ Accedi al Tuo Account' : '✦ Crea Account Gratuito')}
                  </button>

                  {/* Link Configurazione rapida credenziali */}
                  <div style={{ marginTop: '2px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowConfigInputs((prev) => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--coraline-parchment)',
                        opacity: 0.65,
                        fontSize: '10px',
                        fontFamily: 'var(--font-gothic)',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {showConfigInputs ? '▲ Chiudi Configurazione' : 'Modifica credenziali Supabase'}
                    </button>
                  </div>

                  {showConfigInputs && (
                    <div style={{
                      marginTop: '4px',
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(4, 14, 25, 0.95)',
                      border: '1px dashed rgba(216, 198, 21, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <input
                        type="url"
                        value={customSupabaseUrl}
                        onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                        placeholder="Project URL"
                        style={{
                          backgroundColor: 'rgba(6, 20, 34, 0.9)',
                          border: '1px solid rgba(107, 142, 85, 0.35)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          padding: '6px 8px',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <input
                        type="text"
                        value={customSupabaseKey}
                        onChange={(e) => setCustomSupabaseKey(e.target.value)}
                        placeholder="Anon Public Key"
                        style={{
                          backgroundColor: 'rgba(6, 20, 34, 0.9)',
                          border: '1px solid rgba(107, 142, 85, 0.35)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          padding: '6px 8px',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveSupabaseConfig}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #8be574',
                          backgroundColor: 'rgba(16, 80, 45, 0.8)',
                          color: '#8be574',
                          fontSize: '11px',
                          fontFamily: 'var(--font-gothic)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Salva Credenziali
                      </button>
                    </div>
                  )}
                </form>

                {/* Auto-sync continuo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(6, 20, 34, 0.85)',
                  border: '1.2px solid rgba(139, 229, 116, 0.25)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)'
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '12px',
                      color: '#ffffff',
                      fontWeight: 700,
                      letterSpacing: '0.3px'
                    }}>
                      Auto-sync continuo
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10.5px',
                      color: 'var(--coraline-parchment)',
                      opacity: 0.75,
                      marginTop: '2px'
                    }}>
                      Salva in tempo reale ogni progresso sul cloud
                    </div>
                  </div>
                  <CoralineButtonSwitch
                    checked={autoSyncOn}
                    onChange={handleToggleAutoSync}
                    ariaLabel="Auto-sync continuo"
                  />
                </div>
              </div>
            )}

            {/* PULSANTE AGGIORNA L'APP */}
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleUpdateApp}
                disabled={updateLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(9, 29, 49, 0.95)',
                  border: '1.5px solid var(--coraline-yellow)',
                  borderRadius: '14px',
                  color: 'var(--coraline-yellow)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  cursor: updateLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(216, 198, 21, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  touchAction: 'manipulation',
                  transition: 'all 0.15s ease'
                }}
              >
                {updateLoading ? 'Verifica aggiornamenti...' : "Aggiorna l'app"}
              </button>

              {updateStatus && (
                <div style={{
                  marginTop: '8px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-gothic)',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  backgroundColor: updateStatus.type === 'error' 
                    ? 'rgba(65, 15, 20, 0.85)' 
                    : (updateStatus.type === 'info' ? 'rgba(9, 29, 49, 0.9)' : 'rgba(16, 60, 30, 0.9)'),
                  border: updateStatus.type === 'error'
                    ? '1px solid rgba(239, 68, 68, 0.5)'
                    : (updateStatus.type === 'info' ? '1px solid rgba(216, 198, 21, 0.4)' : '1px solid rgba(139, 229, 116, 0.5)'),
                  color: updateStatus.type === 'error'
                    ? '#fca5a5'
                    : (updateStatus.type === 'info' ? 'var(--coraline-yellow)' : '#8be574')
                }}>
                  {updateStatus.text}
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes coralineSettingsTabFadeIn {
            0% {
              opacity: 0;
              transform: translate3d(0, 5px, 0);
            }
            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
