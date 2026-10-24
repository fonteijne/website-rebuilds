import { useState } from 'react';
import { Tabs } from './ui';

const ROWS = [
  { id: 'bash', name: 'Bash sandbox', iso: 'Shell commands and their children', docker: 'No', effort: 'Minimal (macOS) · low (Linux)', mac: true },
  { id: 'srt', name: 'Sandbox runtime (srt)', iso: 'The whole Claude Code process: file tools, MCP, hooks', docker: 'No', effort: 'Low', mac: true },
  { id: 'dev', name: 'Dev container', iso: 'Full development environment', docker: 'Yes', effort: 'Medium', mac: false },
  { id: 'custom', name: 'Custom container', iso: 'Full development environment', docker: 'Yes', effort: 'Medium to high', mac: false },
  { id: 'vm', name: 'Virtual machine', iso: 'A full operating system, own kernel', docker: 'No', effort: 'High', mac: true },
  { id: 'cloud', name: 'Cloud session', iso: 'A full OS, hosted by Anthropic', docker: 'No', effort: 'None', mac: false },
];

type Goal = 'prompts' | 'unattended' | 'nodocker' | 'untrusted' | 'team';
const GOALS: [Goal, string, string[], string][] = [
  ['prompts', 'Fewer prompts, my machine', ['bash'], 'Turn on /sandbox: walls replace most prompts for everyday work.'],
  ['unattended', 'Unattended / bypass', ['srt', 'dev', 'custom', 'vm'], 'The whole process must be inside: the Bash sandbox alone is not enough.'],
  ['nodocker', 'Contain MCP + hooks, no Docker', ['srt'], 'The sandbox runtime wraps everything with the same OS primitives.'],
  ['untrusted', 'Untrusted repository', ['vm', 'cloud'], 'Separate machine. It may ship hooks and MCP servers of its own.'],
  ['team', 'Same setup for the team', ['dev'], 'Commit the reference dev container. A convention, not enforcement.'],
];

export default function Envs() {
  const [g, setG] = useState<Goal>('unattended');
  const goal = GOALS.find((x) => x[0] === g)!;
  return (
    <div>
      <Tabs label="Your goal" value={g} onChange={setG} options={GOALS.map(([id, l]) => [id, l])} />
      <p className="mb-3 text-sm" role="status">
        {goal[3]}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-mute">
              <th className="py-2 pr-3 font-semibold">Approach</th>
              <th className="py-2 pr-3 font-semibold">What is isolated</th>
              <th className="py-2 pr-3 font-semibold">Docker</th>
              <th className="py-2 pr-3 font-semibold">Setup</th>
              <th className="py-2 font-semibold text-ios">Builds iOS?</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const on = goal[2].includes(r.id);
              return (
                <tr key={r.id} className={`border-t border-line align-top transition-colors ${on ? 'bg-guard/[0.08]' : 'opacity-60'}`}>
                  <td className="py-2.5 pr-3 font-medium">
                    {on && <span className="mr-1 text-guard">▸</span>}
                    {r.name}
                  </td>
                  <td className="py-2.5 pr-3 text-mute">{r.iso}</td>
                  <td className="py-2.5 pr-3">{r.docker}</td>
                  <td className="py-2.5 pr-3">{r.effort}</td>
                  <td className="py-2.5">{r.mac ? (r.id === 'vm' ? 'macOS VM' : 'On a Mac') : 'No (Linux)'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
