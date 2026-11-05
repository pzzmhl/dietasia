import { useEffect, useRef, useState } from 'react';

// Singola istanza condivisa di IntersectionObserver per tutta l'app:
// zero overhead di observer multipli durante lo scroll verticale a 120Hz.
let sharedObserver = null;
const elementCallbacks = new WeakMap();

function getSharedObserver() {
  if (sharedObserver || typeof IntersectionObserver === 'undefined') {
    return sharedObserver;
  }

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const cb = elementCallbacks.get(entry.target);
        if (cb) {
          cb(entry.isIntersecting);
        }
      }
    },
    {
      // Riattiva le animazioni 110px prima che l'elemento entri nello schermo:
      // l'utente vede sempre le animazioni attive al 100%, ma fuori schermo consumano 0% GPU.
      rootMargin: '110px 0px 110px 0px',
      threshold: 0
    }
  );

  return sharedObserver;
}

/**
 * Hook ultra-leggero che rileva se un contenitore è vicino o dentro la viewport.
 * Usato per mettere in pausa (`animation-play-state: paused`) le animazioni infinite
 * fuori schermo durante lo scroll su Android senza alcuna differenza visiva.
 */
export function useInViewport(initialVisible = true) {
  const ref = useRef(null);
  const [isInViewport, setIsInViewport] = useState(initialVisible);

  useEffect(() => {
    const el = ref.current;
    const observer = getSharedObserver();
    if (!el || !observer) return;

    elementCallbacks.set(el, setIsInViewport);
    observer.observe(el);

    return () => {
      elementCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, []);

  return [ref, isInViewport];
}

