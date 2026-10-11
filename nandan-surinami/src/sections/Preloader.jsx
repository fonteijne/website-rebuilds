import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { lockScroll, unlockScroll } from '../lib/scroll';
import Sunburst from '../components/Sunburst';

const assetsReady = () =>
  Promise.race([
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
    ]),
    new Promise((r) => setTimeout(r, 4000)), // never hold the visitor hostage
  ]);

export default function Preloader({ onDone }) {
  const root = useRef(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      let alive = true; // StrictMode mounts twice in dev; ignore stale promises
      lockScroll();
      window.scrollTo(0, 0);

      if (prefersReducedMotion()) {
        assetsReady().then(() =>
          alive && gsap.to(root.current, {
            autoAlpha: 0,
            duration: 0.4,
            onComplete: () => {
              unlockScroll();
              setGone(true);
              onDone();
            },
          })
        );
        return () => (alive = false);
      }

      const counter = { v: 0 };
      const num = root.current.querySelector('.preloader__count');

      const intro = gsap.timeline();
      intro
        .from('.sunburst__ray', { scale: 0, transformOrigin: '50% 50%', opacity: 0, stagger: { each: 0.02, from: 'random' }, duration: 0.9 })
        .from('.preloader__logo', { scale: 0.4, autoAlpha: 0, rotate: -12, duration: 1, ease: 'pop' }, 0.15)
        .from('.preloader__tag', { yPercent: 120, duration: 0.8 }, 0.4)
        .to(counter, {
          v: 100,
          duration: 1.6,
          ease: 'power2.inOut',
          onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(3, '0')),
        }, 0);

      gsap.to('.preloader__burst', { rotate: 360, duration: 30, repeat: -1, ease: 'none' });

      Promise.all([assetsReady(), intro.then()]).then(() => {
        if (!alive) return;
        gsap
          .timeline({
            onComplete: () => {
              unlockScroll();
              setGone(true);
            },
          })
          .to('.preloader__logo', { scale: 0.85, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
          .to('.preloader__burst', { scale: 2.4, autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, 0)
          .to(['.preloader__tag', '.preloader__count'], { autoAlpha: 0, duration: 0.3 }, 0)
          .to('.preloader__panel', { yPercent: -100, duration: 1, ease: 'expo.inOut', stagger: { each: 0.12, from: 'end' } }, 0.35)
          .add(() => onDone(), 0.85);
      });

      return () => (alive = false);
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div className="preloader" ref={root} role="status" aria-label="Pagina wordt geladen">
      <div className="preloader__panel preloader__panel--saffron" />
      <div className="preloader__panel preloader__panel--red">
        <Sunburst className="preloader__burst" rays={32} />
        <img className="preloader__logo" src="/img/logo.webp" alt="H. Nandan Surinami" width="220" height="267" />
        <div className="preloader__meta">
          <span className="preloader__tagwrap"><span className="preloader__tag">Authentic made simple</span></span>
          <span className="preloader__count" aria-hidden="true">000</span>
        </div>
      </div>
    </div>
  );
}
