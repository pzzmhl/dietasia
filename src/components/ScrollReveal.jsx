import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal: Componente di generazione/apparizione moderna allo scorrimento.
 * Quando l'utente scorre in basso, gli elementi sottostanti si manifestano
 * con una transizione fluida e moderna (fade-in-up + de-blur + scale organico)
 * accompagnata da un sottile bagliore etereo che simula la creazione dell'Altro Mondo.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  style = {}
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Se l'elemento è già visibile al caricamento (viewport iniziale), mostralo subito
    if (typeof window !== 'undefined') {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        setIsVisible(true);
        return;
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      if (observer && el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  if (!children) return null;

  return (
    <div
      ref={ref}
      className={`scroll-reveal-container ${isVisible ? 'is-revealed' : ''} ${className}`}
      style={{
        ...style,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

