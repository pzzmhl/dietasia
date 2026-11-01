import React, { useEffect, useState } from 'react';
import otherMotherImg from '../assets/other-mother-key.png';
import wybieImg from '../assets/wybie-proud.png';
import catModalBg from '../assets/cat-modal-bg.jpg';

/**
 * Modal Eventi Speciali della Storia di Coraline:
 * - 'other_mother_keys': L'Altra Madre ingoia l'ultima chiave (sgarri mensili esauriti)
 * - 'wybie_streak': Wybie si congratula per il traguardo di giorni di dieta consecutivi
 */
export default function StoryEventModal({ isOpen, type = 'wybie_streak', streak = 0, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isOtherMother = type === 'other_mother_keys';

  // Configurazione contenuti e stile
  const config = isOtherMother ? {
    title: "L'Altra Madre ha preso l'ultima chiave!",
    image: otherMotherImg,
    imageAlt: "L'Altra Madre che ingoia la chiave",
    imageHeight: '220px',
    quote: "Hai esaurito tutti i tuoi sgarri del mese, Asia! L'Altra Madre ha appena ingoiato l'ultima Chiave Nera... Da adesso in poi, niente più passi falsi, o vorrà cucirti i bottoni sugli occhi!",
    buttonLabel: "Resisterò all'Altra Madre ✦",
    borderColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    stitchColor: '#f87171',
    buttonBg: '#991b1b',
    buttonBorder: '#ef4444',
    titleColor: '#fca5a5'
  } : {
    title: "Wybie è fiero di te!",
    image: wybieImg,
    imageAlt: "Wybie Lovat sorridente e fiero",
    imageHeight: '235px',
    quote: `Ehi Asia, persino la nonna non ci crederebbe! Sono già ben ${streak} giorni di fila che segui la dieta alla perfezione! Continua così a cucire il tuo destino, stai battendo l'Altro Mondo!`,
    buttonLabel: "Grazie Wybie, andiamo avanti! ✦",
    borderColor: 'var(--coraline-yellow)',
    glowColor: 'rgba(216, 198, 21, 0.45)',
    stitchColor: 'var(--coraline-yellow)',
    buttonBg: '#786343',
    buttonBorder: 'var(--coraline-yellow)',
    titleColor: 'var(--coraline-yellow)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(3, 10, 18, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease-out'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundImage: `linear-gradient(rgba(6, 22, 37, 0.94), rgba(6, 22, 37, 0.97)), url(${catModalBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '24px',
          border: `2px dashed ${config.stitchColor}`,
          boxShadow: `0 16px 40px rgba(0, 0, 0, 0.9), 0 0 24px ${config.glowColor}, inset 0 0 20px rgba(0, 0, 0, 0.7)`,
          padding: '22px 18px 20px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'scale(1) translateZ(0)' : 'scale(0.92) translateZ(0)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease-out',
          willChange: 'transform, opacity',
          boxSizing: 'border-box'
        }}
      >
        {/* TITOLO IN FONT UFFICIALE CORALINE */}
        <h3
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: isOtherMother ? '14px' : '15px',
            color: config.titleColor,
            textAlign: 'center',
            margin: '0 0 14px 0',
            letterSpacing: '0.8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7)',
            lineHeight: 1.3
          }}
        >
          {config.title}
        </h3>

        {/* IMMAGINE DEL PERSONAGGIO (ALTRA MADRE O WYBIE) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: config.imageHeight,
            marginBottom: '14px',
            position: 'relative'
          }}
        >
          <img
            src={config.image}
            alt={config.imageAlt}
            loading="eager"
            decoding="async"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: isOtherMother
                ? 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 14px rgba(239, 68, 68, 0.45))'
                : 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 14px rgba(216, 198, 21, 0.35))',
              transform: visible ? 'translateZ(0) scale(1)' : 'translateZ(0) scale(0.95)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              borderRadius: isOtherMother ? '14px' : '0'
            }}
          />
        </div>

        {/* NUVOLA DI DIALOGO / TESTO ATMOSFERICO */}
        <div
          style={{
            backgroundColor: 'rgba(13, 44, 73, 0.75)',
            border: `1.5px dashed ${config.stitchColor}`,
            borderRadius: '16px',
            padding: '14px 14px',
            marginBottom: '18px',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)'
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: 1.5,
              color: 'var(--coraline-parchment)',
              fontStyle: 'italic',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
            }}
          >
            "{config.quote}"
          </p>
        </div>

        {/* BOTTONE D'AZIONE IN FONT CORALINE */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 14px',
            backgroundColor: config.buttonBg,
            border: `1.5px solid ${config.buttonBorder}`,
            borderRadius: '14px',
            color: '#ffffff',
            fontFamily: 'var(--font-coraline)',
            fontSize: '11px',
            letterSpacing: '0.8px',
            cursor: 'pointer',
            boxShadow: `0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px ${config.glowColor}`,
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease'
          }}
        >
          {config.buttonLabel}
        </button>
      </div>
    </div>
  );
}

