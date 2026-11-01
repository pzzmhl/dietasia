import React from 'react';

/**
 * Icona del Bottone Nero di Coraline.
 * Dettagli: Rotondo, nero lucido con riflessi 3D, bordo sagomato, 
 * 4 fori centrali con filo da cucito incrociato a 'X'.
 */
export default function BlackButtonIcon({ size = 52, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ filter: 'drop-shadow(0px 5px 8px rgba(0, 0, 0, 0.75))' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente superficie esterna bottone (onice scuro lucido) */}
        <radialGradient id="btnRimGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#3d3e52" />
          <stop offset="35%" stopColor="#1e1f29" />
          <stop offset="70%" stopColor="#12131b" />
          <stop offset="100%" stopColor="#08080d" />
        </radialGradient>

        {/* Gradiente conca interna del bottone */}
        <radialGradient id="btnInnerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#161722" />
          <stop offset="75%" stopColor="#0b0c12" />
          <stop offset="100%" stopColor="#252636" />
        </radialGradient>

        {/* Gradiente fori del bottone (profondità scura) */}
        <radialGradient id="holeGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#020204" />
          <stop offset="100%" stopColor="#1a1b24" />
        </radialGradient>

        {/* Riflesso luce superiore curva tipica dello stop-motion */}
        <linearGradient id="glossArc" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Ombra cucitura */}
        <filter id="threadShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Cerchio base esterno sagomato */}
      <circle cx="50" cy="50" r="48" fill="url(#btnRimGrad)" stroke="#1a1924" strokeWidth="1.5" />

      {/* Bordo rilievo concavo */}
      <circle cx="50" cy="50" r="40" fill="url(#btnInnerGrad)" stroke="#2b2d3d" strokeWidth="1" />

      {/* Riflesso lucido a mezzaluna sull'arcata superiore */}
      <path
        d="M 22 40 A 35 35 0 0 1 78 40 A 31 23 0 0 0 22 40 Z"
        fill="url(#glossArc)"
      />

      {/* Bordo riflettente perimetrale sottile */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8" />

      {/* I 4 fori del bottone (posizionati a quadrato simmetrico) */}
      {/* Foro Top-Left */}
      <circle cx="40" cy="40" r="5" fill="url(#holeGrad)" stroke="#090a0f" strokeWidth="1.2" />
      <circle cx="39" cy="39" r="1.5" fill="#323444" opacity="0.4" />

      {/* Foro Top-Right */}
      <circle cx="60" cy="40" r="5" fill="url(#holeGrad)" stroke="#090a0f" strokeWidth="1.2" />
      <circle cx="59" cy="39" r="1.5" fill="#323444" opacity="0.4" />

      {/* Foro Bottom-Left */}
      <circle cx="40" cy="60" r="5" fill="url(#holeGrad)" stroke="#090a0f" strokeWidth="1.2" />
      <circle cx="39" cy="59" r="1.5" fill="#323444" opacity="0.4" />

      {/* Foro Bottom-Right */}
      <circle cx="60" cy="60" r="5" fill="url(#holeGrad)" stroke="#090a0f" strokeWidth="1.2" />
      <circle cx="59" cy="59" r="1.5" fill="#323444" opacity="0.4" />

      {/* Filo di cucitura incrociato ad 'X' (spago bianco sporco con trama) */}
      <g filter="url(#threadShadow)">
        {/* Filo Diagonale 1: Top-Left -> Bottom-Right */}
        <line
          x1="39"
          y1="39"
          x2="61"
          y2="61"
          stroke="#f1f5f9"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Traccia di filo giallo impermeabile intrecciata */}
        <line
          x1="39.5"
          y1="39.5"
          x2="60.5"
          y2="60.5"
          stroke="#e09f3e"
          strokeWidth="1.2"
          strokeDasharray="2 1"
          strokeLinecap="round"
        />

        {/* Filo Diagonale 2: Top-Right -> Bottom-Left */}
        <line
          x1="61"
          y1="39"
          x2="39"
          y2="61"
          stroke="#e2e8f0"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Traccia di filo d'accento intrecciata */}
        <line
          x1="60.5"
          y1="39.5"
          x2="39.5"
          y2="60.5"
          stroke="#c084fc"
          strokeWidth="1"
          strokeDasharray="2 1"
          strokeLinecap="round"
        />

        {/* Nodo centrale del filo cucito */}
        <circle cx="50" cy="50" r="2.2" fill="#cbd5e1" />
      </g>
    </svg>
  );
}

