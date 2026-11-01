import React, { useState, useEffect, useRef } from 'react';
import introVideoSrc from '../assets/intro.mp4';

/**
 * Animazione di Apertura Essenziale & Spoglia:
 * - Totalmente muta (traccia audio rimossa alla radice dal file).
 * - Nessun pulsante, nessun indicatore, nessuna scritta (interfaccia pulita al 100%).
 * - Riproduzione immediata senza attrito e transizione ultra-rapida al diario.
 */
export default function IntroSplashVideo({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [visible, setVisible] = useState(true);
  const videoRef = useRef(null);

  const handleFinish = () => {
    if (fadingOut) return;
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 280); // Transizione ultra rapida e pulita
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // In caso di qualsiasi eccezione, avanza immediatamente
        handleFinish();
      });
    }

    // Timer di sicurezza (massimo 2.5s) per garantire che l'app si apra subito
    const timer = setTimeout(() => {
      handleFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={handleFinish}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.28s ease-out',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <video
        ref={videoRef}
        src={introVideoSrc}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        onEnded={handleFinish}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
