import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Enforced by the operating system',
    body: 'On macOS the sandbox uses Seatbelt, which is built in. On Linux and WSL2 it uses bubblewrap plus socat (install both). Native Windows isn’t supported; use WSL2. It’s off by default: turn it on with /sandbox or "sandbox": { "enabled": true }. It is built on the open-source @anthropic-ai/sandbox-runtime.',
    src: 'cc-sandbox',
    tags: ['sb-what'],
  },
  {
    kind: 'idea',
    title: 'It wraps commands, not Claude',
    body: 'The sandbox covers Bash, PowerShell and Monitor commands and every process they start. It does not cover Read, Edit or WebFetch (permission rules gate those), and it does not cover MCP servers or command hooks: they run unconstrained on the host.',
    guard: 'Sandbox on ≠ everything contained. Module 06 covers boundaries for the whole process.',
    src: 'cc-envs',
    tags: ['sb-scope'],
  },
  {
    kind: 'idea',
    title: 'Writes are narrow, reads are wide',
    body: 'By default commands can write to the working directory, $TMPDIR and added directories. Protected paths stay write-denied even there (.claude, .mcp.json, .git/hooks, shell rc files). But commands can read most of the machine, including ~/.ssh and ~/.aws/credentials. Close that with denyRead.',
    code: `"sandbox": {
  "enabled": true,
  "filesystem": {
    "denyRead": ["~/.ssh", "~/.aws"]
  }
}`,
    src: 'cc-sandbox',
    tags: ['sb-fs'],
  },
  {
    kind: 'demo',
    title: 'What gets through?',
    demo: 'sandbox',
    body: 'Sandbox on, allowedDomains = registry.npmjs.org, denyRead = ~/.ssh. Guess each outcome.',
    src: 'cc-sandbox',
    tags: ['sb-fs', 'sb-net', 'sb-scope'],
  },
  {
    kind: 'idea',
    title: 'Network goes through a proxy',
    body: 'Sandboxed commands have no direct route out. A proxy on your machine checks each hostname against sandbox.network.allowedDomains, which starts empty and accepts wildcards like *.example.com. WebFetch(domain:…) allow rules count too. Tools that ignore HTTP(S)_PROXY, like plain ssh or most database drivers, fail even for allowed hosts. UDP and ICMP can’t leave.',
    src: 'cc-sandbox',
    tags: ['sb-net'],
  },
  {
    kind: 'idea',
    title: 'The sandbox replaces the prompt',
    body: 'With autoAllowBashIfSandboxed (default true), sandboxed commands run without prompting, because the walls do the work. Content-scoped ask rules like Bash(git push *) still prompt. Set it to false if you want both walls and prompts.',
    src: 'cc-sandbox',
    tags: ['sb-autoallow'],
  },
  {
    kind: 'idea',
    title: 'The escape hatch, and closing it',
    body: 'When a command fails inside the sandbox, Claude may retry it with dangerouslyDisableSandbox. In Manual mode you get an “unsandboxed” prompt; in bypass mode you don’t. Set allowUnsandboxedCommands to false to ignore the escape hatch completely, and failIfUnavailable to true so a missing dependency stops Claude Code instead of silently running without walls.',
    code: `"sandbox": {
  "enabled": true,
  "allowUnsandboxedCommands": false,
  "failIfUnavailable": true
}`,
    src: 'cc-sandbox',
    tags: ['sb-escape'],
  },
  {
    kind: 'idea',
    title: 'excludedCommands leave the box',
    body: 'Matching commands run entirely outside the sandbox, with no filesystem or network limits (they still go through permissions). Matching is on the whole command text, and every chained part must match. Keep patterns narrow: excluding an interpreter like python lets Claude write a script and run it unsandboxed.',
    code: `"excludedCommands": ["docker compose *"]`,
    src: 'cc-sandbox',
    tags: ['sb-excluded'],
  },
  {
    kind: 'idea',
    title: 'Known limits',
    body: 'The allowlist is hostname-based without TLS inspection, so domain fronting is possible. Broad hosts like github.com allow exfiltration (a gist, an issue comment). Unix sockets like /var/run/docker.sock bypass the sandbox. A writable directory on $PATH means code execution elsewhere later. Docker, watchman, git over SSH and localhost servers on Linux need workarounds.',
    src: 'cc-sandbox',
    tags: ['sb-limits'],
  },
  {
    kind: 'idea',
    title: 'Credentials: deny or mask',
    body: 'sandbox.credentials lists files and environment variables. mode "deny" blocks reads and unsets variables. mode "mask" hands the command a placeholder and lets the proxy inject the real value only for the hosts you name; that needs network.tlsTerminate and a trusted settings scope, never repository settings.',
    code: `"credentials": {
  "files":   [{ "path": "~/.aws/credentials", "mode": "deny" }],
  "envVars": [{ "name": "GITHUB_TOKEN", "mode": "deny" }]
}`,
    src: 'cc-sandbox',
    verify: true,
    tags: ['sb-creds'],
  },
  {
    kind: 'quiz',
    title: 'The sandbox is on. Claude uses the Read tool (not Bash) on ~/.aws/credentials. What stops it?',
    options: ['The sandbox’s denyRead', 'Nothing can stop the Read tool', 'Permission rules: a Read deny rule, or the prompt for reads outside the working directory', 'The network proxy'],
    answer: 2,
    why: 'The sandbox only wraps shell commands. Built-in file tools are gated by permission rules and the working-directory prompt. That’s why you write both Read(~/.aws/**) and denyRead.',
    src: 'cc-envs',
    tags: ['sb-scope', 'read-scope'],
  },
  {
    kind: 'dogfood',
    title: 'Dogfood: configure the sandbox',
    step: 'sandbox',
    body: 'Turn the sandbox on, list the hosts your build really needs, and decide on strict mode.',
    tags: ['sb-net', 'sb-escape'],
  },
];
