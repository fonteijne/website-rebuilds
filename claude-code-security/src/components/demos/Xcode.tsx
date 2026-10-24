import { useState } from 'react';
import { Tabs } from './ui';

type K = 'same' | 'diff' | 'verify';
const ROWS: { topic: string; cli: string; xcode: string; k: K }[] = [
  { topic: 'Agent engine', cli: 'You install and update Claude Code', xcode: 'Xcode bundles and updates its own copy', k: 'diff' },
  { topic: 'Project CLAUDE.md', cli: 'Read', xcode: 'Read', k: 'same' },
  { topic: 'Global configuration', cli: '~/.claude/', xcode: '~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig', k: 'diff' },
  { topic: 'Skills', cli: '~/.claude/skills, .claude/skills', xcode: 'ClaudeAgentConfig/skills, plug-ins in Intelligence settings', k: 'diff' },
  { topic: 'MCP servers', cli: 'claude mcp add, .mcp.json, user scope', xcode: 'ClaudeAgentConfig, plug-ins; system-wide servers not inherited', k: 'diff' },
  { topic: 'Permissions', cli: 'allow / ask / deny rules, /permissions', xcode: 'Allowed Commands and Allowed Tools lists', k: 'diff' },
  { topic: 'Plan mode', cli: 'Shift+Tab or --permission-mode plan', xcode: '/plan, or automatic when you ask for a plan', k: 'same' },
  { topic: 'Other permission modes', cli: 'acceptEdits, auto, dontAsk, bypass', xcode: 'Not documented', k: 'verify' },
  { topic: 'Hooks', cli: 'settings.json hooks', xcode: 'Not documented', k: 'verify' },
  { topic: 'Bash sandbox', cli: '/sandbox (Seatbelt)', xcode: 'Not documented', k: 'verify' },
  { topic: 'Undo', cli: '/rewind checkpoints', xcode: 'Undo Changes, History slider (needs Git)', k: 'diff' },
  { topic: 'Build, test, previews', cli: 'xcodebuild via Bash, or Xcode tools via mcpbridge', xcode: 'Built-in Xcode tools', k: 'diff' },
  { topic: 'Shell environment', cli: 'Your shell: PATH, env vars, tokens', xcode: 'Restricted; no .zshrc', k: 'diff' },
  { topic: 'Organisation policy', cli: 'managed-settings.json, com.anthropic.claudecode', xcode: 'MDM: CodingAssistantAllowExternalIntegrations', k: 'diff' },
  { topic: 'Data sent to the model', cli: 'Prompts + files read', xcode: 'Prompts + files read', k: 'same' },
];
const COLOR: Record<K, string> = { same: 'var(--color-ok)', diff: 'var(--color-ios)', verify: 'var(--color-warn)' };
const LABEL: Record<K, string> = { same: 'same', diff: 'different', verify: 'verify' };

export default function Xcode() {
  const [f, setF] = useState<'all' | K>('all');
  const rows = ROWS.filter((r) => f === 'all' || r.k === f);
  return (
    <div>
      <Tabs
        label="Filter"
        value={f}
        onChange={setF}
        options={[
          ['all', `All (${ROWS.length})`],
          ['same', 'Same'],
          ['diff', 'Different'],
          ['verify', 'Verify yourself'],
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-mute">
              <th className="py-2 pr-3 font-semibold">Topic</th>
              <th className="py-2 pr-3 font-semibold">Claude Code (Terminal)</th>
              <th className="py-2 pr-3 font-semibold text-ios">Claude Agent in Xcode</th>
              <th className="py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.topic} className="border-t border-line align-top">
                <td className="py-2.5 pr-3 font-medium">{r.topic}</td>
                <td className="py-2.5 pr-3 text-mute">{r.cli}</td>
                <td className="py-2.5 pr-3 [overflow-wrap:anywhere]">{r.xcode}</td>
                <td className="py-2.5">
                  <span className="mono text-[11px] font-semibold" style={{ color: COLOR[r.k] }}>
                    {LABEL[r.k]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
