export interface Source {
  label: string;
  url: string;
  /** true when the claim comes from third-party write-ups rather than vendor documentation */
  secondhand?: boolean;
}

const cc = (p: string) => `https://code.claude.com/docs/en/${p}`;
const apple = (p: string) => `https://developer.apple.com/documentation/xcode/${p}`;

export const SOURCES: Record<string, Source> = {
  'cc-security': { label: 'CC docs · Security', url: cc('security') },
  'cc-permissions': { label: 'CC docs · Permissions', url: cc('permissions') },
  'cc-modes': { label: 'CC docs · Permission modes', url: cc('permission-modes') },
  'cc-hooks': { label: 'CC docs · Hooks', url: cc('hooks') },
  'cc-sandbox': { label: 'CC docs · Sandboxing', url: cc('sandboxing') },
  'cc-envs': { label: 'CC docs · Sandbox environments', url: cc('sandbox-environments') },
  'cc-devcontainer': { label: 'CC docs · Dev containers', url: cc('devcontainer') },
  'cc-managed': { label: 'CC docs · Managed settings', url: cc('managed-settings') },
  'cc-settings': { label: 'CC docs · Settings', url: cc('settings') },
  'cc-mcp': { label: 'CC docs · MCP', url: cc('mcp') },
  'cc-checkpointing': { label: 'CC docs · Checkpointing', url: cc('checkpointing') },
  'cc-data-usage': { label: 'CC docs · Data usage', url: cc('data-usage') },
  'cc-network': { label: 'CC docs · Network configuration', url: cc('network-config') },
  'cc-gateway': { label: 'CC docs · Connect to an LLM gateway', url: cc('llm-gateway-connect') },
  'cc-env-vars': { label: 'CC docs · Environment variables', url: cc('env-vars') },
  'cc-settings-ref': { label: 'CC docs · All settings', url: cc('settings-reference') },
  'cc-directory': { label: 'CC docs · The .claude directory', url: cc('claude-directory') },
  'apple-privacy': { label: 'Apple · Intelligence in Xcode & Privacy', url: 'https://www.apple.com/legal/privacy/data/en/intelligence-xcode/' },
  'apple-mdm': { label: 'Apple · Deployment: Xcode restrictions', url: 'https://support.apple.com/guide/deployment/dep739685973' },
  'ollama-anthropic': { label: 'Ollama docs · Anthropic compatibility', url: 'https://docs.ollama.com/api/anthropic-compatibility' },
  'ollama-openai': { label: 'Ollama docs · OpenAI compatibility', url: 'https://docs.ollama.com/api/openai-compatibility' },
  'ollama-faq': { label: 'Ollama docs · FAQ', url: 'https://docs.ollama.com/faq' },
  'lmstudio-cc': { label: 'LM Studio docs · Claude Code', url: 'https://lmstudio.ai/docs/integrations/claude-code' },
  'lmstudio-privacy': { label: 'LM Studio · App privacy policy', url: 'https://lmstudio.ai/app-privacy' },
  'codex-config': { label: 'OpenAI · Codex config reference', url: 'https://developers.openai.com/codex/config-reference' },
  'devin-acp': { label: 'Devin docs · ACP agent in Xcode', url: 'https://docs.devin.ai/cli/acp/xcode', secondhand: true },
  lulu: { label: 'Objective-See · LuLu firewall', url: 'https://objective-see.org/products/lulu.html' },
  'apple-setup': { label: 'Apple · Setting up coding intelligence', url: apple('setting-up-coding-intelligence') },
  'apple-agents': { label: 'Apple · Extending and customizing agents', url: apple('extending-and-customizing-agents') },
  'apple-external': { label: 'Apple · External agents', url: apple('giving-external-agents-access-to-xcode') },
  'apple-writing': { label: 'Apple · Writing code with intelligence', url: apple('writing-code-with-intelligence-in-xcode') },
  fatbobman: { label: 'fatbobman.com · Xcode 26.3 + Claude Agent', url: 'https://fatbobman.com/en/posts/xcode-263-claude/', secondhand: true },
  community: { label: 'Community write-ups', url: 'https://danielsaidi.com/blog/2026/04/30/using-xcode-mcp-with-claude-code', secondhand: true },
  practice: { label: 'Field notes · test it yourself', url: 'https://code.claude.com/docs/en/sandboxing', secondhand: true },
};
