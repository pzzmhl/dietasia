import React, { useEffect, useState, useRef } from 'react';
import bobinskyYesImg from '../assets/bobinsky-workout-yes.jpg';
import bobinskyNoImg from '../assets/bobinsky-workout-no.jpg';

/**
 * BobinskyReactionModal:
 * Mostra a schermo intero con sfondo sfocato (backdrop-filter: blur)
 * la foto di Bobinsky con la medaglia sul petto quando si clicca SÌ ad allenamento,
 * oppure Bobinsky a testa in giù quando si clicca NO.
 * Rimane visibile per qualche secondo (o fino a tocco/tap).
 */
export default function BobinskyReactionModal({
  status, // 'yes' | 'no' | null
  onClose,
  duration = 5000
}) {
  const [visible, setVisible] = useState(false);
  const timersRef = useRef([]);

  const addTimer = (id) => {
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!status) {
      setVisible(false);
      return;
    }

    const raf = requestAnimationFrame(() => setVisible(true));

    const timer = addTimer(setTimeout(() => {
      setVisible(false);
      addTimer(setTimeout(() => {
        if (onClose) onClose();
      }, 260));
    }, duration));

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [status, duration, onClose]);

  if (!status) return null;

  const isYes = status === 'yes';
  const imgSource = isYes ? bobinskyYesImg : bobinskyNoImg;

  const handleDismiss = () => {
    setVisible(false);
    addTimer(setTimeout(() => {
      if (onClose) onClose();
    }, 200));
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10005,
        backgroundColor: 'rgba(3, 10, 18, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        touchAction: 'manipulation',
        cursor: 'pointer'
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          width: '100%',
          maxWidth: '330px',
          backgroundColor: 'rgba(6, 20, 34, 0.96)',
          borderRadius: '24px',
          border: '2px solid rgb(141, 109, 82)',
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.95), 0 0 24px rgba(141, 109, 82, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'scale(1) translate3d(0, 0, 0)' : 'scale(0.92) translate3d(0, 16px, 0)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'default',
          position: 'relative'
        }}
      >
        {/* Pulsante chiusura rapida ✕ */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
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
            lineHeight: 1
          }}
        >
          ✕
        </button>
        {/* IMMAGINE DI BOBINSKY (SÌ: SORRIDENTE CON MEDAGLIA, NO: A TESTA IN GIÙ) */}
        <div style={{
          width: '100%',
          maxHeight: '310px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#040d16'
        }}>
          <img
            src={imgSource}
            alt={isYes ? "Il Grande Bobinsky approva l'allenamento!" : "Il Grande Bobinsky e lo stretching acrobatico di riposo"}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '310px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>

        {/* DIDASCALIA IN STILE CORALINE */}
        <div style={{
          padding: '14px 16px 16px 16px',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '17px',
            color: 'var(--coraline-parchment)',
            letterSpacing: '0.6px',
            marginBottom: '4px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)'
          }}>
            {isYes ? '✦ Il Grande Bobinsky approva!' : '✦ Riposo Strategico della Brigata!'}
          </div>

          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--coraline-parchment)',
            opacity: 0.88,
            lineHeight: 1.35
          }}>
            {isYes 
              ? 'Ottimo lavoro per il circo dei topi saltatori!' 
              : 'Anche i topolini della brigata ricaricano le molle! Il vero atleta sa quando riposare, Boiarski!'}
          </div>
        </div>
      </div>
    </div>
  );
}

