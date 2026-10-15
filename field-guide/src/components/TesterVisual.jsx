import { useState } from 'react';
import { classifyTask, VERDICTS } from '../lib/classify.js';
import { useStore } from '../lib/store.jsx';

const QUESTIONS = [
  { key: 'seemsDue', q: 'Does it FEEL like it has a clear deadline?', hint: 'Reminders, chasing, “was due last month”…' },
  { key: 'vital', q: 'Does it FEEL awfully important?', hint: 'It nags you. Everyone says it matters.' },
  { key: 'serious', q: 'If it slipped two more weeks, would something serious happen?', hint: 'Money, health, safety, legal trouble, someone blocked.' }
];

export default function TesterVisual() {
  const { dispatch } = useStore();
  const [title, setTitle] = useState('');
  const [a, setA] = useState({});
  const [added, setAdded] = useState(false);
  const complete = QUESTIONS.every((x) => a[x.key] !== undefined);

  const kind = complete
    ? classifyTask({
        importance: a.vital ? 5 : 2,
        seemsDue: a.seemsDue,
        consequence: a.serious ? 'serious' : 'none'
      })
    : null;
  const verdict = kind && VERDICTS[kind];

  const addToLab = () => {
    dispatch({
      type: 'addTask',
      task: {
        title: title.trim() || 'Untitled task',
        role: kind === 'fuel' ? 'fuel' : 'filler',
        importance: a.vital ? 5 : 2,
        seemsDue: a.seemsDue,
        consequence: a.serious ? 'serious' : 'none'
      }
    });
    setAdded(true);
  };

  return (
    <div className="visual tester">
      <label className="field">
        <span>Task (optional)</span>
        <input
          type="text"
          value={title}
          maxLength={80}
          placeholder="e.g. Rewrite the onboarding doc"
          onChange={(e) => {
            setTitle(e.target.value);
            setAdded(false);
          }}
        />
      </label>
      {QUESTIONS.map((x) => (
        <fieldset className="yn" key={x.key}>
          <legend>
            {x.q}
            <small>{x.hint}</small>
          </legend>
          <div className="yn__btns">
            {[
              [true, 'Yes'],
              [false, 'No']
            ].map(([val, label]) => (
              <button
                key={label}
                type="button"
                className={`chip${a[x.key] === val ? ' chip--on' : ''}`}
                aria-pressed={a[x.key] === val}
                onClick={() => {
                  setA({ ...a, [x.key]: val });
                  setAdded(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className={`verdict verdict--${verdict?.tone ?? 'ink'}`} role="status" aria-live="polite">
        {verdict ? (
          <>
            <strong>{verdict.label}.</strong> {verdict.text}
          </>
        ) : (
          'Answer all three to see where this task belongs.'
        )}
      </div>
      {verdict && kind !== 'real' && (
        <button type="button" className="btn btn--sm" onClick={addToLab} disabled={added}>
          {added ? 'Added to your Lab ✓' : 'Add to my Lab'}
        </button>
      )}
    </div>
  );
}
