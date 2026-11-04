import React, { useMemo, useState, useRef, useEffect } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import streakStarImg from '../assets/streak-star.webp';
import dragonflyImg from '../assets/dragonfly.webp';
import gearBallImg from '../assets/gear-ball.webp';
import keyImg from '../assets/key.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import starryBg from '../assets/coraline-starry-bg.webp';
import { getConsecutiveDietStreak, getMonthBestStreak, getMonthWorkoutCount } from '../utils/storage';
import { triggerHapticFeedback } from '../services/haptics';
import { getUIElementExplanation } from '../data/catQuotes';

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
  workoutLogs = {},
  keysPerMonth = 4,
  onCatSpeak
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const safeYear = typeof displayYear === 'number' ? displayYear : new Date().getFullYear();
  const safeMonth = typeof displayMonth === 'number' ? displayMonth : new Date().getMonth();

  const workoutCount = useMemo(() => {
    return getMonthWorkoutCount(workoutLogs, safeYear, safeMonth);
  }, [workoutLogs, safeYear, safeMonth]);

  const { successCount, cheatCount, remainingKeys, streakCount, daysInMonth, successPercentage, loggedDays } = useMemo(() => {
    const monthPrefix = `${safeYear}-${String(safeMonth + 1).padStart(2, '0')}`;
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

    const streak = getMonthBestStreak(allLogs, safeYear, safeMonth);

    const totalDays = new Date(safeYear, safeMonth + 1, 0).getDate();
    const totalLogged = sCount + cCount + kCount;
    // Calcolo corretto dell'aderenza basato sui giorni registrati (null se 0 giorni compilati)
    const rate = totalLogged > 0
      ? Math.round(((sCount + kCount) / totalLogged) * 100)
      : null;

    return {
      successCount: sCount,
      cheatCount: cCount,
      remainingKeys: Math.max(0, keysPerMonth - kCount),
      streakCount: streak,
      daysInMonth: totalDays,
      successPercentage: rate,
      loggedDays: totalLogged
    };
  }, [allLogs, displayYear, displayMonth, keysPerMonth]);

  const now = new Date();
  const isViewingCurrentMonth = displayYear === now.getFullYear() && displayMonth === now.getMonth();

  // Dettagli esplicativi pronunciati dal Gatto
  const tooltipDetails = {
    keys: {
      text: `Chiavi della Flessibilità: ne hai ${remainingKeys} su ${keysPerMonth} questo mese. Ti permettono una pausa serena dal piano!`
    },
    success: {
      text: `Rotta mantenuta: ${successCount} giorni affrontati con cura questo mese.`
    },
    cheat: {
      text: `Imprevisti affrontati: ${cheatCount} giorni fuori sentiero annotati con onestà.`
    },
    workout: {
      text: `Allenamento: ${workoutCount} giorni di attività completati con il Signor Bobinsky!`
    },
    streak: {
      text: isViewingCurrentMonth
        ? `Miglior serie del mese: record di ${streakCount} giorni consecutivi di costanza a ${MONTHS_IT[safeMonth]}.`
        : `Record del mese: ${streakCount} giorni consecutivi di costanza raggiunti a ${MONTHS_IT[safeMonth]}.`
    },
    rate: {
      text: loggedDays === 0
        ? `Nessun giorno ancora registrato a ${MONTHS_IT[displayMonth]}: apri il tuo diario segreto!`
        : `Tasso di riuscita: ${successPercentage}% di aderenza a ${MONTHS_IT[displayMonth]} su ${loggedDays} giorni registrati (${cheatCount} imprevisti).`
    }
  };

  // Al tocco sulla card, evidenzia la card e fa parlare la nuvoletta del Gatto con la Categoria 8
  const toggleTooltip = (type) => {
    triggerHapticFeedback('selection');

    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    setActiveTooltip(type);
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 4500);

    const tagMap = {
      keys: 'stat_keys',
      success: 'stat_success_days',
      cheat: 'stat_cheat_days',
      workout: 'stat_workout_days',
      streak: 'stat_streak_record',
      rate: 'stat_adherence_rate'
    };

    if (onCatSpeak && tagMap[type]) {
      const phrase = getUIElementExplanation(tagMap[type]);
      onCatSpeak(phrase);
    }
  };

  // Pulizia del timer allo smontaggio del componente
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      id="dashboard-stats-section"
      style={{
        width: '100%',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(20, 45, 76, 0.96) 0%, rgba(12, 16, 19, 0.97) 62%, rgba(48, 49, 49, 0.98) 100%)',
        border: '1.5px solid rgba(47, 77, 108, 0.55)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.88), inset 0 1px 0 rgba(208, 207, 205, 0.18), 0 0 24px rgba(47, 77, 108, 0.25)',
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

      {/* ALONE RADIALE BLU NOTTE CINEMATICO CORALINE */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '260px',
        height: '190px',
        background: 'radial-gradient(circle, rgba(47, 77, 108, 0.32) 0%, rgba(55, 74, 79, 0.18) 50%, rgba(20, 45, 76, 0.10) 70%, transparent 80%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* INTESTAZIONE DASHBOARD IN BLU ACCIAIO & MIST CORALINE */}
      <h3 style={{
        position: 'relative',
        zIndex: 1,
        fontFamily: 'var(--font-coraline)',
        fontSize: '22px',
        color: '#d0cfcd',
        textAlign: 'center',
        margin: '4px 0 20px 0',
        letterSpacing: '0.8px',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 14px rgba(47, 77, 108, 0.7), 0 0 24px rgba(55, 74, 79, 0.45)',
        lineHeight: 1.15
      }}>
        Dashboard
      </h3>

      {/* LE 6 SCHEDE METRICHE A 2 COLONNE: TUTTE UGUALI, OMOGENEE E COERENTI */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        alignItems: 'stretch'
      }}>
        {/* SCHEDA 1: CHIAVI DELLA FLESSIBILITÀ (SINGOLA CHIAVE FLUTTUANTE + 4/4) */}
        <div 
          onClick={() => toggleTooltip('keys')}
          role="button"
          tabIndex={0}
          aria-label="Chiavi della Flessibilità"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'keys' 
              ? '1.5px solid var(--coraline-yellow)' 
              : '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: activeTooltip === 'keys' 
              ? '0 0 18px rgba(216, 198, 21, 0.5), inset 0 1px 0 rgba(216, 198, 21, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
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
            src={keyImg} 
            alt="Chiave Jolly" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 14px rgba(225, 240, 255, 0.65)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.9))',
              pointerEvents: 'none',
              animation: 'dashboardKeyFloat 3.2s ease-in-out infinite',
              willChange: 'transform',
              position: 'relative',
              zIndex: 1
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: remainingKeys > 0 ? 'var(--coraline-yellow)' : '#ef4444', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1,
            marginBottom: '4px',
            position: 'relative',
            zIndex: 1,
            textShadow: remainingKeys > 0 ? '0 1px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(216, 198, 21, 0.4)' : '0 1px 4px rgba(0, 0, 0, 0.9)'
          }}>
            {remainingKeys}/{keysPerMonth}
          </div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: '#d0cfcd',
            opacity: 0.88,
            position: 'relative',
            zIndex: 1
          }}>
            Chiavi della Flessibilità
          </div>
        </div>

        {/* SCHEDA 2: DIETA SEGUITA (PIETRA VERDE) */}
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
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'success' 
              ? '1.5px solid #8be574' 
              : '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: activeTooltip === 'success' 
              ? '0 0 18px rgba(139, 229, 116, 0.5), inset 0 1px 0 rgba(139, 229, 116, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
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
            color: '#d0cfcd',
            opacity: 0.88,
            position: 'relative',
            zIndex: 1
          }}>
            Dieta Seguita
          </div>
        </div>

        {/* SCHEDA 3: IMPREVISTI (BOTTONE NERO) */}
        <div 
          onClick={() => toggleTooltip('cheat')}
          role="button"
          tabIndex={0}
          aria-label="Bottone Nero: Imprevisti Registrati"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'cheat' 
              ? '1.5px solid #ef4444' 
              : '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: activeTooltip === 'cheat' 
              ? '0 0 18px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(239, 68, 68, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
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
            color: '#d0cfcd',
            opacity: 0.88,
            position: 'relative',
            zIndex: 1
          }}>
            Imprevisti Registrati
          </div>
        </div>

        {/* SCHEDA 4: GIORNI DI ALLENAMENTO (PALLA DEL CAMBIO) */}
        <div 
          onClick={() => toggleTooltip('workout')}
          role="button"
          tabIndex={0}
          aria-label="Palla del Cambio: Giorni di Allenamento"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'workout' 
              ? '1.5px solid #8be574' 
              : '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: activeTooltip === 'workout' 
              ? '0 0 18px rgba(139, 229, 116, 0.5), inset 0 1px 0 rgba(139, 229, 116, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
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
            src={gearBallImg} 
            alt="Palla del Cambio" 
            loading="eager"
            decoding="async"
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 8px rgba(139, 229, 116, 0.35))',
              pointerEvents: 'none',
              animation: 'stoneFloat 3.8s ease-in-out infinite',
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
            {workoutCount}
          </div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: '#d0cfcd',
            opacity: 0.88,
            position: 'relative',
            zIndex: 1
          }}>
            Giorni di Allenamento
          </div>
        </div>

        {/* SCHEDA 5: GIORNI DI FILA (STELLA / PALLA DEL CIRCO) */}
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
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'streak' 
              ? '1.5px solid var(--coraline-yellow)' 
              : '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: activeTooltip === 'streak' 
              ? '0 0 18px rgba(216, 198, 21, 0.5), inset 0 1px 0 rgba(216, 198, 21, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
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
            color: '#d0cfcd',
            opacity: 0.88,
            position: 'relative',
            zIndex: 1
          }}>
            Giorni di Fila
          </div>
        </div>

        {/* SCHEDA 6: RIUSCITA MESE (LIBELLULA) */}
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
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px 10px 14px 10px',
            borderRadius: '20px',
            border: activeTooltip === 'rate' 
              ? '1.5px solid #f472b6' 
              : '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: activeTooltip === 'rate' 
              ? '0 0 18px rgba(244, 114, 182, 0.5), inset 0 1px 0 rgba(244, 114, 182, 0.3)' 
              : '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
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
            {successPercentage !== null ? `${successPercentage}%` : '—'}
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
