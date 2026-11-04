import React, { useMemo, useRef, useEffect, useState } from 'react';
import { calculateEclipseState } from '../utils/eclipseLogic.js';
import { getConsecutiveDietStreak } from '../utils/storage.js';
import { smoothScrollToElement } from '../utils/scrollAnimation.js';
import { triggerHapticFeedback } from '../utils/haptics';
import { getUIElementExplanation } from '../data/catExplanations';
import { getSyncStatus, subscribeSyncStatus } from '../utils/syncQueue.js';

// Immagine profilo Boring Blue Boy da Coraline
import profileAvatarImg from '../assets/profile-avatar.webp';
// Palla con stella rossa del Circo (Streak)
import streakStarImg from '../assets/streak-star.webp';
// Sfondo vortice/spirale dell'Altro Mondo
import vortexBg from '../assets/coraline-vortex-bg.webp';
// Sfondo cielo stellato magico di Coraline
import starryBg from '../assets/coraline-starry-bg.webp';

// Oggetti grafici reali di Coraline per gli esiti dei 7 giorni
import seeingStoneImg from '../assets/seeing-stone.webp'; // Pietra verde (dieta seguita)
import blackButtonImg from '../assets/black-button.webp'; // Bottone nero (giorno fuori sentiero)
import keyImg from '../assets/key.webp';                 // Chiave nera (chiave jolly)

