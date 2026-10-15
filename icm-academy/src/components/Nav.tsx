import { useStore } from '../lib/store';
import { overall } from '../lib/progress';
import { href, type Route } from '../lib/route';

const link = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? 'bg-white/10 text-ink' : 'text-mute hover:text-ink'}`;

export default function Nav({ route }: { route: Route }) {
  const s = useStore();
  const o = overall(s);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <a href={href.home} className="mr-auto flex items-center gap-2.5 font-semibold tracking-tight">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="8" fill="#181d24" />
            <path d="M7 9h8l2 3h8v11H7z" fill="#f5b83d" />
            <path d="M7 14h18v9H7z" fill="#ef6a85" opacity=".9" />
          </svg>
          <span>ICM Academy</span>
        </a>
        <nav className="flex items-center gap-1" aria-label="Main">
          <a href={href.home} className={link(route.name === 'home' || route.name === 'module')}>
            Learn
          </a>
          <a href={href.build} className={link(route.name === 'build')}>
            Build
          </a>
          <a href={href.map} className={link(route.name === 'map')}>
            Map
          </a>
        </nav>
        <div
          className="ml-2 hidden items-center gap-2 sm:flex"
          title={`${o.done} of ${o.total} cards complete`}
          aria-label={`Progress ${o.pct} percent`}
        >
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-l0 transition-all duration-500" style={{ width: `${o.pct}%` }} />
          </div>
          <span className="mono text-xs text-mute">{o.pct}%</span>
        </div>
      </div>
    </header>
  );
}
