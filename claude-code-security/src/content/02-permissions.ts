import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Three lists in settings.json',
    body: 'Allow rules run a tool without asking. Ask rules always prompt. Deny rules block. A rule is a tool name, optionally with a specifier in parentheses. You can view and edit every rule, and see which file it came from, with /permissions.',
    code: `{
  "permissions": {
    "allow": ["Bash(npm run test *)"],
    "ask":   ["Bash(git push *)"],
    "deny":  ["Read(./.env)", "Bash(curl *)"]
  }
}`,
    src: 'cc-permissions',
    tags: ['allow-ask-deny'],
  },
  {
    kind: 'idea',
    title: 'Deny, then ask, then allow',
    body: 'Rules are evaluated in that order and the first match wins. Specificity doesn’t matter: a broad deny like Bash(aws *) blocks Bash(aws s3 ls) even when that exact command is in allow. The same goes for ask over allow. An allow rule can never carve an exception out of a deny.',
    guard: 'Put the things that must never happen in deny, and the things a human should see in ask.',
    src: 'cc-permissions',
    tags: ['rule-order'],
  },
  {
    kind: 'idea',
    title: 'A bare name removes the tool',
    body: 'Deny "Bash" and Claude never sees the Bash tool at all. Deny "Bash(rm *)" and the tool stays available, but matching calls are blocked when Claude tries them.',
    src: 'cc-permissions',
    tags: ['bare-vs-scoped'],
  },
  {
    kind: 'idea',
    title: 'How Bash patterns match',
    body: 'A Bash rule matches the whole command text, with * for any text. Compound commands are split on &&, ||, ;, |, &, and newlines, and each part must match an allow rule on its own. Deny and ask rules apply if any part matches, including inside $(…) and loops. Wrappers like timeout, time, nice, nohup and stdbuf are stripped first; npx, docker exec and devbox run are not.',
    guard: 'Bash(devbox run *) allows devbox run rm -rf . too. Allow runners per inner command.',
    src: 'cc-permissions',
    tags: ['bash-syntax'],
  },
  {
    kind: 'demo',
    title: 'Does the deny rule catch it?',
    demo: 'bypass',
    body: 'A deny rule covers the way Claude usually writes a command. Guess which variants it catches.',
    src: 'cc-permissions',
    tags: ['bash-limits'],
  },
  {
    kind: 'idea',
    title: 'Text rules are not a wall',
    body: 'Bash(curl *) stops “curl https://…” but not “/usr/bin/curl …” or “sh -c \'curl …\'”. Bash(git push *) misses “git -C . push”. The docs say it plainly: a deny rule isn’t a security boundary around the program. For enforcement that doesn’t depend on spelling, use the sandbox. To inspect the full command with your own logic, use a PreToolUse hook.',
    src: 'cc-permissions',
    tags: ['bash-limits'],
  },
  {
    kind: 'idea',
    title: 'Path rules: four anchors',
    body: 'Read and Edit rules use gitignore syntax. //path is absolute from the filesystem root. ~/path is your home. /path is relative to the settings file’s project. ./path or path is relative to the current directory. The classic mistake: Read(/Users/alice/.ssh/**) is not absolute. Write Read(//Users/alice/.ssh/**) or Read(~/.ssh/**).',
    code: `"deny": [
  "Read(./.env)",
  "Read(./.env.*)",
  "Read(./secrets/**)",
  "Read(~/.ssh/**)",
  "Read(~/.aws/**)"
]`,
    src: 'cc-permissions',
    tags: ['path-rules'],
  },
  {
    kind: 'idea',
    title: 'What a Read deny covers',
    body: 'It covers Claude’s file tools, @-mentions, recognised shell readers like cat, head, tail, sed and tee, and redirection targets. A Read deny also blocks Edit and Write on the same path. It does not cover a command that reads without naming the file (grep -r from the folder) or a Python or Node script that opens the file itself. A .claudeignore file has no effect at all.',
    guard: 'For OS-level blocking of a path, add sandbox.filesystem.denyRead too.',
    src: 'cc-permissions',
    tags: ['read-scope'],
  },
  {
    kind: 'idea',
    title: 'Some commands never ask',
    body: 'A built-in set of read-only commands runs without a prompt in every mode: ls, cat, echo, pwd, head, tail, grep, find, wc, diff, stat, read-only git and more. The set isn’t configurable. To make one of them prompt, add an ask or deny rule for it. Unparseable commands, and commands over 10,000 characters, always prompt.',
    src: 'cc-permissions',
    tags: ['readonly-cmds'],
  },
  {
    kind: 'idea',
    title: 'Where rules live, and who wins',
    body: 'Managed settings (your organisation) beat command-line flags, which beat .claude/settings.local.json, then .claude/settings.json (committed), then ~/.claude/settings.json. But for rules, deny is evaluated across all of them first: a user-level deny blocks a project-level allow, and vice versa. A managed deny can’t be overridden by --allowedTools.',
    src: 'cc-permissions',
    tags: ['scopes'],
  },
  {
    kind: 'idea',
    title: 'A repo can restrict you, not empower itself',
    body: 'Allow rules and additionalDirectories in a project’s .claude/settings.json only apply after you accept the workspace trust dialog, which lists them first. Deny and ask rules apply immediately, because they only restrict.',
    src: 'cc-permissions',
    tags: ['project-trust-rules'],
  },
  {
    kind: 'quiz',
    title: 'Your user settings allow Bash(npm *). The project denies Bash(npm publish *). Claude runs npm publish. What happens?',
    options: ['It runs: user settings are more personal', 'It runs: the allow rule was there first', 'It is blocked: deny is evaluated before allow, across all scopes', 'You get a prompt to choose'],
    answer: 2,
    why: 'Deny rules from any scope are checked before allow rules from any scope. The first match in deny → ask → allow decides.',
    src: 'cc-permissions',
    tags: ['rule-order', 'scopes'],
  },
  {
    kind: 'dogfood',
    title: 'Dogfood: your first rules',
    step: 'rules',
    body: 'Pick the rules for your project. You can change them later in the Builder.',
    tags: ['allow-ask-deny', 'path-rules'],
  },
];
