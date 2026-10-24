import type { ModuleMeta, Track } from './types';

/**
 * Module metadata only: small enough for the landing page bundle. The cards live in one file per module and are
 * loaded with the module routes (see index.ts). `count` is checked against the real card count by `npm run check`.
 */
export const MODULE_META: ModuleMeta[] = [
  { file: '01-threats', id: 'threats', num: '01', track: 'core', title: 'What can go wrong', tagline: 'An agent with a shell is powerful. Decide in advance what it may do without you.', minutes: 6, count: 9 },
  { file: '02-permissions', id: 'permissions', num: '02', track: 'core', title: 'Permission rules', tagline: 'allow, ask, deny: the first line of enforcement, and its blind spots.', minutes: 9, count: 13 },
  { file: '03-modes', id: 'modes', num: '03', track: 'core', title: 'Permission modes', tagline: 'The default answer to “may I?”, from asking about everything to asking about nothing.', minutes: 8, count: 13 },
  { file: '04-hooks', id: 'hooks', num: '04', track: 'core', title: 'Hooks', tagline: 'Your own code, at fixed moments, every time. PreToolUse is the one that guards.', minutes: 10, count: 14 },
  { file: '05-sandbox', id: 'sandbox', num: '05', track: 'core', title: 'The Bash sandbox', tagline: 'OS-level walls around shell commands: fewer prompts and real enforcement.', minutes: 9, count: 12 },
  { file: '06-isolation', id: 'isolation', num: '06', track: 'core', title: 'Isolated environments', tagline: 'Put the whole agent in a box: file tools, MCP servers and hooks included.', minutes: 8, count: 9 },
  { file: '07-trust', id: 'trust', num: '07', track: 'core', title: 'Supply chain and trust', tagline: 'The repository you open configures the agent you run. Read it like code.', minutes: 7, count: 9 },
  { file: '08-team', id: 'team', num: '08', track: 'core', title: 'Secrets and team policy', tagline: 'Keep keys out of reach, then make the rules stick for everyone.', minutes: 6, count: 7 },
  { file: 'i1-xcode-vs-cli', id: 'xcode-vs-cli', num: 'i1', track: 'ios', title: 'Xcode vs Claude Code: same engine, other dashboard', tagline: 'Almost every concept carries over. Almost every place you configure it moves.', minutes: 9, count: 10 },
  { file: 'i2-bridge', id: 'xcode-bridge', num: 'i2', track: 'ios', title: 'The Xcode MCP bridge', tagline: 'Claude Code in Terminal, Xcode’s tools in reach, and one gap to close.', minutes: 6, count: 6 },
  { file: 'i3-mac-isolation', id: 'mac-isolation', num: 'i3', track: 'ios', title: 'Isolation when Xcode only runs on a Mac', tagline: 'The usual answer, a Linux container, can’t build an iOS app. Here’s what can.', minutes: 6, count: 7 },
  { file: 'i4-ios-sandbox', id: 'ios-sandbox', num: 'i4', track: 'ios', title: 'The sandbox meets the Xcode toolchain', tagline: 'Seatbelt is built in. Xcode’s tools just like to write outside your project.', minutes: 8, count: 8 },
  { file: 'i5-ios-guard', id: 'ios-guard', num: 'i5', track: 'ios', title: 'Signing, secrets and shipping', tagline: 'The iOS-specific keys to protect, actions to gate, and hooks worth having.', minutes: 8, count: 9 },
];
export const cardKey = (moduleId: string, i: number) => `${moduleId}:${i}`;
export const trackMeta = (t: Track) => MODULE_META.filter((m) => m.track === t);
export const CARD_TOTAL = MODULE_META.reduce((n, m) => n + m.count, 0);
