import { useState } from 'react';
import { Tabs } from './ui';

type Doc = 'yes' | 'partly' | 'no';
const ROUTES: { id: string; name: string; local: string; telemetry: string; policy: string; doc: Doc; docNote: string }[] = [
  { id: 'A', name: 'Claude Agent in Xcode', local: 'env block in ClaudeAgentConfig/settings.json', telemetry: 'Same env block (DISABLE_TELEMETRY, …)', policy: 'Xcode MDM: assistant on/off. Claude Code managed settings: unverified', doc: 'no', docNote: 'Config folder is Apple-documented; env and base URL there are not' },
  { id: 'B', name: 'Codex in Xcode', local: 'Custom model_provider in codex/config.toml (Responses API)', telemetry: 'analytics.enabled, feedback.enabled, check_for_update_on_startup', policy: 'Xcode MDM: assistant on/off', doc: 'partly', docNote: 'Codex keys documented by OpenAI; Xcode honouring them is not' },
  { id: 'C', name: 'ACP agent', local: 'Wrapper script exports the endpoint, then execs the agent', telemetry: 'The agent’s own switches, exported by the wrapper', policy: 'Xcode MDM: assistant on/off', doc: 'partly', docNote: '“Add an Agent” is Apple-documented; the env workaround comes from vendor docs' },
  { id: 'D', name: 'Locally hosted chat', local: 'Port of Ollama or LM Studio (/v1/models, /v1/chat/completions)', telemetry: 'No agent; the model server’s own settings', policy: 'Xcode MDM: assistant on/off', doc: 'yes', docNote: 'Apple-documented, but chat only: no tools or builds' },
  { id: 'E', name: 'Claude Code + mcpbridge', local: 'ANTHROPIC_BASE_URL', telemetry: 'env block, managed settings', policy: 'allowedProviders ["customEndpoint"] + pinned managed env', doc: 'yes', docNote: 'Every step documented by Anthropic and Apple' },
];
const DOC: Record<Doc, [string, string]> = { yes: ['documented', 'var(--color-ok)'], partly: ['partly documented', 'var(--color-warn)'], no: ['verify yourself', 'var(--color-bad)'] };

export default function Routes() {
  const [id, setId] = useState('E');
  const r = ROUTES.find((x) => x.id === id)!;
  return (
    <div>
      <Tabs label="Route" value={id} onChange={setId} options={ROUTES.map((x) => [x.id, `${x.id} · ${x.name}`])} />
      <dl className="grid gap-x-4 gap-y-2.5 rounded-xl border border-air/30 bg-air/[0.05] p-4 text-sm sm:grid-cols-[9rem_1fr]" role="status">
        <dt className="mono text-xs uppercase tracking-wider text-air">Local model</dt>
        <dd className="[overflow-wrap:anywhere]">{r.local}</dd>
        <dt className="mono text-xs uppercase tracking-wider text-air">Telemetry off</dt>
        <dd className="[overflow-wrap:anywhere]">{r.telemetry}</dd>
        <dt className="mono text-xs uppercase tracking-wider text-air">Enforce by policy</dt>
        <dd>{r.policy}</dd>
        <dt className="mono text-xs uppercase tracking-wider text-air">Documented</dt>
        <dd>
          <span className="mono mr-2 text-[11px] font-semibold" style={{ color: DOC[r.doc][1] }}>
            {DOC[r.doc][0]}
          </span>
          <span className="text-mute">{r.docNote}</span>
        </dd>
      </dl>
    </div>
  );
}
