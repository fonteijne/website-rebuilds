import { useState } from 'react';

export type Verdict = 'runs' | 'prompts' | 'blocked' | 'classifier';

export const VERDICT: Record<Verdict, { label: string; color: string }> = {
  runs: { label: 'Runs', color: 'var(--color-ok)' },
  prompts: { label: 'Asks you', color: 'var(--color-warn)' },
  blocked: { label: 'Blocked', color: 'var(--color-bad)' },
  classifier: { label: 'Classifier decides', color: 'var(--color-info)' },
};

export function Badge({ v, children }: { v: Verdict; children?: React.ReactNode }) {
  const c = VERDICT[v].color;
  return (
    <span className="mono inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: c, background: `color-mix(in srgb, ${c} 15%, transparent)` }}>
      {children ?? VERDICT[v].label}
    </span>
  );
}

/** Accessible segmented control used by several demos. */
export function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="mb-4 flex max-w-full flex-wrap gap-1 rounded-2xl border border-line p-1 text-sm" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-xl px-3 py-1.5 transition-colors ${value === v ? 'bg-white/10 text-ink' : 'text-mute hover:text-ink'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/**
 * A "guess the outcome" round: one item at a time, the learner picks a verdict, then sees the answer and why.
 * Used by the bypass, sandbox, Xcode-sandbox and iOS-rules demos.
 */
export function GuessGame<C extends string>({
  items,
  choices,
  prompt,
}: {
  items: { q: string; a: C; why: string }[];
  choices: [C, string, string][];
  prompt?: string;
}) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<C[]>([]);
  const done = i >= items.length;
  const score = ans.filter((a, n) => a === items[n].a).length;
  const prev = items[i - 1];
  const last = ans[i - 1];
  const name = (c: C) => choices.find((x) => x[0] === c)?.[1] ?? c;

  if (done)
    return (
      <div className="text-center">
        <div className="mono text-4xl font-semibold">
          {score}/{items.length}
        </div>
        <p className="mt-2 text-sm text-mute">{score === items.length ? 'Spotless.' : 'Review the misses below, then play again.'}</p>
        <ul className="mx-auto mt-4 max-w-xl space-y-2 text-left text-sm">
          {items.map((it, n) =>
            ans[n] === it.a ? null : (
              <li key={n} className="rounded-xl border border-line p-3">
                <code className="mono text-[13px]">{it.q}</code> → <strong>{name(it.a)}</strong>. <span className="text-mute">{it.why}</span>
              </li>
            ),
          )}
        </ul>
        <button
          className="btn mt-4"
          onClick={() => {
            setI(0);
            setAns([]);
          }}
        >
          Play again
        </button>
      </div>
    );

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-mute">
        <span>{prompt}</span>
        <span>
          {i + 1} of {items.length}
        </span>
      </div>
      <div className="mono rounded-xl [overflow-wrap:anywhere] border border-line bg-bg px-4 py-5 text-center text-[15px] sm:text-lg">{items[i].q}</div>
      <div className={`mt-3 grid gap-2 ${choices.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2'}`}>
        {choices.map(([c, l, color]) => (
          <button
            key={c}
            className="btn justify-center text-sm"
            style={{ borderColor: color }}
            onClick={() => {
              setAns([...ans, c]);
              setI(i + 1);
            }}
          >
            {l}
          </button>
        ))}
      </div>
      {prev && (
        <p className={`mt-3 text-sm leading-relaxed ${last === prev.a ? 'text-ok' : 'text-bad'}`} role="status">
          {last === prev.a ? 'Correct' : 'Not quite'}: <span className="mono">{prev.q}</span> → {name(prev.a)}. <span className="text-ink/80">{prev.why}</span>
        </p>
      )}
    </div>
  );
}
