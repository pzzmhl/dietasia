import React, { useMemo, useState, useRef, useEffect } from 'react';
import seeingStoneImg from '../assets/seeing-stone.webp';
import blackButtonImg from '../assets/black-button.webp';
import streakStarImg from '../assets/streak-star.webp';
import dragonflyImg from '../assets/dragonfly.webp';
import gearBallImg from '../assets/gear-ball.webp';
import keyImg from '../assets/key.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import starryBg from '../assets/coraline-starry-bg.webp';
import { getMonthWorkoutCount, getConsecutiveDietStreak, getTodayDateString } from '../utils/storage';
import { calculateMTDComparison } from '../utils/historicalStats';
import { triggerHapticFeedback } from '../utils/haptics';
import { getUIElementExplanation } from '../data/catExplanations';

/**
 * Dashboard Statistiche Mensile Stile Coraline:
 * Disposizione 2x3 deterministica e pulita:
 * 1. Dieta seguita (Pietra Verde) | 2. Imprevisti Registrati (Bottone Nero)
 * 3. Chiavi della Flessibilità (Chiave Nera) | 4. Giorni di Allenamento (Palla Bobinsky)
 * 5. Streak / Giorni di Fila (Stella del Circo) | 6. Riuscita Mese (Libellula)
 */
const MonthStatsBar = React.memo(function MonthStatsBar({ 
  displayYear, 
  displayMonth,
  todayStr: propTodayStr,
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

  const effectiveTodayStr = propTodayStr || getTodayDateString();
  const safeYear = typeof displayYear === 'number' ? displayYear : new Date().getFullYear();
  const safeMonth = typeof displayMonth === 'number' ? displayMonth : new Date().getMonth();

  const workoutCount = useMemo(() => {
    const monthPrefix = `${safeYear}-${String(safeMonth + 1).padStart(2, '0')}`;
    if (monthPrefix > effectiveTodayStr.slice(0, 7)) return 0;
    return getMonthWorkoutCount(workoutLogs, safeYear, safeMonth);
  }, [workoutLogs, safeYear, safeMonth, effectiveTodayStr]);

  const mtdStats = useMemo(() => {
    return calculateMTDComparison(allLogs, workoutLogs, safeYear, safeMonth, effectiveTodayStr);
  }, [allLogs, workoutLogs, safeYear, safeMonth, effectiveTodayStr]);

  const { successCount, cheatCount, remainingKeys, usedKeysCount, streakCount, successPercentage, loggedDays } = useMemo(() => {
    const monthPrefix = `${safeYear}-${String(safeMonth + 1).padStart(2, '0')}`;
    let sCount = 0;
    let cCount = 0;
    let kCount = 0;

    Object.entries(allLogs || {}).forEach(([dateStr, log]) => {
      if (dateStr.startsWith(monthPrefix) && dateStr <= effectiveTodayStr && log && typeof log === 'object') {
        if (log.dietState === 'success') sCount++;
        else if (log.dietState === 'cheat') cCount++;
        else if (log.dietState === 'cheat_key') kCount++;
      }
    });

    const streak = getConsecutiveDietStreak(allLogs);
    const totalLogged = sCount + cCount + kCount;
    // Calcolo corretto dell'aderenza basato sui giorni registrati (null se 0 giorni compilati)
    const rate = totalLogged > 0
      ? Math.round(((sCount + kCount) / totalLogged) * 100)
      : null;

    return {
      successCount: sCount,
      cheatCount: cCount,
      remainingKeys: Math.max(0, keysPerMonth - kCount),
      usedKeysCount: kCount,
      streakCount: streak,
      successPercentage: rate,
      loggedDays: totalLogged
    };
  }, [allLogs, safeYear, safeMonth, keysPerMonth, effectiveTodayStr]);

  const rateDelta = useMemo(() => {
    if (successPercentage === null || mtdStats.historicalAdherence === null) return null;
    return successPercentage - mtdStats.historicalAdherence;
  }, [successPercentage, mtdStats.historicalAdherence]);

  // Al tocco sulla card, evidenzia la card e fa parlare la nuvoletta del Gatto
  const toggleTooltip = (type) => {
    triggerHapticFeedback('selection');

    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    setActiveTooltip(type);
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
      tooltipTimeoutRef.current = null;
    }, 4500);

    const tagMap = {
      success: 'stat_success_days',
      cheat: 'stat_cheat_days',
      keys: 'stat_keys',
      workout: 'stat_workout_days',
      streak: 'stat_streak_record',
      rate: 'stat_adherence_rate'
    };

    if (onCatSpeak && tagMap[type]) {
      const phrase = getUIElementExplanation(tagMap[type]);
      onCatSpeak(phrase);
    }
  };

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
      <div className="vortex-bg-layer" style={{
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
      <h3 
        role="button"
        tabIndex={0}
        aria-label="Dashboard: tocca per ascoltare la spiegazione del Gatto"
        onClick={() => {
          triggerHapticFeedback('selection');
          if (onCatSpeak) {
            onCatSpeak(getUIElementExplanation('dashboard_overview'));
          }
        }}
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: 'var(--font-coraline)',
          fontSize: '22px',
          color: '#d0cfcd',
          textAlign: 'center',
          margin: '4px 0 20px 0',
          letterSpacing: '0.8px',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 14px rgba(47, 77, 108, 0.7), 0 0 24px rgba(55, 74, 79, 0.45)',
          lineHeight: 1.15,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        Dashboard
      </h3>

      {/* LE 6 SCHEDE METRICHE A 2 COLONNE:
          RIGA 1: Dieta seguita (SX) | Imprevisti registrati (DX)
          RIGA 2: Chiavi flessibilità (SX) | Giorni di allenamento (DX)
          RIGA 3: Streak / Giorni di fila (SX) | Riuscita Mese % (DX)
      */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        alignItems: 'stretch'
      }}>
        {/* SCHEDA 1: DIETA SEGUITA (PIETRA VERDE - RIGA 1 SX) */}
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
          <div className="vortex-bg-layer" style={{
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
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            draggable={false}
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
            zIndex: 1,
            lineHeight: 1.2
          }}>
            Dieta<br />seguita
          </div>
          <div style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-body)',
            color: 'rgba(208, 207, 205, 0.78)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            {mtdStats.successComparison.hasComparison ? (
              <>
                Media altri: {mtdStats.successComparison.avg}{' '}
                <span style={{ color: mtdStats.successComparison.color, fontWeight: 700 }}>
                  ({mtdStats.successComparison.deltaText})
                </span>
              </>
            ) : (
              'Media altri: —'
            )}
          </div>
        </div>

        {/* SCHEDA 2: IMPREVISTI REGISTRATI (BOTTONE NERO - RIGA 1 DX) */}
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
          <div className="vortex-bg-layer" style={{
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
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            draggable={false}
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
          <div style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-body)',
            color: 'rgba(208, 207, 205, 0.78)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            {mtdStats.cheatsComparison.hasComparison ? (
              <>
                Media altri: {mtdStats.cheatsComparison.avg}{' '}
                <span style={{ color: mtdStats.cheatsComparison.color, fontWeight: 700 }}>
                  ({mtdStats.cheatsComparison.deltaText})
                </span>
              </>
            ) : (
              'Media altri: —'
            )}
          </div>
        </div>

        {/* SCHEDA 3: CHIAVI DELLA FLESSIBILITÀ (CHIAVE NERA - RIGA 2 SX) */}
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
          <div className="vortex-bg-layer" style={{
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
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            draggable={false}
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
          <div style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-body)',
            color: 'rgba(208, 207, 205, 0.78)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            Usate nel mese: <strong style={{ color: 'var(--coraline-yellow)' }}>{usedKeysCount}</strong>
          </div>
        </div>

        {/* SCHEDA 4: GIORNI DI ALLENAMENTO (PALLA DEL CAMBIO - RIGA 2 DX) */}
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
          <div className="vortex-bg-layer" style={{
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
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            draggable={false}
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
          <div style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-body)',
            color: 'rgba(208, 207, 205, 0.78)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            {mtdStats.workoutsComparison.hasComparison ? (
              <>
                Media altri: {mtdStats.workoutsComparison.avg}{' '}
                <span style={{ color: mtdStats.workoutsComparison.color, fontWeight: 700 }}>
                  ({mtdStats.workoutsComparison.deltaText})
                </span>
              </>
            ) : (
              'Media altri: —'
            )}
          </div>
        </div>

        {/* SCHEDA 5: GIORNI DI FILA / STREAK (STELLA DEL CIRCO - RIGA 3 SX) */}
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
          <div className="vortex-bg-layer" style={{
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
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            draggable={false}
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
          <div style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-body)',
            color: 'rgba(208, 207, 205, 0.78)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            Record storico: <strong style={{ color: 'var(--coraline-yellow)' }}>{mtdStats.allTimeBestStreak} gg</strong>{' '}
            {mtdStats.allTimeBestStreak > 0 && (
              streakCount >= mtdStats.allTimeBestStreak && streakCount > 0 ? (
                <span style={{ color: '#8be574', fontWeight: 700 }}>(Record! ✦)</span>
              ) : (
                <span style={{ color: 'rgba(208, 207, 205, 0.85)', fontWeight: 700 }}>
                  ({streakCount - mtdStats.allTimeBestStreak} gg)
                </span>
              )
            )}
          </div>
        </div>

        {/* SCHEDA 6: PERCENTUALE DI RIUSCITA DEL MESE CORRENTE (LIBELLULA - RIGA 3 DX) */}
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
          <div className="vortex-bg-layer" style={{
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
            width={74}
            height={56}
            loading="lazy"
            decoding="async"
            draggable={false}
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
          <div style={{
            fontSize: '9.5px',
            fontFamily: 'var(--font-body)',
            color: 'rgba(208, 207, 205, 0.78)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            Storico: {mtdStats.historicalAdherence !== null ? `${mtdStats.historicalAdherence}%` : '—'}{' '}
            {rateDelta !== null && (
              loggedDays >= 3 ? (
                <span style={{ color: rateDelta >= 0 ? '#8be574' : '#f87171', fontWeight: 700 }}>
                  ({rateDelta > 0 ? '+' : ''}{rateDelta}%)
                </span>
              ) : (
                <span style={{ color: 'rgba(208, 207, 205, 0.72)', fontWeight: 600, fontSize: '9px' }}>
                  (Avvio mese)
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`
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
