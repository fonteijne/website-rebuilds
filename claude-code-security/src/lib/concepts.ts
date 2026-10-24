import { allCards, concepts } from '../content';
import type { State } from './store';

/** A concept counts as understood when at least one card teaching it is done (and any quiz on it was right). */
export function conceptState(s: State) {
  const covered = new Set<string>();
  for (const { key, card } of allCards) {
    for (const t of card.tags ?? []) {
      const ok = s.done[key] && (card.kind !== 'quiz' || s.quiz[key]);
      if (ok) covered.add(t);
    }
  }
  const total = concepts.length;
  const have = concepts.filter((c) => covered.has(c.id)).length;
  return { covered, have, total, pct: Math.round((have / total) * 100) };
}
