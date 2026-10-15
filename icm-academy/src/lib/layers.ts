export interface LayerInfo {
  n: 0 | 1 | 2 | 3 | 4;
  name: string;
  question: string;
  file: string;
  tokens: string;
  kind: 'Structural (routing)' | 'Content';
  color: string;
  body: string;
  example: string;
}

export const LAYERS: LayerInfo[] = [
  {
    n: 0,
    name: 'Identity',
    question: 'Where am I?',
    file: 'CLAUDE.md',
    tokens: '~800 tok',
    kind: 'Structural (routing)',
    color: 'var(--color-l0)',
    body: 'Global identity: which workspace this is, what the folders contain, where to find things.',
    example: '# Video Studio\nThis workspace turns a topic brief into an animated video.\nRead CONTEXT.md to choose a stage.',
  },
  {
    n: 1,
    name: 'Routing',
    question: 'Where do I go?',
    file: 'CONTEXT.md',
    tokens: '~300 tok',
    kind: 'Structural (routing)',
    color: 'var(--color-l1)',
    body: 'Workspace-level task routing: given what the user wants, which stage handles it and what shared resources exist.',
    example: '| Want to… | Go to |\n| research a topic | stages/01_research |\n| write the script | stages/02_script |',
  },
  {
    n: 2,
    name: 'Stage contract',
    question: 'What do I do?',
    file: 'stages/NN_name/CONTEXT.md',
    tokens: '200–500 tok',
    kind: 'Structural (routing)',
    color: 'var(--color-l2)',
    body: 'The contract for one step: Inputs, Process, Outputs. The control point of the whole system.',
    example: '## Inputs\n- Layer 4: ../01_research/output/\n- Layer 3: ../../_config/voice.md\n## Process\nWrite a script…\n## Outputs\n- script_draft.md -> output/',
  },
  {
    n: 3,
    name: 'Reference',
    question: 'What rules apply?',
    file: '_config/ · references/ · shared/',
    tokens: '500–2k tok',
    kind: 'Content',
    color: 'var(--color-l3)',
    body: 'The factory: voice, design system, conventions, domain knowledge. Stable across runs. Internalise as constraints.',
    example: 'voice.md\ndesign-system.md\nconventions.md',
  },
  {
    n: 4,
    name: 'Working artifacts',
    question: 'What am I working with?',
    file: 'output/',
    tokens: 'varies',
    kind: 'Content',
    color: 'var(--color-l4)',
    body: 'The product: this run’s source material and the previous stage’s output. Changes every run. Process as input.',
    example: 'research-output.md\nscript-draft.md',
  },
];
