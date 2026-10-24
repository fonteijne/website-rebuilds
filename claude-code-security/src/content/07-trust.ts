import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'A repo can configure your agent',
    body: '.claude/settings.json can carry hooks, an env block, permission rules and helper commands. .mcp.json can add MCP servers. .claude/ can hold skills, subagents and commands. CLAUDE.md shapes behaviour. All of it arrives with git clone.',
    src: 'cc-permissions',
    tags: ['repo-config'],
  },
  {
    kind: 'idea',
    title: 'The workspace trust dialog',
    body: 'Start an interactive session in a folder you haven’t trusted and Claude Code asks first, listing the allow rules and directories the folder would grant. Trust is stored per repository root. Servers in .mcp.json get their own approval prompt.',
    src: 'cc-security',
    tags: ['trust-dialog'],
  },
  {
    kind: 'demo',
    title: 'What runs before you trust a folder',
    demo: 'trust',
    body: 'Switch between an interactive session and a headless claude -p run in a repo you never trusted.',
    src: 'cc-permissions',
    tags: ['headless-trap'],
  },
  {
    kind: 'idea',
    title: 'The claude -p trap',
    body: 'Headless runs and SDK sessions never show the trust dialog. In a folder you never trusted, the repository’s hooks in settings files, its env block and helper commands are still used, and .mcp.json servers connect without asking. Only its allow rules are held back.',
    guard: 'Never point a plain claude -p at a repository you didn’t write.',
    src: 'cc-permissions',
    tags: ['headless-trap'],
  },
  {
    kind: 'idea',
    title: 'Running headless on untrusted code',
    body: 'Read only your own settings with --setting-sources user. Or start with --bare, which skips the project’s hooks, skills, plugins and .mcp.json (its env block still applies). Turn hooks off for one run with --settings, because a user-level disableAllHooks can be overridden by the project. Reject named servers with disabledMcpjsonServers.',
    code: `claude -p "summarise this repo" --setting-sources user
claude -p "…" --bare
claude -p "…" --settings '{"disableAllHooks": true}'`,
    src: 'cc-permissions',
    tags: ['headless-safe'],
  },
  {
    kind: 'idea',
    title: 'Choosing MCP servers',
    body: 'Write your own, or use servers from providers you trust. Anthropic reviews directory connectors against listing criteria but doesn’t security-audit MCP servers. .mcp.json isn’t the whole picture: user-scope servers, claude.ai connectors and plugins add more. Organisations can restrict servers with managed MCP configuration.',
    src: 'cc-security',
    tags: ['mcp-trust'],
  },
  {
    kind: 'idea',
    title: 'Tool output is input',
    body: 'What an MCP server returns lands in Claude’s context like any file: an issue body, a database row or a web result can carry instructions. Scope servers with mcp__server__tool rules: allow the read tools, ask on the write tools, deny what you don’t need.',
    code: `"allow": ["mcp__github__get_issue"],
"ask":   ["mcp__github__create_pull_request"],
"deny":  ["mcp__github__delete_file"]`,
    src: 'cc-permissions',
    tags: ['tool-output'],
  },
  {
    kind: 'idea',
    title: 'WebFetch reads through a filter',
    body: 'For most fetches, WebFetch runs a separate model call over the page and Claude gets that answer, not the raw page. curl and wget are not auto-approved by default. The summary still comes from untrusted content.',
    src: 'cc-security',
    tags: ['webfetch'],
  },
  {
    kind: 'quiz',
    title: 'You run claude -p "summarise" in a freshly cloned repo you never opened. Its .claude/settings.json has a SessionStart hook. Does the hook run?',
    options: ['No, the folder isn’t trusted', 'Yes: headless runs use hooks from the repo’s settings files', 'Only if the hook is in .claude/settings.local.json', 'Only in auto mode'],
    answer: 1,
    why: 'claude -p never shows the trust dialog, and hooks in settings files are used in that case. Use --setting-sources user, --bare or --settings with disableAllHooks.',
    src: 'cc-permissions',
    tags: ['headless-trap'],
  },
];
