import React, { useMemo, useRef, useEffect, useState } from 'react';
import { calculateEclipseState } from '../utils/eclipseLogic.js';
import { getConsecutiveDietStreak } from '../utils/storage.js';
import { calculateHistoricalComparison } from '../utils/historicalStats.js';
import { smoothScrollToElement } from '../utils/scrollAnimation.js';
import { triggerHapticFeedback } from '../services/haptics';
import { getUIElementExplanation } from '../data/catQuotes';

// Immagine profilo Boring Blue Boy da Coraline
import profileAvatarImg from '../assets/profile-avatar.webp';
// Palla con stella rossa del Circo (Streak)
import streakStarImg from '../assets/streak-star.webp';
// Sfondo vortice/spirale dell'Altro Mondo
import vortexBg from '../assets/coraline-vortex-bg.webp';
// Sfondo cielo stellato magico di Coraline
import starryBg from '../assets/coraline-starry-bg.webp';
// Texture con sfondo delle stelline di Coraline
import catCloudPattern from '../assets/cat-cloud-pattern.webp';

// Oggetti grafici reali di Coraline per gli esiti dei 7 giorni e le statistiche
import seeingStoneImg from '../assets/seeing-stone.webp'; // Pietra verde (dieta seguita)
import blackButtonImg from '../assets/black-button.webp'; // Bottone nero (giorno fuori sentiero)
import keyImg from '../assets/key.webp';                 // Chiave nera (chiave jolly)
import gearBallImg from '../assets/gear-ball.webp';       // Palla cambio allenamento Bobinsky

// I 7 snapshot fotografici originali estratti direttamente dalla reference cinematografica di Coraline
import moonPhase0 from '../assets/eclipse-phases/coraline-moon-phase-0.webp';
import moonPhase1 from '../assets/eclipse-phases/coraline-moon-phase-1.webp';
import moonPhase2 from '../assets/eclipse-phases/coraline-moon-phase-2.webp';
import moonPhase3 from '../assets/eclipse-phases/coraline-moon-phase-3.webp';
import moonPhase4 from '../assets/eclipse-phases/coraline-moon-phase-4.webp';
import moonPhase5 from '../assets/eclipse-phases/coraline-moon-phase-5.webp';
import moonPhase6 from '../assets/eclipse-phases/coraline-moon-phase-6.webp';

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const MOON_PHASES = [
  moonPhase0,
  moonPhase1,
  moonPhase2,
  moonPhase3,
  moonPhase4,
  moonPhase5,
  moonPhase6
];

