import React, { useMemo, useState, useRef, useEffect } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import streakStarImg from '../assets/streak-star.webp';
import dragonflyImg from '../assets/dragonfly.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import starryBg from '../assets/coraline-starry-bg.webp';
import KeyIcon from './KeyIcon';
import { getConsecutiveDietStreak } from '../utils/storage';
import { triggerHapticFeedback } from '../services/haptics';

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

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

  const { successCount, cheatCount, remainingKeys, streakCount, daysInMonth, successPercentage } = useMemo(() => {
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
    const totalDays = new Date(displayYear, displayMonth + 1, 0).getDate();
    const rate = totalDays > 0 ? Math.round((sCount / totalDays) * 100) : 0;

    return {
      successCount: sCount,
      cheatCount: cCount,
      remainingKeys: Math.max(0, keysPerMonth - kCount),
      streakCount: streak,
      daysInMonth: totalDays,
      successPercentage: rate
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
      text: `Chiavi Nere: ${remainingKeys}/${keysPerMonth} sgarri jolly questo mese`,
      color: 'var(--coraline-yellow)',
      glow: 'rgba(216, 198, 21, 0.4)'
    },
    success: {
      text: `Pietra Verde: ${successCount} ${successCount === 1 ? 'giorno' : 'giorni'} di dieta rispettata questo mese`,
      color: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.4)'
    },
    rate: {
      text: `Libellula: ${successPercentage}% di successo (${successCount} su ${daysInMonth} giorni a ${MONTHS_IT[displayMonth]})`,
      color: '#f472b6',
      glow: 'rgba(244, 114, 182, 0.45)'
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
      style={{
        width: '100%',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.94) 0%, rgba(5, 17, 30, 0.97) 65%, rgba(3, 10, 18, 0.98) 100%)',
        border: '1px solid rgba(107, 142, 85, 0.32)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(154, 185, 123, 0.18)',
        padding: '24px 14px 18px 14px',
        marginTop: '6px',
        marginBottom: '24px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* SFONDO CON CIELO STELLATO MAGICO DI CORALINE (SFOCATO E DISSOLTO) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${starryBg})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        opacity: 0.18,
        filter: 'blur(2.2px)',
        WebkitFilter: 'blur(2.2px)',
        maskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.15) 90%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 45%, rgba(0, 0, 0, 0.15) 90%)',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0
      }} />

      {/* TRAMA VORTICE / SPIRALE SFUMATA IN SECONDO PIANO */}
      <div style={{
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
      }} />

      {/* ALONE RADIALE SMERALDO */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '250px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(107, 142, 85, 0.18) 0%, rgba(26, 69, 110, 0.12) 55%, transparent 75%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* INTESTAZIONE DASHBOARD CON SPAZIO GENEROSO SOPRA E SOTTO */}
      <h3 style={{
        position: 'relative',
        zIndex: 1,
        fontFamily: 'var(--font-coraline)',
        fontSize: '22px',
        color: '#8be574',
        textAlign: 'center',
        margin: '4px 0 20px 0',
        letterSpacing: '0.8px',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(139, 229, 116, 0.45)',
        lineHeight: 1.15
      }}>
        Dashboard
      </h3>

      {/* SEZIONE 1: LE CHIAVI NERE IN LINEA (BOX CON SPIRALE LEGGERA E CONTEGGIO 4/4) */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        marginBottom: '14px'
      }}>
        <div 
          onClick={() => toggleTooltip('keys')}
          role="button"
          tabIndex={0}
          aria-label="Chiavi Jolly Mensili"
          style={{
            backgroundColor: 'rgba(6, 20, 34, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 12px 14px 12px',
            borderRadius: '20px',
            border: activeTooltip === 'keys' 
              ? '1.5px solid var(--coraline-yellow)' 
              : '1px solid rgba(107, 142, 85, 0.28)',
            boxShadow: activeTooltip === 'keys'
              ? '0 0 16px rgba(216, 198, 21, 0.45), inset 0 1px 0 rgba(216, 198, 21, 0.35)'
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(154, 185, 123, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Spirale sfocata molto leggera nel box */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.045,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }} />

          {/* RIGA DELLE 4 CHIAVI RIGOROSAMENTE IN LINEA */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: keysPerMonth <= 4 ? '12px' : keysPerMonth <= 6 ? '8px' : '5px',
            width: '100%',
            marginBottom: '8px'
          }}>
            {(() => {
              // Dimensionamento calibrato per garantire che le 4 chiavi rimangano sempre su una sola riga in qualsiasi telefono
              const keySize = keysPerMonth <= 4 ? 54 : keysPerMonth <= 6 ? 42 : 34;
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
                      willChange: 'transform'
                    }}
                  >
                    {/* Alone bianco spettrale per le chiavi usate */}
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
                    {/* Chiave Nera di Coraline */}
                    <KeyIcon size={keySize} isUsed={isUsed} />
                  </div>
                );
              });
            })()}
          </div>

          {/* TESTO CENTRATO DENTRO IL BOX: 4/4 IN GIALLO + CHIAVI JOLLY SGARRO IN GRIGETTO */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '18px',
              fontFamily: 'var(--font-gothic)',
              fontWeight: 900,
              color: remainingKeys > 0 ? 'var(--coraline-yellow)' : '#ef4444',
              lineHeight: 1,
              textShadow: remainingKeys > 0 ? '0 1px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(216, 198, 21, 0.4)' : '0 1px 4px rgba(0, 0, 0, 0.9)'
            }}>
              {remainingKeys}/{keysPerMonth}
            </span>
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.9px',
              fontFamily: 'var(--font-gothic)',
              fontWeight: 700,
              color: 'rgba(215, 220, 225, 0.72)'
            }}>
              Chiavi Jolly Sgarro
            </span>
          </div>
        </div>
      </div>

      {/* SEZIONE 2: LE 4 SCHEDE METRICHE A 2 COLONNE CON ICONE GRANDI E DICITURE CHIARE */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        alignItems: 'stretch'
      }}>
        {/* RIGA 1, COLONNA 1: Pietra Verde (Dieta Seguita) */}
        <div 
          onClick={() => toggleTooltip('success')}
          role="button"
          tabIndex={0}
          aria-label="Pietra Verde: Dieta Seguita"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 20, 34, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'success' 
              ? '1.5px solid #8be574' 
              : '1px solid rgba(107, 142, 85, 0.28)',
            boxShadow: activeTooltip === 'success' 
              ? '0 0 18px rgba(139, 229, 116, 0.5), inset 0 1px 0 rgba(139, 229, 116, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(154, 185, 123, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Spirale sfocata molto leggera */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.045,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }} />

          <img 
            src={seeingStoneImg} 
            alt="Pietra Verde" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.75))',
              pointerEvents: 'none',
              animation: 'stoneFloat 3.4s ease-in-out infinite',
              willChange: 'transform',
              position: 'relative',
              zIndex: 1
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: '#8be574', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1,
            marginBottom: '4px',
            position: 'relative',
            zIndex: 1
          }}>
            {successCount}
          </div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: 'var(--coraline-parchment)',
            opacity: 0.85,
            position: 'relative',
            zIndex: 1
          }}>
            Dieta Seguita
          </div>
        </div>

        {/* RIGA 1, COLONNA 2: Bottone Nero (Sgarri Registrati) */}
        <div 
          onClick={() => toggleTooltip('cheat')}
          role="button"
          tabIndex={0}
          aria-label="Bottone Nero: Sgarri Registrati"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 20, 34, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'cheat' 
              ? '1.5px solid #ef4444' 
              : '1px solid rgba(107, 142, 85, 0.28)',
            boxShadow: activeTooltip === 'cheat' 
              ? '0 0 18px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(239, 68, 68, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(154, 185, 123, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Spirale sfocata molto leggera */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.045,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }} />

          <img 
            src={blackButtonImg} 
            alt="Bottone Nero" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.95))',
              pointerEvents: 'none',
              animation: 'buttonFloat 3.6s ease-in-out infinite 0.8s',
              willChange: 'transform',
              position: 'relative',
              zIndex: 1
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: '#f87171', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1,
            marginBottom: '4px',
            position: 'relative',
            zIndex: 1
          }}>
            {cheatCount}
          </div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: 'var(--coraline-parchment)',
            opacity: 0.85,
            position: 'relative',
            zIndex: 1
          }}>
            Sgarri Registrati
          </div>
        </div>

        {/* RIGA 2, COLONNA 1: Palla con Stella Rossa (Serie Consecutiva / Streak) */}
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
            backgroundColor: 'rgba(6, 20, 34, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'streak' 
              ? '1.5px solid var(--coraline-yellow)' 
              : '1px solid rgba(107, 142, 85, 0.28)',
            boxShadow: activeTooltip === 'streak' 
              ? '0 0 18px rgba(216, 198, 21, 0.5), inset 0 1px 0 rgba(216, 198, 21, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(154, 185, 123, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Spirale sfocata molto leggera */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.045,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }} />

          <img 
            src={streakStarImg} 
            alt="Giorni Consecutivi" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 12px rgba(220, 38, 38, 0.75))',
              pointerEvents: 'none',
              animation: 'starFloat 3.2s ease-in-out infinite 0.4s',
              willChange: 'transform',
              position: 'relative',
              zIndex: 1
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: 'var(--coraline-yellow)', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1,
            marginBottom: '4px',
            position: 'relative',
            zIndex: 1
          }}>
            {streakCount}
          </div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: 'var(--coraline-parchment)',
            opacity: 0.85,
            position: 'relative',
            zIndex: 1
          }}>
            Giorni di Fila
          </div>
        </div>

        {/* RIGA 2, COLONNA 2: Libellula di Coraline (Successo del Mese) */}
        <div 
          onClick={() => toggleTooltip('rate')}
          role="button"
          tabIndex={0}
          aria-label="Libellula: Percentuale di successo nel mese"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 20, 34, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'rate' 
              ? '1.5px solid #f472b6' 
              : '1px solid rgba(107, 142, 85, 0.28)',
            boxShadow: activeTooltip === 'rate' 
              ? '0 0 18px rgba(244, 114, 182, 0.5), inset 0 1px 0 rgba(244, 114, 182, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(154, 185, 123, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'pan-y',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Spirale sfocata molto leggera */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.045,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }} />

          <img 
            src={dragonflyImg} 
            alt="Libellula Fermaglio" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '74px', 
              height: '56px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 12px rgba(244, 114, 182, 0.75))',
              pointerEvents: 'none',
              animation: 'dragonflyFloat 3.6s ease-in-out infinite 0.2s',
              willChange: 'transform',
              position: 'relative',
              zIndex: 1
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: '#f472b6', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1,
            marginBottom: '4px',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 1
          }}>
            {successPercentage}%
          </div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: 'var(--coraline-parchment)',
            opacity: 0.85,
            position: 'relative',
            zIndex: 1
          }}>
            Riuscita Mese
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
            position: 'relative',
            zIndex: 1,
            marginTop: '12px',
            padding: '10px 14px',
            backgroundColor: 'rgba(6, 20, 34, 0.94)',
            border: `1.5px dashed ${currentTooltip.color}`,
            borderRadius: '14px',
            textAlign: 'center',
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.8), 0 0 14px ${currentTooltip.glow}, inset 0 1px 0 rgba(154, 185, 123, 0.15)`,
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

        @keyframes dragonflyFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -4.5px, 0) rotate(1.8deg);
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
