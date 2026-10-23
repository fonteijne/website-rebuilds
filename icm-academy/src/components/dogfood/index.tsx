import type { DogfoodId } from '../../content/types';
import { updateWs, useStore } from '../../lib/store';
import { href } from '../../lib/route';

const SUGGEST = ['voice.md', 'conventions.md', 'audience.md', 'design-system.md', 'examples.md'];
const EXAMPLE_STAGES = [
  { name: 'Research', job: 'Turn the topic brief into structured research notes.' },
  { name: 'Draft', job: 'Write the first draft from the approved research.' },
  { name: 'Polish', job: 'Edit the draft to match the voice guide and format.' },
];

function NeedStages() {
  return (
    <p className="rounded-xl border border-line p-4 text-sm text-mute">
      You haven’t carved your stages yet. Do the{' '}
      <a className="underline" href={href.module('principles')}>
        stages dogfood in module 04
      </a>{' '}
      first, or use the Builder.
    </p>
  );
}

function Saved() {
  return <p className="mt-3 text-xs text-l4">Saved automatically in your browser. Download the finished harness from the Builder.</p>;
}

function Workflow() {
  const { ws } = useStore();
  const fits = [
    ['seq', 'Sequential: step 2 follows step 1'],
    ['rev', 'Reviewable: a human should check each step'],
    ['rep', 'Repeatable: it will run again with new input'],
  ] as const;
  const score = fits.filter(([k]) => ws.fit[k]).length;
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="wsname">
            Workspace name
          </label>
          <input id="wsname" className="field" value={ws.name} placeholder="e.g. weekly-newsletter" onChange={(e) => updateWs((w) => ({ ...w, name: e.target.value }))} />
        </div>
        <div>
          <label className="label" htmlFor="wsgoal">
            What it produces, in one sentence
          </label>
          <input id="wsgoal" className="field" value={ws.goal} placeholder="Turns raw links into a reviewed newsletter draft." onChange={(e) => updateWs((w) => ({ ...w, goal: e.target.value }))} />
        </div>
      </div>
      <fieldset className="grid gap-2">
        <legend className="label">Fit test</legend>
        {fits.map(([k, l]) => (
          <label key={k} className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" className="accent-[#f5b83d]" checked={ws.fit[k]} onChange={(e) => updateWs((w) => ({ ...w, fit: { ...w.fit, [k]: e.target.checked } }))} />
            {l}
          </label>
        ))}
      </fieldset>
      <p className="text-sm" role="status">
        {score === 3 ? <span className="text-l4">Strong ICM candidate.</span> : <span className="text-mute">{score}/3. ICM works best when all three are true; module 08 covers the alternatives.</span>}
      </p>
      <Saved />
    </div>
  );
}

