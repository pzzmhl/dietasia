import React, { useState, useEffect, useRef } from 'react';
import introVideoSrc from '../assets/intro.mp4';

/**
 * Anteprima Video Introduttiva all'apertura dell'app:
 * - Riproduce il video verticale 1080x1920 a schermo intero.
 * - Gestisce l'autoplay audio/video ottimizzato per Android & Mobile.
 * - Dissolvenza gotica fluida al termine del video (o al tocco di "Salta").
 * - Timer di sicurezza (massimo 3s) per non bloccare mai l'utente.
 */
export default function IntroSplashVideo({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const finishTimeoutRef = useRef(null);

  const handleFinish = () => {
    if (fadingOut) return;
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 450);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Autoplay con audio bloccato dalle policy del browser, riproduco in muto:', err);
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    }

    // Timer di sicurezza: dissolve al massimo dopo 3.2 secondi
    finishTimeoutRef.current = setTimeout(() => {
      handleFinish();
    }, 3200);

    return () => {
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, []);

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.45s ease-out',
        overflow: 'hidden'
      }}
      onClick={handleFinish}
    >
      {/* Video ottimizzato a tutto schermo */}
      <video
        ref={videoRef}
        src={introVideoSrc}
        autoPlay
        playsInline
        webkit-playsinline="true"
        onEnded={handleFinish}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block'
        }}
      />

      {/* Pulsante Salta in alto a destra */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleFinish();
        }}
        aria-label="Salta intro"
        style={{
          position: 'absolute',
          top: 'env(safe-area-inset-top, 20px)',
          right: '20px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          border: '1px solid var(--coraline-yellow)',
          color: 'var(--coraline-yellow)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          zIndex: 2
        }}
      >
        Salta ➔
      </button>

      {/* Pulsante Audio Muto / Attivo in basso a sinistra */}
      <button
        onClick={toggleSound}
        aria-label="Attiva/disattiva audio"
        style={{
          position: 'absolute',
          bottom: 'env(safe-area-inset-bottom, 24px)',
          left: '20px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          fontSize: '15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 2
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
