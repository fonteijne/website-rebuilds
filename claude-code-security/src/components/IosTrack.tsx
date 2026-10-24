import { useRef } from 'react';
import { useGSAP } from '../lib/gsap';
import { revealOnScroll } from '../lib/reveal';
import SpotlightCard from './rb/SpotlightCard';
import ModuleList from './ModuleList';
import { trackMeta } from '../content/meta';
import { useStore } from '../lib/store';
import { moduleProgress, overall } from '../lib/progress';
import { href } from '../lib/route';

const SETUPS = [
  ['A', 'Claude Agent inside Xcode', 'Coding assistant (⌘0), Xcode 26.3+. Config in ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig. Permissions in Xcode › Settings › Intelligence.'],
  ['B', 'Claude Code + Xcode MCP bridge', 'claude mcp add --transport stdio xcode -- xcrun mcpbridge. All of Claude Code’s rules, hooks and sandbox, plus Xcode’s build, test and preview tools.'],
  ['C', 'Claude Code, command line only', 'xcodebuild, swift, xcrun simctl through Bash. Every Claude Code guardrail applies; the Xcode toolchain needs a few sandbox tweaks.'],
];

const SAME = ['CLAUDE.md in your project', 'Skills, MCP, subagents, plan mode', 'Your prompts and read files go to the model', 'It acts as your macOS user'];
const DIFF: [string, string, string][] = [
  ['Config folder', '~/.claude/', 'ClaudeAgentConfig/'],
  ['Permissions', 'allow · ask · deny rules', 'Allowed Commands / Tools'],
  ['Hooks & sandbox', 'Documented', 'Not documented: verify'],
  ['Undo', '/rewind checkpoints', 'History slider (needs Git)'],
  ['Shell env', 'Your shell, your tokens', 'Restricted, no .zshrc'],
  ['Org policy', 'managed-settings.json', 'MDM key'],
];

export default function IosTrack() {
  const root = useRef<HTMLDivElement>(null);
  const s = useStore();
  const list = trackMeta('ios');
  const next = list.find((m) => moduleProgress(s, m.id).done < m.count) ?? list[0];
  const o = overall(s, 'ios');

  useGSAP(() => void revealOnScroll(root.current!), { scope: root });

  return (
    <div ref={root}>
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(closest-side, #a993fa, transparent)' }} aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
          <a href={href.home} className="text-sm text-mute hover:text-ink">
            ← Guardrail Academy
          </a>
          <div className="mono mt-6 text-sm text-ios">iOS track · part of the academy</div>
          <h1 className="mt-2 max-w-3xl text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">Same engine, other dashboard.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mute">
            Claude in Xcode works almost like Claude Code, but configuration, permissions, undo and isolation all live somewhere else. This track names every similarity and every difference, then makes the Xcode toolchain work inside your guardrails.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a className="btn btn-ios" href={href.module(next.id)}>
              {o.done ? 'Continue the iOS track' : 'Start with i1'} <span aria-hidden>→</span>
            </a>
            <a className="btn" href={href.module('threats')}>
              Core track first
            </a>
            <span className="mono text-xs text-mute">{o.done}/{o.total} cards</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">Three setups. Know which one you’re in.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SETUPS.map(([k, t, d]) => (
            <div key={k} className="reveal min-w-0">
              <SpotlightCard spotlightColor="#a993fa" className="h-full !p-6">
                <div className="mono text-3xl font-semibold text-ios">{k}</div>
                <h3 className="mt-2 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute [overflow-wrap:anywhere]">{d}</p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">At a glance: Claude Code vs the agent inside Xcode</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal rounded-2xl border border-ok/30 bg-ok/[0.05] p-5">
            <div className="mono mb-3 text-xs font-semibold uppercase tracking-wider text-ok">= Same</div>
            <ul className="space-y-2 text-[15px]">
              {SAME.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="text-ok" aria-hidden>
                    ✓
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal overflow-x-auto rounded-2xl border border-ios/30">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
              <caption className="mono border-b border-ios/30 bg-ios/[0.07] px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ios">≠ Different</caption>
              <thead>
                <tr className="text-xs text-mute">
                  <th className="px-4 py-2 font-semibold" />
                  <th className="px-4 py-2 font-semibold">Claude Code</th>
                  <th className="px-4 py-2 font-semibold text-ios">Inside Xcode</th>
                </tr>
              </thead>
              <tbody>
                {DIFF.map(([t, a, b]) => (
                  <tr key={t} className="border-t border-line">
                    <th scope="row" className="px-4 py-2.5 font-medium">{t}</th>
                    <td className="mono px-4 py-2.5 text-[13px] text-mute">{a}</td>
                    <td className="mono px-4 py-2.5 text-[13px]">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
        <h2 className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">The iOS modules</h2>
        <p className="reveal mt-2 text-mute">Assumes the core track (or that you know permissions, hooks and the sandbox).</p>
        <ModuleList list={list} color="#a993fa" />
      </section>
    </div>
  );
}
