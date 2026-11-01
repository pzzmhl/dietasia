import React from 'react';

/**
 * =========================================================================
 * COMPONENTE: Illustrazione SVG del Gatto Nero di Coraline.
 * -------------------------------------------------------------------------
 * NOTA PER ASIA E GLI SVILUPPATORI:
 * Se in futuro desideri sostituire questa illustrazione SVG con un'immagine
 * PNG o WEBP locale personalizzata (es. uno screenshot del film o un fanart):
 * 
 * 1. Posiziona il tuo file nella cartella public: `public/cat.png`
 * 2. Sostituisci il blocco <svg> sottostante con:
 *    <img 
 *       src="/cat.png" 
 *       alt="Il Gatto Nero di Coraline" 
 *       className="w-full h-auto object-contain max-h-56 filter drop-shadow(0 10px 15px rgba(0,0,0,0.8))"
 *    />
 * =========================================================================
 */
export default function CatIllustration({ size = 200, className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow(0 8px 16px rgba(0,0,0,0.9))"
      >
        <defs>
          {/* Sfumatura corpo gatto nero profondo */}
          <linearGradient id="catBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a26" />
            <stop offset="40%" stopColor="#10111a" />
            <stop offset="100%" stopColor="#07070d" />
          </linearGradient>

          {/* Sfumatura occhi azzurri luminescenti (stile film Coraline) */}
          <radialGradient id="catEyeGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#034d75" />
          </radialGradient>

          {/* Riflesso aurea lunare dietro le orecchie */}
          <radialGradient id="catAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#442c6e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f1026" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Alone di mistero viola/bluastro sullo sfondo */}
        <ellipse cx="120" cy="130" rx="90" ry="70" fill="url(#catAura)" />

        {/* Coda snella e sinuosa */}
        <path
          d="M 165 195 C 195 195, 215 170, 210 135 C 205 110, 190 100, 185 105 C 180 110, 192 125, 194 145 C 196 170, 180 185, 160 185 Z"
          fill="url(#catBodyGrad)"
          stroke="#262738"
          strokeWidth="1"
        />

        {/* Corpo / Spalle snelle del gatto */}
        <path
          d="M 80 220 C 75 170, 85 140, 95 125 C 105 110, 135 110, 145 125 C 155 140, 165 170, 160 220 Z"
          fill="url(#catBodyGrad)"
          stroke="#20212e"
          strokeWidth="1.2"
        />

        {/* Testa affusolata e spigolosa */}
        <path
          d="M 75 90 C 70 70, 85 55, 120 55 C 155 55, 170 70, 165 90 C 160 115, 145 130, 120 132 C 95 130, 80 115, 75 90 Z"
          fill="url(#catBodyGrad)"
          stroke="#2d2f42"
          strokeWidth="1"
        />

        {/* Orecchio Sinistro (con un tocco leggermente sbeccato / vissuto) */}
        <path
          d="M 82 62 L 55 15 C 65 25, 82 32, 95 48 Z"
          fill="url(#catBodyGrad)"
          stroke="#34374a"
          strokeWidth="1.2"
        />
        {/* Interno orecchio sinistro scuro */}
        <path
          d="M 80 55 L 63 25 C 70 32, 80 38, 88 48 Z"
          fill="#251a3a"
          opacity="0.8"
        />

        {/* Orecchio Destro */}
        <path
          d="M 158 62 L 185 15 C 175 25, 158 32, 145 48 Z"
          fill="url(#catBodyGrad)"
          stroke="#34374a"
          strokeWidth="1.2"
        />
        {/* Interno orecchio destro scuro */}
        <path
          d="M 160 55 L 177 25 C 170 32, 160 38, 152 48 Z"
          fill="#251a3a"
          opacity="0.8"
        />

        {/* GRUPPO OCCHI CON ANIMAZIONE BLINK NATURALE */}
        <g className="animate-blink">
          {/* Occhio Sinistro grande e magnetico */}
          <ellipse
            cx="96"
            cy="86"
            rx="16"
            ry="20"
            transform="rotate(-5 96 86)"
            fill="url(#catEyeGrad)"
            stroke="#0f172a"
            strokeWidth="2"
          />
          {/* Pupilla felina verticale affilata */}
          <ellipse
            cx="97"
            cy="86"
            rx="3.5"
            ry="16"
            transform="rotate(-2 97 86)"
            fill="#050608"
          />
          {/* Riflesso di luce / scintilla bianca stop-motion */}
          <circle cx="92" cy="78" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="102" cy="94" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Occhio Destro */}
          <ellipse
            cx="144"
            cy="86"
            rx="16"
            ry="20"
            transform="rotate(5 144 86)"
            fill="url(#catEyeGrad)"
            stroke="#0f172a"
            strokeWidth="2"
          />
          {/* Pupilla destra */}
          <ellipse
            cx="143"
            cy="86"
            rx="3.5"
            ry="16"
            transform="rotate(2 143 86)"
            fill="#050608"
          />
          {/* Riflessi occhio destro */}
          <circle cx="140" cy="78" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="149" cy="94" r="1.5" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Nasino piccolo e scuro */}
        <path
          d="M 117 105 L 123 105 L 120 109 Z"
          fill="#2f3144"
        />

        {/* Sorrisetto sottile ed enigmatico del Gatto */}
        <path
          d="M 112 113 C 116 116, 120 115, 120 115 C 120 115, 124 116, 128 113"
          stroke="#474a63"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Baffi stilizzati fini (bianco nebbia tenue) */}
        {/* Baffi lato sinistro */}
        <path d="M 90 108 C 65 106, 50 112, 38 120" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 88 113 C 65 116, 48 124, 40 132" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 90 118 C 70 125, 55 136, 46 145" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

        {/* Baffi lato destro */}
        <path d="M 150 108 C 175 106, 190 112, 202 120" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 152 113 C 175 116, 192 124, 200 132" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 150 118 C 170 125, 185 136, 194 145" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

        {/* Collare sottile con filo giallo di Coraline */}
        <path
          d="M 102 140 Q 120 146 138 140"
          stroke="#e09f3e"
          strokeWidth="2"
          strokeDasharray="3 2"
          fill="none"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

