import React, { useMemo, useState, useRef, useEffect } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import streakStarImg from '../assets/streak-star.webp';
import KeyIcon from './KeyIcon';
import { getConsecutiveDietStreak } from '../utils/storage';
import { triggerHapticFeedback } from '../services/haptics';

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
  const tooltipTimeoutRef = useRef(null);

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

  // Gestione comparsa tooltip con dismiss automatico dopo 5 secondi
  const toggleTooltip = (type) => {
    triggerHapticFeedback('selection');

    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    setActiveTooltip((prev) => {
      const next = prev === type ? null : type;
      if (next) {
        // Scompare automaticamente dopo 5 secondi esatti (5000 ms)
        tooltipTimeoutRef.current = setTimeout(() => {
          setActiveTooltip(null);
          tooltipTimeoutRef.current = null;
        }, 5000);
      }
      return next;
    });
  };

  // Pulizia del timer allo smontaggio del componente
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

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
      className="stitched-card vortex-card"
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

      {/* SEZIONE 1: LE CHIAVI NERE GIGANTI (LAYOUT FLESSIBILE ADATTIVO SENZA OVERFLOW) */}
      <div 
        onClick={() => toggleTooltip('keys')}
        role="button"
        tabIndex={0}
        aria-label="Chiavi Jolly Mensili"
        style={{
          backgroundColor: 'rgba(6, 22, 37, 0.32)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: keysPerMonth <= 4 ? '14px 12px' : '10px 8px',
          borderRadius: '18px',
          border: activeTooltip === 'keys' 
            ? '1.5px solid var(--coraline-yellow)' 
            : '1.5px solid var(--border-dark-blue-light)',
          boxShadow: activeTooltip === 'keys'
            ? 'inset 0 1.5px 0 rgba(216, 198, 21, 0.45), inset 0 0 16px rgba(0, 0, 0, 0.75), 0 0 14px rgba(216, 198, 21, 0.4)'
            : 'inset 0 1.5px 0 rgba(221, 202, 183, 0.2), inset 0 0 16px rgba(0, 0, 0, 0.5), 0 4px 14px rgba(0, 0, 0, 0.35)',
          marginBottom: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: keysPerMonth <= 4 ? '14px' : keysPerMonth <= 6 ? '10px' : '6px',
          cursor: 'pointer',
          touchAction: 'pan-y',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {(() => {
          // Dimensionamento responsivo dinamico: scala progressivamente da 54px a 35px
          // quando il numero di chiavi supera 4, impaginandosi perfettamente su 1 o 2 righe
          const keySize = keysPerMonth <= 4 ? 54 : keysPerMonth <= 6 ? 42 : 35;
          const auraSize = keysPerMonth <= 4 ? '32px' : keysPerMonth <= 6 ? '24px' : '18px';

          return Array.from({ length: keysPerMonth }).map((_, idx) => {
            const isUsed = idx >= remainingKeys;
            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isUsed ? 'scale(0.92)' : 'scale(1.05)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  animation: `dashboardKeyFloat 3.2s ease-in-out infinite ${idx * 0.35}s`,
                  willChange: 'transform',
                  margin: keysPerMonth > 4 ? '2px 0' : '0'
                }}
              >
                {/* Alone bianco spettrale ristretto per le chiavi usate */}
                {isUsed && (
                  <div 
                    style={{
                      position: 'absolute',
                      width: auraSize,
                      height: auraSize,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(220, 240, 255, 0.12) 50%, transparent 70%)',
                      filter: 'blur(3px)',
                      pointerEvents: 'none',
                      animation: 'ghostlyAuraPulse 3s ease-in-out infinite'
                    }}
                  />
                )}
                {/* Chiave Nera di Coraline proporzionata */}
                <KeyIcon size={keySize} isUsed={isUsed} />
              </div>
            );
          });
        })()}
      </div>

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
            backgroundColor: 'rgba(6, 22, 37, 0.28)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '14px 6px',
            borderRadius: '16px',
            border: activeTooltip === 'success' 
              ? '1.5px solid #34d399' 
              : '1.5px solid var(--border-dark-blue-light)',
            boxShadow: activeTooltip === 'success' 
              ? 'inset 0 1px 0 rgba(74, 222, 128, 0.4), 0 0 14px rgba(52, 211, 153, 0.45)' 
              : 'inset 0 1px 0 rgba(221, 202, 183, 0.18), 0 6px 16px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
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
              pointerEvents: 'none',
              animation: 'stoneFloat 3.4s ease-in-out infinite',
              willChange: 'transform'
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
            backgroundColor: 'rgba(6, 22, 37, 0.28)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '14px 6px',
            borderRadius: '16px',
            border: activeTooltip === 'streak' 
              ? '1.5px solid var(--coraline-yellow)' 
              : '1.5px solid var(--border-dark-blue-light)',
            boxShadow: activeTooltip === 'streak' 
              ? 'inset 0 1px 0 rgba(216, 198, 21, 0.4), 0 0 14px rgba(216, 198, 21, 0.45)' 
              : 'inset 0 1px 0 rgba(221, 202, 183, 0.18), 0 6px 16px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
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
              pointerEvents: 'none',
              animation: 'starFloat 3.2s ease-in-out infinite 0.4s',
              willChange: 'transform'
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
            backgroundColor: 'rgba(6, 22, 37, 0.28)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '14px 6px',
            borderRadius: '16px',
            border: activeTooltip === 'cheat' 
              ? '1.5px solid #ef4444' 
              : '1.5px solid var(--border-dark-blue-light)',
            boxShadow: activeTooltip === 'cheat' 
              ? 'inset 0 1px 0 rgba(239, 68, 68, 0.4), 0 0 14px rgba(239, 68, 68, 0.45)' 
              : 'inset 0 1px 0 rgba(221, 202, 183, 0.18), 0 6px 16px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
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
              pointerEvents: 'none',
              animation: 'buttonFloat 3.6s ease-in-out infinite 0.8s',
              willChange: 'transform'
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

      {/* DICITURA INTERATTIVA A COMPARSA AL TAP SULL'ICONA - POSIZIONATA SOTTO A TUTTA LA DASHBOARD */}
      {currentTooltip && (
        <div 
          onClick={() => {
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
              tooltipTimeoutRef.current = null;
            }
            setActiveTooltip(null);
          }}
          style={{
            marginTop: '12px',
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

        /* Fluttuazione organica in stile stop-motion per gli oggetti della dashboard */
        @keyframes dashboardKeyFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -5px, 0) rotate(2deg);
          }
        }

        @keyframes stoneFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(2.2deg);
          }
        }

        @keyframes starFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -5px, 0) rotate(-2.5deg);
          }
        }

        @keyframes buttonFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -5px, 0) rotate(1.8deg);
          }
        }
      `}</style>
    </div>
  );
});

export default MonthStatsBar;