const ButtonMoonEclipse = React.memo(function ButtonMoonEclipse({
  allLogs = {},
  workoutLogs = {},
  todayStr,
  displayYear,
  displayMonth,
  onOpenSettings = () => {},
  customAvatar = null,
  onScrollToDashboard,
  onCatSpeak
}) {
  const currentYear = todayStr ? Number(todayStr.split('-')[0]) : new Date().getFullYear();
  const currentMonth = todayStr ? Number(todayStr.split('-')[1]) - 1 : new Date().getMonth();
  const year = displayYear !== undefined ? displayYear : currentYear;
  const month = displayMonth !== undefined ? displayMonth : currentMonth;

  const handleScrollToDashboard = () => {
    triggerHapticFeedback('selection');
    if (onCatSpeak) {
      onCatSpeak(getUIElementExplanation('dashboard_streak_badge'));
    }
    if (onScrollToDashboard) {
      onScrollToDashboard();
    } else {
      smoothScrollToElement('dashboard-stats-section', 1400);
    }
  };

  // Calcolo matematico a 7 giorni: ogni giorno seguito sposta il bottone indietro, ogni imprevisto avanti
  const eclipse = useMemo(() => {
    return calculateEclipseState(allLogs, todayStr);
  }, [allLogs, todayStr]);

  const { phaseIndex, daysBreakdown } = eclipse;

  // Calcolo streak di giorni consecutivi di dieta rispettata
  const streakCount = useMemo(() => {
    return getConsecutiveDietStreak(allLogs);
  }, [allLogs]);

  // Calcolo statistiche storiche per Scheda 2 del Carosello
  const stats = useMemo(() => {
    return calculateHistoricalComparison(allLogs, workoutLogs, year, month);
  }, [allLogs, workoutLogs, year, month]);

  // Variazioni percentuali rispetto alla media per le 4 box comparative
  const comparisonDeltas = useMemo(() => {
    // 1. Aderenza: delta rispetto alla media storica
    const adhDelta = stats.adherenceDelta;
    const adhSign = adhDelta > 0 ? `+${adhDelta}%` : adhDelta < 0 ? `${adhDelta}%` : '0%';
    const adhColor = adhDelta > 0 ? '#4ade80' : adhDelta < 0 ? '#ef4444' : 'rgba(221, 202, 183, 0.75)';

    // 2. Giorni Rispettati: delta rispetto alla media mensile
    const avgSucc = parseFloat(stats.avgMonthlySuccess) || 0;
    let succPct = 0;
    if (avgSucc > 0) {
      succPct = Math.round(((stats.currentSuccessCount - avgSucc) / avgSucc) * 100);
    } else if (stats.currentSuccessCount > 0) {
      succPct = 100;
    }
    const succSign = succPct > 0 ? `+${succPct}%` : succPct < 0 ? `${succPct}%` : '0%';
    const succColor = succPct > 0 ? '#4ade80' : succPct < 0 ? '#ef4444' : 'rgba(221, 202, 183, 0.75)';

    // 3. Imprevisti: MENO imprevisti è miglioramento (verde), PIÙ imprevisti è deviazione (rosso)
    const avgCheat = parseFloat(stats.avgMonthlyCheats) || 0;
    let cheatPct = 0;
    if (avgCheat > 0) {
      cheatPct = Math.round(((stats.currentCheatCount - avgCheat) / avgCheat) * 100);
    } else if (stats.currentCheatCount > 0) {
      cheatPct = 100;
    }
    const cheatSign = cheatPct > 0 ? `+${cheatPct}%` : cheatPct < 0 ? `${cheatPct}%` : '0%';
    const cheatColor = cheatPct < 0 ? '#4ade80' : cheatPct > 0 ? '#ef4444' : 'rgba(221, 202, 183, 0.75)';

    // 4. Allenamenti: delta rispetto alla media mensile
    const avgWork = parseFloat(stats.avgMonthlyWorkouts) || 0;
    let workPct = 0;
    if (avgWork > 0) {
      workPct = Math.round(((stats.currentWorkoutCount - avgWork) / avgWork) * 100);
    } else if (stats.currentWorkoutCount > 0) {
      workPct = 100;
    }
    const workSign = workPct > 0 ? `+${workPct}%` : workPct < 0 ? `${workPct}%` : '0%';
    const workColor = workPct > 0 ? '#4ade80' : workPct < 0 ? '#ef4444' : 'rgba(221, 202, 183, 0.75)';

    return {
      adh: { text: `(${adhSign})`, color: adhColor },
      succ: { text: `(${succSign})`, color: succColor },
      cheat: { text: `(${cheatSign})`, color: cheatColor },
      work: { text: `(${workSign})`, color: workColor }
    };
  }, [stats]);

  // Stato e navigazione a vista singola con due box fisici concatenati
  const [activeTab, setActiveTab] = useState(0); // 0: Ritmo / Luna, 1: Statistiche
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef(null);

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
          isHorizontalSwipe.current = true;
          setIsDragging(true);
        } else {
          isHorizontalSwipe.current = false;
        }
      }
    }

    if (isHorizontalSwipe.current) {
      // Resistenza ai bordi (rubber banding) se si trascina oltre il limite
      if ((activeTab === 0 && deltaX > 0) || (activeTab === 1 && deltaX < 0)) {
        setDragOffset(deltaX * 0.22);
      } else {
        setDragOffset(deltaX);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (isHorizontalSwipe.current) {
      if (dragOffset < -45 && activeTab === 0) {
        triggerHapticFeedback('selection');
        setActiveTab(1);
      } else if (dragOffset > 45 && activeTab === 1) {
        triggerHapticFeedback('selection');
        setActiveTab(0);
      }
    }
    setDragOffset(0);
    isHorizontalSwipe.current = null;
  };

  const handleSelectTab = (newTab) => {
    if (newTab === activeTab) return;
    triggerHapticFeedback('selection');
    setActiveTab(newTab);
  };

  // Effetto glow visivo quando la luna si libera (retrocessione del bottone)
  const [isGlowActive, setIsGlowActive] = useState(false);
  const prevIndexRef = useRef(phaseIndex);

  useEffect(() => {
    if (phaseIndex < prevIndexRef.current) {
      setIsGlowActive(true);
      const timer = setTimeout(() => setIsGlowActive(false), 900);
      return () => clearTimeout(timer);
    }
    prevIndexRef.current = phaseIndex;
  }, [phaseIndex]);

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      userSelect: 'none',
      marginBottom: '6px'
    }}>
      {/* =========================================================
          1. TOP BAR: BOX STREAK A SINISTRA & NOTIFICHE + PROFILO A DESTRA
          ========================================================= */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: '22px'
      }}>
        {/* PICCOLO BOX CON PALLA DEL CIRCO E NUMERO DI STREAK A SINISTRA (STILE BOX DASHBOARD) */}
        <button
          type="button"
          onClick={handleScrollToDashboard}
          title={`Vai alla Dashboard (${streakCount} ${streakCount === 1 ? 'giorno consecutivo' : 'giorni consecutivi'} di serie)`}
          aria-label={`Vai alla Dashboard: serie attuale ${streakCount} giorni consecutivi`}
          style={{
            height: '46px',
            padding: '0 14px 0 10px',
            borderRadius: '14px',
            backgroundColor: 'rgba(12, 16, 19, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(55, 74, 79, 0.42)',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none',
            cursor: 'pointer',
            outline: 'none',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
            e.currentTarget.style.filter = 'brightness(1.15)';
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
        >
          {/* Spirale sfocata molto leggera identica ai box della Dashboard */}
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
            alt="Palla del Circo"
            style={{
              width: '26px',
              height: '26px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 8px rgba(47, 77, 108, 0.6))',
              pointerEvents: 'none',
              position: 'relative',
              zIndex: 1,
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '18px',
              fontWeight: 900,
              color: '#d0cfcd',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.95), 0 0 8px rgba(47, 77, 108, 0.65)'
            }}
          >
            {streakCount}
          </span>
        </button>

        {/* GRUPPO A DESTRA: ICONA PROFILO ASIA */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* ICONA PROFILO A DESTRA (FOTO PERSONALIZZATA O BORING BLUE BOY DA CORALINE) */}
          <button
            onClick={() => {
              triggerHapticFeedback('selection');
              onOpenSettings('profile');
            }}
            aria-label="Apri impostazioni profilo"
            title="Profilo & Impostazioni"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#0c1013',
              border: '2px solid rgba(47, 77, 108, 0.65)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7), 0 0 12px rgba(47, 77, 108, 0.45)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease'
            }}>
              <img
                src={customAvatar || profileAvatarImg}
                alt="Profilo di Asia"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. CAROUSEL A DUE BOX FISICI CONCATENATI CON SCORRIMENTO ORIZZONTALE A TUTTO SCHERMO
          ========================================================= */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          width: 'calc(100% + 32px)',
          marginLeft: '-16px',
          marginRight: '-16px',
          height: '388px',
          minHeight: '388px',
          maxHeight: '388px',
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'manipulation'
        }}
      >
        {/* BINARIO ORIZZONTALE DEI DUE BOX CONCATENATI (200% LARGHEZZA) */}
        <div
          style={{
            display: 'flex',
            width: '200%',
            height: '100%',
            transform: isDragging
              ? `translate3d(calc(${activeTab === 0 ? '0%' : '-50%'} + ${dragOffset}px), 0, 0)`
              : (activeTab === 0 ? 'translate3d(0%, 0, 0)' : 'translate3d(-50%, 0, 0)'),
            transition: isDragging ? 'none' : 'transform 0.52s cubic-bezier(0.2, 0.9, 0.3, 1)',
            willChange: 'transform'
          }}
        >
          {/* SLIDE 1: BOX LA TUA SETTIMANA */}
          <div
            style={{
              width: '50%',
              height: '100%',
              flexShrink: 0,
              padding: '0 16px',
              boxSizing: 'border-box'
            }}
          >
            <div
              key="card-tab-0"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                background: 'linear-gradient(180deg, rgba(6, 9, 12, 0.99) 0%, rgba(8, 18, 30, 0.96) 12%, rgba(13, 44, 73, 0.88) 32%, rgba(12, 22, 33, 0.94) 62%, rgba(6, 9, 12, 0.99) 100%)',
                border: '1.5px solid rgba(47, 77, 108, 0.45)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.92), inset 0 1px 0 rgba(47, 77, 108, 0.25), 0 0 24px rgba(13, 44, 73, 0.25)',
                padding: '24px 16px 18px 16px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
        {/* SFUMATURA NERA CINEMATICA SIA DALL'ALTO CHE DAL BASSO */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(4, 6, 9, 0.88) 0%, rgba(4, 6, 9, 0.45) 16%, transparent 32%, transparent 68%, rgba(4, 6, 9, 0.55) 86%, rgba(4, 6, 9, 0.96) 100%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
          zIndex: 0
        }} />

        {/* SFONDO CON CIELO STELLATO MAGICO DI CORALINE (SFOCATO E MOLTO SCURITO) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${starryBg})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
          filter: 'blur(2.5px)',
          WebkitFilter: 'blur(2.5px)',
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
          opacity: 0.05,
          filter: 'blur(2px)',
          WebkitFilter: 'blur(2px)',
          maskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0, 0, 0, 0.1) 90%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
          zIndex: 0
        }} />

        {/* ALONE RADIALE BLU NOTTE CINEMATICO CORALINE SCURITO */}
        <div style={{
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(13, 44, 73, 0.22) 0%, rgba(12, 16, 19, 0.15) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* =========================================================
            INTESTAZIONE: "LA TUA SETTIMANA" SOPRA, "RITMO DELLA DIETA" SOTTO
            ========================================================= */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          {/* 1. SOPRA: LA TUA (A CAPORIGA) SETTIMANA (VERDE SMERALDO CORALINE) */}
          <div style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '23px',
            lineHeight: 1.15,
            letterSpacing: '0.8px',
            color: '#8be574',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(139, 229, 116, 0.45)',
            marginBottom: '4px'
          }}>
            La tua<br />settimana
          </div>
          {/* 2. SOTTO: RITMO DELLA DIETA (CREMA CORALINE VINTAGE - NON BIANCO SPARATO) */}
          <div style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.3px',
            color: '#DDCAB7',
            fontWeight: 700,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)'
          }}>
            RITMO DELLA DIETA
          </div>
        </div>

        {/* =========================================================
            LA LUNA CINEMATOGRAFICA A 7 FASI FLUTTUANTE (HERO SCURITA)
            ========================================================= */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Luna dell'Eclissi: tocca per ascoltare la spiegazione del Gatto"
          onClick={() => {
            triggerHapticFeedback('selection');
            if (onCatSpeak) {
              onCatSpeak(getUIElementExplanation('dashboard_moon_eclipse'));
            }
          }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '185px',
            height: '185px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '2px 0 16px 0',
            animation: 'moonFloatingBreathe 3.6s ease-in-out infinite',
            willChange: 'transform',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}>
          {/* 1. Ampia foschia eterea lunare ultra-sfumata (bianco prevalente con accenno verde morbidissimo) */}
          <div style={{
            position: 'absolute',
            inset: '-38px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.40) 0%, rgba(240, 255, 245, 0.22) 36%, rgba(139, 229, 116, 0.08) 65%, transparent 85%)',
            filter: 'blur(30px)',
            WebkitFilter: 'blur(30px)',
            animation: 'moonHaloPulse 3.6s ease-in-out infinite',
            pointerEvents: 'none'
          }} />

          {/* 2. Alone di luce soffusa a contatto con la luna (sfumatura delicata, zero stacco) */}
          <div style={{
            position: 'absolute',
            inset: '-18px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(242, 255, 246, 0.22) 42%, rgba(139, 229, 116, 0.07) 70%, transparent 88%)',
            filter: 'blur(16px)',
            WebkitFilter: 'blur(16px)',
            pointerEvents: 'none'
          }} />

          {/* I 7 SNAPSHOT FOTOGRAFICI IN CROSS-FADE CON CONTORNO MORBIDAMENTE SFUMATO */}
          {MOON_PHASES.map((imgSrc, idx) => {
            const isActive = idx === phaseIndex;
            return (
              <img
                key={idx}
                src={imgSrc}
                alt={`Luna Coraline Fase ${idx + 1} di 7`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(0.985)',
                  transition: 'opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), transform 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  maskImage: 'radial-gradient(circle at center, black 58%, rgba(0, 0, 0, 0.8) 75%, rgba(0, 0, 0, 0.25) 90%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 58%, rgba(0, 0, 0, 0.8) 75%, rgba(0, 0, 0, 0.25) 90%, transparent 100%)',
                  filter: isGlowActive && isActive
                    ? 'drop-shadow(0 0 18px rgba(255, 255, 255, 0.65)) drop-shadow(0 0 28px rgba(139, 229, 116, 0.35)) brightness(0.88) contrast(1.05)'
                    : 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.38)) drop-shadow(0 0 22px rgba(139, 229, 116, 0.14)) drop-shadow(0 6px 20px rgba(0, 0, 0, 0.75)) brightness(0.86) contrast(1.08)',
                  willChange: 'opacity, transform',
                  pointerEvents: 'none'
                }}
              />
            );
          })}
        </div>

        {/* =========================================================
            3. GLI ULTIMI 7 GIORNI CON OGGETTI REALI DI CORALINE
            (Da sinistra [t-6] a destra [Oggi])
            Oggetti: Pietra Verde, Bottone Nero, Chiave Nera
            ========================================================= */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Striscia dei 7 giorni della settimana: tocca per ascoltare la spiegazione del Gatto"
          onClick={() => {
            triggerHapticFeedback('selection');
            if (onCatSpeak) {
              onCatSpeak(getUIElementExplanation('dashboard_seven_days'));
            }
          }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '350px',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            padding: '8px 6px',
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(8, 12, 18, 0.95) 0%, rgba(4, 7, 11, 0.98) 100%)',
            border: '1px solid rgba(47, 77, 108, 0.35)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(47, 77, 108, 0.15)',
            overflow: 'hidden',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}>
          {/* Livello 1: Texture cielo stellato molto sfocata e scurita */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${starryBg})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: 0.10,
              filter: 'blur(3px)',
              WebkitFilter: 'blur(3px)',
              pointerEvents: 'none',
              borderRadius: 'inherit',
              zIndex: 0
            }}
          />

          {/* Livello 2: Stelline e punti luce diffusi identici allo sfondo totale dell'app (molto sfocati) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                radial-gradient(1.8px 1.8px at 12% 25%, rgba(221, 202, 183, 0.85), transparent),
                radial-gradient(2.4px 2.4px at 28% 72%, rgba(216, 198, 21, 0.75), transparent),
                radial-gradient(1.6px 1.6px at 45% 30%, rgba(255, 255, 255, 0.8), transparent),
                radial-gradient(2.2px 2.2px at 64% 68%, rgba(139, 229, 116, 0.7), transparent),
                radial-gradient(2.5px 2.5px at 80% 22%, rgba(221, 202, 183, 0.8), transparent),
                radial-gradient(1.8px 1.8px at 93% 76%, rgba(216, 198, 21, 0.75), transparent)
              `,
              filter: 'blur(2.2px)',
              WebkitFilter: 'blur(2.2px)',
              opacity: 0.8,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              zIndex: 0
            }}
          />

          {/* Livello 3: Sfumatura violacea dark (mano dell'Altra Madre) con sentore blu-notte */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 120%, rgba(88, 28, 130, 0.32) 0%, rgba(25, 12, 38, 0.2) 55%, transparent 85%)',
              pointerEvents: 'none',
              borderRadius: 'inherit',
              zIndex: 0
            }}
          />

          {daysBreakdown.map((item) => {
            const isToday = item.isToday;
            const state = item.dietState;

            let bgPill = 'transparent';
            if (state === 'success') {
              bgPill = 'rgba(40, 80, 30, 0.25)';
            } else if (state === 'cheat') {
              bgPill = 'rgba(85, 20, 25, 0.25)';
            } else if (state === 'cheat_key') {
              bgPill = 'rgba(120, 90, 20, 0.25)';
            }

            return (
              <div
                key={item.dateStr}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '5px 2px',
                  borderRadius: '10px',
                  backgroundColor: bgPill,
                  border: isToday
                    ? '1.5px solid #8be574'
                    : '1px solid transparent',
                  boxShadow: isToday ? '0 0 10px rgba(139, 229, 116, 0.35)' : 'none'
                }}
              >
                {/* NOME DEL GIORNO DELLA SETTIMANA (LUN, MAR, MER...) CON FONT DEL CALENDARIO */}
                <span style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '9.5px',
                  fontWeight: isToday ? 800 : 700,
                  color: isToday ? '#ffffff' : 'rgba(221, 202, 183, 0.75)',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                  lineHeight: 1
                }}>
                  {item.dayOfWeek}
                </span>

                {/* NUMERO DEL GIORNO CON FONT DEL CALENDARIO */}
                <span style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '11px',
                  color: isToday ? '#8be574' : 'rgba(221, 202, 183, 0.7)',
                  fontWeight: isToday ? 800 : 600,
                  marginBottom: '4px',
                  lineHeight: 1
                }}>
                  {item.dayNumber}
                </span>

                {/* OGGETTO REALE DI CORALINE CORRISPONDENTE ALL'ESITO */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {state === 'success' && (
                    <img
                      src={seeingStoneImg}
                      alt="Pietra Verde (Dieta Seguita)"
                      title="Dieta Seguita: Pietra Veggente Verde"
                      style={{
                        width: '18px',
                        height: '18px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 4px rgba(139, 229, 116, 0.7))'
                      }}
                    />
                  )}

                  {state === 'cheat' && (
                    <img
                      src={blackButtonImg}
                      alt="Bottone Nero (Giorno Fuori Sentiero)"
                      title="Giorno Fuori Sentiero: Bottone Nero"
                      style={{
                        width: '17px',
                        height: '17px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9))'
                      }}
                    />
                  )}

                  {state === 'cheat_key' && (
                    <img
                      src={keyImg}
                      alt="Chiave Nera (Giorno di Libertà)"
                      title="Giorno di Libertà: Chiave Nera"
                      style={{
                        width: '19px',
                        height: '19px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 5px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 9px rgba(255, 255, 255, 0.75))'
                      }}
                    />
                  )}

                  {state === 'neutral' && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isToday ? '#ffffff' : 'rgba(221, 202, 183, 0.35)',
                      lineHeight: 1
                    }}>
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* SLIDE 2: BOX STATISTICHE COMPARATIVE (VIOLA COME LA DASHBOARD) */}
    <div
      style={{
        width: '50%',
        height: '100%',
        flexShrink: 0,
        padding: '0 16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        key="card-tab-1"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, rgba(13, 44, 73, 0.94) 0%, rgba(12, 16, 19, 0.98) 55%, rgba(6, 9, 12, 0.99) 100%)',
          border: '1.5px solid rgba(47, 77, 108, 0.45)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.92), inset 0 1px 0 rgba(47, 77, 108, 0.25), 0 0 24px rgba(13, 44, 73, 0.25)',
          padding: '14px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
            {/* SFONDO DELLE STELLINE DI CORALINE (OSCURITO E BEN DOSATO) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${catCloudPattern})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: 0.20,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              zIndex: 0
            }} />

            {/* SFONDO CON CIELO STELLATO MAGICO DI CORALINE (SCURITO) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${starryBg})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: 0.09,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              zIndex: 0
            }} />

            {/* VELATURA SCURA CINEMATICA PER OSCURIRE LO SFONDO GENERALE */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(12, 16, 19, 0.4) 0%, rgba(6, 9, 12, 0.72) 100%)',
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
              opacity: 0.05,
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
              top: '35px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '260px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(47, 77, 108, 0.25) 0%, rgba(55, 74, 79, 0.12) 50%, rgba(20, 45, 76, 0.06) 70%, transparent 80%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            {/* I 4 GRANDI BOX STATISTICHE IN GRIGLIA 2x2: RIEMPIMENTO UGUALE AI BOX DELLA DASHBOARD */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              {/* BOX 1: ADERENZA DIETA (PIETRA VEGGENTE FLUTTUANTE GIGANTE) */}
              <div 
                role="button"
                tabIndex={0}
                aria-label="Aderenza Dieta: tocca per ascoltare la spiegazione del Gatto"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  if (onCatSpeak) {
                    onCatSpeak(getUIElementExplanation('dashboard_card_adherence'));
                  }
                }}
                style={{
                  backgroundColor: 'rgba(12, 16, 19, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(55, 74, 79, 0.42)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                {/* Spirale sfocata molto leggera identica alla Dashboard */}
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
                  alt="Aderenza Dieta"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 12px rgba(139, 229, 116, 0.75)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.9))',
                    animation: 'stoneFloat 3.8s ease-in-out infinite',
                    willChange: 'transform',
                    marginBottom: '6px',
                    position: 'relative',
                    zIndex: 1
                  }}
                />

                <div style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '28px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 12px rgba(139, 229, 116, 0.4)',
                  marginBottom: '4px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {stats.currentAdherence}%
                </div>

                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#d0cfcd',
                  opacity: 0.9,
                  lineHeight: 1.25,
                  position: 'relative',
                  zIndex: 1
                }}>
                  Media: <strong style={{ color: '#ffffff' }}>{stats.historicalAdherence}%</strong> <span style={{ color: comparisonDeltas.adh.color, fontWeight: 700, marginLeft: '3px' }}>{comparisonDeltas.adh.text}</span>
                </div>
              </div>

              {/* BOX 2: GIORNI RISPETTATI (STELLA ROSSA FLUTTUANTE GIGANTE) */}
              <div 
                role="button"
                tabIndex={0}
                aria-label="Giorni Rispettati: tocca per ascoltare la spiegazione del Gatto"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  if (onCatSpeak) {
                    onCatSpeak(getUIElementExplanation('dashboard_card_success'));
                  }
                }}
                style={{
                  backgroundColor: 'rgba(12, 16, 19, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(55, 74, 79, 0.42)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                {/* Spirale sfocata molto leggera identica alla Dashboard */}
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
                  alt="Giorni Rispettati"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 14px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))',
                    animation: 'starFloat 3.2s ease-in-out infinite 0.4s',
                    willChange: 'transform',
                    marginBottom: '6px',
                    position: 'relative',
                    zIndex: 1
                  }}
                />

                <div style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '28px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#8be574',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 12px rgba(139, 229, 116, 0.45)',
                  marginBottom: '4px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {stats.currentSuccessCount} <span style={{ fontSize: '15px', fontWeight: 700 }}>gg</span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#d0cfcd',
                  opacity: 0.9,
                  lineHeight: 1.25,
                  position: 'relative',
                  zIndex: 1
                }}>
                  Media: <strong style={{ color: '#ffffff' }}>{stats.avgMonthlySuccess}/m</strong> <span style={{ color: comparisonDeltas.succ.color, fontWeight: 700, marginLeft: '3px' }}>{comparisonDeltas.succ.text}</span>
                </div>
              </div>

              {/* BOX 3: BOTTONI NERI (BOTTONE NERO FLUTTUANTE GIGANTE) */}
              <div 
                role="button"
                tabIndex={0}
                aria-label="Bottoni Neri: tocca per ascoltare la spiegazione del Gatto"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  if (onCatSpeak) {
                    onCatSpeak(getUIElementExplanation('dashboard_card_cheats'));
                  }
                }}
                style={{
                  backgroundColor: 'rgba(12, 16, 19, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(55, 74, 79, 0.42)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                {/* Spirale sfocata molto leggera identica alla Dashboard */}
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
                  alt="Bottoni Neri"
                  style={{
                    width: '58px',
                    height: '58px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))',
                    animation: 'buttonFloat 3.6s ease-in-out infinite 0.8s',
                    willChange: 'transform',
                    marginBottom: '6px',
                    position: 'relative',
                    zIndex: 1
                  }}
                />

                <div style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '28px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#fca5a5',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 12px rgba(239, 68, 68, 0.45)',
                  marginBottom: '4px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {stats.currentCheatCount} <span style={{ fontSize: '15px', fontWeight: 700 }}>imprevisti</span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#d0cfcd',
                  opacity: 0.9,
                  lineHeight: 1.25,
                  position: 'relative',
                  zIndex: 1
                }}>
                  Media: <strong style={{ color: '#ffffff' }}>{stats.avgMonthlyCheats}/m</strong> <span style={{ color: comparisonDeltas.cheat.color, fontWeight: 700, marginLeft: '3px' }}>{comparisonDeltas.cheat.text}</span>
                </div>
              </div>

              {/* BOX 4: ALLENAMENTI BOBINSKY (PALLA DEL CAMBIO FLUTTUANTE GIGANTE) */}
              <div 
                role="button"
                tabIndex={0}
                aria-label="Allenamenti Bobinsky: tocca per ascoltare la spiegazione del Gatto"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  if (onCatSpeak) {
                    onCatSpeak(getUIElementExplanation('dashboard_card_workouts'));
                  }
                }}
                style={{
                  backgroundColor: 'rgba(12, 16, 19, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(55, 74, 79, 0.42)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(208, 207, 205, 0.14)',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                {/* Spirale sfocata molto leggera identica alla Dashboard */}
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
                  alt="Allenamenti"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 14px rgba(224, 159, 62, 0.65)) drop-shadow(0 0 10px rgba(139, 229, 116, 0.35))',
                    animation: 'stoneFloat 3.8s ease-in-out infinite 0.5s',
                    willChange: 'transform',
                    marginBottom: '6px',
                    position: 'relative',
                    zIndex: 1
                  }}
                />

                <div style={{
                  fontFamily: 'var(--font-gothic)',
                  fontSize: '28px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#e09f3e',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 12px rgba(224, 159, 62, 0.45)',
                  marginBottom: '4px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {stats.currentWorkoutCount} <span style={{ fontSize: '15px', fontWeight: 700 }}>workout</span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#d0cfcd',
                  opacity: 0.9,
                  lineHeight: 1.25,
                  position: 'relative',
                  zIndex: 1
                }}>
                  Media: <strong style={{ color: '#ffffff' }}>{stats.avgMonthlyWorkouts}/m</strong> <span style={{ color: comparisonDeltas.work.color, fontWeight: 700, marginLeft: '3px' }}>{comparisonDeltas.work.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* =========================================================
          INDICATORI DI PAGINA (PAGINATION DOTS) SOTTO LA SCHEDA
          ========================================================= */}
      <div
        role="tablist"
        aria-label="Pagine statistiche"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '12px',
          marginBottom: '2px',
          userSelect: 'none'
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 0}
          aria-label="Scheda 1: Ritmo della Dieta e Luna"
          onClick={() => handleSelectTab(0)}
          style={{
            width: activeTab === 0 ? '22px' : '7px',
            height: '7px',
            borderRadius: '5px',
            backgroundColor: activeTab === 0 ? 'rgba(226, 232, 240, 0.72)' : 'rgba(226, 232, 240, 0.22)',
            border: activeTab === 0 ? '1px solid rgba(226, 232, 240, 0.85)' : '1px solid rgba(226, 232, 240, 0.15)',
            boxShadow: activeTab === 0 ? '0 0 6px rgba(226, 232, 240, 0.35)' : 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            touchAction: 'manipulation'
          }}
        />

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 1}
          aria-label="Scheda 2: Statistiche Comparative e Medie"
          onClick={() => handleSelectTab(1)}
          style={{
            width: activeTab === 1 ? '22px' : '7px',
            height: '7px',
            borderRadius: '5px',
            backgroundColor: activeTab === 1 ? 'rgba(226, 232, 240, 0.72)' : 'rgba(226, 232, 240, 0.22)',
            border: activeTab === 1 ? '1px solid rgba(226, 232, 240, 0.85)' : '1px solid rgba(226, 232, 240, 0.15)',
            boxShadow: activeTab === 1 ? '0 0 6px rgba(226, 232, 240, 0.35)' : 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            touchAction: 'manipulation'
          }}
        />
      </div>

      {/* ANIMAZIONI DI TRANSIZIONE SCHEDE E FLUTTUAZIONE LUNA & OGGETTI */}
      <style>{`
        @keyframes coralineCardSoftFadeInRight {
          0% {
            opacity: 0;
            transform: translate3d(10px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes coralineCardSoftFadeInLeft {
          0% {
            opacity: 0;
            transform: translate3d(-10px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes moonFloatingBreathe {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -9px, 0) scale(1.025);
          }
        }

        @keyframes moonHaloPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.95;
          }
        }

        @keyframes stoneFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(2.4deg);
          }
        }

        @keyframes starFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(-2.4deg);
          }
        }

        @keyframes buttonFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -5px, 0) rotate(2deg);
          }
        }

        @keyframes keyFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(-2deg);
          }
        }
      `}</style>
    </div>
  );
});

export default ButtonMoonEclipse;
