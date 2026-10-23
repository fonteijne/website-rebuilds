import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from './rb/SplitText';
import ShinyText from './rb/ShinyText';
import SpotlightCard from './rb/SpotlightCard';
import Magnet from './rb/Magnet';
import CountUp from './rb/CountUp';
import DotGrid from './rb/DotGrid';
import { modules, allCards, concepts } from '../content';
import { useStore } from '../lib/store';
import { moduleProgress } from '../lib/progress';
import { href } from '../lib/route';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TREE: { t: string; c: string; note?: string }[] = [
  { t: 'my-harness/', c: 'var(--color-ink)' },
  { t: '  CLAUDE.md', c: 'var(--color-l0)', note: 'where am I?' },
  { t: '  CONTEXT.md', c: 'var(--color-l1)', note: 'where do I go?' },
  { t: '  stages/', c: 'var(--color-ink)' },
  { t: '    01_research/', c: 'var(--color-ink)' },
  { t: '      CONTEXT.md', c: 'var(--color-l2)', note: 'what do I do?' },
  { t: '      output/', c: 'var(--color-l4)', note: 'what am I working with?' },
  { t: '    02_script/', c: 'var(--color-ink)' },
  { t: '      CONTEXT.md', c: 'var(--color-l2)' },
  { t: '      output/', c: 'var(--color-l4)' },
  { t: '  _config/voice.md', c: 'var(--color-l3)', note: 'what rules apply?' },
];

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const s = useStore();

  const next = modules.find((m) => moduleProgress(s, m.id).done < m.cards.length);
  const started = Object.keys(s.done).length > 0;

  useGSAP(
    () => {
      gsap.from('.tree-line', { opacity: 0, x: -12, stagger: 0.09, duration: 0.5, ease: 'power2.out', delay: 0.6 });
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('.bar-fill').forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-70" aria-hidden>
          <DotGrid
            dotSize={3}
            gap={26}
            baseColor="#2a313b"
            activeColor="#f5b83d"
            proximity={150}
            glow={0.5}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24">
          <div className="pointer-events-none">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs backdrop-blur">
              <span className="size-1.5 rounded-full bg-l4" />
              <ShinyText text="Learn the paper · build your own agent harness" color="#98a0ab" shineColor="#ffffff" speed={3} />
            </div>
            <SplitText
              text="The folder is the framework."
              tag="h1"
              textAlign="left"
              splitType="words"
              delay={80}
              duration={1}
              rootMargin="0px"
              className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
              Interpretable Context Methodology (ICM) runs multi-step AI workflows with numbered folders, plain markdown
              and one agent that reads the right files at the right moment. Learn it in{' '}
              <strong className="text-ink">{allCards.length} snack-sized cards</strong>, then use it to build your own
              harness as you go.
            </p>
            <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-3">
              <Magnet padding={60} magnetStrength={3}>
                <a className="btn btn-primary" href={next ? href.module(next.id) : href.build}>
                  {started ? 'Continue learning' : 'Start learning'} <span aria-hidden>→</span>
                </a>
              </Magnet>
              <a className="btn" href={href.build}>
                Open the Harness Builder
              </a>
            </div>
          </div>

          <div className="pointer-events-none" aria-hidden>
            <div className="panel overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                <span className="size-2.5 rounded-full bg-l2/80" />
                <span className="size-2.5 rounded-full bg-l0/80" />
                <span className="size-2.5 rounded-full bg-l4/80" />
                <span className="mono ml-3 text-xs text-mute">the whole architecture</span>
              </div>
              <pre className="mono overflow-x-auto p-5 text-[13px] leading-7">
                {TREE.map((l, i) => (
                  <div key={i} className="tree-line whitespace-pre">
                    <span style={{ color: l.c }}>{l.t}</span>
                    {l.note && <span className="text-mute">{'  # ' + l.note}</span>}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* HOW YOU'LL LEARN */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="reveal text-3xl font-semibold tracking-tight sm:text-4xl">Three loops, one habit</h2>
        <p className="reveal mt-3 max-w-2xl text-mute">
          ICM says every output is an edit surface and the workspace is the system. This course teaches it the same way:
          small units, hands-on, and the artefact is yours.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ['Snack-bite cards', 'One idea per card, 30 seconds each. Concepts, quizzes and interactive demos you can poke.', 'var(--color-l3)'],
            ['Dogfood it', 'The method teaches itself: after each module you add a real piece to your own workspace (stages, references, contracts, gates).', 'var(--color-l0)'],
            ['Ship a harness', 'The Builder turns your answers into a downloadable folder: CLAUDE.md, CONTEXT.md and stage contracts, ready for Claude Code.', 'var(--color-l4)'],
          ].map(([t, d, c], i) => (
            <div key={t} className="reveal">
              <SpotlightCard spotlightColor={c} className="h-full !p-7">
                <div className="mono mb-4 text-sm" style={{ color: c }}>
                  0{i + 1}
                </div>
                <h3 className="text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mute">{d}</p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </section>

      {/* PATH */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" id="path">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="reveal text-3xl font-semibold tracking-tight sm:text-4xl">The path</h2>
            <p className="reveal mt-3 text-mute">Eight modules, about an hour in total. Go in order the first time.</p>
          </div>
          <div className="reveal mono flex gap-6 text-sm text-mute">
            <span>
              <CountUp to={modules.length} className="text-2xl font-semibold text-ink" /> modules
            </span>
            <span>
              <CountUp to={allCards.length} className="text-2xl font-semibold text-ink" /> cards
            </span>
            <span>
              <CountUp to={concepts.length} className="text-2xl font-semibold text-ink" /> concepts
            </span>
          </div>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {modules.map((m) => {
            const p = moduleProgress(s, m.id);
            return (
              <li key={m.id} className="reveal">
                <a href={href.module(m.id)} className="group block">
                  <SpotlightCard className="!p-6 transition-transform duration-300 group-hover:-translate-y-0.5" spotlightColor="#f5b83d">
                    <div className="flex items-start gap-4">
                      <span className="mono text-3xl font-semibold text-l0/90">{m.num}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold">{m.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-mute">{m.tagline}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div className="bar-fill h-full rounded-full bg-l4" style={{ width: `${p.pct}%` }} />
                          </div>
                          <span className="mono text-xs text-mute">
                            {p.done}/{p.total} · {m.minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24 pt-8 text-center sm:px-6">
        <div className="reveal panel p-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">By the end you can explain it, and run it.</h2>
          <p className="mx-auto mt-3 max-w-xl text-mute">
            The Map tracks {concepts.length} concepts from the paper. Master them through cards and correct quiz answers,
            and download a working harness you built yourself.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a className="btn btn-primary" href={href.module('why')}>
              Begin with module 01
            </a>
            <a className="btn" href={href.map}>
              See the concept map
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
