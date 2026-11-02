import React, { useMemo } from 'react';

/**
 * Calcola la tipologia di nuvola ottimale in base alla lunghezza della frase del Gatto:
 * - 'short': Nuvola compatta / a batuffolo (< 78 caratteri, 1-2 righe)
 * - 'medium': Nuvola ovale / cumulo classico (78 - 108 caratteri, 2-3 righe)
 * - 'long': Nuvola stratocumulo / tempesta estesa (> 108 caratteri, 3+ righe)
 */
export function getCloudType(quote) {
  const len = (quote || '').trim().length;
  if (len < 78) return 'short';
  if (len > 108) return 'long';
  return 'medium';
}

/**
 * Coordinate dei 3 profili vettoriali delle nuvole in stile stop-motion di Coraline:
 * Ciascun profilo possiede un numero e una disposizione di lobi differente per
 * modellarsi organicamente attorno al messaggio.
 */
const CLOUD_CONFIGS = {
  // 1. NUVOLA COMPATTA / BATUFFOLO (6 lobi prominenti, rotonda e paffuta)
  short: {
    viewBox: '0 0 300 135',
    path: 'M 80,110 C 45,110 22,90 22,68 C 22,46 42,28 68,26 C 85,8 145,5 175,20 C 205,10 250,22 262,45 C 285,55 288,85 268,102 C 250,118 200,118 165,112 C 135,118 105,116 80,110 Z',
    highlightPath: 'M 72,30 C 88,14 142,10 172,23 C 202,14 245,25 258,46',
    maxWidth: '295px',
    minHeight: '110px',
    padding: '16px 26px 22px 26px',
    tailOffset: '48%',
    fontSize: '14.5px'
  },
  // 2. NUVOLA OVALE / CUMULO CLASSICO (8-9 lobi asimmetrici d'argilla stop-motion)
  medium: {
    viewBox: '0 0 340 160',
    path: 'M 75,130 C 42,130 18,108 18,80 C 18,58 35,38 60,34 C 70,15 105,6 138,16 C 158,4 202,4 228,16 C 255,8 290,20 302,42 C 325,48 332,78 322,102 C 328,122 305,138 275,135 C 245,146 210,144 185,134 C 155,145 115,142 75,130 Z',
    highlightPath: 'M 64,37 C 74,19 104,11 135,20 C 158,8 198,8 224,20 C 250,12 284,23 296,44',
    maxWidth: '330px',
    minHeight: '135px',
    padding: '20px 28px 26px 28px',
    tailOffset: '50%',
    fontSize: '14px'
  },
  // 3. NUVOLA STRATOCUMULO / TEMPESTA ESTESA (11-12 lobi a livelli, panoramica e accogliente)
  long: {
    viewBox: '0 0 360 205',
    path: 'M 80,175 C 40,175 14,148 14,115 C 14,88 32,65 58,58 C 68,32 100,16 135,20 C 155,8 195,6 220,18 C 245,8 295,16 312,42 C 335,50 348,78 344,105 C 352,132 338,162 308,172 C 285,188 245,188 220,178 C 190,192 150,192 120,182 C 105,185 92,182 80,175 Z',
    highlightPath: 'M 62,60 C 72,36 98,22 130,24 C 152,12 190,10 216,22 C 240,12 288,20 306,44',
    maxWidth: '348px',
    minHeight: '165px',
    padding: '22px 30px 28px 30px',
    tailOffset: '52%',
    fontSize: '13.5px'
  }
};

/**
 * Nuvoletta di Dialogo del Gatto Nero in Stile Coraline:
 * - Forma a nuvola reale con lobi ondulati a stop-motion
 * - Palette grigietta ardesia/fumo con gradiente volumetrico
 * - Cucitura artigianale tratteggiata lungo il perimetro (stile Altra Madre)
 * - Luce d'accento sul colmo superiore
 * - Coda a batuffoli discendenti verso il gatto
 * - 3 varianti adattive (short, medium, long) in base alla lunghezza del testo
 */
