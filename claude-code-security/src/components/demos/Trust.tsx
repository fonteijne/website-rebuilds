import { useState } from 'react';
import { Tabs } from './ui';

type Run = 'parent' | 'headless';
type Cell = { t: string; bad?: boolean };
// "What runs before you trust a folder", Permissions docs.
const ROWS: { what: string; parent: Cell; headless: Cell }[] = [
  { what: 'Hooks in settings files, the env block, helper commands like apiKeyHelper', parent: { t: 'Used', bad: true }, headless: { t: 'Used', bad: true } },
  { what: 'permissions.allow and additionalDirectories from .claude/settings.json', parent: { t: 'Held until you accept the trust dialog' }, headless: { t: 'Not used (warning on stderr)' } },
  { what: 'deny and ask rules from the repo', parent: { t: 'Applied: they only restrict' }, headless: { t: 'Applied: they only restrict' } },
  { what: 'Hooks in project subagent frontmatter, project plugins', parent: { t: 'Not used' }, headless: { t: 'Not used' } },
  { what: 'Servers in .mcp.json', parent: { t: 'Asks before connecting' }, headless: { t: 'Connected without asking', bad: true } },
];

export default function Trust() {
  const [r, setR] = useState<Run>('headless');
  return (
    <div>
      <Tabs
        label="How you started Claude Code"
        value={r}
        onChange={setR}
        options={[
          ['parent', 'Interactive, trusted only a parent folder'],
          ['headless', 'claude -p / SDK, never trusted'],
        ]}
      />
      <ul className="divide-y divide-line rounded-xl border border-line">
        {ROWS.map((x) => {
          const c = x[r];
          return (
            <li key={x.what} className="grid gap-1 px-3 py-2.5 text-sm sm:grid-cols-[1.4fr_1fr] sm:gap-4">
              <span>{x.what}</span>
              <span className={`mono text-[13px] ${c.bad ? 'text-bad' : 'text-ok'}`}>{c.t}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-mute">In an untrusted folder an interactive session shows the trust dialog before it starts.</p>
    </div>
  );
}
