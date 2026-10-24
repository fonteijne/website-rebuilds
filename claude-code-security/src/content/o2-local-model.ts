import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Claude Code against Ollama',
    body: 'Since v0.14.0, Ollama speaks the Anthropic Messages API. Point Claude Code at the server root (not /v1) and give it any placeholder token: the local server doesn’t validate keys. Pull the model first.',
    code: `ollama pull qwen3-coder
export ANTHROPIC_BASE_URL=http://127.0.0.1:11434
export ANTHROPIC_AUTH_TOKEN=ollama
claude --model qwen3-coder`,
    src: 'ollama-anthropic',
    tags: ['anthropic-compat', 'ollama-setup'],
  },
  {
    kind: 'idea',
    title: 'Claude Code against LM Studio',
    body: 'LM Studio added an Anthropic-compatible /v1/messages endpoint in 0.4.1. Start the server, point Claude Code at port 1234, and pass the model by name. If you turn on “Require Authentication”, use the generated token as ANTHROPIC_AUTH_TOKEN.',
    code: `lms server start --port 1234
export ANTHROPIC_BASE_URL=http://localhost:1234
export ANTHROPIC_AUTH_TOKEN=lmstudio
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
claude --model openai/gpt-oss-20b`,
    src: 'lmstudio-cc',
    tags: ['anthropic-compat', 'lmstudio-setup'],
  },
  {
    kind: 'idea',
    title: 'Keep Ollama local, and local only',
    body: 'Ollama binds 127.0.0.1:11434 by default; don’t change OLLAMA_HOST to 0.0.0.0 on a laptop. Turn cloud features off with OLLAMA_NO_CLOUD=1 (or "disable_ollama_cloud": true in ~/.ollama/server.json) and check the log for “Ollama cloud disabled: true”. A model name ending in :cloud runs on Ollama’s servers, not on your Mac. The macOS app reads variables set with launchctl setenv.',
    code: `launchctl setenv OLLAMA_NO_CLOUD 1
launchctl setenv OLLAMA_CONTEXT_LENGTH 65536
# then quit and restart the Ollama app`,
    src: ['ollama-faq', 'ollama-anthropic'],
    tags: ['ollama-setup'],
  },
  {
    kind: 'idea',
    title: 'What LM Studio sends',
    body: 'LM Studio’s privacy policy says messages, chat histories and documents are never transmitted from your system, and that the app has no telemetry or user-specific tracking. It does contact its servers when you search for or download a model, and when it checks for updates (sending app version, OS and IP address). Cloud features apply only if you buy them and choose to use them.',
    src: 'lmstudio-privacy',
    tags: ['lmstudio-setup'],
  },
  {
    kind: 'idea',
    title: 'Context length decides if it works',
    body: 'Ollama’s default context is 4,096 tokens, far too small for an agent that carries a system prompt, tool definitions and file contents. Raise it on the server with OLLAMA_CONTEXT_LENGTH; a client can’t change it for a running server. LM Studio recommends more than about 25k tokens for Claude Code.',
    guard: 'If a local agent forgets its instructions or loops, check the context length before blaming the model.',
    src: ['ollama-faq', 'lmstudio-cc'],
    tags: ['context-length'],
  },
  {
    kind: 'idea',
    title: 'Map the model aliases',
    body: 'Claude Code asks for opus, sonnet and haiku in different places. Map each alias to a local model, or background work (haiku is “also used for background functionality”) may ask for a model your server doesn’t have. CLAUDE_CODE_SUBAGENT_MODEL sets the default for subagents.',
    code: `"env": {
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "qwen3-coder",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen3-coder",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "qwen3-coder",
  "CLAUDE_CODE_SUBAGENT_MODEL": "qwen3-coder"
}`,
    src: 'cc-env-vars',
    tags: ['model-aliases'],
  },
  {
    kind: 'idea',
    title: 'What the local API doesn’t do',
    body: 'Ollama’s Anthropic layer doesn’t support tool_choice, metadata, the token-count endpoint, prompt caching or the Batches API, and accepts but doesn’t enforce budget_tokens. If a server rejects fields Claude Code sends, CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1 strips most pre-release fields.',
    src: ['ollama-anthropic', 'cc-gateway'],
    tags: ['compat-gaps'],
  },
  {
    kind: 'idea',
    title: 'The attribution header',
    body: 'Claude Code starts the system prompt with an attribution block carrying the client version and a prompt fingerprint. CLAUDE_CODE_ATTRIBUTION_HEADER=0 leaves it out. LM Studio’s Claude Code guide sets it; Anthropic’s reference explains that older versions put a per-request token there on custom base URLs, which defeats caching on servers that cache by request body.',
    src: ['cc-env-vars', 'lmstudio-cc'],
    tags: ['attribution-header'],
  },
  {
    kind: 'quiz',
    title: 'Your local agent keeps losing track of the task after a few tool calls. Ollama runs with default settings. First thing to check?',
    options: ['Switch to a :cloud model', 'OLLAMA_CONTEXT_LENGTH: the default is 4,096 tokens', 'Turn on prompt caching', 'Set CLAUDE_CODE_ATTRIBUTION_HEADER=1'],
    answer: 1,
    why: 'With a 4,096-token window the system prompt and tool definitions alone crowd out the conversation. Raise the context on the server. A :cloud model would leave the Mac, which defeats the point.',
    src: 'ollama-faq',
    tags: ['context-length'],
  },
];
