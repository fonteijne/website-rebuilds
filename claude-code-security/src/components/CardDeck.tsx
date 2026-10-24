import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import SpotlightCard from './rb/SpotlightCard';
import { cardKey, SOURCES, type Card, type Module } from '../content';
import type { DiffCard, QuizCard } from '../content/types';
import { markDone, useStore } from '../lib/store';
import { href } from '../lib/route';
import { TRACK } from '../lib/tracks';
import Demo from './demos';
import Dogfood from './dogfood';

const KIND: Record<Card['kind'], { label: string; color: string }> = {
  idea: { label: 'Concept', color: 'var(--color-info)' },
  diff: { label: 'Same · different', color: 'var(--color-ios)' },
  quiz: { label: 'Quick check', color: 'var(--color-bad)' },
  demo: { label: 'Try it', color: 'var(--color-ok)' },
  dogfood: { label: 'Your policy', color: 'var(--color-guard)' },
};

/** One chip per source behind the card, linking out, so every claim can be checked. */
function SrcChip({ src, verify }: { src?: string | string[]; verify?: boolean }) {
  const list = [src ?? []].flat().map((k) => SOURCES[k]).filter(Boolean);
  return (
    <>
      {list.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="chip hover:text-ink"
          title={s.secondhand ? 'Third-party write-up or field notes, not vendor documentation' : 'Where this is documented'}
        >
          {s.label}
          {s.secondhand ? ' · secondhand' : ''} ↗
        </a>
      ))}
      {verify && (
        <span className="chip !border-warn/40 !text-warn" title="Changes fast or isn’t fully documented: check it on your own setup">
          verify on your setup
        </span>
      )}
    </>
  );
}

