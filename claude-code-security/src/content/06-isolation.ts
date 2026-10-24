import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Modes decide if. Isolation decides how far.',
    body: 'A permission mode decides whether an action runs and whether you’re asked. Isolation limits what that action can reach once it runs. The fewer prompts you want, the more the boundary has to carry.',
    src: 'cc-envs',
    tags: ['iso-vs-mode'],
  },
  {
    kind: 'demo',
    title: 'Six options side by side',
    demo: 'envs',
    body: 'From a per-command sandbox to a separate machine. Pick a goal to see where to start.',
    src: 'cc-envs',
    tags: ['env-compare'],
  },
  {
    kind: 'idea',
    title: 'Sandbox runtime: the whole process, no Docker',
    body: 'srt claude runs all of Claude Code inside the same Seatbelt or bubblewrap isolation the Bash sandbox uses, so file tools, MCP servers and hooks are inside too. It denies network by default; configure ~/.srt-settings.json. It’s a beta research preview, and a clean start isn’t proof your settings loaded.',
    code: `npm install -g @anthropic-ai/sandbox-runtime
srt claude`,
    src: 'cc-envs',
    verify: true,
    tags: ['env-srt'],
  },
  {
    kind: 'idea',
    title: 'Dev container with an egress firewall',
    body: 'The reference dev container in anthropics/claude-code adds init-firewall.sh: default-deny outbound traffic with an allowlist (it needs NET_ADMIN and NET_RAW). Run as a non-root user. The warning that comes with it: with bypass on, anything inside the container can still be exfiltrated, including Claude’s own credentials in ~/.claude. Don’t mount ~/.ssh or cloud credential files.',
    src: 'cc-devcontainer',
    tags: ['env-devcontainer'],
  },
  {
    kind: 'idea',
    title: 'Virtual machines: the strongest wall',
    body: 'Its own kernel, and in cloud or microVM setups its own virtual hardware. Use a VM for untrusted code, or when policy requires kernel-level separation. Docker Sandboxes offers a microVM with its own Docker daemon.',
    src: 'cc-envs',
    tags: ['env-vm'],
  },
  {
    kind: 'idea',
    title: 'Cloud sessions',
    body: 'Each cloud session runs in an isolated Anthropic-managed VM with a network allowlist. GitHub credentials never enter the VM: a proxy attaches them server-side and rejects branch deletions and tag pushes. VMs are reclaimed after inactivity. Like any box, it can still change code you let it push.',
    src: 'cc-security',
    tags: ['env-cloud'],
  },
  {
    kind: 'idea',
    title: 'Unattended means the whole process is inside',
    body: 'The Bash sandbox alone isn’t enough for --dangerously-skip-permissions, because file tools, MCP servers and hooks run outside it. Use a container, a VM or the sandbox runtime. You can layer: the Bash sandbox inside a container adds per-command limits on top of the outer wall.',
    guard: 'Bypass mode + host machine = the agent has your hands and nobody is watching.',
    src: 'cc-envs',
    tags: ['bypass-rule'],
  },
  {
    kind: 'idea',
    title: 'A worktree is not a sandbox',
    body: 'Git worktrees give parallel sessions their own checkout, so they don’t trample each other’s files. They don’t isolate anything else: same user, same home folder, same keychain, same network.',
    tags: ['worktree'],
  },
  {
    kind: 'quiz',
    title: 'You want Claude to review an unknown open-source repository and run its test suite. Best starting point?',
    options: ['Your laptop, Manual mode', 'Your laptop, Bash sandbox on', 'A dedicated VM, or a cloud session', 'A git worktree'],
    answer: 2,
    why: 'Untrusted code plus running its tests is the textbook case for a separate machine. The repository may also ship hooks and MCP servers, which the Bash sandbox doesn’t contain.',
    src: 'cc-envs',
    tags: ['env-vm', 'env-cloud'],
  },
];
