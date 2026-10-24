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
  'apple-setup': { label: 'Apple · Setting up coding intelligence', url: apple('setting-up-coding-intelligence') },
  'apple-agents': { label: 'Apple · Extending and customizing agents', url: apple('extending-and-customizing-agents') },
  'apple-external': { label: 'Apple · External agents', url: apple('giving-external-agents-access-to-xcode') },
  'apple-writing': { label: 'Apple · Writing code with intelligence', url: apple('writing-code-with-intelligence-in-xcode') },
  fatbobman: { label: 'fatbobman.com · Xcode 26.3 + Claude Agent', url: 'https://fatbobman.com/en/posts/xcode-263-claude/', secondhand: true },
  community: { label: 'Community write-ups', url: 'https://danielsaidi.com/blog/2026/04/30/using-xcode-mcp-with-claude-code', secondhand: true },
  practice: { label: 'Field notes · test it yourself', url: 'https://code.claude.com/docs/en/sandboxing', secondhand: true },
};
