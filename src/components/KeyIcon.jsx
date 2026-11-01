import React, { useState } from 'react';
import keyImg from '../assets/key.png';

/**
 * Componente per la Chiave Nera di Coraline.
 * - Carica in alta qualità l'immagine png della chiave.
 * - Supporta stato 'active' o 'used' (sfumata/opacizzata).
 * - Fornisce fallback SVG istantaneo in caso di problemi di caricamento.
 */
export default function KeyIcon({ 
  size = 28, 
  isUsed = false, 
  className = '', 
  style = {} 
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback SVG fedele alla Chiave Bottone di Coraline
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{
          opacity: isUsed ? 0.3 : 1,
          filter: isUsed ? 'grayscale(1)' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))',
          ...style
        }}
      >
        <circle cx="50" cy="28" r="22" fill="#12131c" stroke="#c7a40e" strokeWidth="2.5" />
        <circle cx="44" cy="24" r="2.5" fill="#e2e8f0" />
        <circle cx="56" cy="24" r="2.5" fill="#e2e8f0" />
        <circle cx="44" cy="32" r="2.5" fill="#e2e8f0" />
        <circle cx="56" cy="32" r="2.5" fill="#e2e8f0" />
        <line x1="50" y1="50" x2="50" y2="88" stroke="#12131c" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="76" x2="62" y2="76" stroke="#12131c" strokeWidth="5" strokeLinecap="square" />
        <line x1="50" y1="84" x2="62" y2="84" stroke="#12131c" strokeWidth="5" strokeLinecap="square" />
      </svg>
    );
  }

  return (
    <img
      src={keyImg}
      alt="Chiave Nera di Coraline"
      onError={() => setHasError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        opacity: isUsed ? 0.28 : 1,
        filter: isUsed 
          ? 'grayscale(1) brightness(0.6)' 
          : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 4px rgba(199, 164, 14, 0.25))',
        transition: 'all 0.2s ease',
        ...style
      }}
      className={className}
    />
  );
}
