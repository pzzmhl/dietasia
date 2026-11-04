import React, { useEffect, useState } from 'react';
import gearBallImg from '../assets/gear-ball.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { triggerHapticFeedback } from '../services/haptics';
import BobinskyReactionModal from './BobinskyReactionModal';

/**
 * Modal Rapido per la Registrazione dell'Allenamento da Calendario:
 * - Sfondo con la spirale / trama vortice di Coraline.
 * - Data in piccolo in font Coraline (blu scuro di Coraline).
 * - Scritta sottostante in bianco.
 */
export default function DayWorkoutModal({
  isOpen,
  dateStr,
  currentStatus = null,
  onSelectStatus,
  onClose
}) {
  const [visible, setVisible] = useState(false);
  const [reactionStatus, setReactionStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (!isOpen || !dateStr || dateStr > todayStr) return null;

  const dateObj = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const rawDate = dateObj.toLocaleDateString('it-IT', options)
    .replace(/ì/g, 'i')
    .replace(/í/g, 'i')
    .replace(/Ì/g, 'I')
    .replace(/Í/g, 'I');
  const capitalizedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const handleSelectWithReaction = (targetStatus) => {
    const nextStatus = currentStatus === targetStatus ? null : targetStatus;
    if (nextStatus) {
      triggerHapticFeedback(nextStatus === 'yes' ? 'success' : 'cheat');
      setReactionStatus(nextStatus);
    } else {
      triggerHapticFeedback('selection');
      onSelectStatus(null);
    }
  };

  return (
    <>
      <BobinskyReactionModal
        status={reactionStatus}
        onClose={() => {
          const s = reactionStatus;
          setReactionStatus(null);
          onSelectStatus(s);
        }}
      />

      <div
        style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(3, 10, 18, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
        willChange: 'opacity',
        transform: 'translateZ(0)'
      }}
      onClick={onClose}
    >
      <div
        className="stitched-card vortex-card"
        style={{
          width: '100%',
          maxWidth: '300px',
          background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.96) 0%, rgba(5, 17, 30, 0.98) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1.5px solid rgba(141, 109, 82, 0.45)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(141, 109, 82, 0.2)',
          padding: '22px 18px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          transform: visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 14px, 0) scale(0.96)',
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TRAMA VORTICE DI CORALINE SULLO SFONDO */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.12,
            filter: 'blur(1.5px)',
            WebkitFilter: 'blur(1.5px)',
            maskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.2) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.2) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* Pulsante chiusura ✕ */}
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('selection');
            onClose();
          }}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '10px',
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

        {/* Intestazione Data */}
        <div style={{ textAlign: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontSize: '13px',
            fontFamily: 'var(--font-coraline)',
            color: '#4686cb',
            letterSpacing: '0.6px',
            margin: '0 0 4px 0',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(70, 134, 203, 0.45)'
          }}>
            {capitalizedDate}
          </h3>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: '#ffffff',
            fontWeight: 600,
            letterSpacing: '0.4px',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
          }}>
            Allenamento
          </div>
        </div>

        {/* Palla Cambio Marcia */}
        <div style={{
          width: '68px',
          height: '68px',
          margin: '0 auto 12px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <img
            src={gearBallImg}
            alt="Palla Allenamento"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 8px rgba(139, 229, 116, 0.35))'
            }}
          />
        </div>

        <p style={{
          fontSize: '12px',
          fontFamily: 'var(--font-body)',
          color: '#ffffff',
          textAlign: 'center',
          margin: '0 0 16px 0',
          position: 'relative',
          zIndex: 1,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
        }}>
          Ti sei allenata in questa data?
        </p>

        {/* Due Opzioni: SÌ e NO (uguali, nel tema di Bobinsky senza verde né rosso) */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => handleSelectWithReaction('yes')}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '14px',
              backgroundColor: currentStatus === 'yes' ? 'rgba(20, 10, 32, 0.95)' : 'rgba(6, 20, 34, 0.75)',
              border: currentStatus === 'yes' ? '1.5px solid rgb(141, 109, 82)' : '1px solid rgba(141, 109, 82, 0.45)',
              boxShadow: currentStatus === 'yes' ? '0 2px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(221, 202, 183, 0.25), 0 0 10px rgba(141, 109, 82, 0.3)' : 'none',
              color: currentStatus === 'yes' ? '#ffffff' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            {currentStatus === 'yes' ? '✓ Sì' : 'Sì'}
          </button>

          <button
            type="button"
            onClick={() => handleSelectWithReaction('no')}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '14px',
              backgroundColor: currentStatus === 'no' ? 'rgba(20, 10, 32, 0.95)' : 'rgba(6, 20, 34, 0.75)',
              border: currentStatus === 'no' ? '1.5px solid rgb(141, 109, 82)' : '1px solid rgba(141, 109, 82, 0.45)',
              boxShadow: currentStatus === 'no' ? '0 2px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(221, 202, 183, 0.25), 0 0 10px rgba(141, 109, 82, 0.3)' : 'none',
              color: currentStatus === 'no' ? '#ffffff' : 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease'
            }}
          >
            {currentStatus === 'no' ? '✓ No' : 'No'}
          </button>
        </div>

        {/* Cancella Registrazione se presente */}
        {currentStatus && (
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              onSelectStatus(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--coraline-parchment)',
              opacity: 0.65,
              fontSize: '11px',
              fontFamily: 'var(--font-gothic)',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px 8px',
              position: 'relative',
              zIndex: 1
            }}
          >
            ↺ Cancella selezione
          </button>
        )}
      </div>
    </div>
    </>
  );
}
