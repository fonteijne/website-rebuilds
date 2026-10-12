import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap.js';
import { CONCEPTS } from '../data/concepts.js';
import { useStore } from '../lib/store.jsx';
import SnackCard from './SnackCard.jsx';

const SWIPE = 70;

/**
 * Snack-card deck: one idea per card.
 * Keyboard (← →), swipe, buttons and dots all work; GSAP handles the card transition.
 */
export default function CardDeck({ module, nextModule }) {
  const { state, dispatch } = useStore();
  const cards = module.cards;
  const [i, setI] = useState(0);
  const dirRef = useRef(1);
  const stage = useRef(null);
  const drag = useRef(null);
  const finished = i >= cards.length;
  const card = cards[Math.min(i, cards.length - 1)];

  // reset when switching modules
  useEffect(() => setI(0), [module.id]);

  // mark seen
  useEffect(() => {
    if (!finished) dispatch({ type: 'seen', id: card.id });
    else cards.forEach((c) => dispatch({ type: 'seen', id: c.id }));
  }, [i, finished, card.id, cards, dispatch]);

  const go = useCallback(
    (d) => {
      dirRef.current = d;
      setI((cur) => Math.max(0, Math.min(cards.length, cur + d)));
    },
    [cards.length]
  );

  // transition on every change
  useGSAP(
    () => {
      if (!stage.current || prefersReducedMotion()) return;
      const el = stage.current.querySelector('[data-deck-card]');
      if (!el) return;
      gsap.fromTo(
        el,
        { x: dirRef.current * 56, rotate: dirRef.current * 1.6, autoAlpha: 0 },
        { x: 0, rotate: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform' }
      );
    },
    { scope: stage, dependencies: [i] }
  );

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // swipe (ignored on controls)
  const onPointerDown = (e) => {
    if (e.target.closest('input,button,a,textarea,select,label,[role=radio]')) return;
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
  };

  const learned = new Set(cards.flatMap((c) => c.concepts));
  const seenCount = cards.filter((c) => state.seen[c.id]).length;

  return (
    <section className="deck" aria-roledescription="carousel" aria-label={`${module.title} snack cards`}>
      <div className="deck__progress" role="progressbar" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={Math.min(i + 1, cards.length)} aria-label="Module progress">
        {cards.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            className={`dot${idx === i ? ' dot--on' : ''}${state.seen[c.id] ? ' dot--seen' : ''}`}
            aria-label={`Go to card ${idx + 1}: ${c.title}`}
            aria-current={idx === i ? 'step' : undefined}
            onClick={() => {
              dirRef.current = idx > i ? 1 : -1;
              setI(idx);
            }}
          />
        ))}
      </div>

      <div className="deck__stage" ref={stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className="deck__ghost deck__ghost--2" aria-hidden="true" />
        <div className="deck__ghost deck__ghost--1" aria-hidden="true" />
        {!finished ? (
          <div data-deck-card className="deck__card" aria-roledescription="slide" aria-label={`Card ${i + 1} of ${cards.length}`}>
            <SnackCard card={card} index={i} total={cards.length} />
          </div>
        ) : (
          <div data-deck-card className="deck__card">
            <div className="snack snack--done">
              <span className="tag tag--leaf">✓ Module complete</span>
              <h2 className="snack__title">You’ve finished “{module.title}”.</h2>
              <p className="snack__body">Concepts covered in this module:</p>
              <ul className="chips">
                {CONCEPTS.filter((c) => learned.has(c.id)).map((c) => (
                  <li key={c.id} className="chip chip--static">{c.label}</li>
                ))}
              </ul>
              <div className="snack__actions">
                {nextModule ? (
                  <Link className="btn btn--tomato" to={`/learn/${nextModule.id}`}>Next: {nextModule.title} →</Link>
                ) : (
                  <Link className="btn btn--tomato" to="/quiz">Take the mastery check →</Link>
                )}
                <Link className="btn btn--ghost" to="/lab">Open the Lab</Link>
                <button type="button" className="btn btn--ghost" onClick={() => { dirRef.current = -1; setI(0); }}>Replay</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {finished ? 'Module complete.' : `Card ${i + 1} of ${cards.length}: ${card.title}`}
      </p>

      <div className="deck__controls">
        <button type="button" className="btn btn--ghost" onClick={() => go(-1)} disabled={i === 0}>← Back</button>
        <span className="deck__hint no-print">
          {seenCount}/{cards.length} seen · use <kbd>←</kbd> <kbd>→</kbd> or swipe
        </span>
        <button type="button" className="btn" onClick={() => go(1)} disabled={finished}>
          {i === cards.length - 1 ? 'Finish' : 'Next'} →
        </button>
      </div>
    </section>
  );
}
