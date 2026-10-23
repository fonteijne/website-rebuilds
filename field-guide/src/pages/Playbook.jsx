import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { useReveal } from '../lib/useReveal.js';

const PLAN = [
  ['d1', 'Day 1 — Dump', 'Write every task, nag and half-formed obligation you can think of in the Lab. Don’t judge, don’t sort. Aim for 25+.'],
  ['d2', 'Day 2 — Rate honestly', 'For each task ask: “What actually happens if this slips two weeks?” Tag it none / mild / serious. Serious items leave the avoidance stack.'],
  ['d3', 'Day 3 — Pick your fuel', 'Choose 1–3 tasks that feel due and vital but carry no real consequence. Those are your top-of-list tasks.'],
  ['d4', 'Day 4 — Stock the fillers', 'Make sure at least 10 genuinely worthwhile tasks sit beneath the fuel. Tidy, call, write, fix, learn — real value.'],
  ['d5', 'Day 5 — Audit the deadlines', 'For every fuel item, find the second date: when do consequences really begin? (Perry: a week or two after.)'],
  ['d6', 'Day 6 — Run the ritual', 'Do the two-minute daily ritual below, twice today. Say aloud what you are avoiding. Then start a filler.'],
  ['d7', 'Day 7 — Review & refuel', 'Run the weekly review. Retire finished fuel, add fresh fuel, handle any swaps, restock fillers.']
];

const FAQ = [
  {
    q: 'Isn’t this just lying to myself?',
    a: 'Perry says as much — it’s “a pyramid scheme on oneself”. The practical rule from this guide: deceive your feelings about importance, never your knowledge of the consequences. If you can’t say “nothing breaks if this slips”, it isn’t fuel.',
    src: 'essay + guardrail'
  },
  {
    q: 'What if the top item never gets done?',
    a: 'In the essay, it eventually does: a new, apparently more important task arrives (the swap), and the old top item becomes the way of avoiding that. If it truly never matters, it was working as fuel and cost you nothing.',
    src: 'essay'
  },
  {
    q: 'What if every task I have has a real deadline?',
    a: 'Then you’re outside the trick’s safe zone. Do the real-deadline work first or time-box it, and use structured procrastination only on the flexible remainder. Perry’s examples are all soft: book forms, a late chapter, committee work.',
    src: 'our extension'
  },
  {
    q: 'How many tasks should be on the list?',
    a: 'Perry’s warning is against minimising commitments, so err long. Our rule of thumb: 1–3 fuel items and 10+ worthwhile fillers beneath. If you catch yourself doing nothing, the list is too short.',
    src: 'essay + rule of thumb'
  },
  {
    q: 'What makes a good filler?',
    a: 'Anything genuinely useful that is not pressing: clearing inboxes, writing a note, learning a skill, tidying, side projects. Pencil-sharpening alone fails — it only works when it dodges something bigger.',
    src: 'essay'
  },
  {
    q: 'Does it work for teams or managers?',
    a: 'The essay is about personal task-ordering. Be careful applying it to work others depend on: a blocked colleague is a real consequence. Keep shared dependencies off the top shelf.',
    src: 'our extension'
  }
];

