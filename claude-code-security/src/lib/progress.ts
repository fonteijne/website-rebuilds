import { MODULE_META, cardKey } from '../content/meta';
import type { Track } from '../content/types';
import type { State } from './store';

// Light progress helpers: they only need module metadata, so the landing pages stay free of card content.

export function moduleProgress(s: State, moduleId: string) {
  const m = MODULE_META.find((x) => x.id === moduleId)!;
  let done = 0;
  for (let i = 0; i < m.count; i++) if (s.done[cardKey(m.id, i)]) done++;
  return { done, total: m.count, pct: Math.round((done / m.count) * 100) };
}

export function overall(s: State, track?: Track) {
  let done = 0;
  let total = 0;
  for (const m of MODULE_META) {
    if (track && m.track !== track) continue;
    const p = moduleProgress(s, m.id);
    done += p.done;
    total += p.total;
  }
  return { done, total, pct: Math.round((done / total) * 100) };
}
