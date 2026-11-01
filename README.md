# 🧵 Coraline Diet Tracker (Beta) • Per Asia

Un'applicazione mobile habit tracker dedicata ad **Asia**, progettata per il monitoraggio della dieta e dell'idratazione quotidiana con un'atmosfera estetica dark-whimsical ispirata al capolavoro in stop-motion **"Coraline"** (diretto da Henry Selick / Laika).

---

## 🗝️ Caratteristiche Principali

### 1. 📅 Calendario Scorrevole & Griglia Mensile
- **Striscia Orizzontale a Scorrimento Fluido:** Navigazione rapida giorno per giorno con indicatore del giorno della settimana, numero e contrassegno dello stato (spunta dorata o bottone cucito).
- **Griglia Mensile:** Vista panoramica del mese con pulsante "Oggi" rapido e selettori avanti/indietro.
- **Persistenza Offline Completa:** Ogni progresso è memorizzato su `localStorage` del dispositivo (`YYYY-MM-DD`). Chiudendo o riavviando l'app i dati rimangono intatti.

### 2. 🪡 Esito Dieta (3 Stati)
- **Non compilato:** Stato neutro iniziale con suggerimento visivo.
- **Dieta Seguita (Successo):** Checkbox personalizzato con cornice ricamata e spunta dorata lucente (*Giallo impermeabile di Coraline*).
- **Dieta NON Seguita (Sgarrato):** Al posto della spunta compare l'iconico **Bottone Nero di Coraline**, realizzato con un SVG inline ad alta precisione con riflessi 3D lucidi e filo cucito a 'X'.

### 3. 💧 Pozzo dell'Acqua (Tracking Idratazione)
- Contatore rapido a bicchieri (250 ml a bicchiere) con pulsanti `+` e `-`.
- Selettore rapido a 8 bicchieri interattivi (obiettivo 2 Litri).
- Barra di livello a elisir luminescente.
- Pulsante di conferma **"Registra Acqua"**.

### 4. 🐈‍⬛ Il Tutor Virtuale: Il Gatto Nero
- Quando Asia conferma la registrazione dell'acqua o seleziona l'esito della dieta, appare in primo piano il **Gatto Nero di Coraline**.
- **Illustrazione SVG ad alto contrasto:** Silhouette snella, postura sinuosa, pupille feline animate e grandi occhi azzurri luminescenti.
  - *Nota:* Nel componente `src/components/CatIllustration.jsx` sono presenti commenti dettagliati su come sostituire eventualmente l'illustrazione con un file locale `public/cat.png`.
- **Speech Bubble Contestuale:** Oltre 20 battute scritte ad hoc per Asia dal tono sornione, enigmatico, ironico ma profondamente affettuoso e motivante (con moniti a non farsi cucire i bottoni dall'Altra Madre).

---

## 🎨 Palette Colori & Tipografia

- **Sfondo Profondo:** Blu Notte (`#0f1026`) & Viola Scuro (`#231942`)
- **Accenti Primari:** Giallo Impermeabile di Coraline (`#e09f3e` / `#f4ba40`)
- **Dettagli & Testi:** Grigio Nebbia (`#e2e8f0`) & Rosso Sangue/Cuciture (`#841b2d`)
- **Bordi:** Impunture e cuciture a vista (`border: dashed`)
- **Font:** Google Fonts *Cinzel* (titoli gotici) e *Space Grotesk* (leggibilità corpo del testo)

---

## 🛠️ Stack Tecnologico

- **Core:** React 18 + Vite
- **Mobile Engine:** Capacitor 6 (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- **CI/CD:** GitHub Actions per compilazione cloud automatica dell'APK (`.github/workflows/build-apk.yml`)

---

## 🚀 Compilazione Cloud dell'APK (Senza Android Studio)

Non serve installare Android Studio o l'SDK di Android sul computer! Il workflow `.github/workflows/build-apk.yml` si occupa di:
1. Scaricare il codice.
2. Configurare Java 17 Temurin e l'Android SDK nel cloud GitHub.
3. Installare le dipendenze e creare la build web ottimizzata.
4. Sincronizzare la piattaforma Capacitor Android.
5. Compilare l'APK con Gradle (`./gradlew assembleDebug`).
6. Caricare il file pronto `app-debug.apk` negli artefatti scaricabili di GitHub Actions.

---

## 📲 Come Inviare su GitHub e Scaricare l'APK

Esegui questi 3 comandi nel tuo terminale per pubblicare il progetto sul tuo repository GitHub:

```bash
git add .
git commit -m "feat: Coraline Diet Tracker Beta per Asia"
git push -u origin main
```

*(Se crei un nuovo repo su GitHub, basta collegare il remote con `git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git` prima del push).*

Una volta completato il push:
1. Vai sulla pagina del tuo repository GitHub.
2. Clicca sulla scheda **Actions** in alto.
3. Seleziona il workflow **"Build Android APK (Coraline Tracker)"**.
4. A fine compilazione (circa 2-3 minuti), troverai l'artefatto **`Coraline-Diet-Tracker-Beta-APK`** pronto da scaricare e installare sullo smartphone di Asia!
