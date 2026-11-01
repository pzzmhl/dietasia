import React, { useState, useEffect, useRef } from 'react';
import fallbackBanner from '../assets/coraline-banner.gif';
import {
  getRandomStartupGif,
  getNextGifForCategory,
  mapStatusToCategory,
  preloadGif
} from '../services/coralineGifs';

// Durata stimata per 10 ripetizioni complete di una GIF di Coraline (~2.4s x 10 = 24s)
const TEN_REPETITIONS_MS = 24000;

/**
 * Banner Animato Sopra al Calendario:
 * - Mostra una GIF all'apertura dell'app.
 * - Reagisce istantaneamente a ogni nuovo esito (successo, sgarro, chiave).
 * - Dopo 10 ripetizioni (~24 secondi) la GIF NON cambia: si ferma (freeze) sul fotogramma attuale.
 * - Un tocco sul banner quando è fermo o un nuovo inserimento riavvia l'animazione per altre 10 ripetizioni.
 */
export default function AnimatedBanner({ latestOutcomeTrigger = null }) {
  // Stato della GIF correntemente visibile
  const [currentGif, setCurrentGif] = useState(() => {
    try {
      return getRandomStartupGif();
    } catch (e) {
      return { id: 'fallback', url: fallbackBanner, category: 'neutral' };
    }
  });

  const [fadeKey, setFadeKey] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const activeCategoryRef = useRef(currentGif?.category || 'neutral');

  // Mantieni il ref della categoria sincronizzato
  useEffect(() => {
    activeCategoryRef.current = currentGif?.category || 'neutral';
  }, [currentGif]);

  // Funzione per fermare (congelare) la GIF sul fotogramma attuale
  const freezeBanner = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    try {
      const w = img.naturalWidth || img.clientWidth || 400;
      const h = img.naturalHeight || img.clientHeight || 200;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        setIsFrozen(true);
      }
    } catch (err) {
      console.warn('Impossibile bloccare la GIF su canvas:', err);
      // Se c'è un errore di contesto, rimane comunque senza ruotare
    }
  };

  // 1. Gestione del timer: dopo 10 ripetizioni si ferma (senza cambiare GIF)
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Se non è congelato, avvia il conto alla rovescia di 10 ripetizioni
    if (!isFrozen) {
      timerRef.current = setTimeout(() => {
        freezeBanner();
      }, TEN_REPETITIONS_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentGif, isFrozen, fadeKey]);

  // 2. Reazione immediata quando l'utente registra un esito nel calendario
  useEffect(() => {
    if (!latestOutcomeTrigger || !latestOutcomeTrigger.status) return;

    const category = mapStatusToCategory(latestOutcomeTrigger.status);
    if (category === 'neutral') return; // Se resetta il giorno a neutro, mantiene la GIF attuale

    // Reset immediato del congelamento e del timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextGif = getNextGifForCategory(category);
    if (nextGif && nextGif.url) {
      activeCategoryRef.current = category;
      setIsFrozen(false);
      setCurrentGif(nextGif);
      setFadeKey((prev) => prev + 1);
    }

    // Precarica in background la successiva per transizione fulminea al prossimo esito
    setTimeout(() => {
      try {
        const peekNext = getNextGifForCategory(category);
        if (peekNext && peekNext.url) {
          preloadGif(peekNext.url);
        }
      } catch (e) {}
    }, 1500);

  }, [latestOutcomeTrigger]);

  // Tocco sul banner quando è fermo per riavviare le 10 ripetizioni
  const handleBannerClick = () => {
    if (isFrozen) {
      setIsFrozen(false);
      setFadeKey((prev) => prev + 1);
    }
  };

  const commonMediaStyle = {
    width: '100%',
    height: 'auto',
    maxHeight: '190px',
    objectFit: 'cover',
    objectPosition: 'center',
    transform: 'translateZ(0)'
  };

  return (
    <div
      onClick={handleBannerClick}
      style={{
        width: '100%',
        marginBottom: '14px',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1.5px solid var(--border-dark-blue-light)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(6, 22, 37, 0.5)',
        backgroundColor: 'rgba(6, 22, 37, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        position: 'relative',
        cursor: isFrozen ? 'pointer' : 'default'
      }}
      title={isFrozen ? 'Tocca per riprodurre di nuovo l\'animazione' : 'Coraline Banner'}
    >
      {/* Canvas per congelare l'animazione dopo 10 ripetizioni */}
      <canvas
        ref={canvasRef}
        style={{
          ...commonMediaStyle,
          display: isFrozen ? 'block' : 'none'
        }}
      />

      {/* Immagine GIF animata durante le 10 ripetizioni */}
      <img
        ref={imgRef}
        key={fadeKey}
        crossOrigin="anonymous"
        src={currentGif?.url || fallbackBanner}
        alt="Animazione Coraline"
        onError={(e) => {
          if (e.currentTarget.src !== fallbackBanner) {
            e.currentTarget.src = fallbackBanner;
          }
        }}
        style={{
          ...commonMediaStyle,
          display: isFrozen ? 'none' : 'block',
          animation: 'bannerFadeIn 0.22s ease-out',
          willChange: 'opacity'
        }}
      />

      <style>{`
        @keyframes bannerFadeIn {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