const CoralineCatCloud = React.memo(function CoralineCatCloud({
  quote = '',
  context = 'neutral',
  stitchColor = null,
  forceType = null,
  style = {}
}) {
  const type = useMemo(() => {
    if (forceType && CLOUD_CONFIGS[forceType]) return forceType;
    return getCloudType(quote);
  }, [quote, forceType]);

  const cfg = CLOUD_CONFIGS[type] || CLOUD_CONFIGS.medium;

  // Cucitura perimetrale: colore delicatamente coordinato al contesto o grigio pergamena
  const finalStitchColor = stitchColor || (
    context === 'cheat'
      ? 'rgba(239, 68, 68, 0.55)'
      : context === 'key' || context === 'last_key'
      ? 'rgba(216, 198, 21, 0.55)'
      : context === 'success'
      ? 'rgba(139, 229, 116, 0.55)'
      : 'rgba(175, 195, 215, 0.45)'
  );

  const uniqueId = useMemo(() => {
    return `coraline-cloud-${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  return (
    <div
      className="coraline-cat-cloud-wrapper"
      style={{
        width: '100%',
        maxWidth: cfg.maxWidth,
        margin: '0 auto',
        position: 'relative',
        filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.85)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))',
        animation: 'coralineCloudPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards',
        willChange: 'transform, opacity',
        ...style
      }}
    >
      {/* CONTENITORE PRINCIPALE CON ANIMAZIONE FLUTTUANTE DELICATA */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: cfg.minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'coralineCloudFloat 3.8s ease-in-out infinite',
          willChange: 'transform'
        }}
      >
        {/* SFONDO VETTORIALE DELLA NUVOLA A LOBI REALI (SCALA PERFETTAMENTE SUL TESTO) */}
        <svg
          viewBox={cfg.viewBox}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <defs>
            {/* Gradiente volumetrico della nuvola grigietta di Coraline */}
            <linearGradient id={`${uniqueId}-grad`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#556373" />
              <stop offset="38%" stopColor="#3d4957" />
              <stop offset="78%" stopColor="#27323e" />
              <stop offset="100%" stopColor="#19222a" />
            </linearGradient>

            {/* Bagliore radiale morbido per dare rotondità ai lobi centrali */}
            <radialGradient id={`${uniqueId}-belly`} cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="rgba(100, 118, 138, 0.22)" />
              <stop offset="70%" stopColor="rgba(40, 52, 65, 0)" />
            </radialGradient>
          </defs>

          {/* Corpo a lobi della nuvola */}
          <path
            d={cfg.path}
            fill={`url(#${uniqueId}-grad)`}
            stroke={finalStitchColor}
            strokeWidth="1.6"
            strokeDasharray="4.5,3.5"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(inset 0 1px 3px rgba(255, 255, 255, 0.2))'
            }}
          />

          {/* Sfumatura volumetrica centrale */}
          <path
            d={cfg.path}
            fill={`url(#${uniqueId}-belly)`}
            pointerEvents="none"
          />

          {/* Riflesso di luce lunare sul colmo superiore della nuvola */}
          <path
            d={cfg.highlightPath}
            fill="none"
            stroke="rgba(240, 248, 255, 0.28)"
            strokeWidth="2.2"
            strokeLinecap="round"
            pointerEvents="none"
          />
        </svg>

        {/* TESTO DEL GATTO NEL GREMBO DELLA NUVOLA */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            padding: cfg.padding,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              color: '#ffffff',
              fontSize: cfg.fontSize,
              lineHeight: 1.48,
              fontStyle: 'italic',
              fontWeight: 600,
              margin: 0,
              fontFamily: 'var(--font-body)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.7)',
              letterSpacing: '-0.15px'
            }}
          >
            «{quote}»
          </p>
        </div>

        {/* CODA A BATUFFOLI DISCENDENTI VERSO IL GATTO */}
        <div
          style={{
            position: 'absolute',
            bottom: '-19px',
            left: cfg.tailOffset,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          {/* Bolla 1 (maggiore) */}
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #445160 0%, #2a3440 100%)',
              border: `1.2px dashed ${finalStitchColor}`,
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.7)'
            }}
          />
          {/* Bolla 2 (media) */}
          <div
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #374451 0%, #212933 100%)',
              border: `1px dashed ${finalStitchColor}`,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.7)'
            }}
          />
          {/* Bolla 3 (minore verso il muso del gatto) */}
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #2b3540 0%, #1a2128 100%)',
              border: `0.8px dashed ${finalStitchColor}`,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.7)'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes coralineCloudPop {
          0% {
            opacity: 0;
            transform: scale(0.85) translate3d(0, 8px, 0);
          }
          65% {
            opacity: 1;
            transform: scale(1.03) translate3d(0, -2px, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }

        @keyframes coralineCloudFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(0.4deg);
          }
        }
      `}</style>
    </div>
  );
});

export default CoralineCatCloud;

