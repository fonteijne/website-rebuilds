import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Five routes from Xcode to a local model',
    body: 'A. Claude Agent inside Xcode, configured through its own ClaudeAgentConfig folder. B. Codex inside Xcode, configured through Xcode’s codex folder. C. A custom agent added over the Agent Client Protocol (ACP). D. A “Locally Hosted” chat provider: chat only, no agent tools. E. Claude Code in Terminal on a local model, reaching Xcode’s build and preview tools through xcrun mcpbridge.',
    guard: 'Only route E is fully documented end to end today. The others need a test on your Mac.',
    src: ['apple-setup', 'apple-agents', 'apple-external'],
    tags: ['xcode-routes'],
  },
  {
    kind: 'demo',
    title: 'Compare the routes',
    demo: 'routes',
    body: 'How each route reaches a local model, how you silence its telemetry, whether policy can enforce it, and how much of that is documented.',
    src: ['apple-setup', 'apple-agents', 'cc-gateway', 'codex-config', 'devin-acp'],
    tags: ['xcode-routes'],
  },
  {
    kind: 'idea',
    title: 'Xcode starts agents in a restricted environment',
    body: 'Agents launched by Xcode don’t read your shell profile, so an export in .zshrc never reaches them. Apple’s answer is product-specific configuration files in ~/Library/Developer/Xcode/CodingAssistant, which “only affect agents when you launch them in Xcode”. Put endpoint and telemetry variables there, or in system-wide managed settings, never in your shell.',
    src: ['apple-agents', 'fatbobman'],
    tags: ['restricted-env'],
  },
  {
    kind: 'idea',
    title: 'Route A: Claude Agent with a local endpoint',
    body: 'Claude Agent in Xcode reads ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig. A community write-up shows Xcode setting CLAUDE_CONFIG_DIR to that folder, which suggests a settings.json there is read like ~/.claude/settings.json, env block included. Apple doesn’t document env or a custom base URL for the built-in agent, and it signs in through Xcode. Treat this as an experiment: add the file, run one prompt, check the Ollama log for the request.',
    code: `// ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/settings.json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:11434",
    "ANTHROPIC_AUTH_TOKEN": "ollama",
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "skipWebFetchPreflight": true
}`,
    src: ['apple-agents', 'fatbobman', 'cc-settings-ref'],
    verify: true,
    tags: ['route-claude-agent'],
  },
  {
    kind: 'idea',
    title: 'Route B: Codex with a local provider',
    body: 'Xcode keeps Codex configuration in ~/Library/Developer/Xcode/CodingAssistant/codex. Codex’s own config reference defines custom providers (the IDs openai, ollama and lmstudio are reserved, so pick another), and Ollama serves the OpenAI Responses API since v0.13.3. Codex also has switches for analytics, feedback and update checks. Whether Xcode’s bundled Codex honours a custom model_provider isn’t documented by Apple.',
    code: `# ~/Library/Developer/Xcode/CodingAssistant/codex/config.toml
model = "qwen3-coder"
model_provider = "local"

[model_providers.local]
name = "Local Ollama"
base_url = "http://127.0.0.1:11434/v1"
wire_api = "responses"

[analytics]
enabled = false

[feedback]
enabled = false`,
    src: ['apple-agents', 'codex-config', 'ollama-openai'],
    verify: true,
    tags: ['route-codex'],
  },
  {
    kind: 'idea',
    title: 'Route C: an ACP agent, with a wrapper',
    body: 'Xcode › Settings › Intelligence › Add an Agent registers any agent that speaks the Agent Client Protocol. The sheet takes a name, a command and arguments. A vendor guide notes two catches: the command must be an absolute path (no ~, no shell PATH), and there is no field for environment variables. So point the command at a small wrapper script that exports the local endpoint and telemetry switches, then execs the agent.',
    code: `#!/bin/sh
# /Users/you/bin/local-agent-acp: absolute path goes in Xcode's "Command" field
export ANTHROPIC_BASE_URL=http://127.0.0.1:11434
export ANTHROPIC_AUTH_TOKEN=ollama
export DISABLE_TELEMETRY=1
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
exec /Users/you/.local/bin/your-acp-agent "$@"`,
    src: ['apple-setup', 'devin-acp'],
    verify: true,
    tags: ['route-acp'],
  },
  {
    kind: 'idea',
    title: 'Route D: a locally hosted chat provider',
    body: 'Under Chat, “Add a Chat Provider” › Locally Hosted takes a port on your Mac. The server must support the Chat Completions API with /v1/models and /v1/chat/completions, which Ollama and LM Studio both serve. This is a chat model, not an agent: it answers and proposes code, but doesn’t run tools, builds or commands.',
    src: ['apple-setup', 'ollama-openai'],
    tags: ['route-chat'],
  },
  {
    kind: 'idea',
    title: 'Route E: the terminal agent keeps the controls',
    body: 'Run Claude Code in Terminal on the local model and give it Xcode’s tools with claude mcp add --transport stdio xcode -- xcrun mcpbridge. Everything in this track then applies with documented behaviour: env in settings, managed settings, allowedProviders, the sandbox and hooks. Xcode only provides tools; the model traffic never passes through Xcode.',
    code: `claude mcp add --transport stdio xcode -- xcrun mcpbridge`,
    src: ['apple-external', 'cc-gateway', 'cc-settings-ref'],
    tags: ['route-bridge'],
  },
  {
    kind: 'diff',
    title: 'Configuring the agent: Terminal vs inside Xcode',
    left: 'Claude Code in Terminal (route E)',
    right: 'Agents inside Xcode (routes A–C)',
    same: ['Same variables: ANTHROPIC_BASE_URL, DISABLE_TELEMETRY, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC', 'The local model server and its own switches are identical'],
    different: [
      ['~/.claude/settings.json, shell exports, managed settings', 'ClaudeAgentConfig/ or codex/ under ~/Library/Developer/Xcode/CodingAssistant; shell exports ignored'],
      ['Documented end to end, verifiable with /status', 'Endpoint and env behaviour not documented by Apple: test it'],
      ['Policy: allowedProviders + managed env pin', 'Policy: Xcode MDM keys; whether Claude Code managed settings reach the bundled agent is unverified'],
    ],
    src: ['apple-agents', 'cc-settings-ref', 'apple-mdm'],
    verify: true,
    tags: ['xcode-routes', 'restricted-env'],
  },
  {
    kind: 'quiz',
    title: 'You add an ACP agent in Xcode and export ANTHROPIC_BASE_URL in ~/.zshrc. The agent still talks to the cloud. Why?',
    options: ['ACP agents can’t use local models', 'Xcode doesn’t read your shell profile and the sheet has no env field; use a wrapper script', 'The port must be 443', 'ANTHROPIC_BASE_URL only works in plan mode'],
    answer: 1,
    why: 'Xcode launches agents in a restricted environment without your shell configuration. A wrapper script at an absolute path that exports the variables and execs the agent gets them there.',
    src: ['apple-agents', 'devin-acp'],
    tags: ['route-acp', 'restricted-env'],
  },
];
