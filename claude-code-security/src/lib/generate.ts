import { zipSync, strToU8 } from 'fflate';
import type { Policy } from './store';

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-project';

const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const ios = (p: Policy) => p.profile === 'ios';

/** The local model server's loopback address. The sandbox needs the IP, not "localhost". */
export const localHostPort = (p: Policy) => (p.runtime === 'ollama' ? '127.0.0.1:11434' : '127.0.0.1:1234');
const localBase = (p: Policy) => `http://${localHostPort(p)}`;

/** Zero-telemetry variables, from the Claude Code data-usage, env-vars and network docs. */
const ZERO_TELEMETRY_ENV = {
  DISABLE_TELEMETRY: '1',
  DISABLE_ERROR_REPORTING: '1',
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
  DISABLE_FEEDBACK_COMMAND: '1',
  CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY: '1',
  CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: '1',
  ENABLE_CLAUDEAI_MCP_SERVERS: 'false',
};

function localEnv(p: Policy) {
  const m = p.localModel.trim() || 'qwen3-coder';
  return {
    ANTHROPIC_BASE_URL: localBase(p),
    ANTHROPIC_AUTH_TOKEN: p.runtime,
    ANTHROPIC_DEFAULT_OPUS_MODEL: m,
    ANTHROPIC_DEFAULT_SONNET_MODEL: m,
    ANTHROPIC_DEFAULT_HAIKU_MODEL: m,
    CLAUDE_CODE_SUBAGENT_MODEL: m,
    CLAUDE_CODE_ATTRIBUTION_HEADER: '0',
  };
}

const json = (o: unknown) => JSON.stringify(o, null, 2) + '\n';

