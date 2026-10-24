import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Trust, then verify the sockets',
    body: 'Settings tell you what should happen. To see what does, watch the agent’s connections while it works: run one real task, then list every socket the agent and the model server hold. Anything that isn’t 127.0.0.1 is a finding. In Claude Code, /status shows the active base URL and credential source.',
    code: `# connections per process, refreshed live
nettop -m tcp -p "$(pgrep -n -f claude)"
# one-shot list of open internet sockets for both
lsof -nP -i -a -c claude
lsof -nP -i -a -c ollama`,
    src: ['cc-gateway'],
    verify: true,
    tags: ['prove-it'],
  },
  {
    kind: 'idea',
    title: 'Let the sandbox allow only localhost',
    body: 'With the Bash sandbox on, sandboxed commands can only reach hosts on the allowlist. Hostnames that resolve to local addresses are refused unless you list the IP explicitly, so list the model server as 127.0.0.1 with its port and nothing else. strictAllowlist refuses other hosts instead of prompting. Remember the scope: this covers shell commands, not the agent’s own model requests or MCP servers.',
    code: `"sandbox": {
  "enabled": true,
  "network": {
    "allowedDomains": ["127.0.0.1:11434"],
    "strictAllowlist": true
  }
}`,
    src: 'cc-sandbox',
    tags: ['sandbox-localhost'],
  },
  {
    kind: 'idea',
    title: 'Wrap the whole process',
    body: 'The sandbox runtime (srt) puts all of Claude Code, file tools, hooks and MCP servers included, behind the same Seatbelt walls, and denies network by default. Allow only the local model endpoint. Note the docs’ caveat: with a third-party provider, the WebFetch check still calls api.anthropic.com unless skipWebFetchPreflight is set.',
    src: ['cc-envs', 'cc-data-usage'],
    verify: true,
    tags: ['sandbox-localhost'],
  },
  {
    kind: 'idea',
    title: 'Tools that leave on purpose',
    body: 'Zero telemetry doesn’t stop tools whose job is the network. WebFetch and WebSearch fetch the web; deny them. MCP servers run outside the Bash sandbox and talk to whatever they’re built for; keep only local ones such as xcrun mcpbridge. HTTP hooks POST to a URL; restrict them with allowedHttpHookUrls. Swift Package resolution and git push need the network by design: run them yourself.',
    code: `"permissions": {
  "deny": ["WebFetch", "WebSearch", "mcp__github__*"]
}`,
    src: ['cc-permissions', 'cc-hooks', 'cc-envs'],
    tags: ['outbound-tools'],
  },
  {
    kind: 'idea',
    title: 'An outbound firewall gets the last word',
    body: 'A per-process outbound firewall makes the policy visible and enforceable for all three parties, Xcode included. LuLu is a free, open-source macOS firewall that alerts on every new outgoing connection per program and turns your answer into a rule. Block the agent and the model server everywhere except 127.0.0.1, and see what still asks.',
    src: 'lulu',
    tags: ['firewall'],
  },
  {
    kind: 'demo',
    title: 'Does it leave the Mac?',
    demo: 'leaves',
    body: 'Local model on Ollama, zero-telemetry env block, cloud features off. Guess each one.',
    src: ['cc-data-usage', 'cc-network', 'ollama-faq', 'apple-privacy'],
    tags: ['prove-it', 'outbound-tools', 'local-not-offline'],
  },
  {
    kind: 'idea',
    title: 'Test with the network off',
    body: 'The simplest proof: turn Wi-Fi off and run a full task, build included. If anything breaks, it was online. Expect some things to fail for good reasons: Swift packages that aren’t cached, Apple documentation search, and simulator runtimes that aren’t downloaded yet.',
    guard: 'Run this test after every Xcode, agent or model-server update; updates change defaults.',
    src: ['apple-agents', 'cc-network'],
    verify: true,
    tags: ['prove-it'],
  },
  {
    kind: 'quiz',
    title: 'Everything is configured. Which check gives you hard evidence that the agent stays local?',
    options: ['The env block looks right', 'The agent says it’s offline', 'Watching its sockets (nettop/lsof or a firewall) during a real task', 'The model answers quickly'],
    answer: 2,
    why: 'Configuration is a claim; sockets are evidence. Watch the agent, the model server and Xcode during a real task, or block everything but 127.0.0.1 with a firewall and see what asks.',
    src: 'lulu',
    tags: ['prove-it', 'firewall'],
  },
];
