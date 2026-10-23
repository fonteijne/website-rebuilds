import { useState } from 'react';

const FILES = [
  { p: '../01_research/output/', layer: 4, tok: 2100, good: true },
  { p: '../../_config/voice.md', layer: 3, tok: 600, good: true },
  { p: 'references/structure.md', layer: 3, tok: 400, good: true },
  { p: '../../_config/design-system.md', layer: 3, tok: 900, good: false },
  { p: '../03_production/output/', layer: 4, tok: 1800, good: false },
  { p: '../../shared/all-brand-assets/', layer: 3, tok: 6500, good: false },
];
const BASE = 1500; // layers 0–2

export default function Contract() {
  const [on, setOn] = useState<boolean[]>(FILES.map((f) => f.good));
  const total = BASE + FILES.reduce((a, f, i) => a + (on[i] ? f.tok : 0), 0);
  const bad = FILES.filter((f, i) => on[i] && !f.good);
  const missing = FILES.filter((f, i) => !on[i] && f.good);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="label">Stage 02_script · tick what it should read</div>
        <ul className="space-y-1.5">
          {FILES.map((f, i) => (
            <li key={f.p}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-white/30 has-[:checked]:bg-white/[0.04]">
                <input type="checkbox" className="accent-[#f5b83d]" checked={on[i]} onChange={() => setOn(on.map((x, n) => (n === i ? !x : x)))} />
                <span className="mono flex-1 text-[12px]">{f.p}</span>
                <span className="mono text-[11px]" style={{ color: f.layer === 3 ? 'var(--color-l3)' : 'var(--color-l4)' }}>
                  L{f.layer} · {f.tok >= 1000 ? `${(f.tok / 1000).toFixed(1)}k` : f.tok}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="label">02_script/CONTEXT.md</div>
        <pre className="mono overflow-x-auto rounded-xl border border-line bg-bg p-3 text-[12px] leading-6">
{`## Inputs
${FILES.filter((_, i) => on[i]).map((f) => `- Layer ${f.layer} (${f.layer === 3 ? 'reference' : 'working'}): ${f.p}`).join('\n') || '- (nothing: the agent will guess!)'}

## Process
Write a script based on the research.
Follow structure.md. Match voice.md.

## Outputs
- script_draft.md -> output/`}
        </pre>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="mono text-2xl font-semibold">~{(total / 1000).toFixed(1)}k</span>
          <span className="text-sm text-mute">tokens delivered</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed" role="status">
          {missing.length > 0 && <span className="text-l2">Missing: {missing.map((m) => m.p).join(', ')}. The agent will have to guess or invent. </span>}
          {bad.length > 0 && <span className="text-l0">Not needed here: {bad.map((m) => m.p).join(', ')}. That is noise, and a later stage may even overwrite it. </span>}
          {missing.length === 0 && bad.length === 0 && <span className="text-l4">Tight contract: exactly what the stage needs, nothing else.</span>}
        </p>
      </div>
    </div>
  );
}
