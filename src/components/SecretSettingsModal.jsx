import React, { useState, useEffect, useRef } from 'react';
import profileAvatarImg from '../assets/profile-avatar.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { 
  exportFullCloudBackupPayload,
  restoreFullCloudBackupPayload,
  saveCustomAvatar
} from '../utils/storage';
import {
  isSupabaseConfigured,
  getSupabaseUser,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  uploadBackupToSupabase
} from '../services/supabase';
import {
  getSyncStatus,
  subscribeSyncStatus,
  flushSyncQueue
} from '../utils/syncQueue.js';
import {
  checkForAppUpdates,
  downloadAndInstallUpdate,
  CURRENT_APP_VERSION
} from '../utils/updateChecker.js';
import { 
  scheduleDailyReminder, 
  cancelDailyReminder, 
  sendTestReminderNotification 
} from '../utils/notifications';
import { 
  triggerHapticFeedback,
  isHapticsEnabled,
  setHapticsEnabled
} from '../utils/haptics';
import { 
  isMusicEnabled, 
  setMusicEnabled, 
  subscribeMusicState 
} from '../services/backgroundMusic';

/**
 * CoralineButtonSwitch:
 * Slider toggle con cursore a forma di Bottone di Coraline con 4 fori,
 * animazione fluida stop-motion, rim-lighting e feedback aptico.
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
  const [activeTab, setActiveTab] = useState(initialTab === 'profile' ? 'profile' : 'settings');
  const avatarFileInputRef = useRef(null);
  const localBackupFileInputRef = useRef(null);
  const testNotifTimerRef = useRef(null);
  const updateStatusTimerRef = useRef(null);
  const cloudMsgTimerRef = useRef(null);

  // Stato Notifiche & Promemoria
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED) !== 'false';
    } catch (e) {
      return true;
    }
  });

  const [reminderTime, setReminderTime] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMINDER_TIME) || '20:30';
    } catch (e) {
      return '20:30';
    }
  });

  const [testNotificationStatus, setTestNotificationStatus] = useState(null);

  // Stato Musica d'Atmosfera
  const [musicOn, setMusicOn] = useState(() => isMusicEnabled());

  // Stato Vibrazione Tattile
  const [hapticsOn, setHapticsOn] = useState(() => isHapticsEnabled());

  // Stato Sfondo Vortice
  const [vortexOn, setVortexOn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.VORTEX_ENABLED) !== 'false';
    } catch (e) {
      return true;
    }
  });

  // Stato Cloud & Sync
  const [cloudUser, setCloudUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus());
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME) || null;
    } catch (e) {
      return null;
    }
  });

  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudMode, setCloudMode] = useState('signin'); // 'signin' | 'signup'
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState(null);

  // Stato Aggiornamenti
  const [updateCheckStatus, setUpdateCheckStatus] = useState(null);
  const [availableUpdate, setAvailableUpdate] = useState(null);

  // Allinea activeTab quando initialTab cambia all'apertura
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'profile' ? 'profile' : 'settings');
    }
  }, [isOpen, initialTab]);

  // Sincronizza stato musica e sync live + pulizia timer all'unmount
  useEffect(() => {
    const unsubMusic = subscribeMusicState(setMusicOn);
    const unsubSync = subscribeSyncStatus(setSyncStatus);
    return () => {
      if (typeof unsubMusic === 'function') unsubMusic();
      if (typeof unsubSync === 'function') unsubSync();
      if (testNotifTimerRef.current) clearTimeout(testNotifTimerRef.current);
      if (updateStatusTimerRef.current) clearTimeout(updateStatusTimerRef.current);
      if (cloudMsgTimerRef.current) clearTimeout(cloudMsgTimerRef.current);
    };
  }, []);

  // Verifica utente Supabase se configurato
  useEffect(() => {
    if (isOpen && isSupabaseConfigured()) {
      getSupabaseUser().then((user) => {
        setCloudUser(user);
      }).catch(() => {
        setCloudUser(null);
      });
      try {
        setLastSyncTime(localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_BACKUP_TIME) || null);
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- HANDLER PREFERENZE ---

  const handleToggleReminder = (enabled) => {
    setReminderEnabled(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, enabled ? 'true' : 'false');
    } catch (e) {}
    if (enabled) {
      scheduleDailyReminder(reminderTime);
    } else {
      cancelDailyReminder();
    }
  };

  const handleChangeReminderTime = (timeVal) => {
    setReminderTime(timeVal);
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER_TIME, timeVal);
    } catch (e) {}
    if (reminderEnabled) {
      scheduleDailyReminder(timeVal);
    }
  };

  const scheduleTestNotifClear = (ms = 3500) => {
    if (testNotifTimerRef.current) clearTimeout(testNotifTimerRef.current);
    testNotifTimerRef.current = setTimeout(() => setTestNotificationStatus(null), ms);
  };

  const scheduleUpdateStatusClear = (ms = 3500) => {
    if (updateStatusTimerRef.current) clearTimeout(updateStatusTimerRef.current);
    updateStatusTimerRef.current = setTimeout(() => setUpdateCheckStatus(null), ms);
  };

  const scheduleCloudMsgClear = (ms = 3500) => {
    if (cloudMsgTimerRef.current) clearTimeout(cloudMsgTimerRef.current);
    cloudMsgTimerRef.current = setTimeout(() => setCloudMessage(null), ms);
  };

  const handleTestNotification = async () => {
    triggerHapticFeedback('selection');
    setTestNotificationStatus('Invio in corso...');
    const ok = await sendTestReminderNotification();
    if (ok) {
      setTestNotificationStatus('✓ Notifica di prova inviata!');
    } else {
      setTestNotificationStatus('✕ Notifica non consentita (verifica permessi).');
    }
    scheduleTestNotifClear(3500);
  };

  const handleUpdateKeys = (delta) => {
    const newVal = Math.max(1, Math.min(10, keysPerMonth + delta));
    onChangeKeysPerMonth(newVal);
  };

  const handleToggleMusic = (val) => {
    setMusicEnabled(val);
    setMusicOn(val);
  };

  const handleToggleHaptics = (val) => {
    setHapticsEnabled(val);
    setHapticsOn(val);
  };

  const handleToggleVortex = (val) => {
    setVortexOn(val);
    try {
      localStorage.setItem(STORAGE_KEYS.VORTEX_ENABLED, val ? 'true' : 'false');
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('no-vortex-bg', !val);
      }
    } catch (e) {}
  };

  const handleCheckUpdates = async () => {
    triggerHapticFeedback('selection');
    setUpdateCheckStatus('Controllo versioni GitHub...');
    try {
      const res = await checkForAppUpdates({ force: true });
      if (res && res.updateAvailable) {
        setAvailableUpdate(res);
        setUpdateCheckStatus(`✦ Nuova versione ${res.latestVersion} disponibile!`);
      } else {
        setUpdateCheckStatus(`✓ Stai usando l'ultima versione disponibile (${CURRENT_APP_VERSION})`);
        scheduleUpdateStatusClear(3500);
      }
    } catch (err) {
      setUpdateCheckStatus('✕ Impossibile verificare aggiornamenti adesso.');
      scheduleUpdateStatusClear(3500);
    }
  };

  // --- HANDLER PROFILO & CLOUD ---

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event?.target?.result;
      if (typeof rawDataUrl !== 'string') return;

      const img = new Image();
      img.onload = () => {
        try {
          const targetSize = 256;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context unavailable');

          // Ritaglio quadrato centrato (identico a object-fit: cover)
          const minSide = Math.min(img.width, img.height);
          const sx = Math.max(0, Math.floor((img.width - minSide) / 2));
          const sy = Math.max(0, Math.floor((img.height - minSide) / 2));
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

          let compressed = canvas.toDataURL('image/webp', 0.85);
          if (!compressed || !compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', 0.85);
          }

          saveCustomAvatar(compressed);
          onAvatarChange(compressed);
          triggerHapticFeedback('success');
          setCloudMessage({ type: 'success', text: '✓ Foto profilo aggiornata con successo!' });
          scheduleCloudMsgClear(3000);
        } catch (err) {
          saveCustomAvatar(rawDataUrl);
          onAvatarChange(rawDataUrl);
          triggerHapticFeedback('success');
          setCloudMessage({ type: 'success', text: '✓ Foto profilo aggiornata con successo!' });
          scheduleCloudMsgClear(3000);
        }
      };
      img.onerror = () => {
        setCloudMessage({ type: 'error', text: '✕ Impossibile leggere l\'immagine selezionata.' });
        scheduleCloudMsgClear(3500);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetAvatar = () => {
    saveCustomAvatar(null);
    onAvatarChange(null);
    triggerHapticFeedback('selection');
    setCloudMessage({ type: 'success', text: '✓ Disegno originale di Coraline ripristinato.' });
    scheduleCloudMsgClear(3000);
  };

  const handleCloudAuth = async (e) => {
    e.preventDefault();
    if (!cloudEmail || !cloudPassword) {
      setCloudMessage({ type: 'error', text: 'Inserisci sia email che password.' });
      return;
    }

    setCloudLoading(true);
    setCloudMessage(null);
    try {
      if (cloudMode === 'signup') {
        const signUpData = await supabaseSignUp(cloudEmail, cloudPassword);
        if (signUpData && signUpData.session && signUpData.user) {
          setCloudUser(signUpData.user);
          triggerHapticFeedback('success');
          setCloudMessage({ type: 'success', text: `✓ Account creato e connesso come ${signUpData.user.email}!` });
          flushSyncQueue();
        } else {
          setCloudMessage({ type: 'success', text: '✓ Account creato! Controlla la mail per confermare o effettua l\'accesso.' });
        }
      } else {
        await supabaseSignIn(cloudEmail, cloudPassword);
        const user = await getSupabaseUser();
        setCloudUser(user);
        triggerHapticFeedback('success');
        setCloudMessage({ type: 'success', text: `✓ Bentornata, ${user.email}!` });
        flushSyncQueue();
      }
    } catch (err) {
      setCloudMessage({ type: 'error', text: `✕ ${err.message || 'Errore di autenticazione'}` });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCloudSignOut = async () => {
    triggerHapticFeedback('selection');
    try {
      await supabaseSignOut();
      setCloudUser(null);
      setCloudMessage({ type: 'success', text: 'Disconnessione effettuata. I dati locali restano sul dispositivo.' });
      scheduleCloudMsgClear(3500);
    } catch (e) {}
  };

  const handleManualCloudBackup = async () => {
    triggerHapticFeedback('selection');
    setCloudLoading(true);
    setCloudMessage({ type: 'info', text: 'Salvataggio nel cloud in corso...' });
    try {
      const payload = exportFullCloudBackupPayload();
      const updatedTime = await uploadBackupToSupabase(payload);
      setLastSyncTime(updatedTime);
      triggerHapticFeedback('success');
      setCloudMessage({ type: 'success', text: '✓ Tutti i tuoi dati sono salvati al sicuro nel Cloud!' });
      scheduleCloudMsgClear(4000);
    } catch (err) {
      setCloudMessage({ type: 'error', text: `✕ Errore di salvataggio: ${err.message}` });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleExportLocalBackup = () => {
    triggerHapticFeedback('selection');
    try {
      const payload = exportFullCloudBackupPayload();
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      a.href = url;
      a.download = `coraline-diario-asia-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCloudMessage({ type: 'success', text: '✓ File di backup scaricato correttamente!' });
      scheduleCloudMsgClear(3500);
    } catch (err) {
      setCloudMessage({ type: 'error', text: '✕ Impossibile esportare il backup su file.' });
    }
  };

  const handleImportLocalBackupFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);
        const res = restoreFullCloudBackupPayload(parsed);
        if (res && res.success) {
          triggerHapticFeedback('success');
          onRestoreSuccess();
          setCloudMessage({ type: 'success', text: `✓ Diario ripristinato con successo! (${res.importedCount || 0} giorni importati)` });
          scheduleCloudMsgClear(4000);
        } else {
          throw new Error('Dati di backup non validi.');
        }
      } catch (err) {
        setCloudMessage({ type: 'error', text: `✕ Errore nel file di ripristino: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper formattazione data ultimo backup
  const formatSyncDate = (isoStr) => {
    if (!isoStr) return 'Nessun salvataggio recente';
    try {
      const d = new Date(isoStr);
      return `Ultimo salvataggio: ${d.toLocaleDateString('it-IT')} alle ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Sincronizzato di recente';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Impostazioni Diario di Asia"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(2, 8, 15, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          backgroundColor: '#071524',
          borderRadius: '24px',
          border: '1.5px solid rgba(47, 77, 108, 0.75)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.9), 0 0 24px rgba(13, 44, 73, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* SFONDO VORTICE SOFFUSO */}
        <div
          className="vortex-bg-layer"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at center, rgba(7, 21, 36, 0.6) 0%, rgba(4, 13, 24, 0.95) 80%),
              url(${vortexBg})
            `,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            opacity: 0.18,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* HEADER MODALE */}
        <div style={{
          padding: '18px 20px 14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(220, 240, 255, 0.1)',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-coraline)',
              fontSize: '18px',
              color: 'var(--coraline-yellow)',
              margin: 0,
              letterSpacing: '0.8px',
              lineHeight: 1.2
            }}>
              Impostazioni
            </h2>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--coraline-parchment)',
              opacity: 0.75,
              marginTop: '2px'
            }}>
              Il Diario di Asia • Mondo Reale
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi impostazioni"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(5, 17, 30, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--coraline-parchment)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            ✕
          </button>
        </div>

        {/* SELETTORE A 2 TAB */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          padding: '10px 16px 6px 16px',
          position: 'relative',
          zIndex: 2,
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setActiveTab('settings');
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '12px',
              border: activeTab === 'settings' ? '1px solid rgba(216, 198, 21, 0.6)' : '1px solid transparent',
              backgroundColor: activeTab === 'settings' ? 'rgba(216, 198, 21, 0.16)' : 'rgba(4, 14, 25, 0.6)',
              color: activeTab === 'settings' ? 'var(--coraline-yellow)' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              touchAction: 'manipulation'
            }}
          >
            <span>⚙️ Preferenze</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setActiveTab('profile');
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '12px',
              border: activeTab === 'profile' ? '1px solid rgba(139, 229, 116, 0.6)' : '1px solid transparent',
              backgroundColor: activeTab === 'profile' ? 'rgba(139, 229, 116, 0.16)' : 'rgba(4, 14, 25, 0.6)',
              color: activeTab === 'profile' ? '#8be574' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              touchAction: 'manipulation'
            }}
          >
            <span>👤 Profilo & Cloud</span>
          </button>
        </div>

        {/* CORPO SCORREVOLE DELLE IMPOSTAZIONI */}
        <div style={{
          padding: '12px 18px 20px 18px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* TAB 1: PREFERENZE & DIARIO */}
          {activeTab === 'settings' && (
            <>
              {/* 1. NOTIFICHE PROMEMORIA */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1.2px solid rgba(139, 229, 116, 0.22)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 700, color: '#f3f4f6' }}>
                      Promemoria Serale
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, marginTop: '2px' }}>
                      Ricevi un avviso gentile prima di andare a dormire
                    </div>
                  </div>
                  <CoralineButtonSwitch
                    checked={reminderEnabled}
                    onChange={handleToggleReminder}
                    ariaLabel="Attiva o disattiva promemoria serale"
                  />
                </div>

                {reminderEnabled && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px dashed rgba(139, 229, 116, 0.25)'
                  }}>
                    <span style={{ fontFamily: 'var(--font-gothic)', fontSize: '11.5px', color: 'var(--coraline-parchment)' }}>
                      Orario Notifica:
                    </span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => handleChangeReminderTime(e.target.value)}
                      style={{
                        backgroundColor: 'rgba(6, 22, 37, 0.9)',
                        border: '1.5px solid rgba(139, 229, 116, 0.4)',
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

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
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
                      padding: '4px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    ✦ Prova notifica adesso
                  </button>
                </div>

                {testNotificationStatus && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: testNotificationStatus.startsWith('✓') ? '#8be574' : '#ef4444', textAlign: 'center' }}>
                    {testNotificationStatus}
                  </div>
                )}
              </div>

              {/* 2. CHIAVI JOLLY MENSILI */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1.2px solid rgba(139, 229, 116, 0.22)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 700, color: '#f3f4f6' }}>
                    Chiavi della Flessibilità (Jolly)
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, marginTop: '2px' }}>
                    Pasti liberi speciali al mese senza spezzare la serie
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateKeys(-1)}
                    disabled={keysPerMonth <= 1}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(6, 22, 37, 0.8)',
                      border: '1px solid rgba(139, 229, 116, 0.3)',
                      color: 'var(--coraline-parchment)',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: keysPerMonth <= 1 ? 'not-allowed' : 'pointer',
                      opacity: keysPerMonth <= 1 ? 0.3 : 1
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '17px',
                    fontWeight: 900,
                    color: 'var(--coraline-yellow)',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {keysPerMonth}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateKeys(1)}
                    disabled={keysPerMonth >= 10}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(6, 22, 37, 0.8)',
                      border: '1px solid rgba(139, 229, 116, 0.3)',
                      color: 'var(--coraline-parchment)',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: keysPerMonth >= 10 ? 'not-allowed' : 'pointer',
                      opacity: keysPerMonth >= 10 ? 0.3 : 1
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3. MUSICA D'ATMOSFERA */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1.2px solid rgba(139, 229, 116, 0.22)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 700, color: '#f3f4f6' }}>
                    🎵 Musica di Sottofondo
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, marginTop: '2px' }}>
                    "Exploration" di Bruno Coulais in loop d'atmosfera
                  </div>
                </div>
                <CoralineButtonSwitch
                  checked={musicOn}
                  onChange={handleToggleMusic}
                  ariaLabel="Attiva o disattiva musica"
                />
              </div>

              {/* 4. VIBRAZIONE APTICA */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1.2px solid rgba(139, 229, 116, 0.22)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 700, color: '#f3f4f6' }}>
                    📳 Feedback Tattile (Vibrazione)
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, marginTop: '2px' }}>
                    Micro-vibrazioni stile cucito sui pulsanti e conferme
                  </div>
                </div>
                <CoralineButtonSwitch
                  checked={hapticsOn}
                  onChange={handleToggleHaptics}
                  ariaLabel="Attiva o disattiva vibrazione"
                />
              </div>

              {/* 5. TRAMA VORTICE DI SFONDO */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1.2px solid rgba(139, 229, 116, 0.22)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 700, color: '#f3f4f6' }}>
                    🌀 Sfondo Vortice dell'Altro Mondo
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, marginTop: '2px' }}>
                    Trama ipnotica in chiaroscuro sul calendario e schede
                  </div>
                </div>
                <CoralineButtonSwitch
                  checked={vortexOn}
                  onChange={handleToggleVortex}
                  ariaLabel="Attiva o disattiva trama vortice"
                />
              </div>

              {/* 6. SALUTO DEL GATTO & CONTROLLO AGGIORNAMENTI */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('selection');
                    onOpenDailyGreeting();
                    onClose();
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px dashed rgba(216, 198, 21, 0.4)',
                    backgroundColor: 'rgba(216, 198, 21, 0.08)',
                    color: 'var(--coraline-yellow)',
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    touchAction: 'manipulation'
                  }}
                >
                  ✦ Rileggi il Saluto del Buongiorno del Gatto
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.65 }}>
                    Versione app: v{CURRENT_APP_VERSION}
                  </span>
                  <button
                    type="button"
                    onClick={handleCheckUpdates}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8be574',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Controlla aggiornamenti
                  </button>
                </div>

                {updateCheckStatus && (
                  <div style={{ fontSize: '11px', color: '#8be574', textAlign: 'center' }}>
                    {updateCheckStatus}
                  </div>
                )}

                {availableUpdate && (
                  <button
                    type="button"
                    onClick={() => downloadAndInstallUpdate(availableUpdate.apkUrl)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#10b981',
                      color: '#041208',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Scarica Nuova Versione APK ({availableUpdate.latestVersion})
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB 2: PROFILO & CLOUD */}
          {activeTab === 'profile' && (
            <>
              {/* MESSAGGIO FEEDBACK */}
              {cloudMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: cloudMessage.type === 'success' ? 'rgba(16, 80, 45, 0.9)' : 'rgba(80, 15, 20, 0.9)',
                  border: cloudMessage.type === 'success' ? '1px solid #8be574' : '1px solid #ef4444',
                  color: cloudMessage.type === 'success' ? '#8be574' : '#fca5a5',
                  fontSize: '11.5px',
                  lineHeight: 1.3
                }}>
                  {cloudMessage.text}
                </div>
              )}

              {/* SEZIONE FOTO PROFILO */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '18px',
                padding: '16px',
                border: '1.2px solid rgba(47, 77, 108, 0.75)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid rgba(216, 198, 21, 0.65)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                  flexShrink: 0,
                  backgroundColor: '#0c1013'
                }}>
                  <img
                    src={customAvatar || profileAvatarImg}
                    alt="Foto di Asia"
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-coraline)', fontSize: '15px', color: 'var(--coraline-yellow)' }}>
                    Asia
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current && avatarFileInputRef.current.click()}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(216, 198, 21, 0.2)',
                        border: '1px solid rgba(216, 198, 21, 0.6)',
                        color: 'var(--coraline-yellow)',
                        fontFamily: 'var(--font-gothic)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Scegli Foto
                    </button>

                    {customAvatar && (
                      <button
                        type="button"
                        onClick={handleResetAvatar}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'var(--coraline-parchment)',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Ripristina Coraline
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />
              </div>

              {/* CARD STATO SINCRONIZZAZIONE LIVE */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '18px',
                padding: '16px',
                border: '1.2px solid rgba(139, 229, 116, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: syncStatus === 'synced' ? '#10b981' : (syncStatus === 'syncing' ? '#38bdf8' : (syncStatus === 'pending' ? '#f59e0b' : '#64748b')),
                      boxShadow: syncStatus === 'synced' ? '0 0 8px rgba(16, 185, 129, 0.8)' : 'none'
                    }} />
                    <span style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 800, color: '#f3f4f6' }}>
                      Sincronizzazione Cloud
                    </span>
                  </div>

                  <span style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-gothic)',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: syncStatus === 'synced' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: syncStatus === 'synced' ? '#8be574' : 'var(--coraline-parchment)'
                  }}>
                    {syncStatus === 'synced' ? 'AL SICURO' : syncStatus.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.8, lineHeight: 1.4 }}>
                  {formatSyncDate(lastSyncTime)}
                </div>

                {isSupabaseConfigured() && cloudUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '11px', color: '#8be574' }}>
                      Connessa come: <b>{cloudUser.email}</b>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloudSignOut}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fca5a5',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Disconnetti
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCloudAuth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.85 }}>
                      Accedi con account per salvare automaticamente i tuoi progressi nel Cloud:
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={cloudEmail}
                      onChange={(e) => setCloudEmail(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(6, 22, 37, 0.9)',
                        border: '1px solid rgba(47, 77, 108, 0.8)',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={cloudPassword}
                      onChange={(e) => setCloudPassword(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(6, 22, 37, 0.9)',
                        border: '1px solid rgba(47, 77, 108, 0.8)',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <button
                        type="submit"
                        disabled={cloudLoading}
                        onClick={() => setCloudMode('signin')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#10b981',
                          border: 'none',
                          color: '#041208',
                          fontFamily: 'var(--font-gothic)',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {cloudLoading ? 'Caricamento...' : 'Accedi'}
                      </button>
                      <button
                        type="submit"
                        disabled={cloudLoading}
                        onClick={() => setCloudMode('signup')}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'var(--coraline-parchment)',
                          fontSize: '11.5px',
                          cursor: 'pointer'
                        }}
                      >
                        Crea Account
                      </button>
                    </div>
                  </form>
                )}

                {isSupabaseConfigured() && cloudUser && (
                  <button
                    type="button"
                    onClick={handleManualCloudBackup}
                    disabled={cloudLoading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      border: '1.2px solid rgba(16, 185, 129, 0.65)',
                      color: '#8be574',
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    ✦ Salva Adesso nel Cloud
                  </button>
                )}
              </div>

              {/* COPIA DI SICUREZZA OFFLINE (FILE JSON) */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(8, 26, 44, 0.88) 0%, rgba(4, 16, 28, 0.94) 100%)',
                borderRadius: '18px',
                padding: '16px',
                border: '1.2px solid rgba(47, 77, 108, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontFamily: 'var(--font-gothic)', fontSize: '13px', fontWeight: 700, color: '#f3f4f6' }}>
                  💾 Copia di Sicurezza su File
                </div>
                <div style={{ fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, lineHeight: 1.35 }}>
                  Puoi esportare in ogni momento un file di backup (.json) da conservare sul telefono o sul computer.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleExportLocalBackup}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(216, 198, 21, 0.16)',
                      border: '1px solid rgba(216, 198, 21, 0.5)',
                      color: 'var(--coraline-yellow)',
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✦ Esporta (.json)
                  </button>

                  <button
                    type="button"
                    onClick={() => localBackupFileInputRef.current && localBackupFileInputRef.current.click()}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: 'var(--coraline-parchment)',
                      fontFamily: 'var(--font-gothic)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✦ Ripristina (.json)
                  </button>
                </div>

                <input
                  type="file"
                  ref={localBackupFileInputRef}
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleImportLocalBackupFile}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
