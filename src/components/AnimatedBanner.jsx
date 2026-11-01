import React from 'react';
import coralineBannerImg from '../assets/coraline-banner.gif';

/**
 * Registro delle GIF / Animazioni di Coraline:
 * Predisposto per supportare un intero pacchetto di GIF che possono
 * alternarsi in base a giorni della settimana, streak, esito o orario.
 */
export const CORALINE_GIFS = [
  {
    id: 'coraline-curious',
    src: coralineBannerImg,
    alt: 'Coraline',
    // Parametri opzionali per alternanza futura (es. tag: 'neutral', 'success', 'monday', etc.)
    tags: ['default', 'curious']
  }
];

/**
 * Banner Animato Sopra al Calendario:
 * - Mostra la GIF a ripetizione continua (loop).
 * - Cornice gotica rifinita in Blu Scuro (#1a456e).
 * - Pronto per alternare più GIF in base a parametri personalizzati.
 */
export default function AnimatedBanner({ currentGifSrc = null }) {
  const activeGif = currentGifSrc || coralineBannerImg;

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
        src={activeGif}
        alt="Animazione Coraline"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '190px',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block'
        }}
      />

      {/* Sottile bagliore/sfumatura interna gotica sui bordi */}
      <div style={{
        position: 'absolute',
        inset: 0,
        boxShadow: 'inset 0 0 20px rgba(7, 23, 39, 0.75)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
