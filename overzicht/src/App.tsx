import { useMemo, useState } from 'react';
import { sites, type Site } from './content/sites';
import SiteTile from './components/SiteTile';

const kinds = ['Alles', ...new Set(sites.map((s) => s.kind))] as const;
type Filter = (typeof kinds)[number];

export default function App() {
  const [filter, setFilter] = useState<Filter>('Alles');
  const shown = useMemo<Site[]>(
    () => (filter === 'Alles' ? sites : sites.filter((s) => s.kind === filter)),
    [filter],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
      <header className="flex flex-col gap-6 pt-12 pb-10 sm:pt-20 sm:pb-14">
        <p className="font-mono text-xs tracking-wider text-mute uppercase">
          fonteijne/website-rebuilds · Vercel
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
          Alle sites die we hebben gebouwd<span className="text-accent">.</span>
        </h1>
        <p className="max-w-xl text-base text-pretty text-mute sm:text-lg">
          {sites.length} projecten uit één repo, elk als eigen Vercel-project. Klik op een tegel om de
          live versie te openen.
        </p>
      </header>

      <main>
        <nav aria-label="Filter op soort" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2">
            {kinds.map((k) => {
              const count = k === 'Alles' ? sites.length : sites.filter((s) => s.kind === k).length;
              return (
                <li key={k}>
                  <button
                    type="button"
                    aria-pressed={filter === k}
                    onClick={() => setFilter(k)}
                    className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg"
                  >
                    {k} <span className="font-mono text-xs opacity-60">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <ul key={filter} className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((site, i) => (
            <SiteTile key={site.slug} site={site} index={i} />
          ))}
        </ul>
      </main>

      <footer className="mt-20 border-t border-line pt-6 text-sm text-mute">
        Previews zijn screenshots van de productie-URL. Bijwerken met{' '}
        <code className="font-mono text-xs text-ink">npm run previews</code>.
      </footer>
    </div>
  );
}
