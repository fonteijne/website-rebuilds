import { Link, Navigate, useParams } from 'react-router-dom';
import { MODULES, getModule } from '../data/modules.js';
import CardDeck from '../components/CardDeck.jsx';

export default function Module() {
  const { moduleId } = useParams();
  const module = getModule(moduleId);
  if (!module) return <Navigate to="/learn" replace />;
  const idx = MODULES.indexOf(module);
  const next = MODULES[idx + 1];
  return (
    <div className="wrap section section--tight">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/learn">Course</Link> <span aria-hidden="true">/</span> <span>Module {module.n}</span>
      </nav>
      <header className="module-head">
        <p className="eyebrow">Module {module.n} of {MODULES.length} · ~{module.minutes} min</p>
        <h1 className="page-title page-title--sm">{module.title}</h1>
        <p className="lead">{module.tagline}</p>
      </header>
      <CardDeck module={module} nextModule={next} />
      <nav className="module-pager" aria-label="Modules">
        {MODULES.map((m) => (
          <Link key={m.id} to={`/learn/${m.id}`} className={`pager${m.id === module.id ? ' pager--on' : ''}`} aria-current={m.id === module.id ? 'page' : undefined}>
            <b>{m.n}</b>
            <span>{m.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
