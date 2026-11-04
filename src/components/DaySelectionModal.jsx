import React, { useEffect, useState, useRef } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import keyImg from '../assets/key.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { 
  hapticButtonStitch, 
  hapticSuccess, 
  hapticLight 
} from '../utils/haptics';

/**
 * Modal Compatto e Iconico per la Registrazione Esito Giornaliero:
 * - Sfondo con la spirale / trama vortice di Coraline.
 * - Intestazione:
 *   - Data in piccolo in font Coraline (blu scuro di Coraline).
 *   - Domanda sottostante in bianco brillante ("Come è andata questa giornata?").
 * - 4 Riquadri in griglia 2x2 con i simboli:
 *   1. In alto a sinistra: Dieta Rispettata (Pietra verde)
 *   2. In alto a destra: Dieta Non Rispettata (Bottone nero)
 *   3. In basso a sinistra: Giorno di Libertà con Chiave (Chiave jolly)
 *   4. In basso a destra: X per chiudere la finestra
 */
export default function DaySelectionModal({ 
  isOpen, 
  dateStr, 
  currentStatus = 'neutral', 
  remainingKeys = 0,
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

  const handleSelect = (status) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    const isDeselecting = currentStatus === status;
    if (isDeselecting) {
      hapticLight();
      onSelectStatus('neutral');
      return;
    }
    if (status === 'cheat') {
      hapticButtonStitch();
    } else {
      hapticSuccess();
    }
    onSelectStatus(status);
  };

  const handleClose = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    hapticLight();
    onClose();
  };

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (!isOpen || !dateStr || dateStr > todayStr) return null;

  // La chiave è utilizzabile se ce ne sono disponibili o se è già stata assegnata a questo giorno
  const canUseKey = remainingKeys > 0 || currentStatus === 'cheat_key';

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
          background: 'linear-gradient(180deg, rgba(13, 44, 73, 0.94) 0%, rgba(6, 22, 37, 0.96) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-dark-blue-light)',
          boxShadow: 'inset 0 1.5px 0 rgba(216, 198, 21, 0.35), 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(26, 69, 110, 0.4)',
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

        {/* GRIGLIA 2x2 DEI 4 RIQUADRI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* 1. IN ALTO A SINISTRA: PIETRA VERDE (ROTTA MANTENUTA) */}
          <button
            type="button"
            onClick={() => handleSelect('success')}
            aria-label={currentStatus === 'success' ? "Pietra Verde selezionata: tocca per rimuovere" : "Pietra Verde: Rotta Mantenuta"}
            title={currentStatus === 'success' ? "Tocca per rimuovere la selezione" : "Pietra Verde: Rotta Mantenuta"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: currentStatus === 'success' 
                ? 'rgba(18, 48, 35, 0.92)' 
                : 'rgba(6, 22, 37, 0.8)',
              border: currentStatus === 'success' 
                ? '2px solid #4ade80' 
                : '1.5px solid rgba(74, 222, 128, 0.35)',
              boxShadow: currentStatus === 'success' 
                ? 'inset 0 1px 0 rgba(74, 222, 128, 0.5), 0 0 18px rgba(74, 222, 128, 0.5), inset 0 0 14px rgba(21, 128, 61, 0.4)' 
                : 'inset 0 1px 0 rgba(221, 202, 183, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(74, 222, 128, 0.12)',
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
              filter: currentStatus === 'success' 
                ? 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))' 
                : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
            }}>
              <img 
                src={seeingStoneImg} 
                alt="" 
                width={54}
                height={54}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  transform: 'rotate(-8deg)'
                }} 
              />
            </div>
            {currentStatus === 'success' && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#4ade80'
              }}>✓</span>
            )}
          </button>

          {/* 2. IN ALTO A DESTRA: BOTTONE NERO (GIORNO FUORI SENTIERO) */}
          <button
            type="button"
            onClick={() => handleSelect('cheat')}
            aria-label={currentStatus === 'cheat' ? "Bottone Nero selezionato: tocca per rimuovere" : "Bottone Nero: Fuori Sentiero"}
            title={currentStatus === 'cheat' ? "Tocca per rimuovere la selezione" : "Bottone Nero: Fuori Sentiero"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: currentStatus === 'cheat' 
                ? 'rgba(50, 18, 22, 0.92)' 
                : 'rgba(6, 22, 37, 0.8)',
              border: currentStatus === 'cheat' 
                ? '2px solid #ef4444' 
                : '1.5px solid rgba(239, 68, 68, 0.35)',
              boxShadow: currentStatus === 'cheat' 
                ? 'inset 0 1px 0 rgba(239, 68, 68, 0.5), 0 0 18px rgba(239, 68, 68, 0.5), inset 0 0 14px rgba(185, 28, 28, 0.4)' 
                : 'inset 0 1px 0 rgba(221, 202, 183, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(239, 68, 68, 0.12)',
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
              filter: currentStatus === 'cheat' 
                ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))' 
                : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
            }}>
              <img 
                src={blackButtonImg} 
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
            {currentStatus === 'cheat' && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#ef4444'
              }}>✓</span>
            )}
          </button>

          {/* 3. IN BASSO A SINISTRA: CHIAVE DELLA LIBERTÀ (AURA ORO) */}
          <button
            type="button"
            onClick={() => {
              if (!canUseKey) return;
              handleSelect('cheat_key');
            }}
            disabled={!canUseKey}
            aria-label={currentStatus === 'cheat_key' ? "Chiave della Libertà selezionata: tocca per rimuovere" : "Chiave della Libertà"}
            title={currentStatus === 'cheat_key' ? "Tocca per rimuovere la chiave" : (canUseKey ? "Giorno di Libertà (Chiave Nera)" : "Nessuna chiave disponibile")}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '90px',
              borderRadius: '18px',
              backgroundColor: currentStatus === 'cheat_key' 
                ? 'rgba(48, 40, 14, 0.92)' 
                : 'rgba(6, 22, 37, 0.8)',
              border: currentStatus === 'cheat_key' 
                ? '2px solid var(--coraline-yellow)' 
                : '1.5px solid rgba(216, 198, 21, 0.35)',
              boxShadow: currentStatus === 'cheat_key' 
                ? 'inset 0 1px 0 rgba(216, 198, 21, 0.5), 0 0 18px rgba(216, 198, 21, 0.5), inset 0 0 14px rgba(161, 98, 7, 0.4)' 
                : 'inset 0 1px 0 rgba(221, 202, 183, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(216, 198, 21, 0.12)',
              cursor: canUseKey ? 'pointer' : 'not-allowed',
              opacity: canUseKey ? 1 : 0.35,
              touchAction: 'manipulation',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: currentStatus === 'cheat_key' 
                ? 'drop-shadow(0 0 10px rgba(216, 198, 21, 0.8))' 
                : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
            }}>
              <img 
                src={keyImg} 
                alt="" 
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  transform: 'rotate(-25deg)'
                }} 
              />
            </div>
            {currentStatus === 'cheat_key' && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '11px',
                fontWeight: 900,
                color: 'var(--coraline-yellow)'
              }}>✓</span>
            )}
          </button>

          {/* 4. IN BASSO A DESTRA: TASTO ✕ PER CHIUDERE E ANNULLARE LA SELEZIONE */}
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
              border: '1.5px solid rgba(221, 202, 183, 0.22)',
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
