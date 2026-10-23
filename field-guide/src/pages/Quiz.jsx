import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QUIZ } from '../data/quiz.js';
import { CONCEPTS, READY_THRESHOLD } from '../data/concepts.js';
import { ALL_CARDS, MODULES } from '../data/modules.js';
import { useStore } from '../lib/store.jsx';
import CheckCard from '../components/CheckCard.jsx';
import ConceptMap from '../components/ConceptMap.jsx';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const moduleForConcept = (cid) => {
  const card = ALL_CARDS.find((c) => c.type !== 'check' && c.type !== 'dogfood' && c.concepts?.includes(cid));
  return MODULES.find((m) => m.id === card?.moduleId);
};

export default function Quiz() {
  const { state, mastery } = useStore();
  const [run, setRun] = useState(() => ({ id: 0, qs: shuffle(QUIZ) }));
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState(false);
  const [first, setFirst] = useState({}); // qid -> true if right first time
  const [tries, setTries] = useState({});

  const q = run.qs[i];
  const finished = i >= run.qs.length;
  const firstTryCorrect = Object.values(first).filter(Boolean).length;
  const missing = CONCEPTS.filter((c) => !mastery.mastered.has(c.id));

  const start = (onlyMissed) => {
    let qs;
    if (onlyMissed) {
      qs = QUIZ.filter((x) => x.concepts.some((c) => !mastery.mastered.has(c)));
      if (!qs.length) qs = QUIZ;
    } else qs = QUIZ;
    setRun({ id: run.id + 1, qs: shuffle(qs) });
    setI(0);
    setSolved(false);
    setFirst({});
    setTries({});
  };

  const onAnswer = (correct) => {
    setTries((t) => ({ ...t, [q.id]: (t[q.id] ?? 0) + 1 }));
    setFirst((f) => (q.id in f ? f : { ...f, [q.id]: correct }));
    if (correct) setSolved(true);
  };
  const next = () => {
    setSolved(false);
    setI(i + 1);
  };

  const answeredAny = useMemo(() => Object.keys(state.answers).some((k) => k.startsWith('q')), [state.answers]);

  return (
    <div className="wrap section">
      <p className="eyebrow">Mastery check</p>
      <h1 className="page-title">Prove you <span className="hl">own the method.</span></h1>
      <p className="lead">
        {QUIZ.length} questions covering every idea in the essay. Wrong answers are free — try again until it clicks. You’re{' '}
        <strong>ready to practise at {Math.round(READY_THRESHOLD * 100)}%</strong> concept coverage.
      </p>

      <div className="quiz-grid">
        <section className="quiz" aria-live="polite">
          {!finished ? (
            <>
              <div className="quiz__top">
                <span className="tag">Question {i + 1} / {run.qs.length}</span>
                <span className="tag tag--sun">{q.kind === 'scenario' ? 'Scenario' : 'Recall'}</span>
                <div className="bar" aria-hidden="true"><i style={{ width: `${(i / run.qs.length) * 100}%` }} /></div>
              </div>
              <div key={`${run.id}-${q.id}`} className="snack snack--quiz">
                <CheckCard id={q.id} question={q} onAnswer={onAnswer} />
                {solved && (
                  <div className="quiz__next">
                    <button type="button" className="btn btn--tomato" onClick={next} autoFocus>
                      {i === run.qs.length - 1 ? 'See my results' : 'Next question'} →
                    </button>
                    {tries[q.id] > 1 && <span className="muted">Took {tries[q.id]} tries — it still counts.</span>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="snack snack--result">
              <span className={`tag ${mastery.ready ? 'tag--leaf' : 'tag--sun'}`}>{mastery.ready ? '✓ Ready to practise' : 'Almost there'}</span>
              <h2 className="snack__title">{firstTryCorrect} of {run.qs.length} right on the first try.</h2>
              <p className="snack__body">
                Concept mastery is now <strong>{Math.round(mastery.score * 100)}%</strong> ({mastery.masteredCount} of {mastery.total}).
                {mastery.ready ? ' You’ve crossed the 95% line — go put it to work.' : ` ${missing.length} idea${missing.length === 1 ? '' : 's'} still to lock in:`}
              </p>
              {!mastery.ready && (
                <ul className="review">
                  {missing.map((c) => {
                    const m = moduleForConcept(c.id);
                    return (
                      <li key={c.id}>
                        <strong>{c.label}</strong> — {c.gist}
                        {m && <> <Link to={`/learn/${m.id}`}>Review in Module {m.n}</Link></>}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="snack__actions">
                {mastery.ready ? (
                  <Link className="btn btn--tomato" to="/playbook">Open the Playbook →</Link>
                ) : (
                  <button type="button" className="btn btn--tomato" onClick={() => start(true)}>Retry only what’s missing</button>
                )}
                <button type="button" className="btn btn--ghost" onClick={() => start(false)}>Full re-run</button>
                <Link className="btn btn--ghost" to="/lab">Back to the Lab</Link>
              </div>
            </div>
          )}
          {!finished && answeredAny && (
            <p className="muted quiz__resume">
              Progress from earlier attempts is saved. <button type="button" className="linklike" onClick={() => start(true)}>Focus on missing ideas</button>
            </p>
          )}
        </section>

        <aside className="quiz-side" aria-label="Concept coverage">
          <div className="panel">
            <h3>Coverage: {Math.round(mastery.score * 100)}%</h3>
            <div className="bar bar--lg" aria-hidden="true"><i style={{ width: `${mastery.score * 100}%` }} /><span className="bar__mark" style={{ left: `${READY_THRESHOLD * 100}%` }} /></div>
            <ConceptMap compact />
          </div>
        </aside>
      </div>
    </div>
  );
}
