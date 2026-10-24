import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'A secrets checklist',
    body: 'Read deny rules for .env, secrets folders and key files. sandbox denyRead (or credentials deny) for ~/.ssh, ~/.aws and friends, so scripts can’t read them either. Short-lived, narrowly scoped tokens instead of personal ones. Nothing secret pasted into prompts or CLAUDE.md: it goes to the model.',
    src: 'cc-security',
    tags: ['secrets'],
  },
  {
    kind: 'idea',
    title: 'Managed settings: the top of the stack',
    body: 'Your organisation’s file beats every other level. macOS: /Library/Application Support/ClaudeCode/managed-settings.json. Linux and WSL: /etc/claude-code/managed-settings.json. Windows: C:\\Program Files\\ClaudeCode\\. Drop-in files go in managed-settings.d/. MDM can deliver the com.anthropic.claudecode preferences domain, or admins can use server-managed settings in the claude.ai console.',
    src: 'cc-managed',
    tags: ['managed'],
  },
  {
    kind: 'idea',
    title: 'Locks only admins can set',
    body: 'allowManagedPermissionRulesOnly makes managed settings the only source of permission rules. allowManagedHooksOnly blocks user, project and plugin hooks. sandbox.network.allowManagedDomainsOnly locks the allowlist. disableBypassPermissionsMode and disableAutoMode lock modes. Managed allowUnsandboxedCommands: false plus failIfUnavailable: true makes the sandbox admin-required, and repo settings can no longer loosen it.',
    code: `{
  "permissions": { "disableBypassPermissionsMode": "disable" },
  "allowManagedHooksOnly": true,
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false,
    "failIfUnavailable": true
  }
}`,
    src: 'cc-managed',
    tags: ['managed-locks'],
  },
  {
    kind: 'idea',
    title: 'A Dockerfile is not policy',
    body: 'Copying managed-settings.json into a dev container image works, but the Dockerfile lives in the repo: anyone with write access can change or remove that step. Policy people must not bypass belongs in MDM or server-managed settings.',
    src: 'cc-devcontainer',
    tags: ['repo-not-policy'],
  },
  {
    kind: 'idea',
    title: 'Audit what’s actually in force',
    body: '/permissions lists every rule and the file it came from. /hooks shows every hook and its source. OpenTelemetry metrics show what the team runs. A ConfigChange hook can log or block settings changes during a session.',
    src: 'cc-security',
    tags: ['audit'],
  },
  {
    kind: 'idea',
    title: 'Guard the output, not only the actions',
    body: 'Guardrails stop dangerous actions; they don’t make the code Claude writes secure. Run /security-review over your branch, use the security-guidance plugin, and review diffs like a colleague’s.',
    src: 'cc-security',
    tags: ['review-output'],
  },
  {
    kind: 'quiz',
    title: 'Your team wants nobody to run Claude Code in bypass mode, even if a repo or a user tries. Where does the setting go?',
    options: ['In CLAUDE.md', 'In the repo’s .claude/settings.json', 'In each user’s ~/.claude/settings.json', 'In managed settings (MDM, server-managed or the system managed-settings.json)'],
    answer: 3,
    why: 'Only managed settings can’t be overridden or removed by users or repositories. The setting works from any scope, but only the managed one sticks.',
    src: 'cc-managed',
    tags: ['managed', 'managed-locks'],
  },
];
