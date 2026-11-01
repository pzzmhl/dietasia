import React from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';
import KeyIcon from './KeyIcon';

/**
 * Barra Statistiche & Proiezione Mensile Stile Coraline:
 * - Metriche chiave: Rispettati, Bottoni Neri, Chiavi Jolly usate, % Tenuta Filo.
 * - Monitoraggio Chiavi Nere Jolly disponibili per il mese (icone accese vs serrature aperte).
 * - Barra di avanzamento ad "Ago e Filo" e micro-copy dinamico.
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

  // La chiave NON penalizza come un bottone nero:
  // Calcolo % su giorni effettivi (successi vs bottoni)
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
        padding: '14px 14px 12px 14px',
        marginBottom: '14px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* SEZIONE 1: CONTATORE VISIVO CHIAVI NERE DEL MESE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(6, 22, 37, 0.85)',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px dashed rgba(199, 164, 14, 0.35)',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <KeyIcon size={20} />
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-gothic)',
            fontWeight: 700,
            color: 'var(--coraline-parchment)',
            letterSpacing: '0.5px'
          }}>
            Chiavi Nere Jolly:
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'var(--font-gothic)',
            color: remainingKeys > 0 ? 'var(--coraline-yellow)' : '#f87171'
          }}>
            {remainingKeys} / {keysPerMonth}
          </span>
        </div>

        {/* Silhouette delle chiavi (accese vs usate/spente) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {Array.from({ length: keysPerMonth }).map((_, idx) => {
            const isUsed = idx >= remainingKeys;
            return (
              <div 
                key={idx}
                title={isUsed ? "Chiave utilizzata" : "Chiave disponibile"}
                style={{
                  transform: isUsed ? 'scale(0.85)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <KeyIcon size={19} isUsed={isUsed} />
              </div>
            );
          })}
        </div>
      </div>

      {/* SEZIONE 2: LE METRICHE DEL MESE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '6px',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        {/* Metrica 1: Giorni Rispettati */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '6px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(52, 211, 153, 0.35)'
        }}>
          <img 
            src={seeingStoneImg} 
            alt="Pietra Verde" 
            style={{ width: '15px', height: '15px', objectFit: 'contain' }} 
          />
          <div>
            <div style={{ fontSize: '8.5px', color: '#86efac', textTransform: 'uppercase', fontWeight: 600 }}>
              Rispettati
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', fontFamily: 'var(--font-gothic)', lineHeight: 1.1 }}>
              {successCount}
            </div>
          </div>
        </div>

        {/* Metrica 2: Giorni con Bottone Nero */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '6px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(220, 38, 38, 0.35)'
        }}>
          <img 
            src={blackButtonImg} 
            alt="Bottone Nero" 
            style={{ width: '15px', height: '15px', objectFit: 'contain' }} 
          />
          <div>
            <div style={{ fontSize: '8.5px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 600 }}>
              Bottoni
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-gothic)', lineHeight: 1.1 }}>
              {cheatCount}
            </div>
          </div>
        </div>

        {/* Metrica 3: Percentuale Tenuta Filo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '6px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(199, 164, 14, 0.4)'
        }}>
          <span style={{ fontSize: '12px' }}>🪡</span>
          <div>
            <div style={{ fontSize: '8.5px', color: 'var(--coraline-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tenuta
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--coraline-yellow)', fontFamily: 'var(--font-gothic)', lineHeight: 1.1 }}>
              {totalLogged > 0 ? `${successPercentage}%` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE 3: BARRA AD AGO E FILO */}
      <div style={{ position: 'relative', padding: '6px 4px 8px 4px' }}>
        <div style={{
          width: '100%',
          height: '9px',
          backgroundColor: 'rgba(6, 22, 37, 0.9)',
          borderRadius: '999px',
          border: '1.5px dashed var(--coraline-gold)',
          position: 'relative',
          overflow: 'visible',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.8)'
        }}>
          <div style={{
            width: `${totalLogged > 0 ? successPercentage : 0}%`,
            height: '100%',
            backgroundColor: 'var(--coraline-gold)',
            borderRadius: '999px',
            boxShadow: '0 0 10px rgba(216, 198, 21, 0.5)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />

          {/* Cursore Ago Ricurvo */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${totalLogged > 0 ? successPercentage : 0}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
            pointerEvents: 'none'
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path
                d="M 6 10 Q 10 4 14 12"
                stroke="var(--coraline-yellow)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 12 14 C 18 10 24 16 28 26 C 24 23 18 18 14 16 Z"
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth="0.8"
              />
              <ellipse cx="14" cy="15" rx="1.5" ry="0.8" fill="#1e293b" />
              <circle cx="28" cy="26" r="0.8" fill="#f8fafc" />
            </svg>
          </div>
        </div>
      </div>

      {/* SEZIONE 4: MICRO-COPY DI PROIEZIONE */}
      <div style={{
        marginTop: '6px',
        textAlign: 'center',
        fontSize: '11px',
        fontStyle: 'italic',
        color: projectionColor,
        letterSpacing: '0.3px',
        lineHeight: 1.35,
        fontWeight: 500,
        transition: 'color 0.3s ease'
      }}>
        «{projectionText}»
      </div>
    </div>
  );
}
