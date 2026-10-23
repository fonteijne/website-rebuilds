import { allCards, concepts, modules } from '../content';
import type { State } from './store';

export function moduleProgress(s: State, moduleId: string) {
  const m = modules.find((x) => x.id === moduleId)!;
  const done = m.cards.filter((_, i) => s.done[`${moduleId}:${i}`]).length;
  return { done, total: m.cards.length, pct: Math.round((done / m.cards.length) * 100) };
}

export function overall(s: State) {
  const done = allCards.filter((c) => s.done[c.key]).length;
  return { done, total: allCards.length, pct: Math.round((done / allCards.length) * 100) };
}

/** A concept counts as understood when at least one card teaching it is done (and any quiz on it was right). */
export function conceptState(s: State) {
  const covered = new Set<string>();
  const available = new Set<string>();
  for (const { key, card } of allCards) {
    for (const t of card.tags ?? []) {
      available.add(t);
      const ok = s.done[key] && (card.kind !== 'quiz' || s.quiz[key]);
      if (ok) covered.add(t);
    }
  }
  const total = concepts.length;
  const have = concepts.filter((c) => covered.has(c.id)).length;
  return { covered, available, have, total, pct: Math.round((have / total) * 100) };
}
