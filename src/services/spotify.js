/**
 * Servizio Integrazione Spotify - Colonna Sonora di Coraline
 * Playlist: https://open.spotify.com/playlist/5BjQJoPU0S0RiMNUro26kF
 * 
 * Permette l'avvio immediato in modalità Shuffle con apertura
 * dell'app nativa Spotify (Android/iOS) o web player di fallback.
 */

export const CORALINE_PLAYLIST_ID = '5BjQJoPU0S0RiMNUro26kF';

export const CORALINE_SOUNDTRACK_TRACKS = [
  { id: '24AX9XecMUvVKzQjir6Xpl', title: 'Exploration (Coraline) [feat. Julia K]' },
  { id: '2hlEY1tXhAUqFeboU54j5A', title: 'Coraline - Other Father Song' },
  { id: '2VAAmaEqL1xCvsWV03zJqn', title: 'End Credits (Piano Version)' },
  { id: '3TZ5SUq3BSWYSJCg5Xke8k', title: 'Exploration' },
  { id: '7s7OxPkHcp35ZPP3XUvAKQ', title: 'Mechanical Lullaby' },
  { id: '1c3LVp3S1zVVzvbC28fulX', title: 'Dreaming' },
  { id: '743qePSrW3yi7mXcOLmh6r', title: 'Coraline Fly' },
  { id: '0aDSDEVAJMO2cm3ALGuyI9', title: 'Mice Circus' },
  { id: '332aIozLqEI6NjKykV10Zx', title: "Let's Go" },
  { id: '2YYuGnUkC10FceY0e0YYB9', title: 'Wybie' },
  { id: '7CoEkx8uQ36R5FESR3lv8m', title: 'The Supper' },
  { id: '6XfJwhdF5SClfkFRDLEoIL', title: 'Trap For The Mices' },
  { id: '5719SLFumc4K0qPA9l7xI6', title: 'Dreams Are Dangerous' },
  { id: '5wqlmoVjaUq71USw2GNlIi', title: 'The Party' },
  { id: '4ApAk8pgYT99aT3ZzjxOgZ', title: 'In The Bed' },
  { id: '0Bt6Aeum1Id745Noz4kuAz', title: 'End Credits' },
  { id: '48TwC1rBszo6ST6qe4sB5k', title: 'Installation' },
  { id: '0n2XfbOhVR8xVQ3U8TsCwm', title: 'Alone' },
  { id: '4muN65tnNgZ3zoKCRqdBJh', title: 'The Theater' },
  { id: '0gRz53258BBmx0cogWB4o5', title: 'The Hand' },
  { id: '3VU9ICLsBuYYCf71VlTxqi', title: 'You Know I Love You' },
  { id: '3AiIorC9szTsyIqVDM0S7E', title: 'Ghost Children' },
  { id: '0WSnbVx4f5oUbCoXysOGpq', title: 'Sirens Of The Sea' },
  { id: '0UsmCOkYjWhoVQQDiVJZ3C', title: 'Bobinsky' },
  { id: '32XZSzERpdmnvdwU6OyrmJ', title: 'The Famous Mister B' },
  { id: '4IrY98FMi6cOZAa0NLtGxs', title: 'Coraline Dispair' }
];

/**
 * Apre Spotify riproducendo una canzone randomica dalla colonna sonora di Coraline,
 * mantenendo la playlist in coda (modalità shuffle reale).
 * @returns {{ id: string, title: string }} La traccia selezionata
 */
export function openCoralineSpotifyShuffle() {
  const randomIndex = Math.floor(Math.random() * CORALINE_SOUNDTRACK_TRACKS.length);
  const selectedTrack = CORALINE_SOUNDTRACK_TRACKS[randomIndex];

  const trackId = selectedTrack.id;
  const playlistUri = `spotify:playlist:${CORALINE_PLAYLIST_ID}`;
  const trackUri = `spotify:track:${trackId}?context=${playlistUri}`;
  const webUrl = `https://open.spotify.com/track/${trackId}?context=spotify%3Aplaylist%3A${CORALINE_PLAYLIST_ID}`;

  try {
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // 1. Tenta apertura nativa tramite URI scheme spotify:
      const invisibleLink = document.createElement('a');
      invisibleLink.href = trackUri;
      invisibleLink.style.display = 'none';
      document.body.appendChild(invisibleLink);
      invisibleLink.click();
      document.body.removeChild(invisibleLink);

      // 2. Se l'app non è installata o non risponde dopo 600ms, fallback sul browser
      setTimeout(() => {
        if (typeof document !== 'undefined' && document.hasFocus()) {
          window.open(webUrl, '_blank');
        }
      }, 600);
    } else {
      // Su desktop o browser web standard
      window.open(webUrl, '_blank');
    }
  } catch (err) {
    console.warn('[Spotify] Errore apertura nativa, fallback web:', err);
    if (typeof window !== 'undefined') {
      window.open(webUrl, '_blank');
    }
  }

  return selectedTrack;
}

