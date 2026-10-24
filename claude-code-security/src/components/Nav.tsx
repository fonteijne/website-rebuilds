import { useStore } from '../lib/store';
import { overall } from '../lib/progress';
import { MODULE_META } from '../content/meta';
import { href, type Route } from '../lib/route';

const link = (active: boolean) => `px-2.5 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? 'bg-white/10 text-ink' : 'text-mute hover:text-ink'}`;

export default function Nav({ route }: { route: Route }) {
  const s = useStore();
  const o = overall(s);
  const modTrack = route.name === 'module' ? MODULE_META.find((m) => m.id === route.id)?.track : undefined;
  const inIos = route.name === 'ios' || modTrack === 'ios';
  const inAir = route.name === 'offline' || modTrack === 'offline';
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 sm:gap-2 sm:px-6">
        <a href={href.home} className="mr-auto flex min-w-0 items-center gap-2.5 font-semibold tracking-tight">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden className="shrink-0">
            <rect width="32" height="32" rx="8" fill="#172026" />
            <path d="M16 5l9 3.5v6.2c0 5.6-3.8 10.4-9 12.3-5.2-1.9-9-6.7-9-12.3V8.5z" fill="#4fd1b5" />
            <path d="M12 16.2l3 3 5.5-6" fill="none" stroke="#0a0d0f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">
            Guardrail<span className="hidden sm:inline"> Academy</span>
          </span>
        </a>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
          <a href={href.home} className={link(route.name === 'home' || modTrack === 'core')} aria-current={route.name === 'home' ? 'page' : undefined}>
            Learn
          </a>
          <a href={href.ios} className={`${link(!!inIos)} ${inIos ? '!text-ios' : ''}`} aria-current={route.name === 'ios' ? 'page' : undefined}>
            iOS
          </a>
          <a href={href.offline} className={`${link(!!inAir)} ${inAir ? '!text-air' : ''}`} aria-current={route.name === 'offline' ? 'page' : undefined}>
            Offline
          </a>
          <a href={href.build} className={link(route.name === 'build')} aria-current={route.name === 'build' ? 'page' : undefined}>
            Build
          </a>
          <a href={href.map} className={link(route.name === 'map')} aria-current={route.name === 'map' ? 'page' : undefined}>
            Map
          </a>
        </nav>
        <div className="ml-2 hidden items-center gap-2 md:flex" title={`${o.done} of ${o.total} cards complete`}>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={o.pct} aria-label="Overall progress">
            <div className="h-full origin-left rounded-full bg-guard transition-transform duration-500" style={{ transform: `scaleX(${o.pct / 100})` }} />
          </div>
          <span className="mono text-xs text-mute">{o.pct}%</span>
        </div>
      </div>
    </header>
  );
}
