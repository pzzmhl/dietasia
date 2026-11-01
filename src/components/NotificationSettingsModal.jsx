import React, { useState, useEffect } from 'react';
import jumpingMouseImg from '../assets/jumping-mouse.png';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendTestNotification
} from '../services/notifications';

/**
 * Modal per Gestire il Promemoria Quotidiano dei Topi Saltatori:
 * Permette ad Asia di scegliere l'orario esatto (es. 20:00) per ricevere la notifica
 * push sul proprio telefono ogni giorno.
 */
export default function NotificationSettingsModal({
  isOpen,
  onClose
}) {
  const [enabled, setEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [testSent, setTestSent] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getNotificationSettings();
      setEnabled(current.enabled);
      setReminderTime(current.time);
      const timer = setTimeout(() => setVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      setTestSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    saveNotificationSettings(enabled, reminderTime);

    if (enabled) {
      await requestNotificationPermission();
      await scheduleDailyReminder(reminderTime);
    } else {
      await cancelDailyReminder();
    }

    onClose();
  };

  const handleSendTest = async () => {
    setTestSent(true);
    await sendTestNotification();
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(6, 18, 30, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'linear-gradient(180deg, #0d2c49 0%, #061625 100%)',
          borderRadius: '24px',
          border: '2px solid var(--coraline-yellow)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(216, 198, 21, 0.35)',
          padding: '22px 20px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsante Chiusura "✕" */}
        <button
          onClick={onClose}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--coraline-parchment)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          ✕
        </button>

        {/* Intestazione con Icona Topo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: 'rgba(6, 22, 37, 0.8)',
            border: '1.5px solid var(--coraline-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <img
              src={jumpingMouseImg}
              alt="Topo Saltatore"
              style={{ width: '42px', height: '42px', objectFit: 'contain' }}
            />
          </div>

          <div>
            <h3 style={{
              margin: 0,
              color: 'var(--coraline-yellow)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              Promemoria Topi Saltatori
            </h3>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '11px',
              color: 'var(--coraline-parchment)',
              opacity: 0.8
            }}>
              Notifiche quotidiane per Asia
            </p>
          </div>
        </div>

        {/* Switch Attiva/Disattiva */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(6, 22, 37, 0.7)',
          padding: '12px 14px',
          borderRadius: '16px',
          border: '1px solid var(--border-dark-blue)',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{
              color: 'var(--coraline-parchment)',
              fontSize: '13px',
              fontWeight: 700
            }}>
              Attiva Notifica Giornaliera
            </div>
            <div style={{
              color: 'var(--coraline-gold)',
              fontSize: '10px',
              marginTop: '2px'
            }}>
              {enabled ? 'I topi suoneranno all’ora scelta' : 'Notifiche spente'}
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setEnabled((prev) => !prev)}
            aria-label="Attiva disattiva notifica"
            style={{
              width: '46px',
              height: '26px',
              borderRadius: '14px',
              backgroundColor: enabled ? 'var(--coraline-yellow)' : 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
              padding: '2px'
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#061625',
              transform: enabled ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </button>
        </div>

        {/* Selezione Orario (es. 20:00) */}
        {enabled && (
          <div style={{
            backgroundColor: 'rgba(6, 22, 37, 0.7)',
            padding: '14px',
            borderRadius: '16px',
            border: '1.5px solid var(--border-dark-blue-light)',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--coraline-yellow)',
              fontWeight: 800,
              marginBottom: '8px'
            }}>
              Orario del Promemoria
            </label>

            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              style={{
                width: '140px',
                padding: '8px 12px',
                fontSize: '22px',
                fontWeight: 900,
                textAlign: 'center',
                backgroundColor: '#061625',
                color: 'var(--coraline-yellow)',
                border: '2px solid var(--coraline-gold)',
                borderRadius: '12px',
                outline: 'none',
                fontFamily: 'monospace',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
              }}
            />

            <p style={{
              margin: '8px 0 0 0',
              fontSize: '11px',
              color: 'var(--coraline-parchment)',
              opacity: 0.75,
              lineHeight: 1.3
            }}>
              Ogni giorno a quest'ora riceverai un promemoria per completare il diario.
            </p>
          </div>
        )}

        {/* Pulsante Prova Notifica */}
        {enabled && (
          <button
            onClick={handleSendTest}
            disabled={testSent}
            style={{
              backgroundColor: 'rgba(216, 198, 21, 0.12)',
              border: '1px dashed var(--coraline-gold)',
              borderRadius: '12px',
              padding: '8px 12px',
              color: 'var(--coraline-yellow)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{testSent ? '✓ Notifica inviata!' : 'Invia notifica di prova subito'}</span>
          </button>
        )}

        {/* Tasto Salva */}
        <button
          onClick={handleSave}
          style={{
            backgroundColor: 'var(--coraline-yellow)',
            color: '#061625',
            border: 'none',
            borderRadius: '14px',
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(216, 198, 21, 0.35)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Salva Promemoria
        </button>
      </div>
    </div>
  );
}

