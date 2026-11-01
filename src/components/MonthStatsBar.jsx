import React from 'react';
import seeingStoneImg from '../assets/seeing-stone.png';
import blackButtonImg from '../assets/black-button.png';

/**
 * Barra Statistiche & Proiezione Mensile Stile Coraline:
 * - Metriche chiave del mese corrente (Giorni Rispettati, Bottone Nero, %).
 * - Barra di avanzamento a "Filo di Cucitura" con cursore ad Ago Ricurvo SVG.
 * - Micro-copy dinamico basato sulla percentuale di successo.
 */
export default function MonthStatsBar({ displayYear, displayMonth, allLogs = {} }) {
  // Calcolo statistiche per il mese visualizzato
  const monthPrefix = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;

  let successCount = 0;
  let cheatCount = 0;

  Object.entries(allLogs).forEach(([dateStr, log]) => {
    if (dateStr.startsWith(monthPrefix)) {
      if (log.dietState === 'success') successCount++;
      else if (log.dietState === 'cheat') cheatCount++;
    }
  });

  const totalLogged = successCount + cheatCount;
  const successPercentage = totalLogged > 0 
    ? Math.round((successCount / totalLogged) * 100) 
    : 0;

  // Micro-Copy Dinamico di Proiezione
  let projectionText = "Inizia a cucire la trama di questo mese, Asia.";
  let projectionColor = "var(--coraline-parchment)";

  if (totalLogged > 0) {
    if (successPercentage >= 80) {
      projectionText = "Il filo tiene saldo: l'Altra Madre è lontana.";
      projectionColor = "#4ade80"; // verde speranza / pietra verde
    } else if (successPercentage >= 50) {
      projectionText = "In equilibrio sul cornicione: basta un passo falso.";
      projectionColor = "var(--coraline-yellow)"; // giallo d'attenzione
    } else {
      projectionText = "I bottoni si avvicinano troppo: riprendi il controllo, Asia.";
      projectionColor = "#f87171"; // rosso allarme
    }
  }

  return (
    <div 
      className="stitched-card"
      style={{
        padding: '14px 16px',
        marginBottom: '14px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* RIGA DELLE 3 METRICHE CHIAVE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1.1fr',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '14px'
      }}>
        {/* Metrica 1: Giorni Rispettati */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '6px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(52, 211, 153, 0.35)'
        }}>
          <img 
            src={seeingStoneImg} 
            alt="Pietra Verde" 
            style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
          />
          <div>
            <div style={{ fontSize: '9px', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Rispettati
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#4ade80', fontFamily: 'var(--font-gothic)', lineHeight: 1.1 }}>
              {successCount}
            </div>
          </div>
        </div>

        {/* Metrica 2: Giorni con Bottone Nero */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '6px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(220, 38, 38, 0.35)'
        }}>
          <img 
            src={blackButtonImg} 
            alt="Bottone Nero" 
            style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
          />
          <div>
            <div style={{ fontSize: '9px', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Bottoni
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-gothic)', lineHeight: 1.1 }}>
              {cheatCount}
            </div>
          </div>
        </div>

        {/* Metrica 3: Percentuale di Successo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(6, 22, 37, 0.75)',
          padding: '6px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(199, 164, 14, 0.4)'
        }}>
          <span style={{ fontSize: '13px' }}>🪡</span>
          <div>
            <div style={{ fontSize: '9px', color: 'var(--coraline-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Tenuta Filo
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--coraline-yellow)', fontFamily: 'var(--font-gothic)', lineHeight: 1.1 }}>
              {totalLogged > 0 ? `${successPercentage}%` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DI AVANZAMENTO A "FILO DI CUCITURA" CON AGO RICURVO */}
      <div style={{ position: 'relative', padding: '6px 4px 8px 4px' }}>
        {/* Nastro/Filo Scuro di base con contorni a tratteggio */}
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
          {/* Tratto cucito completato (Giallo Impermeabile di Coraline) */}
          <div style={{
            width: `${totalLogged > 0 ? successPercentage : 0}%`,
            height: '100%',
            backgroundColor: 'var(--coraline-gold)',
            borderRadius: '999px',
            boxShadow: '0 0 10px rgba(216, 198, 21, 0.5)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />

          {/* Cursore: Piccolo Ago Ricurvo da cucito con filo giallo */}
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
              {/* Filo giallo che esce dalla cruna dell'ago */}
              <path
                d="M 6 10 Q 10 4 14 12"
                stroke="var(--coraline-yellow)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Ago in acciaio curvato tipico da sarta/stop-motion */}
              <path
                d="M 12 14 C 18 10 24 16 28 26 C 24 23 18 18 14 16 Z"
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth="0.8"
              />
              {/* Cruna dell'ago */}
              <ellipse cx="14" cy="15" rx="1.5" ry="0.8" fill="#1e293b" />
              {/* Punta affilata dell'ago */}
              <circle cx="28" cy="26" r="0.8" fill="#f8fafc" />
            </svg>
          </div>
        </div>
      </div>

      {/* MICRO-COPY DINAMICO DI PROIEZIONE */}
      <div style={{
        marginTop: '6px',
        textAlign: 'center',
        fontSize: '11.5px',
        fontStyle: 'italic',
        color: projectionColor,
        letterSpacing: '0.3px',
        lineHeight: 1.4,
        fontWeight: 500,
        transition: 'color 0.3s ease'
      }}>
        «{projectionText}»
      </div>
    </div>
  );
}
