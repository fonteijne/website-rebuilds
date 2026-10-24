import { useState } from 'react';
import { Badge, Tabs, type Verdict } from './ui';

type Mode = 'default' | 'acceptEdits' | 'plan' | 'auto' | 'dontAsk' | 'bypassPermissions';

const ACTIONS = ['Read a file in the project', 'Edit a file in the project', 'ls / git status', 'npm test', 'curl https://api.example.com', 'Write .git/hooks/pre-commit', 'rm -rf ~ (critical path)'];

// Rows follow the Permission modes docs, for calls that no allow/ask/deny rule matches.
const M: Record<Mode, { label: string; note: string; v: [Verdict, string?][] }> = {
  default: {
    label: 'Manual',
    note: 'Starts read-only. Everything else asks the first time; “don’t ask again” saves an allow rule.',
    v: [['runs'], ['prompts'], ['runs', 'read-only set'], ['prompts'], ['prompts'], ['prompts', 'protected path'], ['prompts']],
  },
  acceptEdits: {
    label: 'acceptEdits',
    note: 'Edits and mkdir/touch/rm/mv/cp/sed in the working directory run. Other commands still ask.',
    v: [['runs'], ['runs'], ['runs'], ['prompts'], ['prompts'], ['prompts', 'protected path'], ['prompts', 'never auto']],
  },
  plan: {
    label: 'Plan',
    note: 'Explore and plan. Source edits wait for your approval of the plan. With auto mode available, the classifier reviews other commands.',
    v: [['runs'], ['blocked', 'until plan approved'], ['runs'], ['prompts', 'or classifier'], ['prompts', 'or classifier'], ['blocked', 'until plan approved'], ['prompts', 'never auto']],
  },
  auto: {
    label: 'Auto',
    note: 'Reads and project edits run. Everything else goes to a classifier that checks it matches your request.',
    v: [['runs'], ['runs'], ['runs'], ['classifier'], ['classifier'], ['classifier', 'protected path'], ['prompts', 'never auto']],
  },
  dontAsk: {
    label: 'dontAsk',
    note: 'Anything that would prompt is refused. Only pre-approved tools run. Built for CI.',
    v: [['runs'], ['blocked'], ['runs'], ['blocked', 'unless allowed'], ['blocked', 'unless allowed'], ['blocked'], ['blocked']],
  },
  bypassPermissions: {
    label: 'Bypass',
    note: 'No prompts, protected paths included. Deny rules still block. Containers and VMs only.',
    v: [['runs'], ['runs'], ['runs'], ['runs'], ['runs'], ['runs'], ['prompts', 'never auto']],
  },
};

export default function Modes() {
  const [m, setM] = useState<Mode>('default');
  const row = M[m];
  return (
    <div>
      <Tabs label="Permission mode" value={m} onChange={setM} options={(Object.keys(M) as Mode[]).map((k) => [k, M[k].label])} />
      <p className="mb-3 text-sm text-mute" role="status">
        {row.note}
      </p>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {ACTIONS.map((a, i) => (
          <li key={a} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
            <span className="mono text-[13px]">{a}</span>
            <span className="flex items-center gap-2">
              {row.v[i][1] && <span className="text-xs text-mute">{row.v[i][1]}</span>}
              <Badge v={row.v[i][0]} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-mute">A matching deny rule blocks in every mode. A matching ask rule prompts in every mode, bypass included.</p>
    </div>
  );
}
