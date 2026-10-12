import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { useSparks } from './Sparks.jsx';

/** "Eat your own dog food": every module ends by applying the idea to the learner's real list. */
export default function DogfoodAction({ card }) {
  const { state, dispatch } = useStore();
  const { celebrate } = useSparks();
  const cfg = card.dogfood;
  const key = `df:${card.id}`;
  const done = Boolean(state.seen[key]);
  const [vals, setVals] = useState(() => Array.from({ length: cfg.count ?? 1 }, () => ''));
  const [btn, setBtn] = useState(null);

  if (cfg.role === 'lab') {
    return (
      <Link className="btn btn--tomato" to="/lab">
        {cfg.cta} →
      </Link>
    );
  }

  const filled = vals.map((v) => v.trim()).filter(Boolean);
  const submit = (e) => {
    e.preventDefault();
    if (!filled.length) return;
    filled.forEach((title) => {
      if (cfg.role === 'audit') dispatch({ type: 'addNote', text: title });
      else if (cfg.role === 'filler')
        dispatch({ type: 'addTask', task: { title, role: 'filler', importance: 3, seemsDue: false, consequence: 'none' } });
      else
        dispatch({
          type: 'addTask',
          task: { title, role: 'fuel', importance: 5, seemsDue: true, consequence: cfg.role === 'avoid' ? 'unset' : 'mild', avoided: cfg.role === 'avoid' }
        });
    });
    dispatch({ type: 'seen', id: key });
    celebrate(btn);
  };

  if (done) {
    return (
      <div className="dogfood dogfood--done">
        <p>
          <strong>Done ✓</strong> It’s in your Lab.{' '}
          {cfg.role === 'avoid' && 'Remember: this guide is now how you’re not doing it.'}
        </p>
        <Link to="/lab" className="btn btn--ghost btn--sm">See it in the Lab →</Link>
      </div>
    );
  }

  return (
    <form className="dogfood" onSubmit={submit}>
      <p className="dogfood__label">{cfg.label}</p>
      {vals.map((v, i) => (
        <input
          key={i}
          type="text"
          value={v}
          maxLength={80}
          aria-label={`${cfg.label} ${i + 1}`}
          placeholder={cfg.placeholder}
          onChange={(e) => setVals(vals.map((x, j) => (j === i ? e.target.value : x)))}
        />
      ))}
      <button ref={setBtn} type="submit" className="btn btn--tomato btn--sm" disabled={!filled.length}>
        {cfg.role === 'audit' ? 'Save my honest answer' : `Add to my Lab (${filled.length || 0})`}
      </button>
    </form>
  );
}
