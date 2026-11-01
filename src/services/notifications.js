/**
 * Servizio Notifiche Quotidiane (Topi Saltatori di Bobinsky)
 * Supporta sia le notifiche native Android (tramite @capacitor/local-notifications)
 * sia l'API Web Notification standard del browser.
 */

import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_ID = 42;
const STORAGE_ENABLED_KEY = 'coraline_asia_notification_enabled';
const STORAGE_TIME_KEY = 'coraline_asia_notification_time';

export function getNotificationSettings() {
  try {
    const enabledRaw = localStorage.getItem(STORAGE_ENABLED_KEY);
    const timeRaw = localStorage.getItem(STORAGE_TIME_KEY);
    return {
      enabled: enabledRaw !== null ? enabledRaw === 'true' : true,
      time: timeRaw || '20:00'
    };
  } catch (e) {
    return { enabled: true, time: '20:00' };
  }
}

export function saveNotificationSettings(enabled, time) {
  try {
    localStorage.setItem(STORAGE_ENABLED_KEY, String(enabled));
    localStorage.setItem(STORAGE_TIME_KEY, time);
  } catch (e) {}
}

/**
 * Richiede i permessi per le notifiche sia su Android che su Web
 */
export async function requestNotificationPermission() {
  try {
    // 1. Prova con Capacitor LocalNotifications (Android Nativo)
    const capPerm = await LocalNotifications.requestPermissions();
    if (capPerm && capPerm.display === 'granted') {
      return true;
    }
  } catch (e) {
    // Fallback su ambiente browser
  }

  // 2. Prova con API Web standard se supportata
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const webPerm = await Notification.requestPermission();
      return webPerm === 'granted';
    } catch (e) {}
  }

  return false;
}

/**
 * Pianifica il promemoria giornaliero alle ore 20:00 (o timeStr indicato).
 * Se la giornata di oggi è già stata registrata con successo o sgarro,
 * la notifica odierna viene evitata e programmata direttamente per il giorno successivo.
 */
export async function scheduleDailyReminder(timeStr = '20:00', isTodayLogged = false) {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const targetHour = parseInt(hoursStr, 10) || 20;
  const targetMinute = parseInt(minutesStr, 10) || 0;

  try {
    // 1. Assicura che i permessi siano concessi
    await requestNotificationPermission();

    // 2. Registra il canale notifiche ad alta priorità su Android
    try {
      await LocalNotifications.createChannel({
        id: 'coraline_reminders',
        name: 'Promemoria Diario Coraline',
        description: 'Notifica giornaliera dei topi saltatori alle 20:00',
        importance: 5,
        visibility: 1,
        vibration: true
      });
    } catch (e) {}

    // 3. Cancella notifiche precedenti per evitare doppioni
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

    // 4. Calcola la data e ora del prossimo trigger
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(targetHour, targetMinute, 0, 0);

    // Se l'orario delle 20:00 per oggi è già passato, OPPURE se oggi è già stato segnato,
    // programma per domani alla stessa ora!
    if (scheduledDate <= now || isTodayLogged) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'I Topi Saltatori ti chiamano!',
          body: 'Asia, è ora di contrassegnare il tuo diario prima che l’Altra Madre se ne accorga!',
          id: NOTIFICATION_ID,
          channelId: 'coraline_reminders',
          schedule: {
            at: scheduledDate,
            repeats: true,
            every: 'day',
            allowWhileIdle: true
          },
          sound: undefined,
          smallIcon: 'ic_launcher'
        }
      ]
    });

    console.log(`[Notifiche] Promemoria programmato per: ${scheduledDate.toLocaleString()}`);
    return true;
  } catch (err) {
    console.warn('Pianificazione notifica nativa non riuscita o su web:', err);
    return false;
  }
}

/**
 * Cancella il promemoria programmato
 */
export async function cancelDailyReminder() {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Invia una notifica di prova immediata per verificare che funzioni
 */
export async function sendTestNotification() {
  await requestNotificationPermission();

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Allarme Topi Saltatori (Prova)',
          body: 'Squiiik! Notifica di prova ricevuta! Il tuo promemoria giornaliero funzionerà regolarmente.',
          id: 999,
          schedule: { at: new Date(Date.now() + 1000) }
        }
      ]
    });
    return true;
  } catch (err) {
    // Fallback su Web Notification se aperto in browser desktop/mobile
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Allarme Topi Saltatori (Prova)', {
        body: 'Squiiik! Notifica di prova ricevuta! Il promemoria è attivo.',
        icon: '/favicon.ico'
      });
      return true;
    }
    return false;
  }
}

