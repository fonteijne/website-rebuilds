// The full curriculum: every card of every module. Only the lazy routes (modules, map) import this file;
// the landing pages use meta.ts so the first load doesn't carry 126 cards.
import { cards as threats } from './01-threats';
import { cards as permissions } from './02-permissions';
import { cards as modes } from './03-modes';
import { cards as hooks } from './04-hooks';
import { cards as sandbox } from './05-sandbox';
import { cards as isolation } from './06-isolation';
import { cards as trust } from './07-trust';
import { cards as team } from './08-team';
import { cards as xcodeVsCli } from './i1-xcode-vs-cli';
import { cards as bridge } from './i2-bridge';
import { cards as macIsolation } from './i3-mac-isolation';
import { cards as iosSandbox } from './i4-ios-sandbox';
import { cards as iosGuard } from './i5-ios-guard';
import { cards as offTraffic } from './o1-traffic';
import { cards as offLocal } from './o2-local-model';
import { cards as offRoutes } from './o3-xcode-routes';
import { cards as offTelemetry } from './o4-zero-telemetry';
import { cards as offProve } from './o5-prove-it';
import { MODULE_META, cardKey } from './meta';
import type { Card, Module } from './types';

const CARDS: Record<string, Card[]> = {
  '01-threats': threats,
  '02-permissions': permissions,
  '03-modes': modes,
  '04-hooks': hooks,
  '05-sandbox': sandbox,
  '06-isolation': isolation,
  '07-trust': trust,
  '08-team': team,
  'i1-xcode-vs-cli': xcodeVsCli,
  'i2-bridge': bridge,
  'i3-mac-isolation': macIsolation,
  'i4-ios-sandbox': iosSandbox,
  'i5-ios-guard': iosGuard,
  'o1-traffic': offTraffic,
  'o2-local-model': offLocal,
  'o3-xcode-routes': offRoutes,
  'o4-zero-telemetry': offTelemetry,
  'o5-prove-it': offProve,
};

export const modules: Module[] = MODULE_META.map((m) => ({ ...m, cards: CARDS[m.file] }));
export const allCards: { key: string; moduleId: string; card: Card }[] = modules.flatMap((m) =>
  m.cards.map((card, i) => ({ key: cardKey(m.id, i), moduleId: m.id, card })),
);
export { cardKey };
export { concepts } from './coverage';
export { SOURCES } from './sources';
export type { Card, Module, Track } from './types';
