import React, { useState, useRef, useEffect } from 'react';
import secretDoorImg from '../assets/secret-door.webp';
import keyImg from '../assets/key.webp';
import seeingStoneImg from '../assets/seeing-stone.webp';
import { 
  exportBackupData, 
  importBackupData, 
  getAllLogs 
} from '../utils/storage';
import { 
  scheduleDailyReminder, 
  sendTestReminderNotification,
  requestNotificationPermission 
} from '../services/notifications';
import { 
  triggerHapticFeedback, 
  isHapticsEnabled, 
  setHapticsEnabled 
} from '../services/haptics';

export default function SecretSettingsModal({ 
  isOpen, 
  onClose, 
  keysPerMonth = 4,
  onChangeKeysPerMonth = () => {},
  onRestoreSuccess = () => {} 
}) {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'backup' | 'info'
  
  // STATI IMPOSTAZIONI
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    try {
      return localStorage.getItem('coraline_reminder_enabled') !== 'false';
    } catch (e) {
      return true;
    }
  });

  const [reminderTime, setReminderTime] = useState(() => {
    try {
      return localStorage.getItem('coraline_reminder_time') || '20:00';
    } catch (e) {
      return '20:00';
    }
  });

  const [hapticsOn, setHapticsOn] = useState(() => isHapticsEnabled());
  const [testNotificationStatus, setTestNotificationStatus] = useState(null);

  // STATI BACKUP
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setTestNotificationStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLogs = getAllLogs();
  const totalDays = Object.keys(currentLogs).length;
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

  // GESTIONE PROMEMORIA
  const handleToggleReminder = async (enabled) => {
    setReminderEnabled(enabled);
    try {
      localStorage.setItem('coraline_reminder_enabled', enabled ? 'true' : 'false');
      if (enabled) {
        await scheduleDailyReminder(reminderTime, false);
      }
    } catch (e) {}
    triggerHapticFeedback('selection');
  };

  const handleChangeReminderTime = async (newTime) => {
    setReminderTime(newTime);
    try {
      localStorage.setItem('coraline_reminder_time', newTime);
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
    setTimeout(() => setTestNotificationStatus(null), 5000);
  };

  // GESTIONE CHIAVI MENSILI
  const handleUpdateKeys = (delta) => {
    const nextVal = Math.min(10, Math.max(1, keysPerMonth + delta));
    onChangeKeysPerMonth(nextVal);
    try {
      localStorage.setItem('coraline_keys_per_month', String(nextVal));
    } catch (e) {}
    triggerHapticFeedback('selection');
  };

  // GESTIONE APTICA
  const handleToggleHaptics = (enabled) => {
    setHapticsOn(enabled);
    setHapticsEnabled(enabled);
    if (enabled) triggerHapticFeedback('selection');
  };

  // GESTIONE BACKUP (Download file)
  const handleDownloadFile = () => {
    triggerHapticFeedback('selection');
    try {
      const dataStr = exportBackupData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const nowStr = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diario-coraline-asia-${nowStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `✓ File scaricato con successo nei Download! (${totalDays} giorni registrati)`
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Errore durante la creazione del file di backup.'
      });
    }
  };

  // GESTIONE BACKUP (Copia appunti)
  const handleCopyClipboard = async () => {
    triggerHapticFeedback('selection');
    try {
      const dataStr = exportBackupData();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(dataStr);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = dataStr;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setStatusMessage({
        type: 'success',
        text: '✓ Codice di backup copiato! Incollalo nelle tue Note o inviatelo su WhatsApp.'
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Impossibile copiare negli appunti. Prova a scaricare il file.'
      });
    }
  };

  // GESTIONE RIPRISTINO (File)
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      processRestore(event.target.result);
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Impossibile leggere il file selezionato.'
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Processo di ripristino
  const processRestore = (jsonString) => {
    triggerHapticFeedback('key');
    try {
      const result = importBackupData(jsonString);
      setStatusMessage({
        type: 'success',
        text: `✓ Diario ripristinato con successo! Importati ${result.importedCount} giorni.`
      });
      setPasteText('');
      onRestoreSuccess(result.allLogs);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `✕ Errore: ${err.message || 'File non valido o corrotto'}`
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(2, 8, 15, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
        touchAction: 'pan-y'
      }}
      onClick={onClose}
    >
      <div
        className="stitched-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(6, 22, 37, 0.94)',
          borderRadius: '24px',
          border: '1.5px solid rgba(74, 222, 128, 0.45)',
          boxShadow: 'inset 0 1.5px 0 rgba(74, 222, 128, 0.5), 0 24px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(74, 222, 128, 0.25)',
          padding: '18px 16px',
          position: 'relative',
          overflowY: 'auto',
          boxSizing: 'border-box',
          touchAction: 'pan-y'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODALE: LA PORTICINA SEGRETA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={secretDoorImg}
              alt="Porticina"
              style={{
                width: '34px',
                height: 'auto',
                filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.7))',
                borderRadius: '3px'
              }}
            />
            <div>
              <h2 style={{
                fontFamily: 'var(--font-coraline)',
                fontSize: '16px',
                color: '#4ade80',
                margin: 0,
                letterSpacing: '0.8px',
                textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(74, 222, 128, 0.4)'
              }}>
                La Porticina Segreta
              </h2>
              <div style={{
                fontSize: '11px',
                color: 'var(--coraline-brown)',
                fontFamily: 'var(--font-body)'
              }}>
                Impostazioni & Diario dell'Altro Mondo
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi impostazioni"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--coraline-parchment)',
              opacity: 0.7,
              fontSize: '22px',
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
              touchAction: 'manipulation'
            }}
          >
            ✕
          </button>
        </div>

        {/* NAVIGAZIONE A TAB */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setActiveTab('settings');
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              border: activeTab === 'settings' ? '1.5px solid #4ade80' : '1px solid var(--border-dark-blue)',
              backgroundColor: activeTab === 'settings' ? 'rgba(74, 222, 128, 0.18)' : 'rgba(6, 22, 37, 0.5)',
              color: activeTab === 'settings' ? '#4ade80' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            ⚙ Opzioni
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setActiveTab('backup');
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              border: activeTab === 'backup' ? '1.5px solid var(--coraline-yellow)' : '1px solid var(--border-dark-blue)',
              backgroundColor: activeTab === 'backup' ? 'rgba(216, 198, 21, 0.18)' : 'rgba(6, 22, 37, 0.5)',
              color: activeTab === 'backup' ? 'var(--coraline-yellow)' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            💾 Backup
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setActiveTab('info');
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              border: activeTab === 'info' ? '1.5px solid var(--coraline-gold)' : '1px solid var(--border-dark-blue)',
              backgroundColor: activeTab === 'info' ? 'rgba(199, 164, 14, 0.18)' : 'rgba(6, 22, 37, 0.5)',
              color: activeTab === 'info' ? 'var(--coraline-gold)' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            ✦ Info
          </button>
        </div>

        {/* TAB 1: IMPOSTAZIONI OPERATIVE */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. NOTIFICHE PROMEMORIA */}
            <div style={{
              backgroundColor: 'rgba(4, 16, 28, 0.7)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1px solid var(--border-dark-blue-light)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--coraline-parchment)' }}>
                    Promemoria Topi Saltatori
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--coraline-brown)' }}>
                    Notifica giornaliera se non hai segnato il giorno
                  </div>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => handleToggleReminder(e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#4ade80',
                      cursor: 'pointer'
                    }}
                  />
                </label>
              </div>

              {reminderEnabled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px dashed rgba(26, 69, 110, 0.5)'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--coraline-parchment)' }}>
                    Orario Notifica:
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleChangeReminderTime(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(6, 22, 37, 0.9)',
                      border: '1.5px solid var(--border-dark-blue-light)',
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

              <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    borderRadius: '8px',
                    color: '#4ade80',
                    fontSize: '11px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  ✦ Invia notifica di prova adesso
                </button>
              </div>

              {testNotificationStatus && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  color: testNotificationStatus.startsWith('✓') ? '#4ade80' : '#ef4444',
                  textAlign: 'center'
                }}>
                  {testNotificationStatus}
                </div>
              )}
            </div>

            {/* 2. CHIAVI DI SGARRO MENSILI */}
            <div style={{
              backgroundColor: 'rgba(4, 16, 28, 0.7)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1px solid var(--border-dark-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--coraline-parchment)' }}>
                  Chiavi Jolly per Mese
                </div>
                <div style={{ fontSize: '11px', color: 'var(--coraline-brown)' }}>
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
                    border: '1px solid var(--border-dark-blue)',
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
                  fontSize: '16px',
                  fontWeight: 900,
                  color: 'var(--coraline-yellow)',
                  minWidth: '20px',
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
                    border: '1px solid var(--border-dark-blue)',
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

            {/* 3. VIBRAZIONE APTICA */}
            <div style={{
              backgroundColor: 'rgba(4, 16, 28, 0.7)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1px solid var(--border-dark-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--coraline-parchment)' }}>
                  Feedback Aptico (Vibrazione)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--coraline-brown)' }}>
                  Micro-vibrazioni tattili su tocchi e bottoni
                </div>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hapticsOn}
                  onChange={(e) => handleToggleHaptics(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#4ade80',
                    cursor: 'pointer'
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: DIARIO & BACKUP (INGLOBATO) */}
        {activeTab === 'backup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* STATISTICHE STORICHE */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '6px',
              textAlign: 'center',
              backgroundColor: 'rgba(4, 16, 28, 0.7)',
              padding: '10px 8px',
              borderRadius: '14px',
              border: '1px solid var(--border-dark-blue-light)'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--coraline-brown)' }}>Registrati</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--coraline-yellow)' }}>{totalDays}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--coraline-brown)' }}>Rispettati</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#4ade80' }}>{successCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--coraline-brown)' }}>Sgarri</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#ef4444' }}>{cheatCount + keyCount}</div>
              </div>
            </div>

            {/* SEZIONE ESPORTA */}
            <div style={{
              backgroundColor: 'rgba(4, 16, 28, 0.7)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1px solid var(--border-dark-blue-light)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--coraline-yellow)', marginBottom: '8px' }}>
                ✦ Esporta e Salva il Tuo Diario
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(13, 44, 73, 0.8)',
                    border: '1.5px solid var(--coraline-yellow)',
                    borderRadius: '12px',
                    color: 'var(--coraline-yellow)',
                    padding: '10px 8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  📥 Scarica File .json
                </button>
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(6, 22, 37, 0.8)',
                    border: '1px solid var(--border-dark-blue-light)',
                    borderRadius: '12px',
                    color: 'var(--coraline-parchment)',
                    padding: '10px 8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  {copied ? '✓ Copiato!' : '📋 Copia Codice'}
                </button>
              </div>
            </div>

            {/* SEZIONE IMPORTA */}
            <div style={{
              backgroundColor: 'rgba(4, 16, 28, 0.7)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1px solid var(--border-dark-blue-light)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>
                ✦ Ripristina da Backup
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(21, 128, 61, 0.25)',
                  border: '1.5px dashed #4ade80',
                  borderRadius: '12px',
                  color: '#4ade80',
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '10px',
                  touchAction: 'manipulation'
                }}
              >
                📂 Seleziona file .json dal telefono
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Oppure incolla il codice qui..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(6, 22, 37, 0.9)',
                    border: '1px solid var(--border-dark-blue-light)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    color: 'var(--coraline-parchment)',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => processRestore(pasteText)}
                  disabled={!pasteText.trim()}
                  style={{
                    backgroundColor: 'rgba(74, 222, 128, 0.3)',
                    border: '1px solid #4ade80',
                    borderRadius: '10px',
                    color: '#4ade80',
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: pasteText.trim() ? 'pointer' : 'not-allowed',
                    opacity: pasteText.trim() ? 1 : 0.4
                  }}
                >
                  Ripristina
                </button>
              </div>
            </div>

            {/* MESSAGGI DI STATO */}
            {statusMessage && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: statusMessage.type === 'success' ? 'rgba(21, 128, 61, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                border: `1px solid ${statusMessage.type === 'success' ? '#4ade80' : '#ef4444'}`,
                color: statusMessage.type === 'success' ? '#4ade80' : '#ef4444',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                {statusMessage.text}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INFORMAZIONI APP */}
        {activeTab === 'info' && (
          <div style={{
            backgroundColor: 'rgba(4, 16, 28, 0.7)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border-dark-blue-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <div style={{
                fontFamily: 'var(--font-coraline)',
                fontSize: '16px',
                color: 'var(--coraline-yellow)'
              }}>
                Coraline Tracker (Beta)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--coraline-brown)' }}>
                Dedicato ad Asia ✦
              </div>
            </div>

            <div style={{
              fontSize: '12px',
              color: 'var(--coraline-parchment)',
              lineHeight: 1.5,
              borderTop: '1px dashed rgba(26, 69, 110, 0.5)',
              paddingTop: '10px'
            }}>
              <div>• <strong>Versione:</strong> 2.6-beta (Build Android)</div>
              <div>• <strong>Database:</strong> Locale SQLite / WebStorage cifrato</div>
              <div>• <strong>Notifiche:</strong> Background Engine Android Nativo</div>
              <div>• <strong>Sensori:</strong> Feedback Aptico Hardware Haptic Engine</div>
              <div>• <strong>Stile:</strong> Stop-Motion Dark Fantasy (Laika Inspired)</div>
            </div>

            <div style={{
              marginTop: '6px',
              padding: '8px',
              backgroundColor: 'rgba(6, 22, 37, 0.6)',
              borderRadius: '8px',
              fontSize: '10px',
              color: 'rgba(221, 202, 183, 0.6)',
              textAlign: 'center'
            }}>
              Nessun dato viene inviato a server esterni. I tuoi progressi rimangono al sicuro sul tuo dispositivo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
