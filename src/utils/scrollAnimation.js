let cancelActiveScroll = null;

/**
 * Scorrimento morbido e cinematico verso un elemento del DOM
 * sincronizzato al refresh rate nativo (60/90/120Hz) ed easing cubico.
 *
 * @param {string|HTMLElement} target - ID dell'elemento o elemento DOM
 * @param {number} duration - Durata dello scorrimento in millisecondi (default: 1400ms)
 * @param {number} offsetTop - Spaziatura superiore in pixel (default: 16px)
 */
export function smoothScrollToElement(target, duration = 1400, offsetTop = 16) {
  if (typeof window === 'undefined') return;
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;

  if (cancelActiveScroll) {
    cancelActiveScroll();
  }

  const startY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const rect = el.getBoundingClientRect();
  const targetY = Math.max(0, rect.top + startY - offsetTop);
  const distance = targetY - startY;

  if (Math.abs(distance) < 4) return;

  let startTime = null;
  let animId = null;

  // Curva di decelerazione cinematografica ultra-morbida (easeInOutCubic)
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const cleanup = () => {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener('wheel', cleanup);
    window.removeEventListener('touchstart', cleanup);
    window.removeEventListener('pointerdown', cleanup);
    if (cancelActiveScroll === cleanup) {
      cancelActiveScroll = null;
    }
  };

  cancelActiveScroll = cleanup;
  window.addEventListener('wheel', cleanup, { passive: true });
  window.addEventListener('touchstart', cleanup, { passive: true });
  window.addEventListener('pointerdown', cleanup, { passive: true });

  const step = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * ease);

    if (progress < 1) {
      animId = requestAnimationFrame(step);
    } else {
      cleanup();
    }
  };

  animId = requestAnimationFrame(step);
}
