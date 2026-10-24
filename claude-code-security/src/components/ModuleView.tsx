import { modules, cardKey } from '../content';
import { useStore } from '../lib/store';
import { moduleProgress } from '../lib/progress';
import { href } from '../lib/route';
import CardDeck from './CardDeck';

export default function ModuleView({ id }: { id: string }) {
  const s = useStore();
  const m = modules.find((x) => x.id === id);
  if (!m) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-mute">Module not found.</p>
        <a className="btn mt-4" href={href.home}>
          Back to the academy
        </a>
      </div>
    );
  }
  const track = modules.filter((x) => x.track === m.track);
  const nextMod = track[track.indexOf(m) + 1];
  const p = moduleProgress(s, id);
  const first = m.cards.findIndex((_, i) => !s.done[cardKey(id, i)]);
  const ios = m.track === 'ios';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <a href={ios ? href.ios : href.home} className="text-sm text-mute hover:text-ink">
        ← {ios ? 'iOS track' : 'All modules'}
      </a>
      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className={`mono text-sm ${ios ? 'text-ios' : 'text-guard'}`}>
            {ios ? 'iOS track · ' : ''}Module {m.num}
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">{m.title}</h1>
          <p className="mt-2 max-w-2xl text-mute">{m.tagline}</p>
        </div>
        <div className="mono text-sm text-mute">
          {p.done}/{p.total} cards · {m.minutes} min
        </div>
      </header>
      <div className="mt-8">
        <CardDeck key={id} module={m} startAt={first === -1 ? 0 : first} nextModule={nextMod} />
      </div>
    </div>
  );
}
