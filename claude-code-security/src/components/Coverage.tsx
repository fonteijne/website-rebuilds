import { allCards, concepts, modules } from '../content';
import { resetAll, useStore } from '../lib/store';
import { conceptState } from '../lib/concepts';
import { href } from '../lib/route';
import { TRACK } from '../lib/tracks';

export default function Coverage() {
  const s = useStore();
  const c = conceptState(s);
  const where = (id: string) => href.module(allCards.find((x) => x.card.tags?.includes(id))!.moduleId);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mono text-sm text-guard">Concept map</div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">How well is your agent guarded?</h1>
      <p className="mt-2 max-w-2xl text-mute">
        {concepts.length} concepts across three tracks. One lights up when you finish a card that teaches it, and answer any quiz on it correctly.
      </p>

      <div className="panel mt-8 flex flex-wrap items-center gap-6 p-6">
        <div className="relative grid size-28 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2.6" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-guard)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray={`${c.pct} 100`} />
          </svg>
          <span className="mono text-2xl font-semibold">{c.pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold">
            {c.have} of {c.total} concepts
          </div>
          <p className="mt-1 text-sm text-mute">
            {c.pct >= 95 ? 'You know the layers. Now ship the policy: download it from the Builder.' : c.pct >= 50 ? 'Past halfway. Unlit concepts below link straight to their module.' : 'Work through the modules to light up the map.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a className="btn btn-primary" href={href.build}>
              Open the Builder
            </a>
            <button
              className="btn"
              onClick={() => {
                if (confirm('Reset all progress and your policy?')) resetAll();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8">
        {modules.map((m) => {
          const ids = [...new Set(m.cards.flatMap((x) => x.tags ?? []))].filter((id) => concepts.some((k) => k.id === id));
          const color = TRACK[m.track].text;
          return (
            <section key={m.id}>
              <h2 className="mb-3 flex items-baseline gap-3 text-lg font-semibold">
                <span className={`mono ${color}`}>{m.num}</span> {m.title}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ids.map((id) => {
                  const k = concepts.find((x) => x.id === id)!;
                  const on = c.covered.has(id);
                  return (
                    <li key={id}>
                      <a href={where(id)} className={`flex h-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${on ? 'border-ok/40 bg-ok/[0.07]' : 'border-line text-mute hover:text-ink'}`}>
                        <span className={on ? 'text-ok' : ''} aria-hidden>
                          {on ? '●' : '○'}
                        </span>
                        <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{k.label}</span>
                        <span className="sr-only">{on ? 'covered' : 'not yet covered'}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