function offlineFiles(p: Policy): Record<string, string> {
  const f: Record<string, string> = {};
  const m = p.localModel.trim() || 'qwen3-coder';
  const env = { ...localEnv(p), ...ZERO_TELEMETRY_ENV };

  f['offline/managed-settings.json'] = json({
    allowedProviders: ['customEndpoint'],
    env,
    skipWebFetchPreflight: true,
    feedbackDrafts: 'off',
    permissions: { deny: ['WebFetch', 'WebSearch'], disableBypassPermissionsMode: 'disable' },
    sandbox: { enabled: true, failIfUnavailable: true, allowUnsandboxedCommands: false, network: { allowedDomains: [localHostPort(p)], strictAllowlist: true } },
  });

  if (p.offlineRoute === 'claude')
    f['offline/xcode/ClaudeAgentConfig/settings.json'] = json({ env, skipWebFetchPreflight: true, feedbackDrafts: 'off', permissions: { deny: ['WebFetch', 'WebSearch'] } });

  if (p.offlineRoute === 'codex')
    f['offline/xcode/codex/config.toml'] = `# Copy to ~/Library/Developer/Xcode/CodingAssistant/codex/config.toml
# Keys from OpenAI's Codex config reference. Whether Xcode's bundled Codex honours a custom
# provider is not documented by Apple: verify with the Ollama/LM Studio server log.
model = "${m}"
model_provider = "local"
web_search = "disabled"
check_for_update_on_startup = false

[model_providers.local]
name = "Local ${p.runtime === 'ollama' ? 'Ollama' : 'LM Studio'}"
base_url = "${localBase(p)}/v1"
wire_api = "responses"

[analytics]
enabled = false

[feedback]
enabled = false

[history]
persistence = "none"
`;

  if (p.offlineRoute === 'acp')
    f['offline/xcode/local-agent-acp.sh'] = `#!/bin/sh
# Wrapper for Xcode > Settings > Intelligence > Add an Agent.
# Xcode needs an absolute path in "Command" and has no field for environment variables,
# so this script sets them and then starts your ACP agent. Edit AGENT before use.
AGENT="/Users/you/.local/bin/your-acp-agent"
${Object.entries(env)
  .map(([k, v]) => `export ${k}="${v}"`)
  .join('\n')}
exec "$AGENT" "$@"
`;

  f['offline/model-server.sh'] =
    p.runtime === 'ollama'
      ? `#!/bin/sh
# Ollama for local, offline agent work (docs.ollama.com/faq).
# Keeps the default 127.0.0.1 binding, turns cloud models and web search off,
# and raises the context window from the 4096-token default.
set -e
launchctl setenv OLLAMA_NO_CLOUD 1
launchctl setenv OLLAMA_CONTEXT_LENGTH 65536
ollama pull ${m}
echo "Now quit and restart the Ollama app, then check its log for: Ollama cloud disabled: true"
`
      : `#!/bin/sh
# LM Studio for local agent work (lmstudio.ai/docs/integrations/claude-code).
# Load ${m} with a context window above ~25k tokens in LM Studio first.
set -e
lms server start --port 1234
`;

  f['offline/verify-offline.sh'] = `#!/bin/sh
# Lists internet sockets of the agent, the model server and Xcode that are NOT on loopback.
# Run it while the agent works on a real task. Exit code 1 means something left (or listens beyond) the Mac.
found=0
for proc in claude node codex ollama "LM Studio" lms Xcode; do
  out=$(lsof -nP -i -a -c "$proc" 2>/dev/null | awk 'NR>1' | grep -v -E '127\\.0\\.0\\.1|\\[::1\\]|localhost')
  if [ -n "$out" ]; then
    echo "== $proc"
    echo "$out"
    found=1
  fi
done
[ "$found" -eq 0 ] && echo "No non-loopback sockets found for the agent, model server or Xcode."
exit "$found"
`;

  const route = { claude: 'A · Claude Agent inside Xcode', codex: 'B · Codex inside Xcode', acp: 'C · ACP agent', bridge: 'E · Claude Code in Terminal + xcrun mcpbridge' }[p.offlineRoute];
  f['offline/README.md'] = `# Offline kit: local model, zero telemetry

Model server: **${p.runtime === 'ollama' ? 'Ollama' : 'LM Studio'}** at \`${localBase(p)}\`, model \`${m}\`. Route: **${route}**.

## Install
1. \`sh offline/model-server.sh\`, then restart the model server app.
2. Policy for Claude Code (route E, and possibly the agent inside Xcode):
   \`sudo cp offline/managed-settings.json "/Library/Application Support/ClaudeCode/managed-settings.json"\`
   - \`allowedProviders: ["customEndpoint"]\` admits only the endpoint pinned in the managed \`env\` block.
   - The telemetry variables and \`skipWebFetchPreflight\` cover everything the docs list; WebFetch and WebSearch are denied.
${p.offlineRoute === 'claude' ? '3. Copy `offline/xcode/ClaudeAgentConfig/settings.json` to `~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/settings.json`. **Unverified**: Apple does not document env or a base URL for the built-in agent.\n' : ''}${p.offlineRoute === 'codex' ? '3. Copy `offline/xcode/codex/config.toml` to `~/Library/Developer/Xcode/CodingAssistant/codex/config.toml`. **Unverified** for the Codex that Xcode bundles.\n' : ''}${p.offlineRoute === 'acp' ? '3. Edit `AGENT` in `offline/xcode/local-agent-acp.sh`, make it executable, and enter its absolute path as the Command in Xcode > Settings > Intelligence > Add an Agent.\n' : ''}${p.offlineRoute === 'bridge' ? '3. `claude mcp add --transport stdio xcode -- xcrun mcpbridge`, enable "Allow external agents to use Xcode tools" in Xcode > Settings > Intelligence, and start `claude` from your project.\n' : ''}
## Verify
- \`/status\` in Claude Code shows the base URL and credential source.
- \`sh offline/verify-offline.sh\` during a real task: exit 0 means no non-loopback sockets.
- Run one task with Wi-Fi off. Then add an outbound firewall such as LuLu and block everything but 127.0.0.1.

## Sources
- Claude Code: data usage, network configuration, env vars, settings reference (allowedProviders, skipWebFetchPreflight), LLM gateway: https://code.claude.com/docs
- Apple: Intelligence in Xcode & Privacy, Extending and customizing agents, Setting up coding intelligence, deployment restrictions for Xcode
- Ollama: Anthropic compatibility and FAQ (https://docs.ollama.com) · LM Studio: Claude Code integration and app privacy (https://lmstudio.ai)
- Codex config reference: https://developers.openai.com/codex/config-reference
`;
  return f;
}

