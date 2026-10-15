import { useState } from 'react';

interface Node {
  p: string;
  depth: number;
  layer?: 0 | 1 | 2 | 3 | 4;
  note: string;
  loaded: [boolean, boolean, boolean];
}
const COLORS = ['var(--color-l0)', 'var(--color-l1)', 'var(--color-l2)', 'var(--color-l3)', 'var(--color-l4)'];

// loaded[n] = would the agent load this while running stage n+1 (illustrative, following the paper's example contract)
const T = (p: string, depth: number, layer: Node['layer'], note: string, loaded: Node['loaded']): Node => ({ p, depth, layer, note, loaded });
const NODES: Node[] = [
  T('workspace/', 0, undefined, 'The whole thing is a folder. Copy it and you have copied the system.', [false, false, false]),
  T('CLAUDE.md', 1, 0, 'Layer 0: which workspace am I in, what is here, where do I look?', [true, true, true]),
  T('CONTEXT.md', 1, 1, 'Layer 1: task routing. Which stage handles what the user wants?', [true, true, true]),
  T('stages/', 1, undefined, 'Numbered stage folders. The number is the execution order.', [false, false, false]),
  T('01_research/', 2, undefined, 'Stage 1: one job, topic brief → structured research.', [false, false, false]),
  T('CONTEXT.md', 3, 2, 'Layer 2: stage 1 contract (Inputs · Process · Outputs).', [true, false, false]),
  T('references/', 3, 3, 'Layer 3: stage-specific reference material.', [true, false, false]),
  T('output/', 3, 4, 'Layer 4: research output. The handoff to stage 2, and an edit surface.', [false, true, false]),
  T('02_script/', 2, undefined, 'Stage 2: research → script.', [false, false, false]),
  T('CONTEXT.md', 3, 2, 'Layer 2: stage 2 contract.', [false, true, false]),
  T('references/', 3, 3, 'Layer 3: structure template.', [false, true, false]),
  T('output/', 3, 4, 'Layer 4: script draft. Handoff to stage 3.', [false, false, true]),
  T('03_production/', 2, undefined, 'Stage 3: script → animation spec and code.', [false, false, false]),
  T('CONTEXT.md', 3, 2, 'Layer 2: stage 3 contract.', [false, false, true]),
  T('references/', 3, 3, 'Layer 3: stage-specific production rules.', [false, false, true]),
  T('output/', 3, 4, 'Layer 4: final deliverable.', [false, false, false]),
  T('_config/', 1, 3, 'Layer 3: the factory. Voice, design system, conventions. Set up once.', [false, true, true]),
  T('shared/', 1, 3, 'Layer 3: material several stages use. Only loaded if a contract lists it.', [false, false, false]),
  T('setup/questionnaire.md', 1, undefined, 'The setup questions that fill _config/ when the workspace is created.', [false, false, false]),
];

export default function Tree() {
  const [stage, setStage] = useState<0 | 1 | 2 | -1>(-1);
  const [sel, setSel] = useState(1);
  const n = NODES[sel];
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Agent is running:</span>
        {[-1, 0, 1, 2].map((s) => (
          <button key={s} onClick={() => setStage(s as typeof stage)} className={`rounded-full border px-3 py-1 ${stage === s ? 'border-l0 bg-l0/10' : 'border-line text-mute'}`}>
            {s === -1 ? 'nothing (colour by layer)' : `stage 0${s + 1}`}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="mono overflow-x-auto rounded-xl border border-line bg-bg p-3 text-[13px] leading-7" role="tree">
          {NODES.map((x, i) => {
            const on = stage === -1 ? true : x.loaded[stage];
            return (
              <button
                key={i}
                role="treeitem"
                aria-selected={sel === i}
                onClick={() => setSel(i)}
                className={`block w-full whitespace-pre rounded px-2 text-left transition-opacity ${sel === i ? 'bg-white/10' : 'hover:bg-white/5'}`}
                style={{
                  paddingLeft: `${x.depth * 18 + 8}px`,
                  color: x.layer === undefined ? 'var(--color-ink)' : COLORS[x.layer],
                  opacity: on || x.layer === undefined ? 1 : 0.25,
                }}
              >
                {x.p}
                {x.layer !== undefined && <span className="ml-2 text-[11px] opacity-70">L{x.layer}</span>}
                {stage !== -1 && x.loaded[stage] && <span className="ml-2 text-[11px] text-l4">● loaded</span>}
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-line p-4">
          <div className="mono text-sm" style={{ color: n.layer === undefined ? undefined : COLORS[n.layer] }}>
            {n.p} {n.layer !== undefined && `· Layer ${n.layer}`}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/85">{n.note}</p>
          {stage !== -1 && (
            <p className="mt-3 text-xs text-mute">
              Dimmed files are never loaded while stage 0{stage + 1} runs. That is how context is scoped. (Illustrative, following the paper’s example contract.)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
