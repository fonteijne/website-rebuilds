import { useState } from 'react';

type K = 'local' | 'tel' | 'err' | 'ness' | 'wf' | 'upd' | 'mkt' | 'mcp';
const TOGGLES: [K, string][] = [
  ['local', 'ANTHROPIC_BASE_URL → 127.0.0.1'],
  ['tel', 'DISABLE_TELEMETRY=1'],
  ['err', 'DISABLE_ERROR_REPORTING=1'],
  ['ness', 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1'],
  ['wf', '"skipWebFetchPreflight": true'],
  ['upd', 'DISABLE_AUTOUPDATER=1'],
  ['mkt', 'CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1'],
  ['mcp', 'ENABLE_CLAUDEAI_MCP_SERVERS=false'],
];

type S = Record<K, boolean>;
// Rows and conditions follow the Network configuration, Data usage and LLM gateway pages of the Claude Code docs.
const ROWS: { what: string; host: (s: S) => string; on: (s: S) => boolean; note?: string }[] = [
  { what: 'Model requests', host: (s) => (s.local ? '127.0.0.1:11434' : 'api.anthropic.com'), on: (s) => !s.local },
  { what: 'Telemetry events', host: () => 'api.anthropic.com, http-intake.logs.us5.datadoghq.com', on: (s) => !s.tel && !s.ness, note: 'Still sent with a custom base URL' },
  { what: 'Error reports', host: () => 'browser-intake-us5-datadoghq.com', on: (s) => !s.err && !s.tel && !s.ness && !s.local, note: 'Only Pro/Max sign-ins on the direct API' },
  { what: 'Feature flags', host: () => 'api.anthropic.com', on: (s) => !s.tel && !s.ness },
  { what: 'WebFetch safety check', host: () => 'api.anthropic.com', on: (s) => !s.wf, note: 'Not covered by the master switch' },
  { what: 'Auto-update and version checks', host: () => 'downloads.claude.ai', on: (s) => !s.upd && !s.ness },
  { what: 'Release notes feed', host: () => 'raw.githubusercontent.com', on: (s) => !s.ness },
  { what: 'Fast mode availability check', host: () => 'api.anthropic.com', on: (s) => !s.ness, note: 'Ignores ANTHROPIC_BASE_URL' },
  { what: 'Official plugin marketplace', host: () => 'github.com', on: (s) => !s.mkt, note: 'Registered on first interactive launch' },
  { what: 'claude.ai MCP connectors', host: () => 'mcp-proxy.anthropic.com', on: (s) => !s.mcp && !s.local, note: 'Only for claude.ai sign-ins' },
];

export default function Traffic() {
  const [s, setS] = useState<S>({ local: true, tel: false, err: false, ness: false, wf: false, upd: false, mkt: false, mcp: false });
  const out = ROWS.filter((r) => r.on(s)).length;
  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <fieldset className="space-y-1.5">
        <legend className="label">Settings</legend>
        {TOGGLES.map(([k, l]) => (
          <label key={k} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line px-3 py-2 text-[13px] hover:border-white/25">
            <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-[var(--color-air)]" checked={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.checked })} />
            <span className="mono min-w-0 [overflow-wrap:anywhere]">{l}</span>
          </label>
        ))}
      </fieldset>
      <div className="min-w-0">
        <div className="mb-2 flex items-baseline justify-between" role="status">
          <span className="label !mb-0">Leaves the Mac</span>
          <span className={`mono text-sm font-semibold ${out ? 'text-air' : 'text-ok'}`}>{out ? `${out} kind${out > 1 ? 's' : ''} of traffic` : 'nothing listed'}</span>
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line text-sm">
          {ROWS.map((r) => {
            const on = r.on(s);
            return (
              <li key={r.what} className={`px-3 py-2 ${on ? '' : 'opacity-45'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.what}</span>
                  <span className={`mono shrink-0 text-[11px] font-semibold ${on ? 'text-air' : 'text-ok'}`}>{on ? 'OUT' : 'off'}</span>
                </div>
                <div className="mono text-[11px] text-mute [overflow-wrap:anywhere]">
                  {r.host(s)}
                  {r.note && <span className="not-italic"> · {r.note}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-mute">Claude Code only. Xcode, the model server and any MCP servers have their own traffic.</p>
      </div>
    </div>
  );
}
