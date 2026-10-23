import { why } from './01-why';
import { roots } from './02-roots';
import { context } from './03-context';
import { principles } from './04-principles';
import { layers } from './05-layers';
import { anatomy } from './06-anatomy';
import { running } from './07-running';
import { source } from './08-source';
import type { Card } from './types';

export const modules = [why, roots, context, principles, layers, anatomy, running, source];
export const cardKey = (moduleId: string, i: number) => `${moduleId}:${i}`;
export const allCards: { key: string; moduleId: string; card: Card }[] = modules.flatMap((m) =>
  m.cards.map((card, i) => ({ key: cardKey(m.id, i), moduleId: m.id, card })),
);
export { concepts } from './coverage';
export type { Card, Module } from './types';
