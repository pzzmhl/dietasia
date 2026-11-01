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

    // Trigger del Tutor Gatto Nero solo quando si seleziona uno stato attivo
    if (newStatus === 'success' || newStatus === 'cheat') {
      const quote = getRandomCatQuote(newStatus);
      setModalState({
        isOpen: true,
        quote,
        context: newStatus
      });
    }
  };

  // Calcolo statistiche rapide
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
      {/* HEADER PULITO CON IMPUNTURE GOTICHE E ICONE UFFICIALI */}
      <header style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1.5px dashed rgba(224, 159, 62, 0.4)',
        borderRadius: '16px',
        backgroundColor: 'rgba(26, 20, 56, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        marginBottom: '16px'
      }}>
        {/* Contatori sintetici: Giorni Rispettati (Pietra Verde) e Totali */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(15, 16, 38, 0.7)',
            padding: '6px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(52, 211, 153, 0.3)'
          }}>
            <img src={seeingStoneImg} alt="" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
            <span style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '13px',
              fontWeight: 800,
              color: '#4ade80'
            }}>
              {successfulDays} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>rispettati</span>
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(15, 16, 38, 0.7)',
            padding: '6px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(224, 159, 62, 0.25)'
          }}>
            <span style={{ fontSize: '13px' }}>🗝️</span>
            <span style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '13px',
              fontWeight: 800,
              color: '#f8fafc'
            }}>
              {totalDaysLogged} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>totali</span>
            </span>
          </div>
        </div>

        {/* L'Iconico Bottone Nero di Coraline integrato nell'Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-gothic)',
            color: 'rgba(224, 159, 62, 0.75)',
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
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))'
            }}
          />
        </div>
      </header>

      {/* UNICA VISTA CALENDARIO MENSILE A GRIGLIA (SETTIMANA DA LUNEDÌ) */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        allLogs={allLogs}
      />

      {/* INTESTAZIONE DATA CORRENTE SELEZIONATA */}
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
          color: '#f8fafc',
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
        color: '#64748b',
        borderTop: '1px dashed rgba(255, 255, 255, 0.08)'
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
