import React, { useState, useEffect } from 'react';
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
    setTimeout(() => {
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
            radial-gradient(circle at center, rgba(4, 16, 28, 0.5) 0%, rgba(2, 8, 15, 0.92) 80%),
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

      {/* HEADER SUPERIORE: PULSANTE CHIUDI (✕) IN ALTO A DESTRA */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Chiudi e vai al diario"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(221, 202, 183, 0.75)',
            fontSize: '22px',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '8px',
            touchAction: 'manipulation',
            transition: 'color 0.2s ease, transform 0.2s ease',
            outline: 'none'
          }}
        >
          ✕
        </button>
      </div>

      {/* CONTENUTO CENTRALE: SALUTO + FRASE + GATTO FLUTTUANTE */}
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          margin: 'auto 0'
        }}
      >
        {/* Saluto in piccolo (Buongiorno / Buon pomeriggio / Buonasera Asia) */}
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: 'rgba(221, 202, 183, 0.7)',
            marginBottom: '16px'
          }}
        >
          {greeting}
        </div>

        {/* Frase del Gatto in grande al centro */}
        <h1
          style={{
            fontSize: '21px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            lineHeight: 1.45,
            color: '#fdfbf7',
            letterSpacing: '-0.3px',
            margin: '0 0 24px 0',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 20px rgba(13, 44, 73, 0.6)'
          }}
        >
          {quote}
        </h1>

        {/* Il Gatto Nero che fluttua morbidamente sotto la frase */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '6px'
          }}
        >
          {/* Alone soffuso dietro al gatto */}
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(74, 222, 128, 0.22) 0%, rgba(13, 44, 73, 0.15) 50%, transparent 70%)',
              filter: 'blur(12px)',
              pointerEvents: 'none'
            }}
          />

          <img
            src={catStandingImg}
            alt="Il Gatto Nero di Coraline"
            loading="eager"
            decoding="async"
            style={{
              width: '95px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(74, 222, 128, 0.35))',
              animation: 'dailyCatFloat 3.6s ease-in-out infinite',
              pointerEvents: 'none',
              willChange: 'transform'
            }}
          />
        </div>
      </div>

      {/* FOOTER INFERIORE: PULSANTE CIRCOLARE CON FRECCIA AVANTI (→) */}
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
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: '#f5efe6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(245, 239, 230, 0.35)',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease',
            outline: 'none',
            touchAction: 'manipulation'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {/* Freccia avanti in stile pulito minimale (come nell'immagine di riferimento) */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#121820"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block', transform: 'translateX(1px)' }}
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
