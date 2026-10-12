import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap.js';

/**
 * A toy model of Perry's argument — NOT data. Avoidance needs two things:
 * something to avoid (the top task) and somewhere useful to flee to (the rest).
 * Done = tasks you can flee to = n - 1. With n = 1 there is nowhere to flee: the couch.
 */
export default function EngineVisual() {
  const [n, setN] = useState(1);
  const root = useRef(null);
  const done = Math.max(0, n - 1);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.tile', { scale: 0.4, autoAlpha: 0, stagger: 0.03, duration: 0.35, ease: 'back.out(2)', clearProps: 'all' });
    },
    { scope: root, dependencies: [n] }
  );

  const verdict =
    n === 1
      ? { tone: 'tomato', head: 'Couch potato', text: 'One big task and nowhere to flee. Avoiding it means doing nothing at all.' }
      : n < 5
        ? { tone: 'sun', head: 'Barely moving', text: 'A few escape routes. Something gets done, but fuel is thin — one finished task and the engine stalls.' }
        : { tone: 'leaf', head: 'Effective human', text: 'Plenty of worthwhile places to flee to. The top stays untouched; everything else moves.' };

  return (
    <div className="visual engine" ref={root}>
      <label className="engine__label" htmlFor="engine-range">
        Tasks on your list: <b>{n}</b>
      </label>
      <input
        id="engine-range"
        type="range"
        min={1}
        max={12}
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
        aria-valuetext={`${n} tasks`}
        data-lenis-prevent-touch
      />
      <div className="tiles" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`tile ${i === 0 ? 'tile--top' : 'tile--done'}`}>
            {i === 0 ? '!' : '✓'}
          </span>
        ))}
      </div>
      <div className={`verdict verdict--${verdict.tone}`} role="status">
        <strong>{verdict.head}</strong> — {done} worthwhile {done === 1 ? 'thing' : 'things'} done while the top stays untouched.
        <br />
        {verdict.text}
      </div>
      <p className="visual__fine">A toy model of the essay’s argument, not a measurement.</p>
    </div>
  );
}
