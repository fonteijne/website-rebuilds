import { useRef } from 'react';
import { useGSAP } from '../lib/gsap';
import { revealOnScroll } from '../lib/reveal';
import SpotlightCard from './rb/SpotlightCard';
import ModuleList from './ModuleList';
import { trackMeta } from '../content/meta';
import { modules, SOURCES } from '../content';
import { useStore } from '../lib/store';
import { moduleProgress, overall } from '../lib/progress';
import { href } from '../lib/route';

const PARTIES = [
  ['Xcode', 'Hosts the coding assistant. Apple collects limited request data (counts, sizes) when you use a provider; history stays in Xcode. Two MDM keys exist.'],
  ['The agent', 'Claude Agent, Codex, an ACP agent or Claude Code in Terminal. Model requests plus telemetry, error reports, update checks, the WebFetch check, release notes.'],
  ['The model server', 'Ollama or LM Studio on your Mac. Prompts to local models stay local; update checks, model downloads and cloud features don’t.'],
];

const STACK: [string, string][] = [
  ['Local endpoint', 'ANTHROPIC_BASE_URL → 127.0.0.1 (Ollama 11434 · LM Studio 1234)'],
  ['Zero telemetry', 'DISABLE_TELEMETRY · DISABLE_ERROR_REPORTING · CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'],
  ['The one it misses', '"skipWebFetchPreflight": true, and deny WebFetch / WebSearch'],
  ['Enforce', 'Managed settings: allowedProviders ["customEndpoint"] + pinned env'],
  ['Prove', 'Sockets during a real task · sandbox allowlist 127.0.0.1 · outbound firewall'],
];

const PUBLISHER = (url: string) =>
  url.includes('claude.com') ? 'Anthropic' : url.includes('apple.com') ? 'Apple' : url.includes('ollama') ? 'Ollama' : url.includes('lmstudio') ? 'LM Studio' : url.includes('openai') ? 'OpenAI' : 'Other';

export default function OfflineTrack() {
  const root = useRef<HTMLDivElement>(null);
  const s = useStore();
  const list = trackMeta('offline');
  const next = list.find((m) => moduleProgress(s, m.id).done < m.count) ?? list[0];
  const o = overall(s, 'offline');

  // Every source cited by a card in this track, with how many cards cite it.
  const cited = new Map<string, number>();
  for (const m of modules.filter((x) => x.track === 'offline'))
    for (const c of m.cards) for (const k of [c.src ?? []].flat()) cited.set(k, (cited.get(k) ?? 0) + 1);
  const groups = new Map<string, { key: string; n: number }[]>();
  for (const [key, n] of cited) {
    const g = PUBLISHER(SOURCES[key].url);
    groups.set(g, [...(groups.get(g) ?? []), { key, n }]);
  }
  const order = ['Anthropic', 'Apple', 'Ollama', 'LM Studio', 'OpenAI', 'Other'].filter((g) => groups.has(g));

  useGSAP(() => void revealOnScroll(root.current!), { scope: root });

  return (
    <div ref={root}>
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(closest-side, #f59e5b, transparent)' }} aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
          <a href={href.home} className="text-sm text-mute hover:text-ink">
            ← Guardrail Academy
          </a>
          <div className="mono mt-6 text-sm text-air">Offline track · part of the academy</div>
          <h1 className="mt-2 max-w-4xl text-[2.2rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">Local model. Zero telemetry. Proven.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mute">
            Configuring the agent environment in Xcode so the model runs on your Mac and nothing phones home: which settings exist for each route, which ones are documented, which ones you have to test, and how to enforce and verify the result. Every claim links to its source.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a className="btn btn-air" href={href.module(next.id)}>
              {o.done ? 'Continue the offline track' : 'Start with o1'} <span aria-hidden>→</span>
            </a>
            <a className="btn" href={href.ios}>
              iOS track first
            </a>
            <span className="mono text-xs text-mute">
              {o.done}/{o.total} cards · {cited.size} sources
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">Three programs can reach the network</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PARTIES.map(([t, d], i) => (
            <div key={t} className="reveal min-w-0">
              <SpotlightCard spotlightColor="#f59e5b" className="h-full !p-6">
                <div className="mono text-3xl font-semibold text-air">{i + 1}</div>
                <h3 className="mt-2 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{d}</p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">The stack, in one view</h2>
        <ol className="reveal mt-6 divide-y divide-line rounded-2xl border border-air/30">
          {STACK.map(([k, v], i) => (
            <li key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <span className="font-medium">
                <span className="mono mr-2 text-air">{i + 1}</span>
                {k}
              </span>
              <span className="mono text-[13px] text-mute [overflow-wrap:anywhere]">{v}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">The offline modules</h2>
        <p className="reveal mt-2 text-mute">Builds on the core and iOS tracks. Cards marked “verify on your setup” describe behaviour no vendor documents yet.</p>
        <ModuleList list={list} color="#f59e5b" />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6" aria-labelledby="sources">
        <h2 id="sources" className="reveal text-2xl font-semibold tracking-tight sm:text-3xl">
          Sources
        </h2>
        <p className="reveal mt-2 max-w-2xl text-mute">
          Every source cited in this track, with the number of cards that rely on it. Checked in October 2026; vendors change these pages often.
        </p>
        <div className="reveal mt-6 grid gap-6 md:grid-cols-2">
          {order.map((g) => (
            <div key={g}>
              <h3 className="mono mb-2 text-xs font-semibold uppercase tracking-wider text-air">{g}</h3>
              <ul className="space-y-1.5 text-sm">
                {groups
                  .get(g)!
                  .sort((a, b) => b.n - a.n)
                  .map(({ key, n }) => (
                    <li key={key} className="flex items-baseline gap-2">
                      <a href={SOURCES[key].url} target="_blank" rel="noreferrer" className="min-w-0 underline decoration-white/20 underline-offset-2 [overflow-wrap:anywhere] hover:decoration-air">
                        {SOURCES[key].label}
                      </a>
                      {SOURCES[key].secondhand && <span className="chip">secondhand</span>}
                      <span className="mono ml-auto shrink-0 text-xs text-mute">
                        {n} card{n > 1 ? 's' : ''}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
