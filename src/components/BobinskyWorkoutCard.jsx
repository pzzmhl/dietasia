import React, { useState } from 'react';
import bobinskyImg from '../assets/bobinsky-training.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import starryBg from '../assets/coraline-starry-bg.webp';
import { triggerHapticFeedback } from '../services/haptics';

/**
 * Scheda Giornaliera di Bobinsky (Allenamento di Asia):
 * Chiede ad Asia una volta al giorno se si è allenata con due opzioni: [Sì] e [No].
 * I dati vengono salvati localmente per data (YYYY-MM-DD) per future statistiche.
 */
const BobinskyWorkoutCard = React.memo(function BobinskyWorkoutCard({ todayStr }) {
  // Mappa di allenamenti per data: { "YYYY-MM-DD": "yes" | "no" }
  const [workoutLogs, setWorkoutLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('coraline_workout_logs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const todayStatus = workoutLogs[todayStr] || null;

  const handleSelectOption = (status) => {
    triggerHapticFeedback('selection');
    const updated = {
      ...workoutLogs,
      [todayStr]: status
    };
    setWorkoutLogs(updated);
    setIsEditing(false);
    try {
      localStorage.setItem('coraline_workout_logs', JSON.stringify(updated));
    } catch (e) {
      console.error('Errore salvataggio allenamento Bobinsky:', e);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.94) 0%, rgba(5, 17, 30, 0.97) 65%, rgba(3, 10, 18, 0.98) 100%)',
        border: '1px solid rgba(107, 142, 85, 0.32)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(154, 185, 123, 0.18)',
        padding: '16px 14px 18px 14px',
        marginBottom: '16px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      {/* SFONDO CON CIELO STELLATO MAGICO DI CORALINE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${starryBg})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          filter: 'blur(2px)',
          WebkitFilter: 'blur(2px)',
          maskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.15) 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.15) 90%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
          zIndex: 0
        }}
      />

      {/* TRAMA VORTICE / SPIRALE SFUMATA */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${vortexBg})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.07,
          filter: 'blur(2px)',
          WebkitFilter: 'blur(2px)',
          maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
          zIndex: 0
        }}
      />

      {/* ALONE RADIALE SMERALDO */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '160px',
          background: 'radial-gradient(circle, rgba(107, 142, 85, 0.18) 0%, rgba(26, 69, 110, 0.12) 55%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* INTESTAZIONE: TITOLO */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          marginBottom: '6px'
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '22px',
            color: '#8be574',
            textAlign: 'center',
            margin: 0,
            letterSpacing: '0.8px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(139, 229, 116, 0.45)',
            lineHeight: 1.2
          }}
        >
          Il Grande<br />Bobinsky
        </h3>
      </div>

      {/* IMMAGINE DI BOBINSKY IN SPACCATA SULLA RINGHIERA */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '240px',
          margin: '2px auto 10px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'bobinskyFloat 3.8s ease-in-out infinite',
          willChange: 'transform'
        }}
      >
        <img
          src={bobinskyImg}
          alt="Il Grande Bobinsky in spaccata"
          loading="eager"
          decoding="async"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '135px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.9))',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* SEZIONE DOMANDA O STATO RISPOSTA */}
      {todayStatus && !isEditing ? (
        // STATO GIÀ RISPOSTO PER OGGI
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '310px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2px'
          }}
        >
          {/* Badge Esito */}
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '12px',
              backgroundColor: todayStatus === 'yes' ? 'rgba(16, 80, 45, 0.55)' : 'rgba(60, 20, 25, 0.55)',
              border: todayStatus === 'yes' ? '1.5px solid #8be574' : '1.5px solid rgba(239, 68, 68, 0.6)',
              boxShadow: todayStatus === 'yes'
                ? '0 0 12px rgba(139, 229, 116, 0.35)'
                : '0 0 12px rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '13px' }}>{todayStatus === 'yes' ? '🎪' : '💤'}</span>
            <span
              style={{
                fontFamily: 'var(--font-gothic)',
                fontSize: '13px',
                fontWeight: 800,
                color: todayStatus === 'yes' ? '#8be574' : '#fca5a5'
              }}
            >
              {todayStatus === 'yes' ? 'Oggi ti sei allenata! ✦' : 'Oggi giorno di riposo'}
            </span>
          </div>

          {/* Frase di Bobinsky */}
          <p
            style={{
              margin: '2px 0 6px 0',
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '13.5px',
              lineHeight: 1.4,
              color: 'var(--coraline-parchment)',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
              padding: '0 8px'
            }}
          >
            {todayStatus === 'yes'
              ? '«Molto bene, Asia! I muscoli sono scattanti come i miei Topi Saltatori!»'
              : '«Niente salti oggi per Asia! Anche i più grandi acrobati hanno bisogno di riposo.»'}
          </p>

          {/* Pulsante Modifica Risposta */}
          <button
            onClick={() => {
              triggerHapticFeedback('selection');
              setIsEditing(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--coraline-parchment)',
              opacity: 0.65,
              fontSize: '11px',
              fontFamily: 'var(--font-gothic)',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Modifica risposta
          </button>
        </div>
      ) : (
        // STATO IN ATTESA DI RISPOSTA PER OGGI
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '310px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Domanda di Bobinsky */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.4,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)'
            }}
          >
            «Asia! Dimmi un po', oggi ti sei allenata?»
          </div>

          {/* Pulsanti SÌ e NO */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              width: '100%'
            }}
          >
            {/* Opzione SÌ */}
            <button
              onClick={() => handleSelectOption('yes')}
              style={{
                flex: 1,
                maxWidth: '125px',
                padding: '11px 16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 80, 45, 0.85)',
                border: '1.5px solid #8be574',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(139, 229, 116, 0.35)',
                color: '#ffffff',
                fontFamily: 'var(--font-gothic)',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                touchAction: 'manipulation'
              }}
            >
              Sì ✦
            </button>

            {/* Opzione NO */}
            <button
              onClick={() => handleSelectOption('no')}
              style={{
                flex: 1,
                maxWidth: '125px',
                padding: '11px 16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(60, 20, 25, 0.85)',
                border: '1.5px solid rgba(239, 68, 68, 0.55)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                fontFamily: 'var(--font-gothic)',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                touchAction: 'manipulation'
              }}
            >
              No
            </button>
          </div>

          {/* Opzione Annulla (quando in modalità modifica) */}
          {isEditing && (
            <button
              onClick={() => {
                triggerHapticFeedback('selection');
                setIsEditing(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--coraline-parchment)',
                opacity: 0.65,
                fontSize: '11px',
                fontFamily: 'var(--font-gothic)',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '2px 8px'
              }}
            >
              Annulla modifica
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes bobinskyFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -4px, 0) rotate(0.8deg);
          }
        }
      `}</style>
    </div>
  );
});

export default BobinskyWorkoutCard;
