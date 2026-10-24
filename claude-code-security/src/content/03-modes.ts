import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'A mode is the default answer',
    body: 'Rules handle the cases you named. The mode decides everything else: prompt, run, send to a classifier, or refuse. Switch during a session with Shift+Tab, or start in one with --permission-mode. The status bar shows the active mode.',
    code: `claude --permission-mode plan
claude -p "run the tests" --permission-mode dontAsk --allowedTools "Bash(npm test)" "Read"`,
    src: 'cc-modes',
    tags: ['mode-manual'],
  },
  {
    kind: 'demo',
    title: 'Six modes, seven actions',
    demo: 'modes',
    body: 'Pick a mode and see what happens to typical actions when no rule matches them.',
    src: 'cc-modes',
    tags: ['mode-manual', 'mode-edits', 'mode-plan', 'mode-auto', 'mode-dontask', 'mode-bypass'],
  },
  {
    kind: 'idea',
    title: 'Manual: you approve',
    body: 'Called default in settings and Manual in the UI. Reads in your working directories and the read-only command set run; edits, other commands and network fetches prompt. “Yes, and don’t ask again” saves an allow rule for that command or domain.',
    src: 'cc-modes',
    tags: ['mode-manual'],
  },
  {
    kind: 'idea',
    title: 'acceptEdits: files yes, commands no',
    body: 'File edits in the working directory and a fixed set of filesystem commands (mkdir, touch, rm, rmdir, mv, cp, sed) run without asking. Other commands, and anything outside the working directory, still prompt.',
    src: 'cc-modes',
    tags: ['mode-edits'],
  },
  {
    kind: 'idea',
    title: 'Plan: look, don’t touch',
    body: 'Claude reads and explores, runs read-only commands, and writes a plan. Source edits wait until you approve the plan. A PreToolUse hook that returns allow cannot unlock edits in plan mode.',
    guard: 'Start risky or unfamiliar work in plan mode. It costs one approval.',
    src: 'cc-modes',
    tags: ['mode-plan'],
  },
  {
    kind: 'idea',
    title: 'Auto: a classifier instead of you',
    body: 'Read-only actions and edits in the working directory run. Other actions go to a separate classifier model that checks they match your request. Blocked by default include curl | bash, sending sensitive data out, production deploys, force push, git reset --hard and terraform destroy. On entering auto mode, broad allow rules like Bash(*) or Bash(python*) are dropped.',
    guard: 'Auto mode is a per-action control, not an isolation boundary.',
    src: 'cc-modes',
    verify: true,
    tags: ['mode-auto'],
  },
  {
    kind: 'idea',
    title: 'dontAsk: for scripts and CI',
    body: 'Anything that would prompt is denied. Pre-approved tools and actions that need no approval still run. Pair it with a short --allowedTools list in headless runs, so a stuck prompt becomes a clean refusal instead of a hang or a guess.',
    src: 'cc-modes',
    tags: ['mode-dontask'],
  },
  {
    kind: 'idea',
    title: 'bypassPermissions: only inside a box',
    body: 'Also known as --dangerously-skip-permissions. Prompts are skipped, including writes to .git and .claude. Deny rules still block, and allow rules have no effect. Claude Code refuses to start with it as root on Linux and macOS. Use it only in a container or VM where the whole process is isolated.',
    src: 'cc-modes',
    tags: ['mode-bypass'],
  },
  {
    kind: 'idea',
    title: 'What no mode auto-approves',
    body: 'Even in bypass mode, these still need you: tools matched by an explicit ask rule, AskUserQuestion and MCP tools marked requiresUserInteraction, recognised rm/rmdir of critical paths, and reads outside your working directories while blockReadsOutsideWorkingDirectories is on.',
    guard: 'An ask rule is the strongest “human in the loop” you can write.',
    src: 'cc-modes',
    tags: ['never-auto'],
  },
  {
    kind: 'idea',
    title: 'Protected paths',
    body: 'Writes to places where a file quietly becomes code later are never auto-approved (except in bypass): .git, .claude, .vscode, .idea, .husky, .devcontainer, shell startup files like .zshrc, .npmrc, .mcp.json, .gitconfig, .pre-commit-config.yaml and more.',
    src: 'cc-modes',
    tags: ['protected-paths'],
  },
  {
    kind: 'idea',
    title: 'A repository can’t choose your mode',
    body: 'defaultMode "auto" and "bypassPermissions" are ignored when they come from .claude/settings.json or settings.local.json. To lock modes, set permissions.disableBypassPermissionsMode or permissions.disableAutoMode to "disable". It works from any settings file, and is unbreakable from managed settings.',
    code: `{
  "permissions": {
    "defaultMode": "default",
    "disableBypassPermissionsMode": "disable"
  }
}`,
    src: 'cc-modes',
    tags: ['mode-lock'],
  },
  {
    kind: 'quiz',
    title: 'A CI job runs Claude on pull requests from forks. Which setup fits best?',
    options: ['bypassPermissions, so it never hangs', 'acceptEdits with broad allow rules', 'dontAsk with a narrow --allowedTools list, inside an isolated runner', 'Manual mode; someone will approve prompts'],
    answer: 2,
    why: 'Fork PRs are untrusted input. dontAsk turns every unexpected action into a refusal, the allow list stays short, and the runner bounds the rest. Bypass on untrusted input is exactly the wrong pairing.',
    src: 'cc-modes',
    tags: ['mode-dontask', 'mode-bypass'],
  },
  {
    kind: 'dogfood',
    title: 'Dogfood: pick your starting mode',
    step: 'mode',
    body: 'Choose the mode sessions start in for this project, and whether you lock yourself out of bypass mode.',
    tags: ['mode-lock'],
  },
];
