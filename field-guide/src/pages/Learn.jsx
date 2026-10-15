import { Link } from 'react-router-dom';
import SpotlightCard from '../vendor/react-bits/SpotlightCard.jsx';
import '../vendor/react-bits/SpotlightCard.css';
import { MODULES, ALL_CARDS } from '../data/modules.js';
import { useStore } from '../lib/store.jsx';
import ConceptMap from '../components/ConceptMap.jsx';
import { READY_THRESHOLD } from '../data/concepts.js';
import { useReveal } from '../lib/useReveal.js';

export default function Learn() {
  const { state, mastery } = useStore();
  const root = useReveal();
  const pct = Math.round(mastery.score * 100);
  return (
    <div className="wrap section" ref={root}>
      <p className="eyebrow">The course</p>
      <h1 className="page-title">{MODULES.length} modules. <span className="hl">{ALL_CARDS.length} snack cards.</span></h1>
      <p className="lead">
        Each module is a deck of bite-sized cards (about a minute each). Every deck ends by making you{' '}
        <strong>use the idea on your own to-do list</strong> — that is the dogfood method.
      </p>

      <div className="modules" data-reveal-group>
        {MODULES.map((m) => {
          const seen = m.cards.filter((c) => state.seen[c.id]).length;
          const complete = seen === m.cards.length;
          return (
            <Link key={m.id} to={`/learn/${m.id}`} className="module-link" data-reveal>
              <SpotlightCard
                className="module"
                theme="light"
                spotlightColor="#f2c230"
                intensity={0.45}
                style={{ '--spotlight-card-surface': 'var(--card)', '--spotlight-card-border': 'var(--line)', '--spotlight-card-shadow': 'var(--shadow)', padding: 0 }}
              >
                <div className={`module__inner module--${m.hue}`}>
                  <span className="module__n">{String(m.n).padStart(2, '0')}</span>
                  <h2 className="module__title">{m.title}</h2>
                  <p>{m.tagline}</p>
                  <div className="module__meta">
                    <span>{m.cards.length} cards · ~{m.minutes} min</span>
                    <span className={complete ? 'badge badge--ok' : 'badge'}>
                      {complete ? '✓ Done' : seen ? `${seen}/${m.cards.length}` : 'Start'}
                    </span>
                  </div>
                  <div className="bar" aria-hidden="true"><i style={{ width: `${(seen / m.cards.length) * 100}%` }} /></div>
                </div>
              </SpotlightCard>
            </Link>
          );
        })}
      </div>

      <section className="coverage" aria-labelledby="cov-h" data-reveal>
        <div className="coverage__head">
          <div>
            <p className="eyebrow">Coverage map</p>
            <h2 id="cov-h">How much of the essay do you own?</h2>
            <p className="lead">
              Perry’s essay boils down to <strong>20 ideas</strong>. Learn them by reading cards; <em>master</em> them by answering
              questions correctly. At <strong>{Math.round(READY_THRESHOLD * 100)}%</strong> you’re ready to practise.
            </p>
          </div>
          <div className="coverage__score" aria-live="polite">
            <b>{pct}%</b>
            <span>{mastery.masteredCount}/{mastery.total} mastered</span>
            <span>{mastery.learnedCount}/{mastery.total} read</span>
            {mastery.ready ? (
              <Link className="btn btn--tomato btn--sm" to="/playbook">Ready — open the Playbook →</Link>
            ) : (
              <Link className="btn btn--sm" to="/quiz">Take the mastery check</Link>
            )}
          </div>
        </div>
        <ConceptMap />
      </section>
    </div>
  );
}
