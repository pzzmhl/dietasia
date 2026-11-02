import React from 'react';

/**
 * ScrollReveal: Rende i figli immediatamente al caricamento dell'app
 * senza attendere lo scorrimento o creare ritardi/dissolvenze a comparsa.
 */
export default function ScrollReveal({
  children,
  className = '',
  style = {}
}) {
  if (!children) return null;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
