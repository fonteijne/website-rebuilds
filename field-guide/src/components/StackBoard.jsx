import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap.js';

const TASKS = [
  { label: 'Finish the grant report', stamp: 'Seems due!', kind: 'fuel' },
  { label: 'Answer the backlog of emails', kind: 'work' },
  { label: 'Clear and file the receipts', kind: 'work' },
  { label: 'Update the team wiki', kind: 'work' },
  { label: 'Book the dentist', kind: 'work' },
  { label: 'Fix the squeaky door', kind: 'work' }
];

/**
 * The method, animated. One GSAP timeline tells the whole story:
 *   list appears → top item is avoided (wobble) → everything beneath it gets done →
 *   a bigger task arrives (the swap) → the old top item finally gets done.
 * `getTimeline()` lets the parent either play() it (cards) or scrub it with ScrollTrigger (home).
 */
const StackBoard = forwardRef(function StackBoard({ onStep }, ref) {
  const root = useRef(null);
  const tlRef = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const notes = q('.board__list .note');
      const counter = { n: 0 };
      const scoreEl = q('[data-score]')[0];
      const bump = (to) =>
        gsap.to(counter, {
          n: to,
          duration: 0.3,
          snap: { n: 1 },
          onUpdate: () => {
            scoreEl.textContent = counter.n;
          }
        });

      if (prefersReducedMotion()) {
        // Show the finished state, no motion.
        gsap.set(q('.note__strike'), { scaleX: 1 });
        gsap.set(q('.note__check'), { scale: 1 });
        scoreEl.textContent = TASKS.length - 1;
        return;
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      tl.set(q('.note__strike'), { scaleX: 0, transformOrigin: 'left center' })
        .set(q('.note__check'), { scale: 0 })
        .set(q('.board__new'), { autoAlpha: 0, y: -28 })
        .set(q('.stamp--avoid'), { autoAlpha: 0, scale: 1.5, rotate: -14 })
        .from(notes, { autoAlpha: 0, y: 24, stagger: 0.09, duration: 0.4 }, 0)
        .addLabel('avoid', '+=0.2')
        .call(() => onStep?.('avoid'), null, 'avoid')
        .to(q('.stamp--avoid'), { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.3, ease: 'back.out(2)' }, 'avoid')
        .to(notes[0], { x: 6, repeat: 5, yoyo: true, duration: 0.05 }, 'avoid')
        .addLabel('cascade', '+=0.25')
        .call(() => onStep?.('cascade'), null, 'cascade');

      notes.slice(1).forEach((note, i) => {
        const at = `cascade+=${i * 0.55}`;
        tl.to(note.querySelector('.note__strike'), { scaleX: 1, duration: 0.35 }, at)
          .to(note.querySelector('.note__check'), { scale: 1, duration: 0.35, ease: 'back.out(3)' }, at)
          .to(note, { backgroundColor: 'var(--leaf-soft)', duration: 0.3 }, at)
          .add(bump(i + 1), at);
      });

      tl.addLabel('swap', '+=0.5')
        .call(() => onStep?.('swap'), null, 'swap')
        .to(q('.board__new'), { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, 'swap')
        .to(q('.stamp--avoid'), { autoAlpha: 0, duration: 0.2 }, 'swap')
        .to(notes[0].querySelector('.note__strike'), { scaleX: 1, duration: 0.35 }, 'swap+=0.5')
        .to(notes[0].querySelector('.note__check'), { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 'swap+=0.5')
        .to(notes[0], { backgroundColor: 'var(--leaf-soft)', duration: 0.3 }, 'swap+=0.5')
        .add(bump(TASKS.length), 'swap+=0.5');

      tlRef.current = tl;
    },
    { scope: root }
  );

  useImperativeHandle(ref, () => ({ getTimeline: () => tlRef.current }), []);

  return (
    <div className="board" ref={root} role="group" aria-label="Animated example of a task stack">
      <div className="board__new note note--big" aria-hidden="true">
        <span>⚡ A bigger, “more important” task arrives</span>
      </div>
      <ul className="board__list">
        {TASKS.map((t, i) => (
          <li key={t.label} className={`note${t.kind === 'fuel' ? ' note--fuel' : ''}`}>
            <span className="note__check" aria-hidden="true">✓</span>
            <span className="note__text">
              {t.label}
              <span className="note__strike" aria-hidden="true" />
            </span>
            {t.stamp && <em className="stamp">{t.stamp}</em>}
            {i === 0 && <em className="stamp stamp--avoid" aria-hidden="true">Avoiding</em>}
          </li>
        ))}
      </ul>
      <p className="board__score">
        Done: <b data-score>0</b> / {TASKS.length}
      </p>
    </div>
  );
});

export default StackBoard;
