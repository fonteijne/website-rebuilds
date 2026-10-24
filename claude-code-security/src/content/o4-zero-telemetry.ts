import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'The telemetry switches',
    body: 'DISABLE_TELEMETRY (or the cross-tool DO_NOT_TRACK=1) stops usage metrics and feature-flag fetching. DISABLE_ERROR_REPORTING stops error reports. DISABLE_FEEDBACK_COMMAND removes /feedback, /bug and /share. CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY stops the session rating prompt. Metrics never include code, prompts or file paths, but zero means zero.',
    src: ['cc-data-usage', 'cc-env-vars'],
    tags: ['telemetry-vars'],
  },
  {
    kind: 'idea',
    title: 'The master switch',
    body: 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC turns off auto-updates, telemetry, error reporting, /feedback, release notes, status-badge checks, the fast mode check and feature flags in one go. Watch the semantics: for this variable, DISABLE_TELEMETRY and DISABLE_ERROR_REPORTING, even "0" or "false" still disables; unset it to turn traffic back on. You then own updates: use DISABLE_UPDATES to block self-updates when you distribute Claude Code yourself.',
    src: ['cc-env-vars', 'cc-gateway'],
    tags: ['nonessential'],
  },
  {
    kind: 'idea',
    title: 'Two things the master switch misses',
    body: 'The WebFetch domain safety check sends each hostname to api.anthropic.com regardless of provider and isn’t affected by the master switch; turn it off with "skipWebFetchPreflight": true, and then restrict WebFetch with permission rules or deny it. Registration of the official plugin marketplace (from github.com) needs CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1, read on first interactive launch.',
    src: ['cc-data-usage', 'cc-env-vars'],
    tags: ['webfetch-preflight'],
  },
  {
    kind: 'idea',
    title: 'One env block for zero telemetry',
    body: 'All of these are environment variables that can live in a settings file’s env block. ENABLE_CLAUDEAI_MCP_SERVERS=false stops fetching claude.ai connectors. For the agent inside Xcode, the same block goes in ClaudeAgentConfig/settings.json (verify it’s honoured there).',
    code: `{
  "env": {
    "DISABLE_TELEMETRY": "1",
    "DISABLE_ERROR_REPORTING": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "DISABLE_FEEDBACK_COMMAND": "1",
    "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY": "1",
    "CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL": "1",
    "ENABLE_CLAUDEAI_MCP_SERVERS": "false"
  },
  "skipWebFetchPreflight": true,
  "feedbackDrafts": "off"
}`,
    src: ['cc-data-usage', 'cc-env-vars', 'cc-settings-ref'],
    tags: ['telemetry-vars', 'nonessential'],
  },
  {
    kind: 'idea',
    title: 'A repository can redirect your model traffic',
    body: 'A project’s .claude/settings.json can set ANTHROPIC_BASE_URL in its env block. It applies after you trust the folder, or immediately in claude -p, which never asks. Project settings can’t turn OpenTelemetry exporters on (those variables are ignored there, except values that turn things off), but the base URL isn’t on that list. A hostile repo could send your prompts and code to its own “gateway”.',
    guard: 'Pin the endpoint in managed settings so no repository can move it.',
    src: 'cc-settings-ref',
    tags: ['repo-env'],
  },
  {
    kind: 'idea',
    title: 'Pin the endpoint with policy',
    body: 'In managed settings, allowedProviders: ["customEndpoint"] admits only a custom endpoint, and only “for the exact value a managed env block pins”. Every other provider, the Anthropic API included, is refused at startup, at login and mid-session. Combined with the telemetry variables in the same managed env block, this is the enforceable version of “local model, zero telemetry” for Claude Code.',
    code: `// /Library/Application Support/ClaudeCode/managed-settings.json
{
  "allowedProviders": ["customEndpoint"],
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:11434",
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "DISABLE_ERROR_REPORTING": "1"
  },
  "skipWebFetchPreflight": true,
  "permissions": { "deny": ["WebFetch", "WebSearch"] }
}`,
    src: ['cc-settings-ref', 'cc-managed'],
    tags: ['pin-endpoint'],
  },
  {
    kind: 'idea',
    title: 'Codex: the same switches, other names',
    body: 'In Codex’s config.toml: analytics.enabled = false (in Codex CLI this also disables the default statsig metrics exporter), feedback.enabled = false, check_for_update_on_startup = false when updates are managed centrally, web_search = "disabled", and history.persistence = "none" to stop saving transcripts. Untrusted projects skip project-local .codex/ config, hooks and rules.',
    src: 'codex-config',
    tags: ['codex-telemetry'],
  },
  {
    kind: 'idea',
    title: 'Xcode’s own policy keys',
    body: 'Apple documents two Xcode keys for configuration profiles (payload com.apple.dt.Xcode). CodingAssistantAllowExternalIntegrations = false turns the coding assistant off entirely (supervised Macs, macOS 26). IDEProhibitOnDeviceModelInteraction = true disables Predictive Code Completion’s on-device model. Apple lists no keys for choosing providers, agents or telemetry.',
    src: ['apple-mdm', 'apple-setup'],
    tags: ['xcode-mdm-keys'],
  },
  {
    kind: 'idea',
    title: 'Offline still writes to disk',
    body: 'Claude Code keeps transcripts in plaintext under ~/.claude/projects/ for 30 days (cleanupPeriodDays); a secret a tool prints ends up there. CLAUDE_CODE_SKIP_PROMPT_HISTORY skips writing transcripts and history; claude purge deletes a project’s state. Xcode stores its conversation history itself, and you can delete it there.',
    src: ['cc-directory', 'cc-settings-ref', 'apple-privacy'],
    tags: ['local-data'],
  },
  {
    kind: 'quiz',
    title: 'You set CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1. Which request can still reach api.anthropic.com?',
    options: ['Telemetry events', 'The auto-updater', 'The WebFetch domain safety check', 'Release notes'],
    answer: 2,
    why: 'The WebFetch check runs regardless of provider and isn’t covered by the master switch. Set skipWebFetchPreflight: true and restrict or deny WebFetch.',
    src: 'cc-data-usage',
    tags: ['webfetch-preflight', 'nonessential'],
  },
  {
    kind: 'dogfood',
    title: 'Dogfood: your offline kit',
    step: 'offline',
    body: 'Choose the model server, model and route. The Builder adds managed settings with a pinned endpoint, an Xcode agent config, a Codex config, an ACP wrapper and a verification script to your download.',
    tags: ['pin-endpoint', 'telemetry-vars'],
  },
];
