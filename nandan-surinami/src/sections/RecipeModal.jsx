import { useEffect, useRef, useState } from 'react';
import { gsap, Observer, useGSAP, motionScale } from '../lib/gsap';
import { matches, MQ, useMediaQuery } from '../lib/media';
import { lockScroll, unlockScroll } from '../lib/scroll';

export default function RecipeModal({ recipe, onClose }) {
  const root = useRef(null);
  const [current, setCurrent] = useState(null);
  const tl = useRef(null);
  const lastFocus = useRef(null);
  const swiped = useRef(false);
  const desktop = useMediaQuery(MQ.desktop);

  // Keep content mounted while the closing animation runs.
  useEffect(() => {
    if (recipe) {
      lastFocus.current = document.activeElement;
      setCurrent(recipe);
    } else if (current) {
      // After a swipe-down the sheet is already off screen: just fade the rest out quickly.
      tl.current?.timeScale(swiped.current ? 3.5 : 1.5).reverse();
    }
  }, [recipe]); // eslint-disable-line react-hooks/exhaustive-deps

  useGSAP(
    () => {
      if (!current || !recipe) return;
      lockScroll();
      swiped.current = false;
      const reduced = matches(MQ.reduced);
      const { d, t } = motionScale(matches(MQ.small));
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
        .fromTo('.recipe__sheet', { yPercent: reduced ? 0 : 105 }, { yPercent: 0, duration: reduced ? 0.01 : t(0.9), ease: 'expo.out' }, 0);
      // Reduced motion: the sheet just appears, its content is static.
      if (!reduced) {
        tl.current
          .from('.recipe__pack', { rotate: -20, y: d(80), autoAlpha: 0, duration: t(0.9), ease: 'pop' }, 0.25)
          .from('.recipe__head > *', { y: d(30), autoAlpha: 0, stagger: 0.06, duration: t(0.7) }, 0.3)
          .from('.recipe__step', { x: d(40), autoAlpha: 0, stagger: 0.08, duration: t(0.7) }, 0.45)
          .fromTo('.recipe__rail-line', { drawSVG: '0%' }, { drawSVG: '100%', duration: t(1.2), ease: 'power2.inOut' }, 0.45)
          .from('.recipe__outro', { scale: 0.7, autoAlpha: 0, duration: t(0.8), ease: 'pop' }, 0.9);
      }

      // Bottom sheet on phones/tablets: drag it down to dismiss. Observer only reads the gesture
      // (no preventDefault), so the sheet's own native scrolling keeps working. A drag moves the
      // sheet only while its content is scrolled to the top, like a native sheet.
      if (!matches(MQ.desktop)) {
        const sheet = root.current.querySelector('.recipe__sheet');
        let armed = false;
        let dragging = false;
        let offset = 0;
        const fromHandle = (target) => !!target?.closest?.('.recipe__handle, .recipe__visual');
        Observer.create({
          target: sheet,
          type: 'touch,pointer',
          dragMinimum: 4,
          onPress: (self) => {
            armed = fromHandle(self.event.target) || sheet.scrollTop <= 0;
            dragging = false;
            offset = 0;
          },
          onDrag: (self) => {
            if (!armed) return;
            const dy = self.y - self.startY;
            if (!dragging && (dy <= 0 || (sheet.scrollTop > 0 && !fromHandle(self.event.target)))) {
              // An upward gesture (or one that scrolls the content) is a scroll, not a dismiss.
              if (Math.abs(dy) > 8) armed = false;
              return;
            }
            dragging = true;
            offset = Math.max(0, dy);
            gsap.set(sheet, { y: offset });
          },
          onRelease: (self) => {
            if (!dragging) return;
            dragging = false;
            const shouldClose = offset > Math.min(160, sheet.offsetHeight * 0.25) || (self.velocityY > 900 && offset > 30);
            if (shouldClose) {
              gsap.to(sheet, { y: sheet.offsetHeight, duration: reduced ? 0.01 : 0.3, ease: 'power2.in', onComplete: () => {
                swiped.current = true;
                onClose();
              } });
            } else {
              gsap.to(sheet, { y: 0, duration: reduced ? 0.01 : 0.45, ease: 'power3.out' });
            }
          },
        });
      }

      root.current.querySelector('.recipe__close')?.focus();
    },
    // revertOnUpdate: once the sheet has closed (current → null) its timeline and drag Observer are
    // killed, so nothing lingers between openings.
    { scope: root, dependencies: [current], revertOnUpdate: true }
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
        {/* Drag handle for the phone/tablet bottom sheet: swipe down to close. */}
        {!desktop && <div className="recipe__handle" aria-hidden="true"><span /></div>}
        <button type="button" className="recipe__close" onClick={onClose} aria-label="Sluiten">
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
