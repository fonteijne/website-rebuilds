import { useState } from 'react';

const Q = [
  { q: 'Do the steps run one after another?', good: true, why: 'ICM is sequential by design.' },
  { q: 'Should a human review the output of each step?', good: true, why: 'Review gates are the point.' },
  { q: 'Will the same pipeline run repeatedly with new input?', good: true, why: 'Configure the factory once, run it many times.' },
  { q: 'Do agents need to talk to each other in real time, in tight loops?', good: false, why: 'Needs message-passing infrastructure (e.g. AutoGen).' },
  { q: 'Will many users hit the same pipeline concurrently?', good: false, why: 'Needs queueing, state isolation and deployment infrastructure.' },
  { q: 'Must the AI itself decide branching mid-pipeline, automatically?', good: false, why: 'Automating branching pushes ICM toward being a framework.' },
];

export default function Decision() {
  const [a, setA] = useState<(boolean | null)[]>(Q.map(() => null));
  const answered = a.every((x) => x !== null);
  const hits = Q.filter((q, i) => a[i] === q.good).length;
  const blockers = Q.filter((q, i) => !q.good && a[i] === true);
  const missing = Q.filter((q, i) => q.good && a[i] === false);
  let verdict = '';
  let tone = 'text-l4';
  if (answered) {
    if (!blockers.length && !missing.length) verdict = 'Great fit. Sequential, reviewable, repeatable: ICM gives you full orchestration with no framework code.';
    else if (blockers.length && !missing.length) { verdict = 'Hybrid. Use ICM for the backbone and a framework (or scripts) for the parts that need real-time, concurrency or automatic branching.'; tone = 'text-l0'; }
    else { verdict = 'Probably not ICM. Your workflow lacks the sequential, human-reviewed, repeatable shape this method is built for.'; tone = 'text-l2'; }
  }
  return (
    <div>
      <ul className="space-y-2">
        {Q.map((q, i) => (
          <li key={q.q} className="flex flex-wrap items-center gap-3 rounded-lg border border-line px-3 py-2">
            <span className="min-w-0 flex-1 text-sm">{q.q}</span>
            <span className="flex gap-1.5">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => setA(a.map((x, n) => (n === i ? v : x)))} aria-pressed={a[i] === v} className={`rounded-full border px-3 py-1 text-xs ${a[i] === v ? 'border-l0 bg-l0/15' : 'border-line text-mute'}`}>
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {answered && (
        <div className="mt-4 rounded-xl border border-line p-4" role="status">
          <p className={`font-medium ${tone}`}>{verdict}</p>
          <p className="mono mt-1 text-xs text-mute">{hits}/{Q.length} answers match ICM’s sweet spot</p>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-mute">
            {[...blockers, ...missing].map((q) => <li key={q.q}>{q.why}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
