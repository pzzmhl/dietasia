import React from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import KeyIcon from './KeyIcon';

/**
 * Dashboard Statistiche & Proiezione Mensile Ingrandita Stile Coraline:
 * - Posizionata sotto il calendario.
 * - Chiavi Nere Jolly in formato extra-large (visibili e definite).
 * - Indicatori e numeri grandi per una leggibilità immediata.
 * - Barra ad Ago e Filo maggiorata.
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

  Object.entries(allLogs).forEach(([dateStr, log]) => {
    if (dateStr.startsWith(monthPrefix)) {
      if (log.dietState === 'success') successCount++;
      else if (log.dietState === 'cheat') cheatCount++;
      else if (log.dietState === 'cheat_key') keyCount++;
    }
  });

  const remainingKeys = Math.max(0, keysPerMonth - keyCount);

  // La chiave non penalizza il tasso di aderenza
  const totalDecisiveDays = successCount + cheatCount;
  const successPercentage = totalDecisiveDays > 0 
    ? Math.round((successCount / totalDecisiveDays) * 100) 
    : (successCount > 0 || keyCount > 0 ? 100 : 0);

  const totalLogged = successCount + cheatCount + keyCount;

  // Micro-Copy Dinamico di Proiezione
  let projectionText = "Inizia a cucire la trama di questo mese, Asia.";
  let projectionColor = "var(--coraline-parchment)";

  if (totalLogged > 0) {
    if (successPercentage >= 80) {
      projectionText = "Il filo tiene saldo: l'Altra Madre è lontana.";
      projectionColor = "#4ade80";
    } else if (successPercentage >= 50) {
      projectionText = "In equilibrio sul cornicione: basta un passo falso.";
      projectionColor = "var(--coraline-yellow)";
    } else {
      projectionText = "I bottoni si avvicinano troppo: riprendi il controllo, Asia.";
      projectionColor = "#f87171";
    }
  }

  return (
    <div 
      className="stitched-card"
      style={{
        padding: '18px 16px',
        marginTop: '4px',
        marginBottom: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* SEZIONE 1: VETRINA CHIAVI NERE JOLLY INGRANDITE */}
      <div style={{
        backgroundColor: 'rgba(6, 22, 37, 0.88)',
        padding: '12px 14px',
        borderRadius: '16px',
        border: '1.5px dashed var(--coraline-gold)',
        boxShadow: 'inset 0 0 14px rgba(0, 0, 0, 0.7)',
        marginBottom: '16px'
      }}>
        {/* Titolo e contatore testuale */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🗝️</span>
            <span style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--coraline-parchment)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}>
              Chiavi Nere Jolly
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: '14px',
            fontWeight: 900,
            color: remainingKeys > 0 ? 'var(--coraline-yellow)' : '#f87171',
            backgroundColor: 'rgba(13, 44, 73, 0.8)',
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(199, 164, 14, 0.4)'
          }}>
            {remainingKeys} / {keysPerMonth} disponibili
          </div>
        </div>

        {/* File delle Chiavi in FORMATO GRANDE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '8px 4px 4px 4px',
          flexWrap: 'wrap'
        }}>
          {Array.from({ length: keysPerMonth }).map((_, idx) => {
            const isUsed = idx >= remainingKeys;
            return (
              <div 
                key={idx}
                title={isUsed ? "Chiave utilizzata per sgarro" : "Chiave pronta all'uso"}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transform: isUsed ? 'scale(0.88)' : 'scale(1.05)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Chiave Nera di Coraline in formato grande (42px) */}
                <KeyIcon size={42} isUsed={isUsed} />

                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-gothic)',
                  fontWeight: 700,
                  color: isUsed ? 'var(--coraline-brown)' : 'var(--coraline-gold)',
                  letterSpacing: '0.5px'
                }}>
                  {isUsed ? "USATA" : `#${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEZIONE 2: LE 3 GRANDI METRICHE DELLA DASHBOARD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        {/* Metrica 1: Giorni Rispettati */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(6, 22, 37, 0.8)',
          padding: '10px 6px',
          borderRadius: '12px',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          textAlign: 'center'
        }}>
          <img 
            src={seeingStoneImg} 
            alt="Pietra Verde" 
            style={{ width: '22px', height: '22px', objectFit: 'contain', marginBottom: '4px' }} 
          />
          <div style={{ fontSize: '10px', color: '#86efac', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            Rispettati
          </div>
          <div style={{ fontSize: '19px', fontWeight: 900, color: '#4ade80', fontFamily: 'var(--font-gothic)', marginTop: '2px' }}>
            {successCount}
          </div>
        </div>

        {/* Metrica 2: Giorni con Bottone Nero */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(6, 22, 37, 0.8)',
          padding: '10px 6px',
          borderRadius: '12px',
          border: '1px solid rgba(220, 38, 38, 0.4)',
          textAlign: 'center'
        }}>
          <img 
            src={blackButtonImg} 
            alt="Bottone Nero" 
            style={{ width: '22px', height: '22px', objectFit: 'contain', marginBottom: '4px' }} 
          />
          <div style={{ fontSize: '10px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            Bottoni
          </div>
          <div style={{ fontSize: '19px', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-gothic)', marginTop: '2px' }}>
            {cheatCount}
          </div>
        </div>

        {/* Metrica 3: Percentuale Tenuta Filo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(6, 22, 37, 0.8)',
          padding: '10px 6px',
          borderRadius: '12px',
          border: '1px solid rgba(199, 164, 14, 0.45)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '18px', marginBottom: '4px' }}>🪡</span>
          <div style={{ fontSize: '10px', color: 'var(--coraline-gold)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            Tenuta Filo
          </div>
          <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--coraline-yellow)', fontFamily: 'var(--font-gothic)', marginTop: '2px' }}>
            {totalLogged > 0 ? `${successPercentage}%` : '--'}
          </div>
        </div>
      </div>

      {/* SEZIONE 3: BARRA AD AGO E FILO MAGGIORATA */}
      <div style={{ position: 'relative', padding: '8px 4px 10px 4px' }}>
        <div style={{
          width: '100%',
          height: '11px',
          backgroundColor: 'rgba(6, 22, 37, 0.95)',
          borderRadius: '999px',
          border: '1.5px dashed var(--coraline-gold)',
          position: 'relative',
          overflow: 'visible',
          boxShadow: 'inset 0 1px 5px rgba(0,0,0,0.85)'
        }}>
          <div style={{
            width: `${totalLogged > 0 ? successPercentage : 0}%`,
            height: '100%',
            backgroundColor: 'var(--coraline-gold)',
            borderRadius: '999px',
            boxShadow: '0 0 12px rgba(216, 198, 21, 0.55)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />

          {/* Cursore Ago Ricurvo Ingrandito */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${totalLogged > 0 ? successPercentage : 0}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.95))',
            pointerEvents: 'none'
          }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path
                d="M 6 10 Q 10 4 14 12"
                stroke="var(--coraline-yellow)"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 12 14 C 18 10 24 16 28 26 C 24 23 18 18 14 16 Z"
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth="0.9"
              />
              <ellipse cx="14" cy="15" rx="1.6" ry="0.9" fill="#1e293b" />
              <circle cx="28" cy="26" r="0.9" fill="#f8fafc" />
            </svg>
          </div>
        </div>
      </div>

      {/* SEZIONE 4: MICRO-COPY DI PROIEZIONE CHIARO E LEGGIBILE */}
      <div style={{
        marginTop: '6px',
        textAlign: 'center',
        fontSize: '12.5px',
        fontStyle: 'italic',
        color: projectionColor,
        letterSpacing: '0.3px',
        lineHeight: 1.4,
        fontWeight: 600,
        transition: 'color 0.3s ease'
      }}>
        «{projectionText}»
      </div>
    </div>
  );
}
