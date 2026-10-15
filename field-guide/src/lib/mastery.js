import { CONCEPT_IDS, READY_THRESHOLD } from '../data/concepts.js';
import { ALL_CARDS } from '../data/modules.js';

/** answers: { [questionOrCardId]: { correct: boolean, attempts: number } } ; seen: { [cardId]: true } */
export function computeMastery(answers = {}, seen = {}, cards = ALL_CARDS) {
  const mastered = new Set();
  const learned = new Set();

  for (const card of cards) {
    if (seen[card.id]) card.concepts?.forEach((c) => learned.add(c));
  }
  // checks live on cards, quiz questions live in the answers map under their own ids.
  const index = new Map();
  for (const card of cards) if (card.type === 'check') index.set(card.id, card.concepts);
  for (const [id, a] of Object.entries(answers)) {
    if (!a?.correct) continue;
    const concepts = index.get(id) ?? a.concepts ?? [];
    concepts.forEach((c) => mastered.add(c));
  }

  const total = CONCEPT_IDS.length;
  const masteredCount = CONCEPT_IDS.filter((c) => mastered.has(c)).length;
  const learnedCount = CONCEPT_IDS.filter((c) => learned.has(c)).length;
  const score = masteredCount / total;
  return {
    mastered,
    learned,
    total,
    masteredCount,
    learnedCount,
    score,
    ready: score >= READY_THRESHOLD,
    missing: CONCEPT_IDS.filter((c) => !mastered.has(c))
  };
}
