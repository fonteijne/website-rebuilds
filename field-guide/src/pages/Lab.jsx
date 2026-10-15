import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flip, gsap, useGSAP, prefersReducedMotion } from '../lib/gsap.js';
import { useStore } from '../lib/store.jsx';
import { CONSEQUENCES, VERDICTS, classifyTask, orderStack, suggestNext } from '../lib/classify.js';
import { useSparks } from '../components/Sparks.jsx';
import TesterVisual from '../components/TesterVisual.jsx';
import Magnet from '../vendor/react-bits/Magnet.jsx';

export default function Lab() {
  const { state, dispatch } = useStore();
  const { celebrate } = useSparks();
  const root = useRef(null);
  const flipState = useRef(null);
  const [title, setTitle] = useState('');
  const [bigger, setBigger] = useState('');
  const [editing, setEditing] = useState(null);

  const ordered = orderStack(state.tasks);
  const { avoided, next, real } = suggestNext(state.tasks);
  const open = state.tasks.filter((t) => !t.done).length;
  const done = state.tasks.length - open;
  const fuelOpen = state.tasks.filter((t) => !t.done && classifyTask(t) === 'fuel').length;
  const sig = ordered.map((t) => `${t.id}:${t.done}:${classifyTask(t)}`).join('|');

  // GSAP Flip: capture layout, let React reorder, animate from the old positions.
  const withFlip = (fn) => {
    if (!prefersReducedMotion() && root.current) {
      flipState.current = Flip.getState(root.current.querySelectorAll('[data-flip-id]'));
    }
    fn();
  };

  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.55,
        ease: 'power2.inOut',
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.2 })
      });
      flipState.current = null;
    },
    { scope: root, dependencies: [sig] }
  );

  const add = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    withFlip(() => dispatch({ type: 'addTask', task: { title: t, role: 'filler', importance: 3, seemsDue: false, consequence: 'none' } }));
    setTitle('');
  };

  const swap = (e) => {
    e.preventDefault();
    const t = bigger.trim();
    if (!t) return;
    withFlip(() => dispatch({ type: 'swap', task: { title: t } }));
    setBigger('');
  };

  const tick = (task, el) => {
    withFlip(() => dispatch({ type: 'toggleTask', id: task.id }));
    if (!task.done) celebrate(el);
  };

  return (
    <div className="wrap section" ref={root}>
      <p className="eyebrow">Dogfood Lab</p>
      <h1 className="page-title">Your real list. <span className="hl">Run the method on it.</span></h1>
      <p className="lead">
        This is where the course becomes practice. Everything you added in the modules lands here. Mark what you’re avoiding, tag
        real consequences honestly, and let the stack tell you what to do instead.
      </p>

      <section className="now" aria-labelledby="now-h">
        <h2 id="now-h" className="sr-only">Right now</h2>
        {state.tasks.length === 0 ? (
          <div className="now__empty">
            <p><strong>Your stack is empty.</strong> Add the thing you’re avoiding in <Link to="/learn/confession">Module 1</Link>, or type it in below.</p>
          </div>
        ) : (
          <div className="now__grid">
            <div className="now__avoid">
              <span className="tag tag--tomato">You’re avoiding</span>
              <p className="now__task">{avoided ? avoided.title : '—'}</p>
              <small>It’s fine. It’s doing its job.</small>
            </div>
            <div className="now__arrow" aria-hidden="true">→</div>
            <div className="now__do">
              <span className="tag tag--leaf">Instead, do</span>
              <p className="now__task">{next ? next.title : 'Add some worthwhile tasks below'}</p>
              {next && (
                <Magnet padding={60} magnetStrength={3}>
                  <button type="button" className="btn btn--sm" onClick={(e) => tick(next, e.currentTarget)}>Done ✓</button>
                </Magnet>
              )}
            </div>
          </div>
        )}
        {real && (
          <p className="alert" role="alert">
            <strong>Heads up:</strong> “{real.title}” has serious consequences. It doesn’t belong in the avoidance stack — do it first or
            time-box it.
          </p>
        )}
        <dl className="stats">
          <div><dt>Open</dt><dd>{open}</dd></div>
          <div><dt>Done</dt><dd>{done}</dd></div>
          <div><dt>Fuel items</dt><dd>{fuelOpen}</dd></div>
          <div><dt>Fillers (aim 10+)</dt><dd>{state.tasks.filter((t) => !t.done && classifyTask(t) === 'filler').length}</dd></div>
        </dl>
        {state.tasks.length > 0 && state.tasks.filter((t) => classifyTask(t) === 'filler').length < 10 && (
          <p className="muted">Tip: couch-potato risk. Perry’s method wants a <em>long</em> list of worthwhile tasks beneath the top.</p>
        )}
      </section>

      <div className="lab-grid">
        <section aria-labelledby="stack-h">
          <h2 id="stack-h">The stack</h2>
          <form className="addrow" onSubmit={add}>
            <label className="sr-only" htmlFor="newtask">New task</label>
            <input id="newtask" type="text" value={title} maxLength={80} placeholder="Add a worthwhile task…" onChange={(e) => setTitle(e.target.value)} />
            <button className="btn btn--sm" type="submit" disabled={!title.trim()}>Add</button>
          </form>

          <ol className="stack">
            {ordered.map((t, idx) => {
              const kind = classifyTask(t);
              const v = VERDICTS[kind];
              const isEditing = editing === t.id;
              return (
                <li key={t.id} data-flip-id={t.id} className={`task task--${kind}${t.done ? ' task--done' : ''}`}>
                  <div className="task__row">
                    <button
                      type="button"
                      className="check-btn"
                      role="checkbox"
                      aria-checked={t.done}
                      aria-label={`Mark “${t.title}” ${t.done ? 'not done' : 'done'}`}
                      onClick={(e) => tick(t, e.currentTarget)}
                    >
                      {t.done ? '✓' : ''}
                    </button>
                    <div className="task__main">
                      <span className="task__title">{t.title}</span>
                      <span className="task__meta">
                        <span className={`tag tag--${v.tone}`}>{v.label}</span>
                        {t.avoided && !t.done && <span className="tag tag--tomato">avoiding</span>}
                        <span className="muted">felt importance {t.importance}/5</span>
                      </span>
                    </div>
                    <div className="task__tools">
                      <button type="button" className="icon-btn" aria-expanded={isEditing} onClick={() => setEditing(isEditing ? null : t.id)} aria-label={`Tune “${t.title}”`}>⚙</button>
                      <button type="button" className="icon-btn" onClick={() => withFlip(() => dispatch({ type: 'removeTask', id: t.id }))} aria-label={`Delete “${t.title}”`}>×</button>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="task__edit">
                      <label>
                        Feels important: <b>{t.importance}</b>/5
                        <input type="range" min={1} max={5} value={t.importance ?? 3} onChange={(e) => dispatch({ type: 'updateTask', id: t.id, patch: { importance: Number(e.target.value) } })} />
                      </label>
                      <label className="inline">
                        <input type="checkbox" checked={Boolean(t.seemsDue)} onChange={(e) => dispatch({ type: 'updateTask', id: t.id, patch: { seemsDue: e.target.checked } })} />
                        Feels like it has a clear deadline
                      </label>
                      <fieldset className="yn">
                        <legend>Real consequence if it slips two weeks?</legend>
                        <div className="yn__btns">
                          {CONSEQUENCES.map((c) => (
                            <button key={c.id} type="button" className={`chip${t.consequence === c.id ? ' chip--on' : ''}`} aria-pressed={t.consequence === c.id} onClick={() => withFlip(() => dispatch({ type: 'updateTask', id: t.id, patch: { consequence: c.id } }))}>
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <p className="muted">{v.text}</p>
                    </div>
                  )}
                  {idx === 0 && !t.done && kind === 'fuel' && <div className="task__top">top of the stack</div>}
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="lab-side">
          <section className="panel" aria-labelledby="swap-h">
            <h3 id="swap-h">⚡ Something bigger arrived</h3>
            <p className="muted">Perry’s “swap”: a new, apparently more important task takes the top slot, and the old fuel becomes something you can finally do.</p>
            <form className="addrow" onSubmit={swap}>
              <label className="sr-only" htmlFor="bigger">Bigger task</label>
              <input id="bigger" type="text" value={bigger} maxLength={80} placeholder="e.g. Board deck for Monday" onChange={(e) => setBigger(e.target.value)} />
              <button className="btn btn--tomato btn--sm" type="submit" disabled={!bigger.trim()}>Swap</button>
            </form>
          </section>

          <section className="panel" aria-labelledby="tester-h">
            <h3 id="tester-h">Top-Task Tester</h3>
            <TesterVisual />
          </section>

          {state.notes.length > 0 && (
            <section className="panel" aria-labelledby="notes-h">
              <h3 id="notes-h">Your deadline audits</h3>
              <ul className="notes">
                {state.notes.map((n) => <li key={n.id}>{n.text}</li>)}
              </ul>
            </section>
          )}

          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { if (window.confirm('Clear your tasks, notes and progress?')) dispatch({ type: 'reset' }); }}>
            Reset everything
          </button>
        </aside>
      </div>
    </div>
  );
}
