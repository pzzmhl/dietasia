import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { CORALINE_PLAYLIST_URL, openCoralineSpotifyShuffle } from '../services/spotify.js';

/**
 * Portale della Piccola Porta di Coraline — Algoritmo "Weighted Shuffle Bag" (6 : 3)
 *
 * Mazzo da 9 elementi totali persistito in localStorage:
 * - 6x Playlist Colonna Sonora di Coraline (Spotify)
 * - 1x Video YouTube 1
 * - 1x Video YouTube 2
 * - 1x Video YouTube 3
 */
export const CORALINE_YOUTUBE_VIDEOS = [
  'https://youtu.be/jXqqd0ZBEMA?si=who2AAprixOMjJQN',
  'https://youtu.be/lWMsWXUljIg?si=i2xIp3oleH92Vs_G',
  'https://youtu.be/Y24P2xSzmE4?si=s1GiFr6rVM_KOa_b'
];

const BAG_TOTAL_SIZE = 9;
const PLAYLIST_WEIGHT = 6;

const ALLOWED_PORTAL_URLS = new Set([
  CORALINE_PLAYLIST_URL,
  ...CORALINE_YOUTUBE_VIDEOS
]);

/**
 * Genera e mescola con Fisher-Yates un nuovo mazzo da 9 elementi (proporzione 6 : 1 : 1 : 1).
 * Applica la protezione anti-ripetizione video a cavallo del rimescolamento:
 * se l'ultimo URL estratto dal mazzo precedente era uno dei 3 video YouTube e la prima carta
 * del nuovo mazzo è quello stesso identico video, la scambia con un'altra posizione del mazzo.
 *
 * @param {string | null} [previousLastUrl]
 * @returns {string[]} Array mescolato di 9 URL
 */
export function createShuffledPortalBag(previousLastUrl = null) {
  const bag = [
    ...Array(PLAYLIST_WEIGHT).fill(CORALINE_PLAYLIST_URL),
    ...CORALINE_YOUTUBE_VIDEOS
  ];

  // Mescolamento uniforme Fisher-Yates
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = bag[i];
    bag[i] = bag[j];
    bag[j] = temp;
  }

  // Rimescolamento Automatico Anti-Ripetizione Video:
  // Poiché ogni video YouTube compare 1 sola volta nel mazzo da 9, tutti gli indici 1..8
  // contengono garantitamente un URL diverso da bag[0].
  if (
    previousLastUrl &&
    CORALINE_YOUTUBE_VIDEOS.includes(previousLastUrl) &&
    bag[0] === previousLastUrl
  ) {
    const swapIndex = 1 + Math.floor(Math.random() * (bag.length - 1));
    const temp = bag[0];
    bag[0] = bag[swapIndex];
    bag[swapIndex] = temp;
  }

  return bag;
}

/**
 * Legge e valida in modo difensivo lo stato del mazzo da localStorage.
 * @returns {{ deck: string[], lastDrawnUrl: string | null }}
 */
function readPersistedBagState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOOR_PORTAL_SHUFFLE_BAG);
    if (!raw) {
      return { deck: [], lastDrawnUrl: null };
    }

    const parsed = JSON.parse(raw);

    // Supporta sia la struttura { deck, lastDrawnUrl } sia un eventuale array diretto
    const rawDeck = Array.isArray(parsed)
      ? parsed
      : (parsed && Array.isArray(parsed.deck) ? parsed.deck : null);

    const lastDrawnUrl = (
      parsed &&
      !Array.isArray(parsed) &&
      typeof parsed.lastDrawnUrl === 'string' &&
      ALLOWED_PORTAL_URLS.has(parsed.lastDrawnUrl)
    )
      ? parsed.lastDrawnUrl
      : null;

    if (
      !rawDeck ||
      rawDeck.length === 0 ||
      rawDeck.length > BAG_TOTAL_SIZE ||
      !rawDeck.every((item) => typeof item === 'string' && ALLOWED_PORTAL_URLS.has(item))
    ) {
      return { deck: [], lastDrawnUrl };
    }

    return { deck: rawDeck, lastDrawnUrl };
  } catch (e) {
    return { deck: [], lastDrawnUrl: null };
  }
}

/**
 * Salva in modo silenzioso e sicuro lo stato del mazzo in localStorage.
 * @param {string[]} deck
 * @param {string} lastDrawnUrl
 */
function savePersistedBagState(deck, lastDrawnUrl) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.DOOR_PORTAL_SHUFFLE_BAG,
      JSON.stringify({ deck, lastDrawnUrl })
    );
  } catch (e) {
    // Fallback silenzioso se lo storage è bloccato o pieno
  }
}

/**
 * Estrae il prossimo URL dalla Weighted Shuffle Bag (6:3), rigenerando automaticamente
 * il mazzo quando è vuoto o corrotto, e aggiorna il localStorage.
 *
 * @returns {string} L'URL estratto
 */
export function drawNextDoorPortalUrl() {
  const { deck: storedDeck, lastDrawnUrl } = readPersistedBagState();

  const activeDeck = storedDeck.length > 0
    ? storedDeck
    : createShuffledPortalBag(lastDrawnUrl);

  const drawnUrl = activeDeck[0];
  const remainingDeck = activeDeck.slice(1);

  // Se l'estrazione ha svuotato il mazzo da 9 elementi, rigenera subito il prossimo mazzo
  // applicando il controllo anti-ripetizione rispetto a `drawnUrl`.
  const nextPersistedDeck = remainingDeck.length > 0
    ? remainingDeck
    : createShuffledPortalBag(drawnUrl);

  savePersistedBagState(nextPersistedDeck, drawnUrl);

  return drawnUrl;
}

/**
 * Estrae il prossimo elemento dalla Shuffle Bag 6:3 e apre direttamente la destinazione esterna:
 * - Se esce la Playlist della Colonna Sonora (6 su 9): avvia Spotify Shuffle come in precedenza.
 * - Se esce uno dei 3 video YouTube (3 su 9): apre direttamente il relativo link esterno.
 *
 * @returns {string} L'URL aperto
 */
export function openNextDoorPortal() {
  const targetUrl = drawNextDoorPortalUrl();

  if (targetUrl === CORALINE_PLAYLIST_URL) {
    openCoralineSpotifyShuffle();
    return targetUrl;
  }

  try {
    if (typeof window !== 'undefined') {
      const win = window.open(targetUrl, '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch (e) {}
      }
    }
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.location.assign(targetUrl);
    }
  }

  return targetUrl;
}

