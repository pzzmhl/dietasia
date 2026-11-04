import React, { useEffect, useState } from 'react';
import otherMotherImg from '../assets/other-mother-key.webp';
import catModalBg from '../assets/cat-modal-bg.webp';
import { triggerHapticFeedback } from '../utils/haptics';

/**
 * Modal Eventi Speciali della Storia di Coraline:
 * L'Altra Madre vorrebbe un copione rigido (chiavi mensili esaurite).
 */
export default function StoryEventModal({ isOpen, onClose }) {
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
          border: '2px dashed #f87171',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 24px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.7)',
          padding: '22px 18px 20px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: visible ? 'scale(1) translateZ(0)' : 'scale(0.92) translateZ(0)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease-out',
          willChange: 'transform, opacity',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Pulsante chiusura rapida ✕ */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '12px',
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
            lineHeight: 1,
            touchAction: 'manipulation',
            padding: 0
          }}
        >
          ✕
        </button>

        {/* TITOLO IN FONT UFFICIALE CORALINE */}
        <h3
          style={{
            fontFamily: 'var(--font-coraline)',
            fontSize: '14px',
            color: '#fca5a5',
            textAlign: 'center',
            margin: '0 0 14px 0',
            letterSpacing: '0.8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7)',
            lineHeight: 1.3
          }}
        >
          L'Altra Madre vorrebbe un copione perfetto...
        </h3>

        {/* IMMAGINE DELL'ALTRA MADRE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '220px',
            marginBottom: '14px',
            position: 'relative'
          }}
        >
          <img
            src={otherMotherImg}
            alt="L'Altra Madre che custodisce l'ultima chiave"
            width={220}
            height={220}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 14px rgba(239, 68, 68, 0.45))',
              transform: visible ? 'translateZ(0) scale(1)' : 'translateZ(0) scale(0.95)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              borderRadius: '14px',
              position: 'relative',
              zIndex: 1
            }}
          />
        </div>

        {/* NUVOLA DI DIALOGO / TESTO ATMOSFERICO */}
        <div
          style={{
            backgroundColor: 'rgba(13, 44, 73, 0.75)',
            border: '1.5px dashed #f87171',
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
            "Le quattro chiavi di scorta hanno fatto il loro lavoro questo mese, Asia. L'Altra Madre vorrebbe che tutto fosse rigido, immutabile e finto, ma la tua forza vive nel mondo reale. Da qui in avanti non servono magie: basta la tua bussola quotidiana."
          </p>
        </div>

        {/* BOTTONE D'AZIONE */}
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('selection');
            if (onClose) onClose();
          }}
          style={{
            width: '100%',
            padding: '12px 14px',
            backgroundColor: 'rgba(50, 18, 22, 0.85)',
            border: '1.5px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '14px',
            color: '#ffffff',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '13.5px',
            letterSpacing: '0.4px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(239, 68, 68, 0.5)',
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease'
          }}
        >
          Il mondo reale appartiene a me ✦
        </button>
      </div>
    </div>
  );
}
