import { zipSync, strToU8 } from 'fflate';
import type { Workspace } from './store';

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'stage';

const pad = (n: number) => String(n + 1).padStart(2, '0');
export const stageDir = (ws: Workspace, i: number) => `${pad(i)}_${slug(ws.stages[i]?.name ?? `stage_${i + 1}`)}`;

const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean);
const bullets = (s: string, fallback: string) => {
  const l = lines(s);
  return (l.length ? l : [fallback]).map((x) => `- ${x}`).join('\n');
};

/** Build every file of the learner's workspace as { path: contents }. */
export function generateFiles(ws: Workspace): Record<string, string> {
  const name = ws.name.trim() || 'my-agent-harness';
  const root = slug(name).replace(/_/g, '-');
  const f: Record<string, string> = {};
  const stages = ws.stages.length ? ws.stages : [{ name: 'stage one', job: 'Describe the single job of this stage.' }];
  const w = { ...ws, stages };

  const tree = [
    `${root}/`,
    '  CLAUDE.md            # Layer 0: where am I?',
    '  CONTEXT.md           # Layer 1: where do I go?',
    '  handoff.md           # session state: what happened, what is unresolved',
    '  stages/',
    ...stages.flatMap((_, i) => [
      `    ${stageDir(w, i)}/`,
      '      CONTEXT.md       # Layer 2: what do I do?',
      '      references/      # Layer 3: stage-specific rules',
      '      output/          # Layer 4: this run\'s product',
    ]),
    '  _config/             # Layer 3: factory settings, stable across runs',
    '  shared/              # Layer 3: material used by several stages',
    '  setup/questionnaire.md',
  ].join('\n');

  f['CLAUDE.md'] = `# ${name}

${ws.goal.trim() || 'State in one sentence what this workspace produces.'}

## Where am I?
This folder is an ICM workspace (Interpretable Context Methodology). One agent does all the work by reading the right files at the right moment.

\`\`\`
${tree}
\`\`\`

## Rules
1. Read \`CONTEXT.md\` first to decide which stage to run.
2. Run **one stage at a time**. Inside a stage, read its \`CONTEXT.md\` and load **only** the files in its Inputs list.
3. Write results to that stage's \`output/\` folder, then **stop** for human review${
    w.gates.some(Boolean)
      ? ` (gates after: ${stages.filter((_, i) => w.gates[i]).map((s) => s.name).join(', ')})`
      : ''
  }.
4. Always read the stage's \`output/\` from the previous stage as it is on disk: the human may have edited it.
5. Do mechanical work (fetching, moving, formatting) with scripts, not with the model.
6. Source-fix rule: ${ws.sourceFix.trim() || 'Prefer fixing sources over patching outputs.'}
7. At the end of a session, update \`handoff.md\`.
`;

  f['CONTEXT.md'] = `# Routing

| If the user wants to… | Go to | Output |
|---|---|---|
${stages.map((s, i) => `| ${s.job.trim() || s.name} | \`stages/${stageDir(w, i)}/CONTEXT.md\` | \`stages/${stageDir(w, i)}/output/\` |`).join('\n')}

## Shared resources
- \`_config/\`: ${ws.references.length ? ws.references.map((r) => r.file || 'file.md').join(', ') : 'factory settings (voice, conventions)'}
- \`shared/\`: material several stages use

## Order
Stages run in folder-number order. The output of stage N is the working input of stage N+1.
`;

  f['handoff.md'] = `# Handoff

## Last session
- (what was done)

## Unresolved
- (open questions, failed runs, things a human must decide)

## Next stage to run
- ${stageDir(w, 0)}
`;

  stages.forEach((s, i) => {
    const dir = `stages/${stageDir(w, i)}`;
    const c = ws.contracts[i] ?? { inputs: '', process: '', outputs: '', verify: '' };
    const prev = i > 0 ? `- Layer 4 (working): ../${stageDir(w, i - 1)}/output/` : '- Layer 4 (working): the brief the user provides for this run';
    const cfg = ws.references.map((r) => `- Layer 3 (reference): ../../_config/${r.file || 'file.md'}`);
    const inputs = lines(c.inputs).length ? bullets(c.inputs, '') : [prev, ...cfg].join('\n');
    f[`${dir}/CONTEXT.md`] = `# Stage ${pad(i)}: ${s.name || 'Unnamed stage'}

> One stage, one job: ${s.job.trim() || '(describe the single job)'}

## Inputs
${inputs}

## Process
${bullets(c.process, s.job.trim() || 'Describe what the agent does.')}

## Outputs
${bullets(c.outputs, `stage_${pad(i)}_result.md -> output/`)}
${
  c.verify.trim()
    ? `
## Verify
${bullets(c.verify, '')}
`
    : ''
}
## Review gate
${w.gates[i] ? '**Stop here.** A human reviews and may edit `output/` before the next stage runs.' : 'No mandatory stop. The human may still inspect `output/`.'}
`;
    f[`${dir}/references/README.md`] = `Layer 3 material for this stage only (templates, examples, checklists).\n`;
    f[`${dir}/output/.gitkeep`] = '';
  });

  (ws.references.length ? ws.references : [{ file: 'voice.md', purpose: 'Tone and style rules' }]).forEach((r) => {
    f[`_config/${r.file || 'file.md'}`] = `# ${r.file || 'file.md'}\n\n${r.purpose.trim() || 'Describe the stable rule set here.'}\n\n<!-- Layer 3: configure once, reuse every run. -->\n`;
  });
  f['shared/README.md'] = 'Layer 3 material that several stages read. Give big collections their own CONTEXT.md router.\n';
  f['setup/questionnaire.md'] = `# Setup questionnaire

Answer once when creating or duplicating this workspace. Your answers update the files in \`_config/\`.

1. Who is the audience for the output?
2. What tone should it have? Give two examples you like.
3. What must never appear?
4. Where do you want to review: after which stages?
`;
  return f;
}

export function downloadZip(ws: Workspace) {
  const files = generateFiles(ws);
  const root = slug(ws.name.trim() || 'my-agent-harness').replace(/_/g, '-');
  const data: Record<string, Uint8Array> = {};
  for (const [p, c] of Object.entries(files)) data[`${root}/${p}`] = strToU8(c);
  const blob = new Blob([zipSync(data) as BlobPart], { type: 'application/zip' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${root}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