/** The permissions block, built from the learner's choices. Every entry here is explained in SECURITY.md. */
export function permissionLists(p: Policy) {
  const allow: string[] = [];
  const ask: string[] = [];
  const deny: string[] = [];

  if (ios(p)) allow.push('Bash(xcodebuild -scheme *)', 'Bash(swift build *)', 'Bash(swift test *)', 'Bash(xcrun simctl list *)');
  else allow.push('Bash(npm run test *)', 'Bash(npm run lint *)', 'Bash(npm run build *)');

  if (p.denySecrets) {
    deny.push('Read(./.env)', 'Read(./.env.*)', 'Read(./secrets/**)', 'Read(~/.ssh/**)', 'Read(~/.aws/**)');
    if (ios(p))
      deny.push(
        'Read(./**/*.p8)',
        'Read(./**/*.p12)',
        'Read(./**/*.mobileprovision)',
        'Read(./**/Secrets*.xcconfig)',
        'Read(~/.appstoreconnect/**)',
        'Read(~/private_keys/**)',
      );
  }
  if (p.askPush) ask.push('Bash(git push *)');
  if (p.denyNetCli) deny.push('Bash(curl *)', 'Bash(wget *)');
  if (p.offline) deny.push('WebFetch', 'WebSearch');

  if (ios(p)) {
    if (p.iosShipAsk) ask.push('Bash(fastlane *)', 'Bash(xcrun altool *)', 'Bash(xcrun notarytool *)', 'Bash(xcrun simctl erase *)');
    if (p.iosKeychainDeny)
      deny.push(
        'Bash(security find-generic-password *)',
        'Bash(security find-internet-password *)',
        'Bash(security dump-keychain *)',
        'Bash(security export *)',
      );
    if (p.iosPackageAsk) ask.push('Edit(./Package.swift)', 'Edit(./**/*.pbxproj)');
    if (p.iosSetup === 'bridge' && p.xcodeMcpRules) {
      allow.push('mcp__xcode__BuildProject', 'mcp__xcode__RunAllTests', 'mcp__xcode__DocumentationSearch', 'mcp__xcode__XcodeRead', 'mcp__xcode__RenderPreview');
      ask.push('mcp__xcode__XcodeUpdate');
    }
  }
  return { allow, ask, deny };
}

export function settingsJson(p: Policy) {
  const { allow, ask, deny } = permissionLists(p);
  const permissions: Record<string, unknown> = { defaultMode: p.startMode, allow, ask, deny };
  if (p.disableBypass) permissions.disableBypassPermissionsMode = 'disable';

  const out: Record<string, unknown> = { $schema: 'https://json.schemastore.org/claude-code-settings.json', permissions };

  if (p.offline) out.skipWebFetchPreflight = true;

  if (p.sandbox) {
    const denyRead = ['~/.ssh', '~/.aws'];
    if (ios(p)) denyRead.push('~/.appstoreconnect', '~/private_keys');
    const sb: Record<string, unknown> = {
      enabled: true,
      failIfUnavailable: true,
      filesystem: { denyRead },
      network: p.offline ? { allowedDomains: [localHostPort(p)], strictAllowlist: true } : { allowedDomains: lines(p.domains) },
    };
    if (p.strictSandbox) sb.allowUnsandboxedCommands = false;
    out.sandbox = sb;
  }

  const pre: unknown[] = [];
  const post: unknown[] = [];
  const cmd = (f: string, timeout?: number) => ({ type: 'command', command: `\${CLAUDE_PROJECT_DIR}/.claude/hooks/${f}`, ...(timeout ? { timeout } : {}) });
  if (p.guardHook) pre.push({ matcher: 'Bash', hooks: [cmd('guard-bash.sh', 30)] });
  if (ios(p) && p.iosSetup === 'bridge' && p.guardHook) pre.push({ matcher: 'mcp__xcode__.*', hooks: [cmd('guard-xcode-mcp.sh', 30)] });
  if (p.formatHook) post.push({ matcher: 'Edit|Write', hooks: [cmd('format.sh', 60)] });
  if (ios(p) && p.pbxprojHook) post.push({ matcher: 'Edit|Write', hooks: [cmd('lint-pbxproj.sh', 30)] });
  if (pre.length || post.length) out.hooks = { ...(pre.length ? { PreToolUse: pre } : {}), ...(post.length ? { PostToolUse: post } : {}) };

  return JSON.stringify(out, null, 2) + '\n';
}