function Quiz({ card, k }: { card: QuizCard; k: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === card.answer;
  return (
    <div className="[overflow-wrap:anywhere]">
      <h2 className="text-xl font-semibold leading-snug sm:text-2xl">{card.title}</h2>
      <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label={card.title}>
        {card.options.map((o, i) => {
          const state = picked === null ? '' : i === card.answer ? 'ok' : i === picked ? 'bad' : 'dim';
          return (
            <button
              key={i}
              role="radio"
              aria-checked={picked === i}
              disabled={picked !== null && correct}
              onClick={() => {
                setPicked(i);
                markDone(k, i === card.answer);
              }}
              className={`rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${
                state === 'ok'
                  ? 'border-ok bg-ok/10'
                  : state === 'bad'
                    ? 'border-bad bg-bad/10'
                    : state === 'dim'
                      ? 'border-line opacity-50'
                      : 'border-line bg-bg hover:border-white/30'
              }`}
            >
              <span className="mono mr-2 text-mute">{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${correct ? 'border-ok/40 bg-ok/5' : 'border-bad/40 bg-bad/5'}`} role="status">
          <strong>{correct ? 'Correct. ' : 'Not quite. '}</strong>
          {card.why}
          {!correct && (
            <button className="ml-2 underline" onClick={() => setPicked(null)}>
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Diff({ card }: { card: DiffCard }) {
  return (
    <div className="mt-5 space-y-4">
      {card.body && <p className="max-w-2xl text-[15px] italic leading-relaxed text-mute">{card.body}</p>}
      <div className="rounded-xl border border-ok/30 bg-ok/[0.05] p-4">
        <div className="mono mb-2 text-[11px] font-semibold uppercase tracking-wider text-ok">= Same in both</div>
        <ul className="space-y-1.5 text-[15px] leading-relaxed">
          {card.same.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-ok" aria-hidden>
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-hidden rounded-xl border border-ios/30">
        <div className="mono border-b border-ios/30 bg-ios/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ios">≠ Different</div>
        <div className="grid grid-cols-1 text-[14px] leading-relaxed sm:grid-cols-2">
          <div className="mono hidden border-b border-line px-4 py-2 text-xs text-mute sm:block">{card.left}</div>
          <div className="mono hidden border-b border-l border-line px-4 py-2 text-xs text-mute sm:block">{card.right}</div>
          {card.different.map(([l, r]) => (
            <div key={l} className="contents">
              <div className="border-b border-line px-4 py-2.5 last:border-b-0">
                <span className="mono mb-0.5 block text-[10px] uppercase tracking-wider text-mute sm:hidden">{card.left}</span>
                {l}
              </div>
              <div className="border-b border-line bg-ios/[0.04] px-4 py-2.5 sm:border-l">
                <span className="mono mb-0.5 block text-[10px] uppercase tracking-wider text-ios sm:hidden">{card.right}</span>
                {r}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CardDeck({ module: m, startAt, nextModule }: { module: Module; startAt: number; nextModule?: Module }) {
  const s = useStore();
  const [i, setI] = useState(startAt);
  const body = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const card = m.cards[i];
  const k = cardKey(m.id, i);
  const last = i === m.cards.length - 1;
  const answered = card.kind !== 'quiz' || k in s.quiz;
  const t = TRACK[m.track];
  const accent = t.color;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo('.card-in', { autoAlpha: 0, x: 40 * dir.current }, { autoAlpha: 1, x: 0, duration: 0.45 });
        gsap.from('.card-stagger > *', { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.08 });
      });
    },
    { scope: body, dependencies: [i] },
  );

  const go = useCallback(
    (d: number) => {
      dir.current = d;
      setI((x) => Math.min(m.cards.length - 1, Math.max(0, x + d)));
    },
    [m.cards.length],
  );
  const jump = (n: number) => {
    dir.current = n > i ? 1 : -1;
    setI(n);
  };

  const advance = () => {
    if (card.kind !== 'quiz') markDone(k);
    if (!last) go(1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === 'ArrowRight') {
        if (answered && !last) {
          if (card.kind !== 'quiz') markDone(k);
          go(1);
        }
      } else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, last, card.kind, k, go]);

  const kind = KIND[card.kind];
  const nextHref = nextModule ? href.module(nextModule.id) : t.next.href;
  const nextLabel = nextModule ? `Module ${nextModule.num} →` : t.next.label;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
      <div ref={body} className="min-w-0">
        <div className="mb-3 flex items-center gap-1.5" aria-label={`Card ${i + 1} of ${m.cards.length}`}>
          {m.cards.map((_, n) => (
            <button
              key={n}
              onClick={() => jump(n)}
              aria-label={`Card ${n + 1}`}
              aria-current={n === i ? 'step' : undefined}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: n === i ? kind.color : s.done[cardKey(m.id, n)] ? 'rgba(95,211,154,.55)' : 'rgba(255,255,255,.1)' }}
            />
          ))}
        </div>

        <div className="card-in">
          <SpotlightCard spotlightColor={kind.color} className="min-h-[24rem] !p-5 sm:!p-9" key={k}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span
                className="mono rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: kind.color, background: `color-mix(in srgb, ${kind.color} 14%, transparent)` }}
              >
                {kind.label}
              </span>
              <SrcChip src={card.src} verify={card.verify} />
              <span className="mono ml-auto text-xs text-mute">
                {i + 1} / {m.cards.length}
              </span>
            </div>

            {card.kind === 'quiz' ? (
              <Quiz card={card} k={k} />
            ) : (
              <div className="card-stagger [overflow-wrap:anywhere]">
                <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{card.title}</h2>
                {card.kind === 'diff' ? (
                  <Diff card={card} />
                ) : (
                  <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink/85">{card.body}</p>
                )}
                {card.kind === 'idea' && card.code && <pre className="code mt-5 max-w-2xl">{card.code}</pre>}
                {card.kind === 'idea' && card.guard && (
                  <div className="mt-6 flex max-w-2xl gap-3 rounded-xl border p-4 text-[15px] leading-relaxed" style={{ borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`, background: `color-mix(in srgb, ${accent} 6%, transparent)` }}>
                    <span className="mono mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
                      Guard
                    </span>
                    <span>{card.guard}</span>
                  </div>
                )}
                {card.kind === 'demo' && (
                  <div className="mt-6">
                    <Demo id={card.demo} />
                  </div>
                )}
                {card.kind === 'dogfood' && (
                  <div className="mt-6">
                    <Dogfood step={card.step} />
                  </div>
                )}
              </div>
            )}
          </SpotlightCard>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button className="btn" onClick={() => go(-1)} disabled={i === 0}>
            ← Back
          </button>
          <span className="hidden text-xs text-mute sm:block">
            <span className="kbd">←</span> <span className="kbd">→</span> to move
          </span>
          {last ? (
            <a
              className={`btn ${t.btn}`}
              href={answered ? nextHref : undefined}
              onClick={() => card.kind !== 'quiz' && markDone(k)}
              aria-disabled={!answered}
            >
              {nextLabel}
            </a>
          ) : (
            <button className={`btn ${t.btn}`} onClick={advance} disabled={!answered}>
              {card.kind === 'quiz' ? 'Next →' : 'Got it →'}
            </button>
          )}
        </div>
      </div>

      <aside className="hidden lg:block" aria-label="Cards in this module">
        <ol className="panel sticky top-20 space-y-0.5 p-2">
          {m.cards.map((c, n) => (
            <li key={n}>
              <button
                onClick={() => jump(n)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors ${n === i ? 'bg-white/10 text-ink' : 'text-mute hover:text-ink'}`}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: s.done[cardKey(m.id, n)] ? 'var(--color-ok)' : KIND[c.kind].color, opacity: s.done[cardKey(m.id, n)] ? 1 : 0.45 }}
                />
                <span className="truncate">{c.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
