import React, { useState, useEffect } from 'react';
import CalendarGrid from './components/CalendarGrid';
import DietStatusSelector from './components/DietStatusSelector';
import CatModal from './components/CatModal';
import seeingStoneImg from './assets/seeing-stone.png';
import blackButtonImg from './assets/black-button.png';
import { getTodayDateString, getAllLogs, saveDayLog } from './utils/storage';
import { getRandomCatQuote } from './data/catQuotes';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [allLogs, setAllLogs] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    quote: '',
    context: 'success'
  });

  // Carica i dati salvati all'avvio
  useEffect(() => {
    setAllLogs(getAllLogs());
  }, []);

  const currentLog = allLogs[selectedDate] || {
    dietState: 'neutral'
  };

  // Formattazione data selezionata in italiano
  const formatDateTitle = (dateStr) => {
    const todayStr = getTodayDateString();
    const dateObj = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = dateObj.toLocaleDateString('it-IT', options);
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    if (dateStr === todayStr) {
      return `Oggi • ${capitalized}`;
    }
    return capitalized;
  };

  // Gestione cambio stato dieta: trigger immediato del Gatto Nero
  const handleSelectDietStatus = (newStatus) => {
    const updated = saveDayLog(selectedDate, { dietState: newStatus });
    if (updated) {
      setAllLogs((prev) => ({ ...prev, [selectedDate]: updated }));
    }

    if (newStatus === 'success' || newStatus === 'cheat') {
      const quote = getRandomCatQuote(newStatus);
      setModalState({
        isOpen: true,
        quote,
        context: newStatus
      });
    }
  };

  // Statistiche rapide
  const totalDaysLogged = Object.values(allLogs).filter(
    (l) => l.dietState && l.dietState !== 'neutral'
  ).length;
  const successfulDays = Object.values(allLogs).filter(
    (l) => l.dietState === 'success'
  ).length;

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      padding: 'env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 24px) 16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER: PALETTE UFFICIALE CORALINE (#0d2c49, #c7a40e, #ddcab7, #786343) */}
      <header style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '2px dashed var(--coraline-gold)',
        borderRadius: '16px',
        backgroundColor: 'rgba(13, 44, 73, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 14px rgba(6, 22, 37, 0.6)',
        marginBottom: '16px'
      }}>
        {/* Contatori sintetici */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Badge Giorni Rispettati (Pietra Verde) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(6, 22, 37, 0.75)',
            padding: '6px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(52, 211, 153, 0.35)'
          }}>
            <img src={seeingStoneImg} alt="" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
            <span style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '13px',
              fontWeight: 800,
              color: '#4ade80'
            }}>
              {successfulDays} <span style={{ fontSize: '10px', color: 'var(--coraline-parchment)', opacity: 0.8, fontWeight: 500 }}>rispettati</span>
            </span>
          </div>

          {/* Badge Giorni Totali Tracciati */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(6, 22, 37, 0.75)',
            padding: '6px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(199, 164, 14, 0.3)'
          }}>
            <span style={{ fontSize: '13px' }}>🗝️</span>
            <span style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--coraline-parchment)'
            }}>
              {totalDaysLogged} <span style={{ fontSize: '10px', color: 'var(--coraline-parchment)', opacity: 0.8, fontWeight: 500 }}>totali</span>
            </span>
          </div>
        </div>

        {/* Bottone Nero di Coraline autentico con badge Beta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-gothic)',
            color: 'var(--coraline-yellow)',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Beta
          </span>
          <img
            src={blackButtonImg}
            alt="Bottone Coraline"
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.85))'
            }}
          />
        </div>
      </header>

      {/* CALENDARIO MENSILE A GRIGLIA */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        allLogs={allLogs}
      />

      {/* DATA CORRENTE SELEZIONATA */}
      <div style={{
        marginBottom: '12px',
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontSize: '17px',
          fontFamily: 'var(--font-gothic)',
          color: 'var(--coraline-parchment)',
          fontWeight: 700,
          letterSpacing: '0.4px'
        }}>
          {formatDateTitle(selectedDate)}
        </h2>
      </div>

      {/* SELETTORE DIRETTO ESITO DIETA */}
      <DietStatusSelector
        status={currentLog.dietState}
        onSelectStatus={handleSelectDietStatus}
      />

      {/* FOOTER GOTICO MINIMALISTA */}
      <footer style={{
        marginTop: 'auto',
        textAlign: 'center',
        padding: '16px 0 8px 0',
        fontSize: '11px',
        color: 'var(--coraline-brown)',
        borderTop: '1px dashed rgba(199, 164, 14, 0.25)'
      }}>
        ✦ 🪡 ✦
      </footer>

      {/* OVERLAY DEL TUTOR (IL GATTO NERO DI CORALINE) */}
      <CatModal
        isOpen={modalState.isOpen}
        quote={modalState.quote}
        context={modalState.context}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
