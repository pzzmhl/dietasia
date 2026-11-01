import React, { useState, useEffect } from 'react';
import CalendarStrip from './components/CalendarStrip';
import DietStatusSelector from './components/DietStatusSelector';
import WaterTracker from './components/WaterTracker';
import CatModal from './components/CatModal';
import BlackButtonIcon from './components/BlackButtonIcon';
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
    dietState: 'neutral',
    waterGlasses: 0
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

  // Gestione cambio stato dieta
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

  // Gestione conferma salvataggio acqua
  const handleSaveWater = (glasses) => {
    const updated = saveDayLog(selectedDate, { waterGlasses: glasses });
    if (updated) {
      setAllLogs((prev) => ({ ...prev, [selectedDate]: updated }));
    }

    // Trigger del Tutor Gatto Nero
    const quote = getRandomCatQuote(glasses >= 8 ? 'success' : 'water');
    setModalState({
      isOpen: true,
      quote,
      context: 'water'
    });
  };

  // Calcola statistiche veloci per Asia
  const totalDaysLogged = Object.values(allLogs).filter(l => l.dietState && l.dietState !== 'neutral').length;
  const successfulDays = Object.values(allLogs).filter(l => l.dietState === 'success').length;

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      padding: 'env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 32px) 16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER TEMA CORALINE */}
      <header style={{
        padding: '16px 4px 12px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1.5px dashed rgba(224, 159, 62, 0.3)',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <h1 style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '1px',
              color: '#f8fafc',
              textShadow: '0 2px 10px rgba(0,0,0,0.7)'
            }}>
              Coraline <span style={{ color: 'var(--accent-yellow)' }}>Tracker</span>
            </h1>
            <span style={{
              fontSize: '10px',
              backgroundColor: '#841b2d',
              color: '#fecdd3',
              padding: '2px 7px',
              borderRadius: '999px',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              BETA
            </span>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '2px',
            fontFamily: 'var(--font-body)'
          }}>
            Diario di bordo segreto per <strong style={{ color: '#e09f3e' }}>Asia</strong>
          </p>
        </div>

        {/* Bottone icona Coraline decorativo con riflesso */}
        <div title="Nessun bottone negli occhi!">
          <BlackButtonIcon size={40} />
        </div>
      </header>

      {/* QUICK BADGES DI MOTIVAZIONE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{
          backgroundColor: 'rgba(20, 16, 42, 0.6)',
          borderRadius: '12px',
          padding: '10px 12px',
          border: '1px dashed rgba(224, 159, 62, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>🗝️</span>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Giorni Tracciati</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-gothic)' }}>
              {totalDaysLogged}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(20, 16, 42, 0.6)',
          borderRadius: '12px',
          padding: '10px 12px',
          border: '1px dashed rgba(224, 159, 62, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Obiettivi Rispettati</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#e09f3e', fontFamily: 'var(--font-gothic)' }}>
              {successfulDays}
            </div>
          </div>
        </div>
      </div>

      {/* CALENDARIO SCORREVOLE & GRIGLIA MENSILE */}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        allLogs={allLogs}
      />

      {/* INTESTAZIONE DATA CORRENTE SELEZIONATA */}
      <div style={{
        marginBottom: '14px',
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{
            fontSize: '11px',
            color: 'var(--accent-yellow)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600
          }}>
            Registro Giornaliero
          </span>
          <h2 style={{
            fontSize: '18px',
            fontFamily: 'var(--font-gothic)',
            color: '#f8fafc',
            fontWeight: 700
          }}>
            {formatDateTitle(selectedDate)}
          </h2>
        </div>
      </div>

      {/* SELETTORE ESITO DIETA (3 STATI: NEUTRAL / SUCCESSO / BOTTone NERO) */}
      <DietStatusSelector
        status={currentLog.dietState}
        onSelectStatus={handleSelectDietStatus}
      />

      {/* TRACKING DELL'ACQUA */}
      <WaterTracker
        initialGlasses={currentLog.waterGlasses || 0}
        onSaveWater={handleSaveWater}
      />

      {/* FOOTER DELICATO GOTICO */}
      <footer style={{
        marginTop: 'auto',
        textAlign: 'center',
        padding: '16px 0 8px 0',
        fontSize: '11px',
        color: '#64748b',
        borderTop: '1px dashed rgba(255, 255, 255, 0.08)'
      }}>
        «Stai attenta a ciò che desideri, Asia.» • Coraline Tracker v1.0 Beta
      </footer>

      {/* MODAL DEL TUTOR (IL GATTO NERO DI CORALINE) */}
      <CatModal
        isOpen={modalState.isOpen}
        quote={modalState.quote}
        context={modalState.context}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

