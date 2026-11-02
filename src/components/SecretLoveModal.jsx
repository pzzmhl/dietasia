import React, { useEffect, useState } from 'react';
import { triggerHapticFeedback } from '../services/haptics';

/**
 * Riquadro Segreto Speciale per Asia (Easter Egg della Porticina Segreta)
 * Si attiva tenendo premuta la Porticina Segreta in fondo all'app.
 */
export default function SecretLoveModal({ isOpen, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      triggerHapticFeedback('key');
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    triggerHapticFeedback('selection');
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Messaggio speciale per Asia"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        backgroundColor: 'rgba(2, 8, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        touchAction: 'pan-y'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="stitched-card vortex-card"
        style={{
          width: '100%',
          maxWidth: '310px',
          padding: '30px 22px 24px 22px',
          borderRadius: '24px',
          border: '2px solid var(--coraline-yellow)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 25px rgba(216, 198, 21, 0.4), inset 0 1.5px 0 rgba(216, 198, 21, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          transform: visible ? 'scale(1) translateZ(0)' : 'scale(0.92) translateZ(0)',
          transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
      >
        {/* Pulsante chiusura rapida ✕ */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
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

        {/* Simbolo del Cuore Pulsante */}
        <div
          style={{
            fontSize: '36px',
            lineHeight: 1,
            marginBottom: '14px',
            filter: 'drop-shadow(0 0 14px rgba(239, 68, 68, 0.75))',
            animation: 'loveHeartPulse 2s ease-in-out infinite',
            userSelect: 'none'
          }}
        >
          ❤️
        </div>

        {/* Titolo "Ti amo" in Font Ufficiale Coraline */}
        <h2
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '34px',
            color: 'var(--coraline-yellow)',
            letterSpacing: '1.5px',
            margin: '0 0 10px 0',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 16px rgba(216, 198, 21, 0.65)',
            lineHeight: 1.15
          }}
        >
          Ti amo
        </h2>

        {/* Messaggio affettuoso e poetico in stile Coraline */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--coraline-parchment)',
            opacity: 0.9,
            margin: '0 0 22px 0',
            lineHeight: 1.45
          }}
        >
          ✦ Più di ogni stella nel cielo notturno, in questo mondo e nell'Altro Mondo. ✦
        </p>

        {/* Pulsante per chiudere */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            backgroundColor: 'rgba(216, 198, 21, 0.16)',
            border: '1.5px solid var(--coraline-yellow)',
            color: 'var(--coraline-yellow)',
            borderRadius: '12px',
            padding: '9px 24px',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'manipulation',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(216, 198, 21, 0.25)',
            transition: 'transform 0.15s ease'
          }}
        >
          ✦ Chiudi ✦
        </button>
      </div>

      <style>{`
        @keyframes loveHeartPulse {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.22);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.15);
          }
          60% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

