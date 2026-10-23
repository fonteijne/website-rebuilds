import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SpotlightCard from './rb/SpotlightCard';
import { cardKey, type Card, type Module } from '../content';
import { markDone, useStore } from '../lib/store';
import { href } from '../lib/route';
import Demo from './demos';
import Dogfood from './dogfood';

gsap.registerPlugin(useGSAP);

const KIND: Record<Card['kind'], { label: string; color: string }> = {
  idea: { label: 'Concept', color: 'var(--color-l3)' },
  quiz: { label: 'Quick check', color: 'var(--color-l2)' },
  demo: { label: 'Try it', color: 'var(--color-l4)' },
  dogfood: { label: 'Dogfood', color: 'var(--color-l0)' },
};

function SrcChip({ src }: { src?: string }) {
  if (!src) return null;
  const video = src.startsWith('video');
  return (
    <span
      className="mono rounded-full border border-line px-2 py-0.5 text-[11px] text-mute"
      title={video ? 'From summaries of Jake Van Clief’s videos, not from the paper. Verify against the originals.' : 'Where this appears in the paper'}
    >
      {video ? 'Jake’s videos · secondhand' : src}
    </span>
  );
}

function Quiz({ card, k }: { card: Extract<Card, { kind: 'quiz' }>; k: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === card.answer;
  return (
    <div>
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
                  ? 'border-l4 bg-l4/10'
                  : state === 'bad'
                    ? 'border-l2 bg-l2/10'
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
        <div className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${correct ? 'border-l4/40 bg-l4/5' : 'border-l2/40 bg-l2/5'}`} role="status">
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

export default function CardDeck({ module: m, startAt, nextModule }: { module: Module; startAt: number; nextModule?: Module }) {
  const s = useStore();
  const [i, setI] = useState(startAt);
  const body = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const card = m.cards[i];
  const k = cardKey(m.id, i);
  const last = i === m.cards.length - 1;
  const answered = card.kind !== 'quiz' || k in s.quiz;

  useGSAP(
    () => {
      gsap.fromTo(
        '.card-in',
        { opacity: 0, x: 40 * dir.current, scale: 0.985 },
        { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'power3.out' },
      );
      gsap.from('.card-stagger > *', { opacity: 0, y: 14, duration: 0.5, stagger: 0.07, ease: 'power2.out', delay: 0.08 });
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div ref={body}>
        <div className="mb-3 flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={m.cards.length} aria-valuenow={i + 1} aria-label="Card progress">
          {m.cards.map((_, n) => (
            <button
              key={n}
              onClick={() => {
                dir.current = n > i ? 1 : -1;
                setI(n);
              }}
              aria-label={`Card ${n + 1}`}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: n === i ? kind.color : s.done[cardKey(m.id, n)] ? 'rgba(95,211,154,.55)' : 'rgba(255,255,255,.1)' }}
            />
          ))}
        </div>

        <div className="card-in">
          <SpotlightCard spotlightColor={kind.color} className="min-h-[24rem] !p-6 sm:!p-9" key={k}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="mono rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: kind.color, background: `color-mix(in srgb, ${kind.color} 14%, transparent)` }}>
                {kind.label}
              </span>
              <SrcChip src={card.src} />
              <span className="mono ml-auto text-xs text-mute">
                {i + 1} / {m.cards.length}
              </span>
            </div>

            {card.kind === 'quiz' ? (
              <Quiz card={card} k={k} />
            ) : (
              <div className="card-stagger">
                <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{card.title}</h2>
                <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink/85">{card.body}</p>
                {card.kind === 'idea' && card.harness && (
                  <div className="mt-6 flex max-w-2xl gap-3 rounded-xl border border-l0/30 bg-l0/[0.06] p-4 text-[15px] leading-relaxed">
                    <span className="mono mt-0.5 text-xs font-semibold uppercase tracking-wider text-l0">Harness</span>
                    <span>{card.harness}</span>
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
              className="btn btn-primary"
              href={nextModule ? href.module(nextModule.id) : href.build}
              onClick={() => card.kind !== 'quiz' && markDone(k)}
              aria-disabled={!answered}
            >
              {nextModule ? `Module ${nextModule.num} →` : 'Open the Builder →'}
            </a>
          ) : (
            <button className="btn btn-primary" onClick={advance} disabled={!answered}>
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
                onClick={() => {
                  dir.current = n > i ? 1 : -1;
                  setI(n);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors ${n === i ? 'bg-white/10 text-ink' : 'text-mute hover:text-ink'}`}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: s.done[cardKey(m.id, n)] ? 'var(--color-l4)' : KIND[c.kind].color, opacity: s.done[cardKey(m.id, n)] ? 1 : 0.45 }}
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
