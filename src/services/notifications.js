/**
 * Servizio Notifiche Quotidiane e di Trama (Coraline Diet Tracker)
 * Supporta notifiche native Android (via @capacitor/local-notifications)
 * con canali ad alta priorità e fallback su API Web Notification.
 */

import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_ID = 42;

/**
 * Richiede i permessi per le notifiche sia su Android che su Web
 */
export async function requestNotificationPermission() {
  try {
    const capPerm = await LocalNotifications.requestPermissions();
    if (capPerm && capPerm.display === 'granted') {
      return true;
    }
  } catch (e) {
    // Fallback su ambiente browser
  }

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
    await requestNotificationPermission();

    // Registra il canale notifiche ad alta priorità su Android
    try {
      await LocalNotifications.createChannel({
        id: 'coraline_reminders',
        name: 'Promemoria Diario Coraline',
        description: 'Notifiche e allarmi dell’Altro Mondo',
        importance: 5,
        visibility: 1,
        vibration: true
      });
    } catch (e) {}

    // Cancella notifiche precedenti per evitare doppioni
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

    // Calcola la data e ora del prossimo trigger
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

    return true;
  } catch (err) {
    console.warn('[Notifiche] Pianificazione nativa non riuscita o su web:', err);
    return false;
  }
}

/**
 * Notifica 1: Wybie celebra il traguardo di giorni di dieta consecutivi (streak)
 */
export async function sendWybieStreakNotification(streak) {
  await requestNotificationPermission();

  const title = '✦ Wybie è fiero di te, Asia! ✦';
  const body = `Ehi Asia, ${streak} giorni di fila senza sgarrare! Persino la nonna sarebbe impressionata, stai battendo l'Altro Mondo!`;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: 1000 + Number(streak),
          channelId: 'coraline_reminders',
          schedule: { at: new Date(Date.now() + 500) },
          smallIcon: 'ic_launcher'
        }
      ]
    });
    return true;
  } catch (err) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
      return true;
    }
    return false;
  }
}

/**
 * Notifica 2: L'Altra Madre ingoia l'ultima chiave (sgarri mensili esauriti)
 */
export async function sendOtherMotherKeysDepletedNotification() {
  await requestNotificationPermission();

  const title = "✦ L'Altra Madre ha ingoiato l'ultima chiave! ✦";
  const body = "Hai esaurito tutti i tuoi sgarri del mese, Asia! L'Altra Madre ha preso l'ultima Chiave Nera... niente più errori o vorrà cucirti i bottoni!";

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: 2001,
          channelId: 'coraline_reminders',
          schedule: { at: new Date(Date.now() + 500) },
          smallIcon: 'ic_launcher'
        }
      ]
    });
    return true;
  } catch (err) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
      return true;
    }
    return false;
  }
}

/**
 * Notifica di Prova (Test immediato per impostazioni)
 */
export async function sendTestReminderNotification() {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const title = "✦ I Topi Saltatori sono qui! (Test) ✦";
  const body = "Promemoria di prova riuscito! Le notifiche dell'Altro Mondo sono attive, Asia.";

  try {
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
  } catch (err) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.png' });
      return true;
    }
    return false;
  }
}