function Stages() {
  const { ws } = useStore();
  const set = (i: number, patch: Partial<{ name: string; job: string }>) =>
    updateWs((w) => ({ ...w, stages: w.stages.map((s, n) => (n === i ? { ...s, ...patch } : s)) }));
  return (
    <div className="grid gap-3">
      {ws.stages.map((s, i) => {
        const smell = /\band\b|&|,/.test(s.job) && s.job.length > 8;
        return (
          <div key={i} className="rounded-xl border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-[9rem_1fr_auto]">
              <input className="field" aria-label={`Stage ${i + 1} name`} placeholder="Stage name" value={s.name} onChange={(e) => set(i, { name: e.target.value })} />
              <input className="field" aria-label={`Stage ${i + 1} job`} placeholder="Its ONE job" value={s.job} onChange={(e) => set(i, { job: e.target.value })} />
              <button
                className="btn !px-3 !py-2"
                aria-label={`Remove stage ${i + 1}`}
                onClick={() =>
                  updateWs((w) => ({
                    ...w,
                    stages: w.stages.filter((_, n) => n !== i),
                    contracts: w.contracts.filter((_, n) => n !== i),
                    gates: w.gates.filter((_, n) => n !== i),
                  }))
                }
              >
                ✕
              </button>
            </div>
            {smell && <p className="mt-1.5 text-xs text-l0">Smells like two jobs ("and" or a list). Could this split into two stages?</p>}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        <button className="btn" disabled={ws.stages.length >= 6} onClick={() => updateWs((w) => ({ ...w, stages: [...w.stages, { name: '', job: '' }] }))}>
          + Add stage
        </button>
        {ws.stages.length === 0 && (
          <button className="btn" onClick={() => updateWs((w) => ({ ...w, stages: EXAMPLE_STAGES }))}>
            Start from an example
          </button>
        )}
      </div>
      <Saved />
    </div>
  );
}

function References() {
  const { ws } = useStore();
  const set = (i: number, patch: Partial<{ file: string; purpose: string }>) =>
    updateWs((w) => ({ ...w, references: w.references.map((r, n) => (n === i ? { ...r, ...patch } : r)) }));
  return (
    <div className="grid gap-3">
      <p className="text-sm text-mute">
        Layer 3 files: stable rules, set once. They land in <span className="mono">_config/</span>.
      </p>
      {ws.references.map((r, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[11rem_1fr_auto]">
          <input className="field mono" aria-label={`Reference ${i + 1} file`} placeholder="voice.md" value={r.file} onChange={(e) => set(i, { file: e.target.value })} />
          <input className="field" aria-label={`Reference ${i + 1} purpose`} placeholder="What rules does it hold?" value={r.purpose} onChange={(e) => set(i, { purpose: e.target.value })} />
          <button className="btn !px-3 !py-2" aria-label={`Remove reference ${i + 1}`} onClick={() => updateWs((w) => ({ ...w, references: w.references.filter((_, n) => n !== i) }))}>
            ✕
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {SUGGEST.filter((f) => !ws.references.some((r) => r.file === f)).map((f) => (
          <button key={f} className="btn mono !px-3 !py-1.5 !text-xs" onClick={() => updateWs((w) => ({ ...w, references: [...w.references, { file: f, purpose: '' }] }))}>
            + {f}
          </button>
        ))}
      </div>
      <Saved />
    </div>
  );
}

const blank = () => ({ inputs: '', process: '', outputs: '', verify: '' });
const PH = {
  inputs: '../01_research/output/\n../../_config/voice.md',
  process: 'One instruction per line',
  outputs: 'draft.md -> output/',
  verify: 'Check output against stage n-2 output; flag mismatches',
};

function Contracts() {
  const { ws } = useStore();
  if (!ws.stages.length) return <NeedStages />;
  const get = (i: number) => ws.contracts[i] ?? blank();
  const set = (i: number, k: 'inputs' | 'process' | 'outputs' | 'verify', v: string) =>
    updateWs((w) => {
      const c = w.stages.map((_, n) => w.contracts[n] ?? blank());
      c[i] = { ...c[i], [k]: v };
      return { ...w, contracts: c };
    });
  return (
    <div className="grid gap-4">
      <p className="text-sm text-mute">
        Leave Inputs blank to auto-fill with the previous stage’s <span className="mono">output/</span> plus your <span className="mono">_config/</span> files.
      </p>
      {ws.stages.map((s, i) => (
        <details key={i} className="rounded-xl border border-line p-3" open={i === 0}>
          <summary className="cursor-pointer text-sm font-medium">
            Stage {String(i + 1).padStart(2, '0')} · {s.name || 'unnamed'}
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(['inputs', 'process', 'outputs', 'verify'] as const).map((k) => (
              <div key={k} className={k === 'verify' ? 'sm:col-span-2' : ''}>
                <label className="label" htmlFor={`c${i}${k}`}>
                  {k}
                  {k === 'verify' ? ' (optional)' : ''}
                </label>
                <textarea id={`c${i}${k}`} className="field" value={get(i)[k]} onChange={(e) => set(i, k, e.target.value)} placeholder={PH[k]} />
              </div>
            ))}
          </div>
        </details>
      ))}
      <Saved />
    </div>
  );
}

function Gates() {
  const { ws } = useStore();
  if (!ws.stages.length) return <NeedStages />;
  return (
    <div className="grid gap-2">
      <p className="text-sm text-mute">
        Tick the stages after which a human must review and may edit <span className="mono">output/</span> before the next stage runs.
      </p>
      {ws.stages.map((s, i) => (
        <label key={i} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm">
          <input
            type="checkbox"
            className="accent-[#f5b83d]"
            checked={!!ws.gates[i]}
            onChange={(e) =>
              updateWs((w) => {
                const g = w.stages.map((_, n) => w.gates[n] ?? false);
                g[i] = e.target.checked;
                return { ...w, gates: g };
              })
            }
          />
          Review after <strong>{s.name || `stage ${i + 1}`}</strong>
        </label>
      ))}
      <p className="text-xs text-mute">The paper’s practitioners edited most after the first and last stages. Don’t skip those gates.</p>
      <Saved />
    </div>
  );
}

function SourceFix() {
  const { ws } = useStore();
  return (
    <div>
      <label className="label" htmlFor="sf">
        Standing rule for your CLAUDE.md
      </label>
      <textarea id="sf" className="field" style={{ minHeight: '7rem' }} value={ws.sourceFix} onChange={(e) => updateWs((w) => ({ ...w, sourceFix: e.target.value }))} />
      <p className="mt-2 text-xs text-mute">Editing output fixes this run. Editing the source fixes every run.</p>
      <Saved />
    </div>
  );
}

const map: Record<DogfoodId, () => React.JSX.Element> = {
  workflow: Workflow,
  stages: Stages,
  references: References,
  contracts: Contracts,
  gates: Gates,
  sourcefix: SourceFix,
};

export default function Dogfood({ step }: { step: DogfoodId }) {
  const C = map[step];
  return (
    <div className="rounded-2xl border border-l0/30 bg-l0/[0.04] p-4 sm:p-5">
      <C />
    </div>
  );
}
