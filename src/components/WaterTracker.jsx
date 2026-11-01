import React, { useState, useEffect } from 'react';

/**
 * Componente per il Tracking dell'Acqua Giornaliera.
 * Include selettore bicchieri con pulsanti +/-, anteprima visiva
 * e bottone "Registra Acqua" che scatena il Tutor (Gatto Nero).
 */
export default function WaterTracker({ initialGlasses = 0, onSaveWater }) {
  const [glasses, setGlasses] = useState(initialGlasses);

  useEffect(() => {
    setGlasses(initialGlasses);
  }, [initialGlasses]);

  const handleIncrement = () => setGlasses((prev) => Math.min(prev + 1, 16));
  const handleDecrement = () => setGlasses((prev) => Math.max(prev - 1, 0));

  const liters = (glasses * 0.25).toFixed(2);
  const targetGlasses = 8; // 2 Litri standard
  const percentage = Math.min(Math.round((glasses / targetGlasses) * 100), 100);

  return (
    <div className="stitched-card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontFamily: 'var(--font-gothic)', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#38bdf8' }}>💧</span> Pozzo dell'Acqua
        </h3>
        <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
          {liters} L bevuti ({percentage}%)
        </span>
      </div>

      {/* Barra di progresso still Coraline (pozione luminosa) */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'rgba(15, 16, 38, 0.8)',
        borderRadius: '999px',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: '#38bdf8',
          boxShadow: '0 0 10px #38bdf8',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>

      {/* Contatore centrale interattivo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgba(15, 16, 38, 0.65)',
        borderRadius: '16px',
        border: '1px dashed rgba(56, 189, 248, 0.35)',
        marginBottom: '16px'
      }}>
        <button
          onClick={handleDecrement}
          disabled={glasses <= 0}
          aria-label="Diminuisci bicchieri"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: glasses <= 0 ? 'rgba(30, 31, 46, 0.5)' : '#231942',
            color: glasses <= 0 ? '#475569' : '#38bdf8',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            fontSize: '22px',
            fontWeight: 700,
            cursor: glasses <= 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s'
          }}
        >
          -
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-gothic)', lineHeight: 1 }}>
            {glasses}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            {glasses === 1 ? 'Bicchiere (250ml)' : 'Bicchieri (250ml)'}
          </div>
        </div>

        <button
          onClick={handleIncrement}
          aria-label="Aumenta bicchieri"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#231942',
            color: '#38bdf8',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            fontSize: '22px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s'
          }}
        >
          +
        </button>
      </div>

      {/* Visualizzatore icone bicchieri rapidi (fino a 8) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '16px'
      }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const isFilled = i < glasses;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setGlasses(i + 1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: isFilled ? 1 : 0.35,
                transform: isFilled ? 'scale(1.05)' : 'scale(0.95)',
                transition: 'all 0.2s ease'
              }}
              title={`Imposta ${i + 1} bicchieri`}
            >
              <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
                <path
                  d="M 4 2 L 6 24 C 6.2 26 8 27 12 27 C 16 27 17.8 26 18 24 L 20 2 Z"
                  fill={isFilled ? 'rgba(56, 189, 248, 0.85)' : 'rgba(30, 41, 59, 0.4)'}
                  stroke={isFilled ? '#38bdf8' : '#64748b'}
                  strokeWidth="1.8"
                />
                {isFilled && (
                  <path
                    d="M 6 12 Q 12 14 18 12"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    opacity="0.8"
                  />
                )}
              </svg>
            </button>
          );
        })}
      </div>

      {/* Bottone principale "Registra Acqua" */}
      <button
        onClick={() => onSaveWater(glasses)}
        style={{
          width: '100%',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          fontFamily: 'var(--font-gothic)',
          fontWeight: 700,
          fontSize: '13px',
          letterSpacing: '1px',
          padding: '13px',
          borderRadius: '12px',
          border: '1.5px dashed #bae6fd',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span>💧</span> Registra Acqua ({liters} L)
      </button>
    </div>
  );
}
