import React, { useEffect, useState, useRef } from 'react';
import gearBallImg from '../assets/gear-ball.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { hapticSuccess, hapticLight } from '../utils/haptics';

/**
 * Modal Compatto e Iconico per la Registrazione dell'Allenamento da Calendario:
 * - Zero scritte (niente data, né titolo, né domande).
 * - Sfondo con la spirale / trama vortice di Coraline e palette Bobinsky.
 * - Solo 2 tasti affiancati:
 *   1. Tasto Allenamento Sì con la pallina di Bobinsky
 *   2. Tasto ✕ per chiudere la finestra e annullare la selezione.
 */
export default function DayWorkoutModal({
  isOpen,
  dateStr,
  currentStatus = null,
  onSelectStatus,
  onClose
}) {
  const [visible, setVisible] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isSubmittingRef.current = false;
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen, dateStr]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (!isOpen || !dateStr || dateStr > todayStr) return null;

  const handleSelect = (targetStatus) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    if (currentStatus === targetStatus) {
      hapticLight();
      onSelectStatus(null);
      return;
    }
    hapticSuccess();
    onSelectStatus(targetStatus);
  };

  const handleClose = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    hapticLight();
    onClose();
  };

  return (
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
      onClick={handleClose}
    >
        <div
          className="stitched-card"
          style={{
            width: '100%',
            maxWidth: '240px',
            background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.96) 0%, rgba(5, 17, 30, 0.98) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(141, 109, 82, 0.45)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(141, 109, 82, 0.2)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
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
            className="vortex-bg-layer"
            aria-hidden="true"
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

          {/* GRIGLIA A 2 TASTI */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            position: 'relative',
            zIndex: 1
          }}>
            {/* TASTO 1: PALLINA ALLENAMENTO SÌ */}
            <button
              type="button"
              onClick={() => handleSelect('yes')}
              aria-label={currentStatus === 'yes' ? "Allenamento selezionato: tocca per rimuovere" : "Allenamento Completato"}
              title={currentStatus === 'yes' ? "Tocca per rimuovere l'allenamento" : "Allenamento Completato"}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90px',
                borderRadius: '18px',
                backgroundColor: currentStatus === 'yes'
                  ? 'rgba(48, 28, 16, 0.92)'
                  : 'rgba(6, 22, 37, 0.8)',
                border: currentStatus === 'yes'
                  ? '2px solid rgb(197, 155, 109)'
                  : '1.5px solid rgba(141, 109, 82, 0.35)',
                boxShadow: currentStatus === 'yes'
                  ? 'inset 0 1px 0 rgba(212, 210, 187, 0.35), 0 0 18px rgba(197, 155, 109, 0.5), inset 0 0 14px rgba(141, 109, 82, 0.4)'
                  : 'inset 0 1px 0 rgba(221, 202, 183, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(141, 109, 82, 0.12)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{
                width: '54px',
                height: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: currentStatus === 'yes'
                  ? 'drop-shadow(0 0 10px rgba(197, 155, 109, 0.8))'
                  : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
              }}>
                <img
                  src={gearBallImg}
                  alt=""
                  width={54}
                  height={54}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              {currentStatus === 'yes' && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: 'rgb(197, 155, 109)'
                }}>✓</span>
              )}
            </button>

            {/* TASTO 2: TASTO ✕ PER CHIUDERE E ANNULLARE LA SELEZIONE */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Chiudi finestra"
              title="Chiudi"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90px',
                borderRadius: '18px',
                backgroundColor: 'rgba(6, 22, 37, 0.55)',
                border: '1.5px solid rgba(141, 109, 82, 0.35)',
                boxShadow: 'inset 0 1px 0 rgba(221, 202, 183, 0.15), 0 4px 12px rgba(0, 0, 0, 0.35)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(3, 10, 18, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--coraline-parchment)',
                fontSize: '18px',
                lineHeight: 1
              }}>
                ✕
              </div>
            </button>
          </div>
        </div>
      </div>
  );
}
