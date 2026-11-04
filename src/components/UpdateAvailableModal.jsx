import React, { useEffect, useState, useRef } from 'react';
import secretDoorImg from '../assets/secret-door.webp';
import keyImg from '../assets/key.webp';
import vortexBg from '../assets/coraline-vortex-bg.webp';
import { hapticSuccess, hapticLight } from '../utils/haptics';
import { downloadAndInstallUpdate, ignoreUpdateVersion } from '../utils/updateChecker';

/**
 * Modal Notifica Aggiornamento Disponibile in Stile Coraline
 * 
 * - Atmosfera dark-fantasy: porticina segreta con alone dorato/verde
 * - Note di rilascio scrollabili in box ricamato
 * - Download nativo dell'APK tramite browser di sistema (_system)
 * - Tasto "Più tardi" con memorizzazione versione ignorata
 */
export default function UpdateAvailableModal({
  isOpen,
  updateInfo,
  onClose
}) {
  const [visible, setVisible] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isSubmittingRef.current = false;
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !updateInfo || !updateInfo.updateAvailable) return null;

  const { currentVersion, latestVersion, releaseNotes, apkUrl } = updateInfo;

  const handleDownload = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    hapticSuccess();
    downloadAndInstallUpdate(apkUrl);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleDismiss = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    hapticLight();
    if (latestVersion) {
      ignoreUpdateVersion(latestVersion);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nuovo aggiornamento disponibile"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        backgroundColor: 'rgba(3, 10, 18, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease-out',
        willChange: 'opacity'
      }}
      onClick={handleDismiss}
    >
      <div
        className="stitched-card vortex-card"
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'linear-gradient(180deg, rgba(13, 44, 73, 0.96) 0%, rgba(6, 22, 37, 0.98) 100%)',
          borderRadius: '24px',
          border: '1.5px solid var(--coraline-yellow)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(216, 198, 21, 0.35), inset 0 1px 0 rgba(216, 198, 21, 0.3)',
          padding: '22px 18px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          transform: visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 14px, 0) scale(0.95)',
          transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TRAMA VORTICE DI CORALINE SULLO SFONDO */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${vortexBg})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.12,
            filter: 'blur(1.5px)',
            WebkitFilter: 'blur(1.5px)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
          }}
        />

        {/* Pulsante chiusura rapida ✕ */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Chiudi e rimanda aggiornamento"
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

        {/* ICONA PORTICINA CON LA CHIAVE NERA */}
        <div
          style={{
            position: 'relative',
            width: '74px',
            height: '74px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            zIndex: 1
          }}
        >
          <img
            src={secretDoorImg}
            alt="Porticina Segreta"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 10px rgba(216, 198, 21, 0.5))'
            }}
          />
          <img
            src={keyImg}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-6px',
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(216, 198, 21, 0.8))',
              transform: 'rotate(-15deg)'
            }}
          />
        </div>

        {/* TITOLO E SOTTOTITOLO */}
        <div style={{ textAlign: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <h3
            style={{
              fontFamily: 'var(--font-coraline)',
              fontSize: '17px',
              color: 'var(--coraline-yellow)',
              letterSpacing: '0.6px',
              margin: '0 0 4px 0',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(216, 198, 21, 0.45)'
            }}
          >
            Una nuova porta si è aperta!
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '11.5px',
              color: 'var(--coraline-parchment)',
              opacity: 0.85,
              margin: 0
            }}
          >
            Nuova versione: <strong>{latestVersion}</strong> (attuale: v{currentVersion})
          </p>
        </div>

        {/* BOX NOTE DI RILASCIO SCROLLABILI */}
        {releaseNotes && releaseNotes.trim().length > 0 && (
          <div
            style={{
              width: '100%',
              maxHeight: '120px',
              overflowY: 'auto',
              backgroundColor: 'rgba(3, 12, 22, 0.8)',
              border: '1px solid rgba(216, 198, 21, 0.25)',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '16px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 1,
              touchAction: 'pan-y'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-gothic)',
                fontSize: '10.5px',
                fontWeight: 700,
                color: 'var(--coraline-yellow)',
                marginBottom: '4px',
                letterSpacing: '0.3px'
              }}
            >
              Novità dell'Altro Mondo:
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                lineHeight: 1.4,
                color: 'var(--coraline-parchment)',
                opacity: 0.88,
                whiteSpace: 'pre-wrap'
              }}
            >
              {releaseNotes}
            </div>
          </div>
        )}

        {/* PULSANTI DI AZIONE */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, #d8c615 0%, #a89408 100%)',
              color: '#04101e',
              border: 'none',
              fontFamily: 'var(--font-gothic)',
              fontSize: '12.5px',
              fontWeight: 800,
              letterSpacing: '0.4px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(216, 198, 21, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              touchAction: 'manipulation',
              transition: 'transform 0.12s ease'
            }}
          >
            ✦ Scarica e Installa APK
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: 'var(--coraline-parchment)',
              opacity: 0.75,
              border: '1px solid rgba(221, 202, 183, 0.25)',
              fontFamily: 'var(--font-gothic)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            Più tardi
          </button>
        </div>
      </div>
    </div>
  );
}

