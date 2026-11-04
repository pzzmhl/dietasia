import React, { useState, useEffect, useRef } from 'react';
import wybieImg from '../assets/wybie-proud.webp';
import catCloudPattern from '../assets/cat-cloud-pattern.webp';
import { triggerHapticFeedback } from '../utils/haptics';
import {
  ALL_WYBIE_QUOTES,
  getWybieStreakQuote,
  getRandomWybieQuote,
  canWybieSpeakToday,
  recordWybieSpokenToday
} from '../data/wybieQuotes';

/**
 * Wybie Lovat Fluttuante in basso a sinistra (il compagno che incarna Michele):
 * - Appare nello stesso angolo del topo
 * - Specchiato orizzontalmente (scaleX(-1)) così è rivolto verso l'interno dello schermo
 * - Nuvoletta di fumetto con frasi d'amore, incoraggiamento per ogni step/streak e motivazionali
 * - Appare sia sui traguardi e allenamenti sia a sorpresa nei giorni randomici con frasi dolci
 * - Toccandolo passa alla frase successiva e resetta il timer di chiusura
 */
export default function FloatingWybie() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeQuote, setActiveQuote] = useState(ALL_WYBIE_QUOTES[0]);
  const quoteIndexRef = useRef(0);
  const autoDismissTimerRef = useRef(null);

  const resetAutoDismiss = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    // Rimane visibile per 10 secondi, poi si dissolve dolcemente
    autoDismissTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  // Notifica il Topo Saltatore quando Wybie è visibile per evitare sovrapposizioni nell'angolo sinistro
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('coraline-wybie-visibility', { detail: { visible: isVisible } }));
    }
    return () => {
      if (isVisible && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coraline-wybie-visibility', { detail: { visible: false } }));
      }
    };
  }, [isVisible]);

  // 1. Apparizione spontanea a giorni alterni (mai per due giorni consecutivi!)
  useEffect(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Regola dei giorni alterni: parla solo se oggi può parlare (almeno 1 giorno di silenzio trascorso)
    if (canWybieSpeakToday(todayStr)) {
      const timer = setTimeout(() => {
        const spontaneousQuote = getRandomWybieQuote('spontaneous');
        setActiveQuote(spontaneousQuote);
        setIsVisible(true);
        resetAutoDismiss();
        recordWybieSpokenToday(todayStr);
      }, 3600); // Compare dopo 3.6 secondi

      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Ascolto per eventi di traguardo streak, azioni o test manuale
  useEffect(() => {
    const handleTrigger = (e) => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const isManualTest = e?.type === 'test-wybie-modal' || e?.type === 'trigger-wybie' || Boolean(e?.detail?.isManualTest);

      // Se è un evento automatico (non test manuale), rispetta rigorosamente la regola dei giorni alterni!
      if (!isManualTest && !canWybieSpeakToday(todayStr)) {
        return; // Ha già parlato ieri: oggi rimane in silenzio
      }

      const streak = e?.detail?.streak;
      const eventType = e?.detail?.type;
      const quoteId = e?.detail?.quoteId;
      let targetQuote = null;

      if (streak !== undefined && streak !== null) {
        // Seleziona la frase di traguardo precisa tra gli obiettivi a giorni alterni
        targetQuote = getWybieStreakQuote(Number(streak));
      } else if (eventType) {
        // Seleziona una frase adatta all'evento (workout, diet_success, diet_cheat, diet_key, spontaneous)
        targetQuote = getRandomWybieQuote(eventType);
      } else if (quoteId) {
        targetQuote = ALL_WYBIE_QUOTES.find((q) => q.id === quoteId);
      }

      if (!targetQuote || (isManualTest && !streak && !eventType && !quoteId)) {
        // Cicla attraverso tutte le frasi per permettere di testarle tutte da Impostazioni
        quoteIndexRef.current = (quoteIndexRef.current + 1) % ALL_WYBIE_QUOTES.length;
        targetQuote = ALL_WYBIE_QUOTES[quoteIndexRef.current];
      }

      setActiveQuote(targetQuote);
      setIsVisible(true);
      resetAutoDismiss();
      triggerHapticFeedback('selection');

      if (!isManualTest) {
        recordWybieSpokenToday(todayStr);
      }
    };

    const handleMouseTest = () => {
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      setIsVisible(false);
    };

    window.addEventListener('test-wybie-modal', handleTrigger);
    window.addEventListener('trigger-wybie', handleTrigger);
    window.addEventListener('test-coraline-mouse', handleMouseTest);

    return () => {
      window.removeEventListener('test-wybie-modal', handleTrigger);
      window.removeEventListener('trigger-wybie', handleTrigger);
      window.removeEventListener('test-coraline-mouse', handleMouseTest);
    };
  }, []);

  const handleDismiss = (e) => {
    if (e) e.stopPropagation();
    triggerHapticFeedback('selection');
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    setIsVisible(false);
  };

  const handleWybieClick = () => {
    triggerHapticFeedback('selection');
    // Toccare Wybie passa alla frase d'amore o incoraggiamento successiva
    quoteIndexRef.current = (quoteIndexRef.current + 1) % ALL_WYBIE_QUOTES.length;
    setActiveQuote(ALL_WYBIE_QUOTES[quoteIndexRef.current]);
    resetAutoDismiss();
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Wybie Lovat di Coraline"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)',
        left: '18px',
        zIndex: 10005, // Posizionato in primo piano assoluto sopra ogni modale/impostazioni
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'translateZ(0)',
        pointerEvents: 'none',
        animation: 'wybieCornerFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* NUVOLETTA A FUMETTO DI WYBIE RIVOLTA VERSO L'INTERNO */}
      <div
        onClick={handleWybieClick}
        style={{
          position: 'absolute',
          bottom: '124px',
          left: '2px',
          width: 'max-content',
          maxWidth: 'min(235px, 64vw)',
          padding: '11px 14px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1.5px solid #0f172a',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.35)',
          color: '#0f172a',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          animation: 'wybieCloudPop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
      >
        {/* Texture Coraline dissolta nel riempimento (opacità 10%) */}
        <div
          style={{
            position: 'absolute',
            inset: '1.5px',
            borderRadius: '14.5px',
            backgroundImage: `url(${catCloudPattern})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.10,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Puntatore / coda del fumetto in basso verso Wybie */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '32px',
            width: '10px',
            height: '10px',
            background: '#ffffff',
            borderLeft: '1.5px solid #0f172a',
            borderBottom: '1.5px solid #0f172a',
            transform: 'rotate(-45deg)',
            zIndex: 1
          }}
        />

        {/* CONTENUTO INFORMATIVO DELLA NUVOLETTA (SOLO FRASE DIRETTA) */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          {/* Tasto chiusura rapida ✕ posizionato discreto in alto a destra */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Chiudi nuvoletta"
            title="Chiudi"
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-6px',
              background: 'none',
              border: 'none',
              padding: '4px',
              color: 'rgba(15, 23, 42, 0.35)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              lineHeight: 1,
              touchAction: 'manipulation'
            }}
          >
            ✕
          </button>

          {/* Testo autentico e diretto di Michele */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 650,
              lineHeight: 1.42,
              color: '#0f172a',
              textAlign: 'left',
              paddingRight: '12px'
            }}
          >
            {activeQuote.text}
          </div>

          <div
            style={{
              fontSize: '8.5px',
              color: 'rgba(15, 23, 42, 0.42)',
              fontStyle: 'italic',
              textAlign: 'right',
              marginTop: '2px'
            }}
          >
            tocca per un'altra frase ↻
          </div>
        </div>
      </div>

      {/* PERSONAGGIO WYBIE FLUTTUANTE SPECCHIATO VERSO L'INTERNO */}
      <button
        type="button"
        onClick={handleWybieClick}
        aria-label="Wybie Lovat: tocca per ascoltare un altro incoraggiamento da Michele"
        title="Tocca per ascoltare un'altra frase di Wybie/Michele"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          animation: 'wybieCornerFloat 3.2s ease-in-out infinite',
          willChange: 'transform'
        }}
      >
        <img
          src={wybieImg}
          alt="Wybie Lovat"
          width={70}
          height={115}
          loading="eager"
          decoding="async"
          draggable={false}
          style={{
            height: '115px',
            width: 'auto',
            objectFit: 'contain',
            // SPECCHIATO ORIZZONTALMENTE: così è girato verso l'interno dello schermo
            transform: 'scaleX(-1) translateZ(0)',
            WebkitTransform: 'scaleX(-1) translateZ(0)',
            filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(216, 198, 21, 0.55)) drop-shadow(0 0 22px rgba(216, 198, 21, 0.3))',
            pointerEvents: 'none'
          }}
        />
      </button>

      {/* ANIMAZIONI CSS STOP-MOTION CORNER */}
      <style>{`
        @keyframes wybieCornerFadeIn {
          0% {
            opacity: 0;
            transform: translate3d(-15px, 20px, 0) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes wybieCornerFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(0, -6px, 0) rotate(1.2deg);
          }
          50% {
            transform: translate3d(0, -9px, 0) rotate(-0.8deg);
          }
          75% {
            transform: translate3d(0, -4px, 0) rotate(0.6deg);
          }
        }

        @keyframes wybieCloudPop {
          0% {
            opacity: 0;
            transform: scale(0.75) translate3d(-10px, 15px, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }
      `}</style>
    </aside>
  );
}
