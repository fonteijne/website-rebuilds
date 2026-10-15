import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { downloadZip, generateFiles } from '../lib/generate';
import { href } from '../lib/route';
import Dogfood from './dogfood';
import type { DogfoodId } from '../content/types';

const STEPS: { id: DogfoodId; title: string; hint: string }[] = [
  { id: 'workflow', title: '1 · Workflow', hint: 'CLAUDE.md · Layer 0' },
  { id: 'stages', title: '2 · Stages', hint: 'Numbered folders' },
  { id: 'references', title: '3 · Reference files', hint: '_config/ · Layer 3' },
  { id: 'contracts', title: '4 · Stage contracts', hint: 'CONTEXT.md · Layer 2' },
  { id: 'gates', title: '5 · Review gates', hint: 'Human edit surfaces' },
  { id: 'sourcefix', title: '6 · Source-fix rule', hint: 'Edit the source' },
];

const layerOf = (p: string) =>
  p === 'CLAUDE.md' ? 'var(--color-l0)' : p === 'CONTEXT.md' ? 'var(--color-l1)' : /stages\/.*\/CONTEXT\.md$/.test(p) ? 'var(--color-l2)' : /^(_config|shared)|references/.test(p) ? 'var(--color-l3)' : /output/.test(p) ? 'var(--color-l4)' : 'var(--color-mute)';

export default function Builder() {
  const { ws } = useStore();
  const files = useMemo(() => generateFiles(ws), [ws]);
  const paths = Object.keys(files).filter((p) => !p.endsWith('.gitkeep'));
  const [sel, setSel] = useState('CLAUDE.md');
  const [open, setOpen] = useState<DogfoodId>('workflow');
  const current = files[sel] !== undefined ? sel : 'CLAUDE.md';

  // Same checks as the paper's workspace-builder "validation" stage: does the pipeline hang together?
  const checks = [
    ['Named, with a one-sentence goal', !!ws.name.trim() && !!ws.goal.trim()],
    ['Passes the sequential · reviewable · repeatable test', ws.fit.seq && ws.fit.rev && ws.fit.rep],
    ['At least two stages, each with a name and one job', ws.stages.length >= 2 && ws.stages.every((s) => s.name.trim() && s.job.trim())],
    ['No stage job that smells like two jobs', ws.stages.length > 0 && ws.stages.every((s) => !(/\band\b|&|,/.test(s.job) && s.job.length > 8))],
    ['At least one Layer 3 reference file', ws.references.length > 0],
    ['Every stage has Process and Outputs defined', ws.stages.length > 0 && ws.stages.every((_, i) => ws.contracts[i]?.process.trim() && ws.contracts[i]?.outputs.trim())],
    ['A review gate after the first and last stage', ws.stages.length > 1 && !!ws.gates[0] && !!ws.gates[ws.stages.length - 1]],
  ] as const;
  const ok = checks.filter((c) => c[1]).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mono text-sm text-l0">The dogfood capstone</div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">Harness Builder</h1>
      <p className="mt-2 max-w-2xl text-mute">
        Fill in the six steps (the same forms you meet in the modules). The folder on the right is generated live. When it’s healthy, download it, open it in Claude Code, and run stage one.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {STEPS.map((s) => (
            <section key={s.id} className="panel overflow-hidden">
              <button className="flex w-full items-center justify-between px-4 py-3.5 text-left" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? ('' as DogfoodId) : s.id)}>
                <span className="font-medium">{s.title}</span>
                <span className="mono text-xs text-mute">{s.hint}</span>
              </button>
              {open === s.id && (
                <div className="px-4 pb-4">
                  <Dogfood step={s.id} />
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="space-y-4">
          <section className="panel p-4" aria-label="Readiness">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Validation</h2>
              <span className="mono text-sm text-mute">{ok}/{checks.length}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {checks.map(([l, pass]) => (
                <li key={l} className="flex gap-2.5">
                  <span className={pass ? 'text-l4' : 'text-mute'} aria-hidden>{pass ? '✓' : '○'}</span>
                  <span className={pass ? '' : 'text-mute'}>{l}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary mt-4 w-full justify-center" onClick={() => downloadZip(ws)}>
              Download {ws.name.trim() ? ws.name.trim() : 'my-agent-harness'}.zip
            </button>
            {ok < checks.length && <p className="mt-2 text-xs text-mute">You can download any time. The checks tell you where the harness is still thin.</p>}
          </section>

          <section className="panel overflow-hidden" aria-label="Generated files">
            <div className="grid sm:grid-cols-[13rem_1fr]">
              <ul className="mono max-h-80 overflow-auto border-b border-line p-2 text-[12px] sm:border-b-0 sm:border-r">
                {paths.map((p) => (
                  <li key={p}>
                    <button onClick={() => setSel(p)} className={`w-full truncate rounded px-2 py-1 text-left ${current === p ? 'bg-white/10' : 'hover:bg-white/5'}`} style={{ color: layerOf(p) }} title={p}>
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
              <pre className="mono max-h-80 overflow-auto whitespace-pre-wrap p-4 text-[12px] leading-6 text-ink/90">{files[current]}</pre>
            </div>
          </section>

          <p className="text-sm text-mute">
            Stuck on a step? Revisit <a className="underline" href={href.module('layers')}>the layers</a> or <a className="underline" href={href.module('anatomy')}>the anatomy of a workspace</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
