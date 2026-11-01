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
 * - Mostra una GIF randomica ad ogni riapertura dell'app.
 * - Reagisce istantaneamente a ogni nuovo esito (anche ripetuto) attivando la categoria corrispondente.
 * - Estrae senza ripetizioni (Shuffle Bag / Deck) fino a esaurimento della categoria, poi ricomincia da zero.
 * - Alterna automaticamente a una nuova GIF randomica ogni 10 ripetizioni continue.
 */
export default function AnimatedBanner({ latestOutcomeTrigger = null }) {
  // Stato della GIF correntemente visibile
  const [currentGif, setCurrentGif] = useState(() => {
    try {
      return getRandomStartupGif();
    } catch (e) {
      return { id: 'fallback', url: fallbackBanner, category: 'all' };
    }
  });

  const [fadeKey, setFadeKey] = useState(0);
  const activeCategoryRef = useRef(currentGif?.category || 'all');
  const timerRef = useRef(null);

  // Mantieni il ref della categoria sincronizzato
  useEffect(() => {
    activeCategoryRef.current = currentGif?.category || 'all';
  }, [currentGif]);

  // Funzione per avanzare alla prossima GIF della categoria attiva dopo 10 ripetizioni
  const advanceToNextRotatingGif = () => {
    const next = getNextGifForCategory(activeCategoryRef.current);
    setCurrentGif(next);
    setFadeKey((prev) => prev + 1);
  };

  // 1. Gestione del timer di rotazione ogni 10 ripetizioni
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      advanceToNextRotatingGif();
    }, TEN_REPETITIONS_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentGif]);

  // 2. Reazione immediata quando l'utente registra un esito nel calendario
  useEffect(() => {
    if (!latestOutcomeTrigger || !latestOutcomeTrigger.status) return;

    const category = mapStatusToCategory(latestOutcomeTrigger.status);
    if (category === 'neutral') return; // Se resetta il giorno a neutro, mantiene la GIF attuale

    // Reset immediato del timer e transizione alla GIF della categoria scelta
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextGif = getNextGifForCategory(category);
    activeCategoryRef.current = category;
    setCurrentGif(nextGif);
    setFadeKey((prev) => prev + 1);

    // Precarica in background la successiva per transizione fulminea
    setTimeout(() => {
      try {
        const peekNext = getNextGifForCategory(category);
        preloadGif(peekNext.url);
      } catch (e) {}
    }, 1500);

  }, [latestOutcomeTrigger]);

  return (
    <div
      style={{
        width: '100%',
        marginBottom: '14px',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1.5px solid var(--border-dark-blue-light)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(6, 22, 37, 0.5)',
        backgroundColor: 'rgba(6, 22, 37, 0.9)',
        position: 'relative'
      }}
    >
      <img
        key={fadeKey}
        src={currentGif.url}
        alt="Animazione Coraline"
        onError={(e) => {
          // Fallback di sicurezza in caso di assenza temporanea di rete
          if (e.currentTarget.src !== fallbackBanner) {
            e.currentTarget.src = fallbackBanner;
          }
        }}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '190px',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          animation: 'bannerFadeIn 0.35s ease-out'
        }}
      />

      <style>{`
        @keyframes bannerFadeIn {
          from { opacity: 0.6; filter: blur(3px); }
          to { opacity: 1; filter: blur(0px); }
        }
      `}</style>
    </div>
  );
}
