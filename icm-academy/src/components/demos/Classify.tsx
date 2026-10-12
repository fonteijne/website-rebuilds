import { useState } from 'react';

const FILES: { f: string; l: 3 | 4; why: string }[] = [
  { f: 'voice.md', l: 3, why: 'Tone rules persist across runs: the recipe.' },
  { f: 'research-output.md', l: 4, why: 'Produced fresh each run by stage 1: an ingredient.' },
  { f: 'design-system.md', l: 3, why: 'Colours and type are factory settings.' },
  { f: 'script-draft.md', l: 4, why: 'This run’s script, consumed by the next stage.' },
  { f: 'conventions.md', l: 3, why: 'Build conventions are stable constraints.' },
  { f: "today's-topic-brief.md", l: 4, why: 'Specific to this run only.' },
  { f: 'structure-template.md', l: 3, why: 'A reusable template the model should follow.' },
  { f: '01_research/output/', l: 4, why: 'output/ folders are the Layer 4 handoff points.' },
];

export default function Classify() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<(3 | 4)[]>([]);
  const done = i >= FILES.length;
  const score = ans.filter((a, n) => a === FILES[n].l).length;
  const cur = FILES[i];
  const last = ans[i - 1];
  const prev = FILES[i - 1];

  if (done)
    return (
      <div className="text-center">
        <div className="mono text-4xl font-semibold">
          {score}/{FILES.length}
        </div>
        <p className="mt-2 text-sm text-mute">{score >= 7 ? 'Recipe and ingredients: you’ve got it.' : 'Rule of thumb: does it change every run? Then it’s Layer 4.'}</p>
        <button className="btn mt-4" onClick={() => { setI(0); setAns([]); }}>
          Play again
        </button>
      </div>
    );

  return (
    <div>
      <div className="mb-1 text-xs text-mute">
        File {i + 1} of {FILES.length}
      </div>
      <div className="mono rounded-xl border border-line bg-bg px-4 py-5 text-center text-xl">{cur.f}</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {([3, 4] as const).map((l) => (
          <button
            key={l}
            className="btn justify-center"
            style={{ borderColor: l === 3 ? 'var(--color-l3)' : 'var(--color-l4)' }}
            onClick={() => {
              setAns([...ans, l]);
              setI(i + 1);
            }}
          >
            {l === 3 ? 'Layer 3 · Reference (recipe)' : 'Layer 4 · Working (ingredient)'}
          </button>
        ))}
      </div>
      {prev && (
        <p className={`mt-3 text-sm ${last === prev.l ? 'text-l4' : 'text-l2'}`} role="status">
          {last === prev.l ? 'Correct' : 'Not quite'}: {prev.f} → Layer {prev.l}. {prev.why}
        </p>
      )}
    </div>
  );
}