// I 7 snapshot fotografici originali estratti direttamente dalla reference cinematografica di Coraline
import moonPhase0 from '../assets/eclipse-phases/coraline-moon-phase-0.webp';
import moonPhase1 from '../assets/eclipse-phases/coraline-moon-phase-1.webp';
import moonPhase2 from '../assets/eclipse-phases/coraline-moon-phase-2.webp';
import moonPhase3 from '../assets/eclipse-phases/coraline-moon-phase-3.webp';
import moonPhase4 from '../assets/eclipse-phases/coraline-moon-phase-4.webp';
import moonPhase5 from '../assets/eclipse-phases/coraline-moon-phase-5.webp';
import moonPhase6 from '../assets/eclipse-phases/coraline-moon-phase-6.webp';

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
  todayStr,
  onOpenSettings = () => {},
  customAvatar = null,
  onScrollToDashboard,
  onCatSpeak
}) {
  const handleScrollToDashboard = () => {
    triggerHapticFeedback('selection');
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

  // Stato sincronizzazione Cloud live (Indicatore Visivo)
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus());

  useEffect(() => {
    const unsub = subscribeSyncStatus((newStatus) => {
      setSyncStatus(newStatus);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const syncConfig = useMemo(() => {
    switch (syncStatus) {
      case 'syncing':
        return {
          color: '#38bdf8',
          glow: '0 0 8px rgba(56, 189, 248, 0.9)',
          title: 'Sincronizzazione Cloud in corso...',
          icon: (
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: '#ffffff',
              animation: 'spinSync 0.8s linear infinite'
            }} />
          )
        };
      case 'pending':
        return {
          color: '#f59e0b',
          glow: '0 0 6px rgba(245, 158, 11, 0.8)',
          title: 'Modifiche in attesa di salvataggio...',
          icon: <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
        };
      case 'offline':
        return {
          color: '#64748b',
          glow: 'none',
          title: 'Offline (dati al sicuro sul dispositivo)',
          icon: <span style={{ width: '5px', height: '1.5px', borderRadius: '1px', backgroundColor: '#cbd5e1' }} />
        };
      case 'error':
        return {
          color: '#ef4444',
          glow: '0 0 8px rgba(239, 68, 68, 0.85)',
          title: 'Errore sincronizzazione (ritenterà)',
          icon: <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>!</span>
        };
      case 'synced':
      default:
        return {
          color: '#10b981',
          glow: '0 0 7px rgba(16, 185, 129, 0.75)',
          title: 'Dati sincronizzati e protetti nel Cloud',
          icon: (
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )
        };
    }
  }, [syncStatus]);

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
            alt="Palla del Circo"
            width={26}
            height={26}
            loading="eager"
            decoding="async"
            draggable={false}
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
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          {/* ICONA PROFILO A DESTRA (FOTO PERSONALIZZATA O BORING BLUE BOY DA CORALINE) */}
          <button
            onClick={() => {
              triggerHapticFeedback('selection');
              onOpenSettings('profile');
            }}
            aria-label="Apri impostazioni profilo"
            title={`Profilo & Impostazioni (${syncConfig.title})`}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative'
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              minWidth: '46px',
              minHeight: '46px',
              borderRadius: '14px',
              background: '#0c1013',
              border: '2px solid rgba(47, 77, 108, 0.65)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7), 0 0 12px rgba(47, 77, 108, 0.45)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}>
              <img
                src={customAvatar || profileAvatarImg}
                alt="Profilo di Asia"
                width={46}
                height={46}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            </div>

            {/* BADGE VISIVO STATO SINCRONIZZAZIONE (BSU) */}
            <div
              title={syncConfig.title}
              aria-label={`Stato sincronizzazione: ${syncConfig.title}`}
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: syncConfig.color,
                border: '2px solid #071524',
                boxShadow: syncConfig.glow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                pointerEvents: 'none'
              }}
            >
              {syncConfig.icon}
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. SCHEDA LA TUA SETTIMANA (LUNA & SETTE GIORNI)
          ========================================================= */}
      <div
        style={{
          width: '100%',
          minHeight: '418px',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, rgba(6, 9, 12, 0.99) 0%, rgba(8, 18, 30, 0.96) 12%, rgba(13, 44, 73, 0.88) 32%, rgba(12, 22, 33, 0.94) 62%, rgba(6, 9, 12, 0.99) 100%)',
          border: '1.5px solid rgba(47, 77, 108, 0.45)',
          outline: '1px dashed rgba(139, 229, 116, 0.16)',
          outlineOffset: '-6px',
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
        <div className="vortex-bg-layer" style={{
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
          {/* 2. SOTTO: RITMO DELLA DIETA (CREMA CORALINE VINTAGE CON CUCITURE A PUNTO CROCE) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '9px', color: 'rgba(221, 202, 183, 0.45)', letterSpacing: '2px', userSelect: 'none' }}>✕—✕</span>
            <span style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.4px',
              color: '#DDCAB7',
              fontWeight: 700,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)'
            }}>
              RITMO DELLA DIETA
            </span>
            <span style={{ fontSize: '9px', color: 'rgba(221, 202, 183, 0.45)', letterSpacing: '2px', userSelect: 'none' }}>✕—✕</span>
          </div>
        </div>

        {/* =========================================================
            LA LUNA CINEMATOGRAFICA A 7 FASI FLUTTUANTE (HERO)
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
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* 2. Alone di luce soffusa a contatto con la luna (sfumatura delicata, zero stacco) */}
          <div style={{
            position: 'absolute',
            inset: '-18px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(242, 255, 246, 0.22) 42%, rgba(139, 229, 116, 0.07) 70%, transparent 88%)',
            filter: 'blur(16px)',
            WebkitFilter: 'blur(16px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* I 7 SNAPSHOT FOTOGRAFICI IN CROSS-FADE */}
          {MOON_PHASES.map((imgSrc, idx) => {
            const isActive = idx === phaseIndex;
            return (
              <img
                key={idx}
                src={imgSrc}
                alt={`Luna Coraline Fase ${idx + 1} di 7`}
                width={185}
                height={185}
                loading={isActive ? 'eager' : 'lazy'}
                fetchPriority={isActive ? 'high' : 'auto'}
                decoding="async"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%',
                  zIndex: 2,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateZ(0) scale(1)' : 'translateZ(0) scale(0.985)',
                  transition: 'opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), transform 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isGlowActive && isActive
                    ? 'drop-shadow(0 0 18px rgba(255, 255, 255, 0.65)) drop-shadow(0 0 28px rgba(139, 229, 116, 0.35)) brightness(0.88) contrast(1.05)'
                    : 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.38)) drop-shadow(0 0 22px rgba(139, 229, 116, 0.14)) drop-shadow(0 6px 20px rgba(0, 0, 0, 0.75)) brightness(0.86) contrast(1.08)',
                  willChange: isActive ? 'opacity, transform' : 'auto',
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
          aria-label="Riepilogo ultimi 7 giorni"
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
            cursor: 'default'
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
                      width={18}
                      height={18}
                      decoding="async"
                      draggable={false}
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
                      width={17}
                      height={17}
                      decoding="async"
                      draggable={false}
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
                      width={19}
                      height={19}
                      decoding="async"
                      draggable={false}
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

      {/* ANIMAZIONI DI FLUTTUAZIONE LUNA & OGGETTI */}
      <style>{`
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
      `}</style>
    </div>
  );
});

export default ButtonMoonEclipse;