const HEAD = `#!/usr/bin/env bash
# Generated by Guardrail Academy. Read it before you trust it: hooks run with your user's rights.
set -u
command -v jq >/dev/null 2>&1 || { echo "hook: jq is not installed, refusing to guess (fail closed)" >&2; exit 2; }
input=$(cat)
`;

function guardBash(p: Policy) {
  const rules: [string, string][] = [
    ['rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f?[[:space:]]+(/|~|\\$HOME)([[:space:]]|/?$)', 'recursive delete of / or your home folder'],
    ['git[[:space:]].*push.*(--force|-f([[:space:]]|$)|--force-with-lease)', 'force push'],
    ['git[[:space:]]+reset[[:space:]]+--hard', 'git reset --hard'],
    ['(curl|wget)[^|]*\\|[[:space:]]*(sudo[[:space:]]+)?(ba|z)?sh', 'piping a download into a shell'],
    ['chmod[[:space:]]+(-R[[:space:]]+)?777', 'chmod 777'],
    ['\\.git/hooks/', 'writing git hooks'],
  ];
  if (ios(p))
    rules.push(
      ['(^|[/[:space:]])security[[:space:]]+(find-generic-password|find-internet-password|dump-keychain|export)', 'reading the keychain'],
      ['\\.p8|\\.p12|\\.mobileprovision', 'touching signing keys or profiles'],
      ['simctl[[:space:]]+erase[[:space:]]+all', 'erasing every simulator'],
    );
  const body = rules.map(([re, why]) => `check '${re}' '${why}'`).join('\n');
  return `${HEAD}cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty') || { echo "guard: could not parse hook input" >&2; exit 2; }

# Block a command when it matches a pattern. Exit 2 = block, and stderr is the reason Claude sees.
# These patterns also catch /usr/bin/… and sh -c '…' forms that permission rules miss.
check() {
  if printf '%s' "$cmd" | grep -Eq -- "$1"; then
    echo "Blocked by guard-bash.sh: $2. Ask the user to run it themselves if it is really needed." >&2
    exit 2
  fi
}

${body}

exit 0
`;
}

const GUARD_XCODE_MCP = `${HEAD}tool=$(printf '%s' "$input" | jq -r '.tool_name // empty') || exit 2
# Edit(...) deny rules don't cover MCP tools, so check what Xcode's tools are asked to touch.
args=$(printf '%s' "$input" | jq -c '.tool_input // {}')
if printf '%s' "$args" | grep -Eqi '\\.p8|\\.p12|\\.mobileprovision|secrets[^"]*\\.xcconfig|\\.env'; then
  echo "Blocked by guard-xcode-mcp.sh: $tool targets a secrets or signing file." >&2
  exit 2
fi
mkdir -p "\${CLAUDE_PROJECT_DIR}/.claude" && printf '%s %s\\n' "$(date -u +%FT%TZ)" "$tool" >> "\${CLAUDE_PROJECT_DIR}/.claude/xcode-mcp.log"
exit 0
`;

