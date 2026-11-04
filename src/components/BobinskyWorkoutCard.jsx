import React, { useState, useRef } from 'react';
import bobinskyImg from '../assets/bobinsky-training.webp';
import circusBg from '../assets/bobinsky-circus-bg.webp';
import { hapticSuccess, hapticLight } from '../utils/haptics';
import BobinskyReactionModal from './BobinskyReactionModal';

/**
 * Notifica / Card del Grande Bobinsky:
 * - Bordo e accenti nel colore specificato dall'utente: RGB(141, 109, 82).
 * - Bobinsky a sinistra grande e ben visibile (92px).
 * - Titolo in font Coraline "Allenamento?" in rgb(141, 109, 82).
 * - Sottotitolo con data e spiegazione in font normale.
 * - Pulsanti [Sì] e [No] allineati.
 * - Se già registrato, mostra un nastro di stato gentile (guilt-free) con opzione "Modifica",
 *   senza sparire nel nulla.
 */
const BobinskyWorkoutCard = React.memo(function BobinskyWorkoutCard({ 
  todayStr,
  workoutLogs: propWorkoutLogs,
  onSaveWorkout,
  reactionStatus: propReactionStatus,
  onReactionStatusChange: propOnReactionStatusChange
}) {
  // Mappa di allenamenti per data con fallback in memoria
  const [localWorkoutLogs, setLocalWorkoutLogs] = useState(() => propWorkoutLogs || {});
  const [isEditing, setIsEditing] = useState(false);
  const [internalReactionStatus, setInternalReactionStatus] = useState(null);
  const isSubmittingRef = useRef(false);

  const workoutLogs = propWorkoutLogs || localWorkoutLogs;
  const todayStatus = workoutLogs[todayStr] || null;

  const reactionStatus = propReactionStatus !== undefined ? propReactionStatus : internalReactionStatus;
  const setReactionStatus = (val) => {
    if (propOnReactionStatusChange) {
      propOnReactionStatusChange(val);
    } else {
      setInternalReactionStatus(val);
    }
  };

  // Formatta data odierna in italiano senza accenti su "i" (es. "Lunedi 2 Novembre")
  const formatItalianDate = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0);
      const daysOfWeek = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
      const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
      const dayName = daysOfWeek[date.getDay()];
      const monthName = months[m - 1];
      return `${dayName} ${d} ${monthName}`;
    } catch (e) {
      return dStr;
    }
  };

  const handleSelectOption = (status) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);

    if (status === 'yes') {
      hapticSuccess();
    } else {
      hapticLight();
    }
    
    // Salva l'allenamento per oggi
    if (onSaveWorkout) {
      onSaveWorkout(todayStr, status);
    } else {
      const updated = { ...workoutLogs, [todayStr]: status };
      setLocalWorkoutLogs(updated);
      try {
        localStorage.setItem('coraline_workout_logs', JSON.stringify(updated));
      } catch (e) {
        console.error('Errore salvataggio allenamento Bobinsky:', e);
      }
    }

    setReactionStatus(status);
    setIsEditing(false);
  };

  // Colore esatto indicato: R:141 G:109 B:82
  const bobinskyColor = 'rgb(141, 109, 82)';

  return (
    <>
      {/* MODAL REAZIONE FOTOGRAFICA BOBINSKY (SFONDO SFOCATO) */}
      <BobinskyReactionModal
        status={reactionStatus}
        onClose={() => {
          setReactionStatus(null);
        }}
      />

      <div
        role="region"
        aria-label="Avviso Allenamento Bobinsky"
        className="stitched-card"
        style={{
          width: '100%',
          marginBottom: '16px',
          borderRadius: '20px',
          background: 'rgba(5, 17, 30, 0.92)',
          border: `2px dashed ${bobinskyColor}`,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(141, 109, 82, 0.28), inset 0 0 15px rgba(141, 109, 82, 0.15)',
          padding: '18px 16px 18px 14px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          touchAction: 'manipulation',
          animation: 'bobinskyNoticeEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* SFONDO CIRCO DI TOPI DI BOBINSKY BEN VISIBILE */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${circusBg})`,
            backgroundPosition: 'center 46%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.82,
            filter: 'brightness(0.78) contrast(1.08)',
            WebkitFilter: 'brightness(0.78) contrast(1.08)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* VELATURA LEGGERA SFUMATA PER GARANTIRE PERFETTA LEGGIBILITÀ AI TESTI */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(5, 17, 30, 0.35) 0%, rgba(5, 17, 30, 0.45) 45%, rgba(5, 17, 30, 0.65) 100%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* LATO SINISTRO: IL GRANDE BOBINSKY GRANDE E BEN VISIBILE (92px) */}
        <div
          style={{
            flexShrink: 0,
            width: '92px',
            height: '92px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            animation: 'bobinskyNoticeFloat 3.5s ease-in-out infinite',
            willChange: 'transform'
          }}
        >
          <img
            src={bobinskyImg}
            alt="Il Grande Bobinsky"
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(141, 109, 82, 0.35))',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* LATO DESTRO: FONT CORALINE "Allenamento?", DATA E PULSANTI ALLINEATI */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left'
          }}
        >
          {/* Titolo in Font Coraline */}
          <div
            style={{
              fontFamily: 'var(--font-coraline)',
              fontSize: '18px',
              color: bobinskyColor,
              letterSpacing: '0.8px',
              lineHeight: 1.15,
              marginBottom: '4px',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(141, 109, 82, 0.45)'
            }}
          >
            {todayStatus && !isEditing ? 'Allenamento' : 'Allenamento?'}
          </div>

          {/* Specifica del giorno esatto in italiano */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11.5px',
              color: 'var(--coraline-parchment)',
              opacity: 0.9,
              lineHeight: 1.35,
              marginBottom: '10px',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)'
            }}
          >
            <span style={{ color: bobinskyColor, fontWeight: 700 }}>
              {formatItalianDate(todayStr)}
            </span>
            <span style={{ opacity: 0.75 }}>
              {todayStatus && !isEditing
                ? todayStatus === 'yes'
                  ? ' — I topi saltatori acclamano il tuo impegno!'
                  : ' — Giorno di riposo per ricaricare le energie.'
                : ' — Oggi acrobazie o riposo strategico per la brigata?'}
            </span>
          </div>

          {/* Stato Registrato (Nastro Elegante con Modifica) oppure Selezione Sì/No */}
          {todayStatus && !isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  backgroundColor: todayStatus === 'yes' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(141, 109, 82, 0.22)',
                  border: `1.5px solid ${todayStatus === 'yes' ? 'rgba(74, 222, 128, 0.55)' : 'rgba(141, 109, 82, 0.55)'}`,
                  color: todayStatus === 'yes' ? '#86efac' : 'var(--coraline-parchment)',
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '12px',
                  fontWeight: 800,
                  boxShadow: todayStatus === 'yes' ? '0 0 10px rgba(74, 222, 128, 0.25)' : '0 0 10px rgba(141, 109, 82, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {todayStatus === 'yes' ? '✓ Allenamento completato' : '💤 Giorno di riposo'}
              </div>

              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setIsEditing(true);
                }}
                style={{
                  background: 'rgba(10, 14, 24, 0.65)',
                  border: '1px solid rgba(221, 202, 183, 0.35)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  color: 'rgba(221, 202, 183, 0.85)',
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.15s ease'
                }}
              >
                Modifica
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleSelectOption('yes')}
                style={{
                  minWidth: '78px',
                  height: '34px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  padding: '6px 16px',
                  borderRadius: '10px',
                  border: todayStatus === 'yes' ? '1.5px solid rgb(141, 109, 82)' : '1px solid rgba(141, 109, 82, 0.45)',
                  backgroundColor: todayStatus === 'yes' ? 'rgba(20, 10, 32, 0.95)' : 'rgba(6, 20, 34, 0.75)',
                  boxShadow: todayStatus === 'yes' ? '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(221, 202, 183, 0.25), 0 0 10px rgba(141, 109, 82, 0.3)' : 'none',
                  color: todayStatus === 'yes' ? '#ffffff' : 'var(--coraline-parchment)',
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.15s ease'
                }}
              >
                {todayStatus === 'yes' ? '✓ Sì' : 'Sì'}
              </button>

              <button
                type="button"
                onClick={() => handleSelectOption('no')}
                style={{
                  minWidth: '78px',
                  height: '34px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  padding: '6px 16px',
                  borderRadius: '10px',
                  border: todayStatus === 'no' ? '1.5px solid rgb(141, 109, 82)' : '1px solid rgba(141, 109, 82, 0.45)',
                  backgroundColor: todayStatus === 'no' ? 'rgba(20, 10, 32, 0.95)' : 'rgba(6, 20, 34, 0.75)',
                  boxShadow: todayStatus === 'no' ? '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(221, 202, 183, 0.25), 0 0 10px rgba(141, 109, 82, 0.3)' : 'none',
                  color: todayStatus === 'no' ? '#ffffff' : 'var(--coraline-parchment)',
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.15s ease'
                }}
              >
                {todayStatus === 'no' ? '✓ No' : 'No'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setIsEditing(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    color: 'rgba(221, 202, 183, 0.55)',
                    fontFamily: 'var(--font-gothic)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  Annulla
                </button>
              )}
            </div>
          )}
        </div>

        <style>{`
          @keyframes bobinskyNoticeEnter {
            from {
              opacity: 0;
              transform: translate3d(0, -6px, 0) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes bobinskyNoticeFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(0deg);
            }
            50% {
              transform: translate3d(0, -8px, 0) rotate(2.2deg);
            }
          }
        `}</style>
      </div>
    </>
  );
});

export default BobinskyWorkoutCard;
