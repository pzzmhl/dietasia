import React, { useState } from 'react';
import keyImg from '../assets/key.png';

/**
 * Componente per la Chiave Nera di Coraline:
 * - Immagine originale ad alta definizione con dimensioni generose.
 * - Stato 'active' (nitida, con bagliore oro) vs 'used' (sfumata a serratura usata).
 * - Fallback SVG istantaneo.
 */
export default function KeyIcon({ 
  size = 38, 
  isUsed = false, 
  className = '', 
  style = {} 
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{
          opacity: isUsed ? 0.8 : 1,
          filter: isUsed 
            ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 18px rgba(220, 240, 255, 0.75))' 
            : 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))',
          ...style
        }}
      >
        <circle cx="50" cy="28" r="22" fill={isUsed ? "#1e293b" : "#12131c"} stroke={isUsed ? "#f8fafc" : "#c7a40e"} strokeWidth="2.5" />
        <circle cx="44" cy="24" r="2.5" fill="#e2e8f0" />
        <circle cx="56" cy="24" r="2.5" fill="#e2e8f0" />
        <circle cx="44" cy="32" r="2.5" fill="#e2e8f0" />
        <circle cx="56" cy="32" r="2.5" fill="#e2e8f0" />
        <line x1="50" y1="50" x2="50" y2="88" stroke={isUsed ? "#1e293b" : "#12131c"} strokeWidth={6} strokeLinecap="round" />
        <line x1="50" y1="76" x2="62" y2="76" stroke={isUsed ? "#1e293b" : "#12131c"} strokeWidth={5} strokeLinecap="square" />
        <line x1="50" y1="84" x2="62" y2="84" stroke={isUsed ? "#1e293b" : "#12131c"} strokeWidth={5} strokeLinecap="square" />
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
        opacity: isUsed ? 0.78 : 1,
        filter: isUsed 
          ? 'brightness(1.1) drop-shadow(0 0 8px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 18px rgba(225, 240, 255, 0.8)) drop-shadow(0 0 28px rgba(255, 255, 255, 0.45))' 
          : 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 6px rgba(216, 198, 21, 0.35))',
        transition: 'all 0.25s ease',
        ...style
      }}
      className={className}
    />
  );
}
