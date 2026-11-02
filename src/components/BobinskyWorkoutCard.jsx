import React, { useState } from 'react';
import bobinskyImg from '../assets/bobinsky-training.webp';
import circusBg from '../assets/bobinsky-circus-bg.webp';
import { triggerHapticFeedback } from '../services/haptics';
import BobinskyReactionModal from './BobinskyReactionModal';

/**
 * Notifica / Card del Grande Bobinsky:
 * - Bordo e accenti nel colore specificato dall'utente: RGB(141, 109, 82).
 * - Bobinsky a sinistra grande e ben visibile (92px).
 * - Titolo in font Coraline "Allenamento?" in rgb(141, 109, 82).
 * - Sottotitolo con data e spiegazione in font normale.
 * - Pulsanti [Sì] e [No] allineati.
 */
const BobinskyWorkoutCard = React.memo(function BobinskyWorkoutCard({ 
  todayStr,
  workoutLogs: propWorkoutLogs,
  onSaveWorkout
}) {
  // Mappa di allenamenti per data
  const [localWorkoutLogs, setLocalWorkoutLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('coraline_workout_logs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const workoutLogs = propWorkoutLogs || localWorkoutLogs;
  const todayStatus = workoutLogs[todayStr] || null;

  // Stato per animazione immediata di chiusura al clic di Sì o No
  const [justAnsweredStatus, setJustAnsweredStatus] = useState(null);
  const [isDismissedAfterClick, setIsDismissedAfterClick] = useState(false);
  const [reactionStatus, setReactionStatus] = useState(null);

  // Formatta data odierna in italiano senza accenti su "i" (es. "Lunedi 2 Novembre")
  const formatItalianDate = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
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
    triggerHapticFeedback(status === 'yes' ? 'success' : 'cheat');
    
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

    setJustAnsweredStatus(status);
    setReactionStatus(status);
  };

  // Se l'utente ha risposto e l'animazione della foto a schermo intero è conclusa, scompare la card
  if (isDismissedAfterClick && !reactionStatus) {
    return null;
  }

  // Colore esatto indicato: R:141 G:109 B:82
  const bobinskyColor = 'rgb(141, 109, 82)';

  return (
    <>
      {/* MODAL REAZIONE FOTOGRAFICA BOBINSKY (SFONDO SFOCATO) */}
      <BobinskyReactionModal
        status={reactionStatus}
        onClose={() => {
          setReactionStatus(null);
          setIsDismissedAfterClick(true);
        }}
      />

      {!isDismissedAfterClick && (
        <div
          role="region"
          aria-label="Avviso Allenamento Bobinsky"
      className="stitched-card"
      style={{
        width: '100%',
        marginBottom: '16px',
        borderRadius: '20px',
        background: 'rgba(5, 17, 30, 0.92)',
        // Tratteggiato nel colore esatto di Bobinsky R:141 G:109 B:82
        border: `2px dashed ${bobinskyColor}`,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(141, 109, 82, 0.28), inset 0 0 15px rgba(141, 109, 82, 0.15)',
        // Più spazio in alto e in basso (18px)
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
      {/* SFONDO CIRCO DI TOPI DI BOBINSKY BEN VISIBILE (SENZA VORTICE) */}
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
        {/* Titolo in Font Coraline in rgb(141, 109, 82): Allenamento? */}
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
          Allenamento?
        </div>

        {/* Specifica del giorno esatto in italiano e spiegazione con font normale */}
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
          <span style={{ opacity: 0.75 }}> — Segna se ti sei allenata per il circo di topi</span>
        </div>

        {/* Le due opzioni [Sì] e [No] allineate a sinistra col testo */}
        {justAnsweredStatus ? (
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(20, 10, 32, 0.92)',
              border: '1.5px solid rgb(141, 109, 82)',
              color: 'var(--coraline-parchment)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 0 12px rgba(141, 109, 82, 0.35)'
            }}
          >
            {justAnsweredStatus === 'yes' ? '✓ Registrato: Allenamento Fatto!' : '✓ Registrato: Nessun Allenamento'}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                border: todayStatus === 'yes' ? '1.5px solid rgb(141, 109, 82)' : `1px solid rgba(141, 109, 82, 0.45)`,
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
                border: todayStatus === 'no' ? '1.5px solid rgb(141, 109, 82)' : `1px solid rgba(141, 109, 82, 0.45)`,
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
            transform: translate3d(0, -3px, 0) rotate(1.2deg);
          }
        }
      `}</style>
        </div>
      )}
    </>
  );
});

export default BobinskyWorkoutCard;
