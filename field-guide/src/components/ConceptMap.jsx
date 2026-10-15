import { CONCEPTS } from '../data/concepts.js';
import { useStore } from '../lib/store.jsx';

/** The 20 ideas in Perry's essay, lit up as you learn (seen) and master (answered correctly). */
export default function ConceptMap({ compact = false }) {
  const { mastery } = useStore();
  return (
    <ul className={`cmap${compact ? ' cmap--compact' : ''}`} aria-label="Essay concept coverage">
      {CONCEPTS.map((c) => {
        const state = mastery.mastered.has(c.id) ? 'mastered' : mastery.learned.has(c.id) ? 'learned' : 'new';
        return (
          <li key={c.id} className={`cmap__item cmap__item--${state}`}>
            <span className="cmap__dot" aria-hidden="true">{state === 'mastered' ? '✓' : state === 'learned' ? '◐' : '○'}</span>
            <span className="cmap__body">
              <strong>{c.label}</strong>
              {!compact && <small>{c.gist}</small>}
            </span>
            <span className="sr-only">{state}</span>
          </li>
        );
      })}
    </ul>
  );
}
