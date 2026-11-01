import React, { useState, useEffect } from 'react';
import KeyIcon from './KeyIcon';

/**
 * Modal Impostazioni: "Regole dell'Altro Mondo"
 * Permette di configurare il numero di Chiavi Nere Jolly al mese (default: 4).
 */
export default function SettingsModal({ 
  isOpen, 
  keysPerMonth, 
  onSaveKeysPerMonth, 
  onClose 
}) {
  const [tempCount, setTempCount] = useState(keysPerMonth);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempCount(keysPerMonth);
      const timer = setTimeout(() => setVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen, keysPerMonth]);

  if (!isOpen) return null;

  const handleIncrement = () => setTempCount((prev) => Math.min(prev + 1, 15));
  const handleDecrement = () => setTempCount((prev) => Math.max(prev - 1, 1));

  const handleSave = () => {
    onSaveKeysPerMonth(tempCount);
    onClose();
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
          borderRadius: '22px',
          border: '2px dashed var(--coraline-gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(199, 164, 14, 0.3)',
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.96)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsante Chiusura "✕" */}
        <button
          onClick={onClose}
          aria-label="Chiudi impostazioni"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 22, 37, 0.8)',
            border: '1px solid rgba(199, 164, 14, 0.4)',
            color: 'var(--coraline-parchment)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          ✕
        </button>

        {/* Intestazione */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-gothic)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--coraline-gold)',
            marginBottom: '4px',
            fontWeight: 700
          }}>
            ✦ Impostazioni ✦
          </div>
          <h3 style={{
            fontSize: '17px',
            fontFamily: 'var(--font-gothic)',
            color: 'var(--coraline-parchment)',
            fontWeight: 800
          }}>
            Regole dell'Altro Mondo
          </h3>
        </div>

        {/* Blocco Configurazione Chiavi al mese */}
        <div style={{
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px dashed rgba(199, 164, 14, 0.35)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <KeyIcon size={22} />
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-gothic)', fontWeight: 700, color: 'var(--coraline-parchment)' }}>
              Chiavi Nere al mese
            </span>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--coraline-parchment)', opacity: 0.75, marginBottom: '14px', lineHeight: 1.4 }}>
            Le chiavi fungono da jolly per i pasti fuori dieta pianificati, evitando di cucire un Bottone Nero.
          </p>

          {/* Stepper numerico + e - */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(13, 44, 73, 0.85)',
            borderRadius: '12px',
            padding: '6px 12px',
            border: '1px solid rgba(199, 164, 14, 0.4)'
          }}>
            <button
              onClick={handleDecrement}
              disabled={tempCount <= 1}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 22, 37, 0.9)',
                border: '1px solid rgba(199, 164, 14, 0.4)',
                color: tempCount <= 1 ? '#475569' : 'var(--coraline-yellow)',
                fontSize: '20px',
                fontWeight: 700,
                cursor: tempCount <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              -
            </button>

            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-gothic)',
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--coraline-yellow)'
              }}>
                {tempCount}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--coraline-parchment)', opacity: 0.8, display: 'block' }}>
                chiavi mensili
              </span>
            </div>

            <button
              onClick={handleIncrement}
              disabled={tempCount >= 15}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 22, 37, 0.9)',
                border: '1px solid rgba(199, 164, 14, 0.4)',
                color: 'var(--coraline-yellow)',
                fontSize: '20px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Pulsante Salva Impostazioni */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            backgroundColor: 'var(--coraline-gold)',
            color: '#061625',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.8px',
            padding: '13px',
            borderRadius: '12px',
            border: '1.5px dashed #061625',
            boxShadow: '0 4px 15px rgba(199, 164, 14, 0.45)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Salva Regole
        </button>
      </div>
    </div>
  );
}