function formatHook(p: Policy) {
  const body = ios(p)
    ? `case "$f" in
  *.swift) xcrun swift format --in-place "$f" 2>/dev/null || true ;;
esac`
    : `case "$f" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.json|*.md) npx --no-install prettier --write "$f" >/dev/null 2>&1 || true ;;
esac`;
  return `#!/usr/bin/env bash
# Generated by Guardrail Academy. Formatting is not a security control, so this hook fails open on purpose.
f=$(jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[ -n "$f" ] || exit 0
${body}
exit 0
`;
}

const LINT_PBXPROJ = `${HEAD}f=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty') || exit 2
case "$f" in
  *.pbxproj)
    command -v plutil >/dev/null 2>&1 || { echo "lint-pbxproj: plutil not found (it ships with macOS); could not validate $f" >&2; exit 2; }
    # PostToolUse can't undo the edit, but exit 2 hands the parse error to Claude to fix right away.
    if ! out=$(plutil -lint "$f" 2>&1); then
      echo "project.pbxproj no longer parses: $out" >&2
      exit 2
    fi ;;
esac
exit 0
`;

function securityMd(p: Policy, name: string) {
  const { allow, ask, deny } = permissionLists(p);
  const li = (xs: string[]) => (xs.length ? xs.map((x) => `- \`${x}\``).join('\n') : '- (none)');
  const setup = { xcode: 'A · Claude Agent inside Xcode', bridge: 'B · Claude Code in Terminal + Xcode MCP bridge', cli: 'C · Claude Code in Terminal, command-line tools only' }[p.iosSetup];
  return `# Guardrails for ${name}

Generated by Guardrail Academy. This file explains \`.claude/settings.json\` and the hook scripts next to it.
Commit both, so the whole team gets the same guardrails.

## Layers in this policy

| Layer | What it does here | What it does not do |
| --- | --- | --- |
| Permission rules | ${deny.length} deny, ${ask.length} ask, ${allow.length} allow rules | Rules match command text: \`/usr/bin/curl\` or \`sh -c\` can slip past a Bash rule |
| Mode | Sessions start in \`${p.startMode}\`${p.disableBypass ? '; bypass mode is disabled' : ''} | A repository can't set \`auto\` or \`bypassPermissions\` as its default |
| Hooks | ${[p.guardHook && 'guard-bash.sh blocks dangerous commands (fail closed)', p.formatHook && 'format.sh formats edited files', ios(p) && p.pbxprojHook && 'lint-pbxproj.sh validates project.pbxproj'].filter(Boolean).join('; ') || 'none'} | Hooks run with your rights, outside the sandbox |
| Sandbox | ${p.sandbox ? `on${p.strictSandbox ? ', strict (no unsandboxed retries)' : ''}; network limited to ${p.offline ? 'the local model server' : `${lines(p.domains).length} host(s)`}` : 'off'} | Only shell commands: not Read/Edit, MCP servers or hooks |

## Deny
${li(deny)}

## Ask (prompts in every mode, bypass included)
${li(ask)}

## Allow
${li(allow)}

## Requirements
- \`jq\` on your PATH (the guard hooks fail closed without it).
${p.sandbox ? '- Linux/WSL2: `bubblewrap` and `socat`. macOS: nothing extra (Seatbelt is built in). With `failIfUnavailable`, Claude Code refuses to start if the sandbox can\'t run.\n' : ''}- Make the hooks executable: \`chmod +x .claude/hooks/*.sh\`.

## Check it is in force
1. Run \`/permissions\` and \`/hooks\` in Claude Code: every rule and hook lists the file it came from.
2. Ask Claude to run \`git push --force\` in a scratch repo: guard-bash.sh should block it.
3. ${p.sandbox ? 'Ask Claude to `curl https://example.com`: the sandbox should refuse the host.' : 'Consider turning on the sandbox with `/sandbox`.'}
${
  ios(p)
    ? `
## iOS notes (${setup})
- Build with \`-derivedDataPath ./build/DerivedData\` so the sandbox doesn't need write access to \`~/Library\`. Add \`build/\` to \`.gitignore\`.
- Use https URLs for Swift packages; git over SSH doesn't pass the sandbox proxy.
- If \`xcrun simctl\` fails inside the sandbox, exclude exactly that command in \`sandbox.excludedCommands\` (never an interpreter).
${p.iosSetup === 'bridge' ? '- Xcode MCP tool names come from community reports. Run `/mcp` and adjust the `mcp__xcode__*` rules to what your Xcode exposes. MCP edits are not covered by `Edit(...)` rules; that is why `XcodeUpdate` is in ask and guard-xcode-mcp.sh checks its targets.\n' : ''}${p.iosSetup === 'xcode' ? '- The agent inside Xcode does **not** read this project\'s `.claude/` the way Claude Code does, and not `~/.claude/` either. See `xcode/README.md`.\n' : ''}`
    : ''
}`;
}

const XCODE_README = `# Using these guardrails with Claude Agent inside Xcode

Xcode keeps its own configuration for agents launched in Xcode:

    ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig

Apple: "These configurations only affect agents when you launch them in Xcode."
Your \`~/.claude/\` (settings, hooks, skills) does not apply there automatically.

## What is documented
- Xcode > Settings > Intelligence > Permissions: **Allowed Commands** and **Allowed Tools**. Keep these lists short.
- Undo: the **Undo Changes** button and the conversation **History** slider (needs a Git repository).
- MDM: \`CodingAssistantAllowExternalIntegrations = false\` turns the coding assistant off on managed Macs.

## What to verify yourself
Apple doesn't document hooks, settings.json permission rules or the Bash sandbox for the built-in agent.
To test whether a settings file in ClaudeAgentConfig is honoured, add a harmless hook that only logs:

    { "hooks": { "PreToolUse": [ { "matcher": "Bash", "hooks": [
      { "type": "command", "command": "echo \\"$(date) xcode-agent hook ran\\" >> /tmp/xcode-hook-test.log" } ] } ] } }

Run one command through the agent and check the log. Until you have seen it work, treat Xcode's Permissions
lists as the only enforced layer for the agent inside Xcode.
`;

/** Every file of the learner's policy, as { path: contents }. */
export function generateFiles(p: Policy): Record<string, string> {
  const name = p.name.trim() || 'my-project';
  const f: Record<string, string> = {};
  f['.claude/settings.json'] = settingsJson(p);
  if (p.guardHook) f['.claude/hooks/guard-bash.sh'] = guardBash(p);
  if (ios(p) && p.iosSetup === 'bridge' && p.guardHook) f['.claude/hooks/guard-xcode-mcp.sh'] = GUARD_XCODE_MCP;
  if (p.formatHook) f['.claude/hooks/format.sh'] = formatHook(p);
  if (ios(p) && p.pbxprojHook) f['.claude/hooks/lint-pbxproj.sh'] = LINT_PBXPROJ;
  f['SECURITY.md'] = securityMd(p, name);
  if (ios(p) && p.iosSetup === 'xcode') f['xcode/README.md'] = XCODE_README;
  if (p.offline) Object.assign(f, offlineFiles(p));
  return f;
}

export function downloadZip(p: Policy) {
  const files = generateFiles(p);
  const root = slug(p.name);
  const data: Record<string, [Uint8Array, { attrs: number; os: number }]> = {};
  for (const [path, body] of Object.entries(files)) {
    // Unix mode in the external attributes: 0755 for hook scripts, 0644 for the rest.
    const mode = path.endsWith('.sh') ? 0o100755 : 0o100644;
    data[`${root}-guardrails/${path}`] = [strToU8(body), { attrs: mode << 16, os: 3 }];
  }
  const blob = new Blob([zipSync(data) as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${root}-guardrails.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
