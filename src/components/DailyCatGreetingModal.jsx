import React, { useState, useEffect, useRef } from 'react';
import catStandingImg from '../assets/cat-standing.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { triggerHapticFeedback } from '../services/haptics';
import { getTimeOfDayGreeting, getDailyCatQuoteForDate } from '../data/dailyCatQuotes';

/**
 * Schermata Giornaliera Minimale del Gatto (Primo Accesso del Giorno)
 * Ispirata al layout minimale scuro di riferimento:
 * - Sfondo: texture vortice dell'Altro Mondo con vignette
 * - In alto a destra: pulsante ✕ di chiusura
 * - Al centro: saluto temporale ("Buongiorno/Buon pomeriggio/Buonasera Asia"),
 *   frase del Gatto in grande, e il Gatto che fluttua
 * - In basso: bottone circolare con freccia avanti (→)
 */
export default function DailyCatGreetingModal({ isOpen, onClose, dateStr }) {
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setGreeting(getTimeOfDayGreeting());
      setQuote(getDailyCatQuoteForDate(dateStr));
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen, dateStr]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    triggerHapticFeedback('selection');
    setVisible(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      onClose();
    }, 240);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Messaggio del Gatto per Asia"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: '#040d18',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'calc(env(safe-area-inset-top, 24px) + 16px) 24px calc(env(safe-area-inset-bottom, 24px) + 32px) 24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        touchAction: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.985)',
        transition: 'opacity 0.26s cubic-bezier(0.16, 1, 0.3, 1), transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* SFONDO VORTICE DELL'ALTRO MONDO */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at center, rgba(4, 16, 28, 0.45) 0%, rgba(2, 8, 15, 0.94) 80%),
            url(${vortexBg})
          `,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.38,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Pulsante chiusura rapida ✕ in alto a destra */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Chiudi"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          right: '16px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'rgba(3, 10, 18, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'var(--coraline-parchment)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          lineHeight: 1,
          touchAction: 'manipulation',
          padding: 0
        }}
      >
        ✕
      </button>

      {/* Spazio flessibile in alto per bilanciare il centraggio perfetto */}
      <div style={{ flex: '0 0 10px', width: '100%' }} />

      {/* BLOCCO UNICO CENTRALE (TUTTO ORIENTATO AL CENTRO) */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          margin: 'auto 0'
        }}
      >
        {/* 1. Saluto in piccolo con il font di Coraline orientato al centro */}
        <div
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '15px',
            color: '#8be574',
            letterSpacing: '1px',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(139, 229, 116, 0.5)',
            marginBottom: '10px'
          }}
        >
          ✦ {greeting} ✦
        </div>

        {/* 2. La frase che dice il gatto (in bianco, pulita e centrale) */}
        <h1
          style={{
            fontSize: '20px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            lineHeight: 1.45,
            color: '#ffffff',
            letterSpacing: '-0.3px',
            margin: '0 0 16px 0',
            padding: '0 6px',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 16px rgba(13, 44, 73, 0.7)'
          }}
        >
          "{quote}"
        </h1>

        {/* 3. Il Gatto sotto, ancora più grande di prima, che prende quasi lo schermo */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4px'
          }}
        >
          {/* Alone di mistero dietro al gatto gigante */}
          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(74, 222, 128, 0.28) 0%, rgba(13, 44, 73, 0.2) 50%, transparent 70%)',
              filter: 'blur(24px)',
              pointerEvents: 'none'
            }}
          />

          <img
            src={catStandingImg}
            alt="Il Gatto Nero di Coraline"
            loading="eager"
            decoding="async"
            style={{
              height: '310px',
              maxHeight: '44vh',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.98)) drop-shadow(0 0 18px rgba(168, 85, 247, 0.65)) drop-shadow(0 0 32px rgba(139, 92, 246, 0.4))',
              animation: 'dailyCatFloat 3.8s ease-in-out infinite',
              pointerEvents: 'none',
              willChange: 'transform'
            }}
          />
        </div>
      </div>

      {/* FOOTER INFERIORE: PULSANTE CIRCOLARE GIALLO CORALINE CON FRECCIA AVANTI (→) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          paddingBottom: '8px'
        }}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Avanti, entra nel diario"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#8be574',
            border: '2px solid #bdf0ad',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 26px rgba(0, 0, 0, 0.8), 0 0 24px rgba(139, 229, 116, 0.65), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease',
            outline: 'none',
            touchAction: 'manipulation'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {/* Freccia avanti scura in netto contrasto sul cerchio giallo */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#061625"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block', transform: 'translateX(1.5px)' }}
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes dailyCatFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -7px, 0) rotate(1.8deg);
          }
        }
      `}</style>
    </div>
  );
}
