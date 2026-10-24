import SpotlightCard from './rb/SpotlightCard';
import type { ModuleMeta } from '../content/types';
import { useStore } from '../lib/store';
import { moduleProgress } from '../lib/progress';
import { href } from '../lib/route';

/** The grid of module cards, shared by the core landing page and the iOS track page. */
export default function ModuleList({ list, color }: { list: ModuleMeta[]; color: string }) {
  const s = useStore();
  return (
    <ol className="mt-10 grid gap-4 md:grid-cols-2">
      {list.map((m) => {
        const p = moduleProgress(s, m.id);
        return (
          <li key={m.id} className="reveal">
            <a href={href.module(m.id)} className="group block h-full">
              <SpotlightCard className="h-full !p-6 transition-transform duration-300 group-hover:-translate-y-0.5" spotlightColor={color}>
                <div className="flex items-start gap-4">
                  <span className="mono text-3xl font-semibold" style={{ color }}>
                    {m.num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mute">{m.tagline}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="bar-fill h-full origin-left rounded-full bg-ok" style={{ transform: `scaleX(${p.pct / 100})` }} />
                      </div>
                      <span className="mono text-xs text-mute">
                        {p.done}/{p.total} · {m.minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
