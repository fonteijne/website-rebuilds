import { useState } from 'react';

const LAYERS = [
  { name: 'CLAUDE.md & instructions', who: 'The model', color: 'var(--color-mute)', stops: 'Honest mistakes, when the model remembers and agrees.', misses: 'Anything an injection or a long context makes it forget. Nothing is enforced.' },
  { name: 'Permission rules & modes', who: 'Claude Code', color: 'var(--color-info)', stops: 'Tool calls that match a deny or ask rule, as written. Every tool: Bash, Read, Edit, WebFetch, MCP.', misses: 'The same program spelled differently: /usr/bin/curl, sh -c, a script that does the work.' },
  { name: 'Hooks', who: 'Your code', color: 'var(--color-warn)', stops: 'Whatever your script recognises in the full tool input, every time the event fires.', misses: 'Cases you didn’t anticipate. And a crashing hook that exits 1 lets the call through.' },
  { name: 'Bash sandbox', who: 'The OS (Seatbelt / bubblewrap)', color: 'var(--color-guard)', stops: 'Writes outside the project and hosts not on the allowlist, however the command is spelled.', misses: 'Read/Edit tools, MCP servers and hooks (they run outside it). Reads are wide by default.' },
  { name: 'Isolated environment', who: 'Container · VM · cloud', color: 'var(--color-ios)', stops: 'Reaching your host at all: your keychain, home folder, other repos, local network.', misses: 'Anything inside the box, including the project it can still change and push.' },
];

export default function Ladder() {
  const [i, setI] = useState(1);
  const l = LAYERS[i];
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <ol className="space-y-1.5" aria-label="Defense layers">
        {LAYERS.map((x, n) => (
          <li key={x.name}>
            <button
              onClick={() => setI(n)}
              aria-pressed={i === n}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${i === n ? 'bg-white/[0.06]' : 'border-line hover:border-white/25'}`}
              style={{ borderColor: i === n ? x.color : undefined, marginLeft: `${n * 6}px`, width: `calc(100% - ${n * 6}px)` }}
            >
              <span className="mono text-xs" style={{ color: x.color }}>
                L{n}
              </span>
              <span className="font-medium">{x.name}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-line p-4 text-sm leading-relaxed" role="status">
        <div className="mono text-xs text-mute">enforced by: {l.who}</div>
        <h4 className="mt-1 text-lg font-semibold" style={{ color: l.color }}>
          {l.name}
        </h4>
        <p className="mt-3">
          <strong className="text-ok">Stops · </strong>
          {l.stops}
        </p>
        <p className="mt-2">
          <strong className="text-bad">Misses · </strong>
          {l.misses}
        </p>
      </div>
    </div>
  );
}
