import { useRef, useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { useSparks } from './Sparks.jsx';

/** One question, instant feedback. Counts toward concept mastery. */
export default function CheckCard({ card, id = card?.id, question, onAnswer }) {
  const { state, dispatch } = useStore();
  const { celebrate } = useSparks();
  const q = question ?? card;
  const [picked, setPicked] = useState(null);
  const refs = useRef([]);
  const solved = picked === q.answer;
  const previouslyCorrect = state.answers[id]?.correct;

  const choose = (i) => {
    if (solved) return;
    setPicked(i);
    const correct = i === q.answer;
    dispatch({ type: 'answer', id, correct, concepts: q.concepts });
    onAnswer?.(correct);
    if (correct) celebrate(refs.current[i]);
  };

  return (
    <div className="check">
      <p className="check__q">{q.q}</p>
      <div className="check__opts" role="radiogroup" aria-label={q.q}>
        {q.options.map((o, i) => {
          const state_ = picked === null ? '' : i === q.answer && solved ? ' opt--right' : i === picked ? ' opt--wrong' : '';
          return (
            <button
              key={o}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={picked === i}
              className={`opt${state_}`}
              onClick={() => choose(i)}
            >
              <span className="opt__key">{'ABC'[i]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      <div className="check__fb" role="status" aria-live="polite">
        {picked !== null && (
          <p>
            <strong>{solved ? 'Right. ' : 'Not quite — try again. '}</strong>
            {solved ? q.why : ''}
          </p>
        )}
        {picked === null && previouslyCorrect && <p className="muted">You’ve already got this one.</p>}
      </div>
    </div>
  );
}
