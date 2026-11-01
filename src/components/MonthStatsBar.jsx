import React from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import KeyIcon from './KeyIcon';

/**
 * Dashboard Statistiche Mensile Stile Coraline (Versione Gigante & Ultra-Visiva):
 * - Rimosso totalmente il filo e la percentuale.
 * - Le 4 Chiavi Nere in formato gigante (60px), le usate diventano opacizzate/meno visibili.
 * - Pietra Verde e Bottone Nero in formato gigante (48px) con grandi numeri a colpo d'occhio.
 */
export default function MonthStatsBar({ 
  displayYear, 
  displayMonth, 
  allLogs = {},
  keysPerMonth = 4 
}) {
  const monthPrefix = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;

  let successCount = 0;
  let cheatCount = 0;
  let keyCount = 0;

  Object.entries(allLogs || {}).forEach(([dateStr, log]) => {
    if (dateStr.startsWith(monthPrefix) && log && typeof log === 'object') {
      if (log.dietState === 'success') successCount++;
      else if (log.dietState === 'cheat') cheatCount++;
      else if (log.dietState === 'cheat_key') keyCount++;
    }
  });

  const remainingKeys = Math.max(0, keysPerMonth - keyCount);

  return (
    <div 
      className="stitched-card"
      style={{
        padding: '18px 16px',
        marginTop: '6px',
        marginBottom: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* INTESTAZIONE DASHBOARD IN FONT UFFICIALE CORALINE */}
      <h3 style={{
        fontFamily: 'var(--font-coraline)',
        fontSize: '15px',
        color: 'var(--coraline-yellow)',
        textAlign: 'center',
        margin: '0 0 10px 0',
        letterSpacing: '1px',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(216, 198, 21, 0.35)'
      }}>
        Dashboard
      </h3>

      {/* SEZIONE 1: LE 4 CHIAVI NERE GIGANTI (SENZA ALCUNA SCRITTA) */}
      <div style={{
        backgroundColor: 'rgba(6, 22, 37, 0.88)',
        padding: '16px 14px',
        borderRadius: '18px',
        border: '1.5px solid var(--border-dark-blue-light)',
        boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.75)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px'
      }}>
        {Array.from({ length: keysPerMonth }).map((_, idx) => {
          const isUsed = idx >= remainingKeys;
          return (
            <div 
              key={idx}
              title={isUsed ? "Chiave utilizzata (Spettrale)" : "Chiave disponibile"}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isUsed ? 'scale(0.92)' : 'scale(1.08)',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
            >
              {/* Alone bianco spettrale ristretto per le chiavi usate */}
              {isUsed && (
                <div 
                  style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(220, 240, 255, 0.12) 50%, transparent 70%)',
                    filter: 'blur(3px)',
                    pointerEvents: 'none',
                    animation: 'ghostlyAuraPulse 3s ease-in-out infinite'
                  }}
                />
              )}
              {/* Chiave Nera di Coraline in formato GIGANTE (60px) */}
              <KeyIcon size={60} isUsed={isUsed} />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ghostlyAuraPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.22);
            opacity: 0.95;
          }
        }
      `}</style>

      {/* SEZIONE 2: PIETRA VERDE E BOTTONE NERO IN FORMATO GIGANTE (2 COLONNE) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Metrica 1: Pietra Verde Gigante + Numero Gigante */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(6, 22, 37, 0.85)',
          padding: '16px 10px',
          borderRadius: '16px',
          border: '1.5px solid var(--border-dark-blue-light)',
          textAlign: 'center',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)'
        }}>
          <img 
            src={seeingStoneImg} 
            alt="Pietra Verde" 
            style={{ 
              width: '48px', 
              height: '48px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 3px 8px rgba(16, 185, 129, 0.6))'
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: '#4ade80', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1 
          }}>
            {successCount}
          </div>
        </div>

        {/* Metrica 2: Bottone Nero Gigante + Numero Gigante */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(6, 22, 37, 0.85)',
          padding: '16px 10px',
          borderRadius: '16px',
          border: '1.5px solid var(--border-dark-blue-light)',
          textAlign: 'center',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)'
        }}>
          <img 
            src={blackButtonImg} 
            alt="Bottone Nero" 
            style={{ 
              width: '48px', 
              height: '48px', 
              objectFit: 'contain', 
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.95))'
            }} 
          />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: '#f87171', 
            fontFamily: 'var(--font-gothic)', 
            lineHeight: 1 
          }}>
            {cheatCount}
          </div>
        </div>
      </div>
    </div>
  );
}
