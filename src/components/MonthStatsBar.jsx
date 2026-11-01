import React, { useMemo, useState } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import streakStarImg from '../assets/streak-star.webp';
import KeyIcon from './KeyIcon';
import { getConsecutiveDietStreak } from '../utils/storage';

/**
 * Dashboard Statistiche Mensile Stile Coraline (Versione Gigante, Streak & Diciture Interattive al Tap):
 */
const MonthStatsBar = React.memo(function MonthStatsBar({ 
  displayYear, 
  displayMonth, 
  allLogs = {},
  keysPerMonth = 4 
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const { successCount, cheatCount, remainingKeys, streakCount } = useMemo(() => {
    const monthPrefix = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;
    let sCount = 0;
    let cCount = 0;
    let kCount = 0;

    Object.entries(allLogs || {}).forEach(([dateStr, log]) => {
      if (dateStr.startsWith(monthPrefix) && log && typeof log === 'object') {
        if (log.dietState === 'success') sCount++;
        else if (log.dietState === 'cheat') cCount++;
        else if (log.dietState === 'cheat_key') kCount++;
      }
    });

    const streak = getConsecutiveDietStreak(allLogs);

    return {
      successCount: sCount,
      cheatCount: cCount,
      remainingKeys: Math.max(0, keysPerMonth - kCount),
      streakCount: streak
    };
  }, [allLogs, displayYear, displayMonth, keysPerMonth]);

  const toggleTooltip = (type) => {
    setActiveTooltip((prev) => (prev === type ? null : type));
  };

  // Dettagli diciture al tocco
  const tooltipDetails = {
    keys: {
      text: `Chiavi Nere: ${remainingKeys} sgarri jolly disponibili su ${keysPerMonth} questo mese`,
      color: 'var(--coraline-yellow)',
      glow: 'rgba(216, 198, 21, 0.4)'
    },
    success: {
      text: `Pietra Verde: ${successCount} ${successCount === 1 ? 'giorno' : 'giorni'} di dieta rispettata questo mese`,
      color: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.4)'
    },
    streak: {
      text: `Palla del Circo: ${streakCount} ${streakCount === 1 ? 'giorno consecutivo' : 'giorni consecutivi'} di dieta rispettata`,
      color: 'var(--coraline-yellow)',
      glow: 'rgba(216, 198, 21, 0.4)'
    },
    cheat: {
      text: `Bottone Nero: ${cheatCount} ${cheatCount === 1 ? 'giorno' : 'giorni'} di dieta non seguita (sgarrati)`,
      color: '#f87171',
      glow: 'rgba(239, 68, 68, 0.4)'
    }
  };

  const currentTooltip = activeTooltip ? tooltipDetails[activeTooltip] : null;

  return (
    <div 
      className="stitched-card"
      style={{
        padding: '18px 14px',
        marginTop: '6px',
        marginBottom: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* INTESTAZIONE DASHBOARD IN FONT UFFICIALE CORALINE */}
      <h3 style={{
        fontFamily: 'var(--font-coraline)',
        fontSize: '15px',
        color: 'var(--coraline-yellow)',
        textAlign: 'center',
        margin: '0 0 10px 0',
        letterSpacing: '1px',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(216, 198, 21, 0.35)'
      }}>
        Dashboard
      </h3>

      {/* SEZIONE 1: LE 4 CHIAVI NERE GIGANTI (TAP PER DICITURA) */}
      <div 
        onClick={() => toggleTooltip('keys')}
        role="button"
        tabIndex={0}
        aria-label="Chiavi Jolly Mensili"
        style={{
          backgroundColor: 'rgba(6, 22, 37, 0.88)',
          padding: '16px 14px',
          borderRadius: '18px',
          border: activeTooltip === 'keys' 
            ? '1.5px solid var(--coraline-yellow)' 
            : '1.5px solid var(--border-dark-blue-light)',
          boxShadow: activeTooltip === 'keys'
            ? 'inset 0 0 16px rgba(0, 0, 0, 0.75), 0 0 14px rgba(216, 198, 21, 0.4)'
            : 'inset 0 0 16px rgba(0, 0, 0, 0.75)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          cursor: 'pointer',
          touchAction: 'manipulation',
          transition: 'all 0.2s ease'
        }}
      >
        {Array.from({ length: keysPerMonth }).map((_, idx) => {
          const isUsed = idx >= remainingKeys;
          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isUsed ? 'scale(0.92)' : 'scale(1.08)',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
            >
              {/* Alone bianco spettrale ristretto per le chiavi usate */}
              {isUsed && (
                <div 
                  style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(220, 240, 255, 0.12) 50%, transparent 70%)',
                    filter: 'blur(3px)',
                    pointerEvents: 'none',
                    animation: 'ghostlyAuraPulse 3s ease-in-out infinite'
                  }}
                />
              )}
              {/* Chiave Nera di Coraline in formato GIGANTE (60px) */}
              <KeyIcon size={60} isUsed={isUsed} />
            </div>
          );
        })}
      </div>

      {/* DICITURA INTERATTIVA A COMPARSA AL TAP SULL'ICONA */}
      {currentTooltip && (
        <div 
          onClick={() => setActiveTooltip(null)}
          style={{
            margin: '0 0 14px 0',
            padding: '10px 14px',
            backgroundColor: 'rgba(4, 16, 28, 0.96)',
            border: `1.5px dashed ${currentTooltip.color}`,
            borderRadius: '14px',
            textAlign: 'center',
            boxShadow: `0 6px 20px rgba(0, 0, 0, 0.8), 0 0 12px ${currentTooltip.glow}`,
            animation: 'tooltipBadgePop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          <span style={{
            fontSize: '12px',
            color: 'var(--coraline-parchment)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            lineHeight: 1.35,
            flex: 1,
            textAlign: 'center'
          }}>
            ✦ {currentTooltip.text}
          </span>
          <span style={{
            color: 'var(--coraline-parchment)',
            opacity: 0.6,
            fontSize: '12px',
            fontWeight: 700,
            marginLeft: '4px'
          }}>
            ✕
          </span>
        </div>
      )}

      {/* SEZIONE 2: LE 3 SCHEDE METRICHE (PIETRA VERDE, GIORNI CONSECUTIVI, BOTTONE NERO) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Metrica 1: Pietra Verde Gigante (Dieta Rispettata) */}
        <div 
          onClick={() => toggleTooltip('success')}
          role="button"
          tabIndex={0}
          aria-label="Pietra Verde: Dieta Rispettata"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 22, 37, 0.85)',
            padding: '14px 6px',
            borderRadius: '16px',
            border: activeTooltip === 'success' 
              ? '1.5px solid #34d399' 
              : '1.5px solid var(--border-dark-blue-light)',
            boxShadow: activeTooltip === 'success' 
              ? '0 0 14px rgba(52, 211, 153, 0.45)' 
              : '0 6px 16px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.18s ease'
          }}
        >
          <img 
            src={seeingStoneImg} 
            alt="Pietra Verde" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '42px', 
              height: '42px', 
              objectFit: 'contain', 
              marginBottom: '6px',
              filter: 'drop-shadow(0 3px 8px rgba(16, 185, 129, 0.6))',
              pointerEvents: 'none'
            }} 
          />
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            color: '#4ade80', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1 
          }}>
            {successCount}
          </div>
        </div>

        {/* Metrica 2: Palla con Stella Rossa Gigante (Giorni Consecutivi / Streak) */}
        <div 
          onClick={() => toggleTooltip('streak')}
          role="button"
          tabIndex={0}
          aria-label="Palla del Circo: Giorni Consecutivi"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 22, 37, 0.85)',
            padding: '14px 6px',
            borderRadius: '16px',
            border: activeTooltip === 'streak' 
              ? '1.5px solid var(--coraline-yellow)' 
              : '1.5px solid var(--border-dark-blue-light)',
            boxShadow: activeTooltip === 'streak' 
              ? '0 0 14px rgba(216, 198, 21, 0.45)' 
              : '0 6px 16px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.18s ease'
          }}
        >
          <img 
            src={streakStarImg} 
            alt="Giorni Consecutivi" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '42px', 
              height: '42px', 
              objectFit: 'contain', 
              marginBottom: '6px',
              filter: 'drop-shadow(0 3px 8px rgba(220, 38, 38, 0.6))',
              pointerEvents: 'none'
            }} 
          />
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            color: 'var(--coraline-yellow)', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1 
          }}>
            {streakCount}
          </div>
        </div>

        {/* Metrica 3: Bottone Nero Gigante (Dieta Non Rispettata) */}
        <div 
          onClick={() => toggleTooltip('cheat')}
          role="button"
          tabIndex={0}
          aria-label="Bottone Nero: Sgarrato"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 22, 37, 0.85)',
            padding: '14px 6px',
            borderRadius: '16px',
            border: activeTooltip === 'cheat' 
              ? '1.5px solid #ef4444' 
              : '1.5px solid var(--border-dark-blue-light)',
            boxShadow: activeTooltip === 'cheat' 
              ? '0 0 14px rgba(239, 68, 68, 0.45)' 
              : '0 6px 16px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.18s ease'
          }}
        >
          <img 
            src={blackButtonImg} 
            alt="Bottone Nero" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '42px', 
              height: '42px', 
              objectFit: 'contain', 
              marginBottom: '6px',
              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.95))',
              pointerEvents: 'none'
            }} 
          />
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            color: '#f87171', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1 
          }}>
            {cheatCount}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ghostlyAuraPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.22);
            opacity: 0.95;
          }
        }

        @keyframes tooltipBadgePop {
          from {
            opacity: 0;
            transform: translate3d(0, -6px, 0) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
});

export default MonthStatsBar;
