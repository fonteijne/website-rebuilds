import { NavLink, Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { useSparks } from './Sparks.jsx';

const links = [
  ['/learn', 'Learn'],
  ['/lab', 'The Lab'],
  ['/quiz', 'Mastery check'],
  ['/playbook', 'Playbook']
];

export default function Nav() {
  const { mastery } = useStore();
  const { enabled, setEnabled } = useSparks();
  const pct = Math.round(mastery.score * 100);
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <Link to="/" className="brand" aria-label="The Procrastinator’s Field Guide — home">
          <svg className="brand__mark" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="var(--ink)" />
            <rect x="14" y="14" width="36" height="8" rx="3" fill="var(--tomato)" />
            <rect x="14" y="28" width="36" height="8" rx="3" fill="var(--sun)" />
            <rect x="14" y="42" width="24" height="8" rx="3" fill="var(--leaf)" />
            <path d="M42 44l4 4 8-9" fill="none" stroke="var(--leaf)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Field Guide
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav__link${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav__tools">
          <button
            type="button"
            className="toggle"
            aria-pressed={enabled}
            onClick={() => setEnabled(!enabled)}
            title="Toggle click sparks"
          >
            ✦<span className="toggle__label"> Sparks {enabled ? 'on' : 'off'}</span>
          </button>
          <div
            className="ring"
            style={{ '--p': pct }}
            role="img"
            aria-label={`Concept mastery ${pct} percent`}
            title={`${mastery.masteredCount} of ${mastery.total} concepts mastered`}
          >
            <span>{pct}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
