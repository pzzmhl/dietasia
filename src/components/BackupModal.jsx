import React, { useState, useRef } from 'react';
import catModalBg from '../assets/cat-modal-bg.jpg';
import keyImg from '../assets/key.png';
import { exportBackupData, importBackupData, getAllLogs } from '../utils/storage';

export default function BackupModal({ isOpen, onClose, onRestoreSuccess }) {
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentLogs = getAllLogs();
  const totalDays = Object.keys(currentLogs).length;

  // Esporta scaricando il file .json
  const handleDownloadFile = () => {
    try {
      const dataStr = exportBackupData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const nowStr = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diario-coraline-asia-${nowStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `✓ File scaricato con successo nella cartella Download! (${totalDays} giorni registrati)`
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Errore durante la creazione del file di backup.'
      });
    }
  };

  // Esporta copiando il codice negli appunti
  const handleCopyClipboard = async () => {
    try {
      const dataStr = exportBackupData();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(dataStr);
      } else {
        // Fallback per browser/webview datati
        const textArea = document.createElement('textarea');
        textArea.value = dataStr;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setStatusMessage({
        type: 'success',
        text: '✓ Codice di backup copiato! Puoi incollarlo nelle tue Note o inviartelo su WhatsApp.'
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Impossibile copiare negli appunti automaticamente. Prova a scaricare il file.'
      });
    }
  };

  // Gestione caricamento file dall'input
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      processRestore(content);
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Impossibile leggere il file selezionato.'
      });
    };
    reader.readAsText(file);
    // Reset input per permettere ri-selezione
    e.target.value = '';
  };

  // Esegue l'importazione validando il contenuto
  const processRestore = (jsonString) => {
    try {
      const result = importBackupData(jsonString);
      setStatusMessage({
        type: 'success',
        text: `✦ Diario ripristinato con successo! ${result.count} giornate aggiornate.`
      });
      setPasteText('');
      if (onRestoreSuccess) {
        onRestoreSuccess(result.logs);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Errore durante il ripristino del backup.'
      });
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 12, 0.88)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backupFadeIn 0.25s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '18px',
          background: `radial-gradient(circle at 50% 20%, rgba(13, 44, 73, 0.95), rgba(6, 22, 37, 0.98)), url(${catModalBg}) center/cover no-repeat`,
          border: '2px solid rgba(216, 198, 21, 0.45)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), inset 0 0 25px rgba(0, 0, 0, 0.8)',
          padding: '22px 20px',
          color: '#ddcab7',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Pulsante Chiusura */}
        <button
          onClick={onClose}
          aria-label="Chiudi finestra backup"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(221, 202, 183, 0.25)',
            color: '#ddcab7',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation'
          }}
        >
          ✕
        </button>

        {/* Intestazione */}
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img src={keyImg} alt="Chiave" style={{ width: '22px', height: '22px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }} />
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-coraline)',
                fontSize: '20px',
                color: '#d8c615',
                letterSpacing: '1.2px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)'
              }}
            >
              Diario di Sicurezza
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(221, 202, 183, 0.8)' }}>
            Salva i tuoi progressi o trasferiscili su un nuovo telefono.
          </p>
          <div
            style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(13, 44, 73, 0.6)',
              border: '1px solid rgba(216, 198, 21, 0.3)',
              fontSize: '11px',
              color: '#ddcab7'
            }}
          >
            📓 <strong>{totalDays}</strong> giornate salvate nel diario
          </div>
        </div>

        {/* Notifica di stato (Successo o Errore) */}
        {statusMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              lineHeight: '1.4',
              backgroundColor: statusMessage.type === 'success' ? 'rgba(38, 70, 83, 0.9)' : 'rgba(107, 30, 42, 0.9)',
              border: `1px solid ${statusMessage.type === 'success' ? '#2a9d8f' : '#e63946'}`,
              color: '#ffffff',
              textAlign: 'center',
              animation: 'backupFadeIn 0.2s ease-out'
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Tab di Selezione (Esporta vs Importa) */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(221, 202, 183, 0.2)',
            padding: '3px',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('export'); setStatusMessage(null); }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'export' ? 'rgba(216, 198, 21, 0.2)' : 'transparent',
              color: activeTab === 'export' ? '#d8c615' : 'rgba(221, 202, 183, 0.65)',
              fontFamily: 'var(--font-coraline)',
              fontSize: '13px',
              letterSpacing: '0.8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            ✦ Salva / Esporta
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('import'); setStatusMessage(null); }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'import' ? 'rgba(216, 198, 21, 0.2)' : 'transparent',
              color: activeTab === 'import' ? '#d8c615' : 'rgba(221, 202, 183, 0.65)',
              fontFamily: 'var(--font-coraline)',
              fontSize: '13px',
              letterSpacing: '0.8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            ✦ Ripristina
          </button>
        </div>

        {/* CONTENUTO TAB: ESPORTA */}
        {activeTab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(221, 202, 183, 0.85)', lineHeight: '1.4' }}>
              I dati sono salvati in sicurezza sul tuo dispositivo. Creando una copia di backup non perderai mai la tua costanza:
            </p>

            <button
              type="button"
              onClick={handleDownloadFile}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(27, 43, 62, 0.95)',
                border: '1.5px solid rgba(216, 198, 21, 0.5)',
                color: '#ddcab7',
                fontFamily: 'var(--font-coraline)',
                fontSize: '14px',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              📥 Scarica File di Backup (.json)
            </button>

            <button
              type="button"
              onClick={handleCopyClipboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 25, 38, 0.85)',
                border: '1px solid rgba(221, 202, 183, 0.3)',
                color: copied ? '#85e3b3' : '#ddcab7',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '13px',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              {copied ? '✓ Copiato negli Appunti!' : '📋 Copia Codice di Backup'}
            </button>

            <span style={{ fontSize: '11px', color: 'rgba(221, 202, 183, 0.6)', textAlign: 'center', marginTop: '2px' }}>
              Il file scaricato viene salvato nella cartella <strong>Download</strong> del tuo Android.
            </span>
          </div>
        )}

        {/* CONTENUTO TAB: IMPORTA */}
        {activeTab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(221, 202, 183, 0.85)', lineHeight: '1.4' }}>
              Seleziona un file scaricato in precedenza o incolla il codice di backup:
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(27, 43, 62, 0.95)',
                border: '1.5px solid rgba(216, 198, 21, 0.5)',
                color: '#ddcab7',
                fontFamily: 'var(--font-coraline)',
                fontSize: '14px',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              📂 Scegli File di Backup (.json)
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(221, 202, 183, 0.7)' }}>
                Oppure incolla qui il codice di backup:
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder='Incolla qui il codice JSON del backup...'
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(221, 202, 183, 0.25)',
                  color: '#ddcab7',
                  padding: '8px 10px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  resize: 'none'
                }}
              />
              <button
                type="button"
                disabled={!pasteText.trim()}
                onClick={() => processRestore(pasteText)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: pasteText.trim() ? 'rgba(70, 52, 28, 0.9)' : 'rgba(40, 40, 40, 0.4)',
                  border: `1px solid ${pasteText.trim() ? '#d8c615' : 'rgba(221, 202, 183, 0.15)'}`,
                  color: pasteText.trim() ? '#ffffff' : 'rgba(221, 202, 183, 0.35)',
                  fontFamily: 'var(--font-coraline)',
                  fontSize: '13px',
                  cursor: pasteText.trim() ? 'pointer' : 'not-allowed',
                  touchAction: 'manipulation'
                }}
              >
                ✦ Ripristina dal Testo Incollato
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes backupFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
