import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { lockScroll, unlockScroll } from '../lib/scroll';

export default function RecipeModal({ recipe, onClose }) {
  const root = useRef(null);
  const [current, setCurrent] = useState(null);
  const tl = useRef(null);
  const lastFocus = useRef(null);

  // Keep content mounted while the closing animation runs.
  useEffect(() => {
    if (recipe) {
      lastFocus.current = document.activeElement;
      setCurrent(recipe);
    } else if (current) {
      tl.current?.timeScale(1.5).reverse();
    }
  }, [recipe]); // eslint-disable-line react-hooks/exhaustive-deps

  useGSAP(
    () => {
      if (!current || !recipe) return;
      lockScroll();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      tl.current = gsap
        .timeline({
          defaults: { ease: 'pour' },
          onReverseComplete: () => {
            unlockScroll();
            setCurrent(null);
            lastFocus.current?.focus?.();
          },
        })
        .fromTo('.recipe__scrim', { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0.01 : 0.5 })
        .fromTo('.recipe__sheet', { yPercent: reduced ? 0 : 105 }, { yPercent: 0, duration: reduced ? 0.01 : 0.9, ease: 'expo.out' }, 0)
        .from('.recipe__pack', { rotate: -20, y: 80, autoAlpha: 0, duration: 0.9, ease: 'pop' }, 0.25)
        .from('.recipe__head > *', { y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.7 }, 0.3)
        .from('.recipe__step', { x: 40, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.45)
        .fromTo('.recipe__rail-line', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' }, 0.45)
        .from('.recipe__outro', { scale: 0.7, autoAlpha: 0, duration: 0.8, ease: 'pop' }, 0.9);

      root.current.querySelector('.recipe__close')?.focus();
    },
    { scope: root, dependencies: [current] }
  );

  useEffect(() => {
    if (!current) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = root.current.querySelectorAll('button, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, onClose]);

  if (!current) return null;

  return (
    <div className="recipe" ref={root} role="dialog" aria-modal="true" aria-labelledby="recipe-title" data-lenis-prevent>
      <div className="recipe__scrim" onClick={onClose} />
      <div className="recipe__sheet" style={{ '--accent': current.accent }}>
        <button className="recipe__close" onClick={onClose} aria-label="Sluiten">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="recipe__visual">
          <img className="recipe__pack" src={current.pack} alt="" width="514" height="800" />
        </div>
        <div className="recipe__content">
          <header className="recipe__head">
            <p className="kicker">Bereidingswijze</p>
            <h2 id="recipe-title">Hindostaanse Boemboe – {current.name}</h2>
            <ul className="recipe__facts">
              <li><strong>Porties</strong>{current.serves}</li>
              <li><strong>Geschikt</strong>{current.for}</li>
              <li><strong>Zelf toevoegen</strong>{current.add.replace('Zelf toevoegen: ', '')}</li>
            </ul>
          </header>
          <div className="recipe__steps-wrap">
            <svg className="recipe__rail" viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true">
              <line className="recipe__rail-line" x1="2" y1="0" x2="2" y2="100" />
            </svg>
            <ol className="recipe__steps">
              {current.steps.map((s, i) => (
                <li className="recipe__step" key={i}>
                  <span className="recipe__step-num">{i + 1}</span>
                  <p>{s}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="recipe__outro">Nyan Switi! <small>(Eet smakelijk)</small></p>
        </div>
      </div>
    </div>
  );
}
