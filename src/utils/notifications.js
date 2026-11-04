/**
 * Servizio Notifiche Quotidiane e di Trama (Coraline Diet Tracker)
 * Supporta notifiche native Android (via @capacitor/local-notifications)
 * con canali ad alta priorità, pool di messaggi in-character e fallback su API Web Notification.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { STORAGE_KEYS } from '../constants/storageKeys.js';

export const NOTIFICATION_ID = 42;
let channelInitialized = false;

/**
 * Pool di messaggi in-character fedeli alla lore di Coraline (Il Gatto e il Grande Bobinsky).
 */
export const IN_CHARACTER_NOTIFICATION_MESSAGES = [
  {
    title: '✦ Il Gatto Nero ti osserva ✦',
    body: "Com'è andata la giornata nel mondo reale, Asia? Il tuo diario ti aspetta per custodire la rotta."
  },
  {
    title: '✦ Boiarski! I Topi Saltatori! ✦',
    body: 'Asia! Il circo dei topi del Grande Bobinsky attende il tuo resoconto di oggi prima dello spettacolo!'
  },
  {
    title: '✦ Uno sguardo attraverso la Pietra Forata ✦',
    body: 'I gatti sanno già come è andata la giornata. Il tuo diario aspetta che sia tu ad annotarla con serenità, Asia.'
  },
  {
    title: '✦ Il Circo di Bobinsky chiama! ✦',
    body: 'Hop-hop! Allenamento o riposo strategico? Ricordati di registrare la giornata per la brigata dei topi!'
  },
  {
    title: '✦ La Pietra Forata luccica ✦',
    body: 'Guarda attraverso la pietra di giada, Asia: c’è ancora una giornata da chiudere prima di mezzanotte.'
  }
];

/**
 * Estrae un messaggio casuale in-character dal pool.
 */
export function getRandomInCharacterMessage() {
  const index = Math.floor(Math.random() * IN_CHARACTER_NOTIFICATION_MESSAGES.length);
  return IN_CHARACTER_NOTIFICATION_MESSAGES[index];
}

/**
 * Richiede i permessi per le notifiche in modo gentile e non bloccante.
 * Gestisce Android 13+ (POST_NOTIFICATIONS) e ambiente Web.
 */
export async function requestNotificationPermission() {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status && status.display === 'granted') {
        return true;
      }
      const capPerm = await LocalNotifications.requestPermissions();
      return capPerm && capPerm.display === 'granted';
    }
  } catch (e) {
    // Continua con fallback Web
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const webPerm = await Notification.requestPermission();
        return webPerm === 'granted';
      }
    } catch (e) {}
  }

  return false;
}

/**
 * Inizializza il canale notifiche ad alta priorità su Android (API 26+)
 * con vibrazione e suoni abilitati.
 */
export async function initNotificationChannels() {
  if (channelInitialized) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.createChannel({
        id: 'coraline_reminders',
        name: 'Promemoria Diario Coraline',
        description: 'Notifiche e allarmi dell’Altro Mondo',
        importance: 5,
        visibility: 1,
        vibration: true
      });
    }
    channelInitialized = true;
  } catch (e) {
    // Non-Android o canale già presente
  }
}

/**
 * Cancella il promemoria giornaliero attivo per evitare spam.
 */
export async function cancelDailyReminder() {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Pianifica il promemoria giornaliero locale offline (default ore 20:30 o preferenza utente).
 * LOGICA SMART:
 * - Se la giornata odierna è già stata registrata (isTodayLogged === true),
 *   la notifica per stasera viene evitata e programmata direttamente per domani sera.
 * - Se l'orario di oggi è già passato, programma per domani sera.
 * - Utilizza a rotazione messaggi immersivi del Gatto e di Bobinsky.
 */
export async function scheduleDailyReminder(timeStr, isTodayLogged = false) {
  let effectiveTime = timeStr;
  try {
    const isEnabled = localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED) !== 'false';
    if (!isEnabled) {
      await cancelDailyReminder();
      return false;
    }
    if (!effectiveTime) {
      effectiveTime = localStorage.getItem(STORAGE_KEYS.REMINDER_TIME) || '20:30';
    }
  } catch (e) {
    if (!effectiveTime) effectiveTime = '20:30';
  }

  const [hoursStr, minutesStr] = effectiveTime.split(':');
  const targetHour = parseInt(hoursStr, 10) || 20;
  const targetMinute = parseInt(minutesStr, 10) || 30;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    await initNotificationChannels();

    // Cancella eventuale notifica precedente per prevenire doppioni
    await cancelDailyReminder();

    // Calcola la data e l'ora esatta del prossimo trigger
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(targetHour, targetMinute, 0, 0);

    // Se l'orario prefissato per oggi è già trascorso O se oggi è già stato compilato:
    // programma per domani alla stessa ora per non infastidire l'utente!
    if (scheduledDate <= now || isTodayLogged) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const { title, body } = getRandomInCharacterMessage();

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: NOTIFICATION_ID,
            channelId: 'coraline_reminders',
            schedule: {
              at: scheduledDate,
              repeats: true,
              every: 'day',
              allowWhileIdle: true
            },
            smallIcon: 'ic_launcher'
          }
        ]
      });
    }

    return true;
  } catch (err) {
    console.warn('[Notifiche] Pianificazione nativa non riuscita o ambiente web:', err);
    return false;
  }
}

/**
 * Notifica speciale di trama: Wybie celebra il traguardo di streak raggiunto.
 */
export async function sendWybieStreakNotification(streak) {
  try {
    await requestNotificationPermission();
    await initNotificationChannels();

    const title = '✦ Wybie è fiero di te, Asia! ✦';
    const body = `Ehi Asia, ${streak} giorni di fila senza sgarrare! Persino la nonna sarebbe impressionata, stai battendo l'Altro Mondo!`;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: 1000 + Number(streak),
            channelId: 'coraline_reminders',
            schedule: { at: new Date(Date.now() + 250) },
            smallIcon: 'ic_launcher'
          }
        ]
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.png' });
      return true;
    }
  } catch (err) {
    return false;
  }
}

/**
 * Notifica speciale di trama: Esaurimento chiavi jolly (L'Altra Madre ingoia l'ultima chiave).
 */
export async function sendOtherMotherKeysDepletedNotification() {
  try {
    await requestNotificationPermission();
    await initNotificationChannels();

    const title = "✦ La bussola è nelle tue mani! ✦";
    const body = "Le quattro chiavi hanno fatto il loro lavoro questo mese, Asia. Nel mondo reale ogni giorno si rinnova con la tua bussola quotidiana.";

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: 2001,
            channelId: 'coraline_reminders',
            schedule: { at: new Date(Date.now() + 250) },
            smallIcon: 'ic_launcher'
          }
        ]
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.png' });
      return true;
    }
  } catch (err) {
    return false;
  }
}

/**
 * Notifica di Prova (Test immediato dalle Impostazioni).
 */
export async function sendTestReminderNotification() {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await initNotificationChannels();

  const title = "✦ I Topi Saltatori sono qui! (Test) ✦";
  const body = "Promemoria di prova riuscito! Le notifiche dell'Altro Mondo sono attive, Asia.";

  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: 9999,
            channelId: 'coraline_reminders',
            schedule: { at: new Date(Date.now() + 600) },
            smallIcon: 'ic_launcher'
          }
        ]
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.png' });
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

