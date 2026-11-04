import React, { useEffect, useState, useRef } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import keyImg from '../assets/key.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { 
  triggerHapticFeedback, 
  hapticButtonStitch, 
  hapticSuccess, 
  hapticLight, 
  hapticWarning 
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
  const [confirmReset, setConfirmReset] = useState(false);
  const isSubmittingRef = useRef(false);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    setConfirmReset(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (isOpen) {
      isSubmittingRef.current = false;
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen, dateStr]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleSelect = (status) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
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

  // Formattazione data in italiano senza anno (es. Lunedi 2 Novembre) con "i" normale al posto di "ì"
  const dateObj = new Date(dateStr + 'T12:00:00');
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const rawDate = dateObj.toLocaleDateString('it-IT', options)
    .replace(/ì/g, 'i')
    .replace(/í/g, 'i')
    .replace(/Ì/g, 'I')
    .replace(/Í/g, 'I');
  const capitalizedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

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
      onClick={onClose}
    >
      <div
        className="stitched-card vortex-card"
        style={{
          width: '100%',
          maxWidth: '290px',
          background: 'linear-gradient(180deg, rgba(13, 44, 73, 0.94) 0%, rgba(6, 22, 37, 0.96) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-dark-blue-light)',
          boxShadow: 'inset 0 1.5px 0 rgba(216, 198, 21, 0.35), 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(26, 69, 110, 0.4)',
          padding: '20px 16px 16px 16px',
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

        {/* Pulsante chiusura rapida ✕ */}
        <button
          type="button"
          onClick={handleClose}
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

        {/* Intestazione Data & Domanda */}
        <div style={{ textAlign: 'center', marginBottom: '16px', padding: '0 6px', position: 'relative', zIndex: 1 }}>
          {/* Data in piccolo in font Coraline nel colore blu scuro di Coraline */}
          <h3 style={{
            fontSize: '13px',
            fontFamily: 'var(--font-coraline)',
            color: '#4686cb',
            letterSpacing: '0.6px',
            lineHeight: 1.25,
            margin: '0 0 5px 0',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(70, 134, 203, 0.45)'
          }}>
            {capitalizedDate}
          </h3>

          {/* Scritta sotto in BIANCO */}
          <p style={{
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            color: '#ffffff',
            fontWeight: 500,
            lineHeight: 1.35,
            margin: 0,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.85)'
          }}>
            Come è andata questa giornata?
          </p>
        </div>

        {/* GRIGLIA 2x2 DEI 4 RIQUADRI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '6px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* 1. IN ALTO A SINISTRA: PIETRA VERDE (ROTTA MANTENUTA) */}
          <button
            type="button"
            onClick={() => {
              hapticSuccess();
              handleSelect(currentStatus === 'success' ? 'neutral' : 'success');
            }}
            aria-label="Pietra Verde: Rotta Mantenuta"
            title="Pietra Verde: Rotta Mantenuta"
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
            onClick={() => {
              hapticButtonStitch();
              handleSelect(currentStatus === 'cheat' ? 'neutral' : 'cheat');
            }}
            aria-label="Bottone Nero: Fuori Sentiero"
            title="Bottone Nero: Fuori Sentiero"
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
              hapticSuccess();
              handleSelect(currentStatus === 'cheat_key' ? 'neutral' : 'cheat_key');
            }}
            disabled={!canUseKey}
            aria-label="Chiave della Libertà"
            title={canUseKey ? "Giorno di Libertà (Chiave Nera)" : "Nessuna chiave disponibile"}
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

          {/* 4. IN BASSO A DESTRA: AZZERA (SE REGISTRATO) OPPURE ANNULLA */}
          {currentStatus !== 'neutral' ? (
            <button
              type="button"
              onClick={() => {
                if (!confirmReset) {
                  hapticLight();
                  setConfirmReset(true);
                  if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                  resetTimerRef.current = setTimeout(() => {
                    setConfirmReset(false);
                  }, 3500);
                } else {
                  if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                  setConfirmReset(false);
                  hapticWarning();
                  handleSelect('neutral');
                }
              }}
              aria-label={confirmReset ? 'Conferma azzeramento esito' : 'Azzera esito registrato'}
              title={confirmReset ? 'Tocca di nuovo per confermare' : 'Azzera esito'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90px',
                borderRadius: '18px',
                backgroundColor: confirmReset ? 'rgba(50, 18, 22, 0.94)' : 'rgba(26, 32, 44, 0.75)',
                border: confirmReset ? '2px solid #ef4444' : '1.5px solid rgba(221, 202, 183, 0.35)',
                boxShadow: confirmReset
                  ? '0 0 16px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(185, 28, 28, 0.3)'
                  : 'inset 0 1px 0 rgba(221, 202, 183, 0.2), 0 4px 12px rgba(0, 0, 0, 0.45)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s ease',
                gap: '6px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: confirmReset ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 20, 34, 0.85)',
                border: confirmReset ? '1.5px solid #ef4444' : '1px solid rgba(221, 202, 183, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: confirmReset ? '#ef4444' : 'var(--coraline-parchment)',
                fontSize: '17px',
                lineHeight: 1
              }}>
                ↺
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-gothic)',
                fontWeight: confirmReset ? 800 : 700,
                color: confirmReset ? '#fca5a5' : 'var(--coraline-parchment)',
                letterSpacing: '0.4px'
              }}>
                {confirmReset ? 'Confermi?' : 'Azzera'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onClose();
              }}
              aria-label="Chiudi finestra"
              title="Chiudi"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90px',
                borderRadius: '18px',
                backgroundColor: 'rgba(6, 22, 37, 0.55)',
                border: '1.5px solid rgba(221, 202, 183, 0.18)',
                boxShadow: 'inset 0 1px 0 rgba(221, 202, 183, 0.15), 0 4px 12px rgba(0, 0, 0, 0.35)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s ease',
                gap: '6px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(3, 10, 18, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--coraline-parchment)',
                fontSize: '14px',
                lineHeight: 1
              }}>
                ✕
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-gothic)',
                fontWeight: 700,
                color: 'var(--coraline-parchment)',
                opacity: 0.75,
                letterSpacing: '0.4px'
              }}>
                Annulla
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