export default function Playbook() {
  const { state, dispatch, mastery } = useStore();
  const root = useReveal();
  const doneCount = PLAN.filter(([id]) => state.seen[`plan:${id}`]).length;

  return (
    <div className="wrap section" ref={root}>
      <p className="eyebrow">Playbook</p>
      <h1 className="page-title">Put it into <span className="hl">practice.</span></h1>
      <p className="lead">
        Everything you need to run the method without re-reading the essay: a one-page cheat sheet, a 7-day setup, a daily ritual, a
        weekly review, and the guardrails.
        {!mastery.ready && (
          <> You’re at <strong>{Math.round(mastery.score * 100)}%</strong> concept coverage — <Link to="/quiz">finish the mastery check</Link> to hit 95%.</>
        )}
      </p>
      <p className="no-print"><button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}>🖨 Print the cheat sheet</button></p>

      <section className="sheet" aria-labelledby="sheet-h" data-reveal>
        <h2 id="sheet-h">The method on one page</h2>
        <div className="sheet__grid">
          <div>
            <h3>The six rules</h3>
            <ol>
              <li><b>Procrastinators do something.</b> They rarely do nothing; they do marginally useful things.</li>
              <li><b>Avoidance is the engine.</b> Side tasks happen because they dodge something bigger.</li>
              <li><b>Keep a long, ordered list.</b> Most urgent-feeling on top, many worthwhile tasks beneath.</li>
              <li><b>Top tasks seem due and vital — but aren’t.</b> Clear-looking deadline, no real one; awfully important, not really.</li>
              <li><b>Don’t minimise commitments.</b> A tiny list of true priorities makes you a couch potato.</li>
              <li><b>Swap when bigger arrives.</b> The old top item becomes your escape from the new one.</li>
            </ol>
          </div>
          <div>
            <h3>Three questions for any task</h3>
            <ul>
              <li>Does it <em>feel</em> like it has a clear deadline?</li>
              <li>Does it <em>feel</em> awfully important?</li>
              <li>If it slipped two weeks, would something <em>serious</em> happen? → If yes, <b>not fuel</b>: do it first.</li>
            </ul>
            <h3>Remember</h3>
            <ul>
              <li>Deadlines press a week or two <em>after</em> they pass.</li>
              <li>Check the real constraint (the bookstore was busy anyway).</li>
              <li>Fake the feeling, never the facts.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="plan" aria-labelledby="plan-h">
        <div className="plan__head" data-reveal>
          <h2 id="plan-h">Your 7-day setup</h2>
          <span className="badge">{doneCount}/7 done</span>
        </div>
        <ul className="plan__list">
          {PLAN.map(([id, h, p]) => {
            const key = `plan:${id}`;
            const on = Boolean(state.seen[key]);
            return (
              <li key={id} data-reveal className={on ? 'plan__item plan__item--on' : 'plan__item'}>
                <label>
                  <input type="checkbox" checked={on} onChange={() => dispatch({ type: 'seen', id: key })} disabled={on} />
                  <span>
                    <b>{h}</b>
                    <small>{p}</small>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="muted no-print">Ticked days stay ticked (they’re saved on this device). Use <Link to="/lab">the Lab</Link> for the actual list.</p>
      </section>

      <section className="rituals" aria-labelledby="rit-h">
        <h2 id="rit-h" data-reveal>Rituals</h2>
        <div className="split split--top">
          <article className="panel" data-reveal>
            <h3>Daily · 2 minutes</h3>
            <ol>
              <li>Open the Lab. Look at the top item.</li>
              <li><b>Say aloud which item you’re avoiding.</b></li>
              <li>Start the highest-value filler beneath it.</li>
              <li>Tick it. Repeat until the day ends.</li>
            </ol>
          </article>
          <article className="panel" data-reveal>
            <h3>Weekly · 10 minutes</h3>
            <ol>
              <li>Is every fuel item still low-stakes? Any new consequence → do it now.</li>
              <li>Did something bigger arrive? Swap it to the top.</li>
              <li>Retire finished fuel; add new fuel.</li>
              <li>Restock fillers to 10+.</li>
              <li>Skim the deadline audits: any “second date” coming up?</li>
            </ol>
          </article>
        </div>
      </section>

      <section className="guard" aria-labelledby="guard-h" data-reveal>
        <h2 id="guard-h">Guardrails <small className="tag tag--sky">our extension</small></h2>
        <p>
          Perry’s essay is playful and its examples are low-stakes. Applied to real life, keep these off the top shelf:
        </p>
        <ul className="guard__list">
          <li>Health or safety</li>
          <li>Taxes, legal filings, anything with a penalty</li>
          <li>Money owed to you or by you</li>
          <li>Anything another person is blocked on</li>
        </ul>
      </section>

      <section className="faq" aria-labelledby="faq-h">
        <h2 id="faq-h" data-reveal>Hard questions</h2>
        {FAQ.map((f) => (
          <details key={f.q} data-reveal>
            <summary>
              <span>{f.q}</span>
              <small className="tag">{f.src}</small>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <section className="end" data-reveal>
        <h2>Now go not-do something.</h2>
        <p className="lead">Your stack is waiting.</p>
        <Link className="btn btn--tomato" to="/lab">Open the Lab →</Link>{' '}
        <a className="btn btn--ghost" href="https://www.structuredprocrastination.com/index.php" target="_blank" rel="noreferrer">Re-read the original ↗</a>
      </section>
    </div>
  );
}
