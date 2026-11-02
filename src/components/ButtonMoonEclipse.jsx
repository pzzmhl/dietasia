import React, { useMemo, useRef, useEffect, useState } from 'react';
import { calculateEclipseState } from '../utils/eclipseLogic.js';
import { getConsecutiveDietStreak } from '../utils/storage.js';
import { triggerHapticFeedback } from '../services/haptics';

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
import blackButtonImg from '../assets/black-button.webp'; // Bottone nero (sgarro)
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
  onOpenSettings = () => {}
}) {
  // Calcolo matematico a 7 giorni: ogni giorno seguito sposta il bottone indietro, ogni sgarro avanti
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
          1. TOP BAR: BOX STREAK A SINISTRA & ICONA PROFILO A DESTRA
          ========================================================= */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: '10px'
      }}>
        {/* PICCOLO BOX CON PALLA DEL CIRCO E NUMERO DI STREAK A SINISTRA */}
        <div
          title={`${streakCount} ${streakCount === 1 ? 'giorno consecutivo' : 'giorni consecutivi'} di dieta rispettata`}
          aria-label={`Serie attuale: ${streakCount} giorni consecutivi`}
          style={{
            height: '46px',
            padding: '0 14px 0 10px',
            borderRadius: '14px',
            background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.94) 0%, rgba(5, 17, 30, 0.97) 100%)',
            border: '1.5px solid rgba(107, 142, 85, 0.35)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(154, 185, 123, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none'
          }}
        >
          <img
            src={streakStarImg}
            alt="Palla del Circo"
            style={{
              width: '26px',
              height: '26px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(220, 38, 38, 0.65))',
              pointerEvents: 'none'
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '18px',
              fontWeight: 900,
              color: 'var(--coraline-yellow)',
              lineHeight: 1,
              position: 'relative',
              top: '-1px',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(216, 198, 21, 0.45)'
            }}
          >
            {streakCount}
          </span>
        </div>

        {/* ICONA PROFILO A DESTRA (BORING BLUE BOY DA CORALINE) */}
        <button
          onClick={() => {
            triggerHapticFeedback('selection');
            onOpenSettings();
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
            background: '#091c2f',
            border: '2px solid #1a456e',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7), 0 0 10px rgba(26, 69, 110, 0.55)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}>
            <img
              src={profileAvatarImg}
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

      {/* =========================================================
          2. DASHBOARD BOX CON SFONDO VORTICE / SPIRALE DELL'ALTRO MONDO
          ========================================================= */}
      <div style={{
        width: '100%',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(9, 29, 49, 0.94) 0%, rgba(5, 17, 30, 0.97) 65%, rgba(3, 10, 18, 0.98) 100%)',
        border: '1px solid rgba(107, 142, 85, 0.32)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(154, 185, 123, 0.18)',
        padding: '20px 16px 16px 16px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* SFONDO CON CIELO STELLATO MAGICO DI CORALINE (SFOCATO E DISSOLTO) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${starryBg})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.22,
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
          opacity: 0.08,
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
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(107, 142, 85, 0.24) 0%, rgba(26, 69, 110, 0.16) 55%, transparent 75%)',
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
          {/* 2. SOTTO: RITMO DELLA DIETA (BIANCO) */}
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.3px',
            color: '#ffffff',
            fontWeight: 700,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)'
          }}>
            RITMO DELLA DIETA
          </div>
        </div>

        {/* =========================================================
            LA LUNA CINEMATOGRAFICA A 7 FASI FLUTTUANTE (HERO)
            ========================================================= */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '185px',
          height: '185px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2px 0 16px 0',
          animation: 'moonFloatingBreathe 3.8s ease-in-out infinite',
          willChange: 'transform'
        }}>
          {/* Alone verde pulsante */}
          <div style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 229, 116, 0.25) 0%, rgba(35, 65, 25, 0.1) 60%, transparent 75%)',
            filter: isGlowActive
              ? 'drop-shadow(0 0 25px rgba(139, 229, 116, 0.9))'
              : 'drop-shadow(0 0 14px rgba(107, 142, 85, 0.35))',
            transition: 'filter 600ms ease',
            pointerEvents: 'none'
          }} />

          {/* I 7 SNAPSHOT FOTOGRAFICI IN CROSS-FADE */}
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
                  filter: isGlowActive && isActive
                    ? 'drop-shadow(0 0 22px rgba(139, 229, 116, 0.85))'
                    : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.95))',
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
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '350px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          padding: '8px 6px',
          borderRadius: '16px',
          backgroundColor: 'rgba(6, 20, 34, 0.75)',
          border: '1px solid rgba(107, 142, 85, 0.22)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
        }}>
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
                {/* NOME DEL GIORNO DELLA SETTIMANA (LUN, MAR, MER...) */}
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? '#ffffff' : 'rgba(221, 202, 183, 0.75)',
                  letterSpacing: '0.2px',
                  textTransform: 'uppercase',
                  marginBottom: '1px'
                }}>
                  {item.dayOfWeek}
                </span>

                {/* NUMERO DEL GIORNO */}
                <span style={{
                  fontSize: '8.5px',
                  color: isToday ? '#8be574' : 'rgba(221, 202, 183, 0.5)',
                  fontWeight: 600,
                  marginBottom: '4px'
                }}>
                  {isToday ? 'Oggi' : item.dayNumber}
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
                      alt="Bottone Nero (Sgarro)"
                      title="Sgarro: Bottone Nero"
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
                      alt="Chiave Nera (Jolly)"
                      title="Sgarro Autorizzato: Chiave Nera"
                      style={{
                        width: '18px',
                        height: '18px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 4px rgba(255, 213, 79, 0.6))'
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

      {/* ANIMAZIONE FLUTTUANTE ORGANICA DELLA LUNA */}
      <style>{`
        @keyframes moonFloatingBreathe {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -6px, 0) scale(1.015);
          }
        }
      `}</style>
    </div>
  );
});

export default ButtonMoonEclipse;
