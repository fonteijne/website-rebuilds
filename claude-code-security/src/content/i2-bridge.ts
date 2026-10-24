import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Connecting Claude Code to Xcode',
    body: 'In Xcode › Settings › Intelligence, under Model Context Protocol, turn on “Allow external agents to use Xcode tools”. Register the bridge with Claude Code. Open the project in Xcode before you prompt. Xcode shows when an external agent connects and while it’s active.',
    code: `claude mcp add --transport stdio xcode -- xcrun mcpbridge
claude mcp list`,
    src: 'apple-external',
    tags: ['mcpbridge'],
  },
  {
    kind: 'idea',
    title: 'Xcode’s tools become MCP tools',
    body: 'The bridge exposes about twenty IDE tools, reported to include BuildProject, RunAllTests, XcodeRead, XcodeUpdate, RenderPreview and DocumentationSearch. In Claude Code they are named mcp__xcode__<Tool>, so the usual MCP permission rules apply. Run /mcp to see the exact list your Xcode version exposes.',
    code: `"allow": ["mcp__xcode__BuildProject", "mcp__xcode__RunAllTests",
          "mcp__xcode__DocumentationSearch", "mcp__xcode__XcodeRead"],
"ask":   ["mcp__xcode__XcodeUpdate"]`,
    src: 'community',
    verify: true,
    tags: ['xcode-tools'],
  },
  {
    kind: 'diff',
    title: 'Two gates instead of one',
    left: 'Claude Code’s side',
    right: 'Xcode’s side',
    same: ['Both can refuse the agent', 'Neither replaces reviewing what the agent changed'],
    different: [
      ['Permission rules on mcp__xcode__* tools, hooks matching mcp__xcode__.*', 'The Intelligence toggle, and a dialog to allow the MCP connection'],
      ['Decides per tool call', 'Decides per connection'],
    ],
    src: 'apple-external',
    tags: ['two-gates'],
  },
  {
    kind: 'idea',
    title: 'The gap: MCP edits aren’t Edit calls',
    body: 'Edit(…) rules apply to Claude Code’s built-in file tools. A file written through mcp__xcode__XcodeUpdate is an MCP tool call, so your Edit deny rules don’t match it. MCP servers also run outside the Bash sandbox, and checkpoints only track Claude’s own file tools, so /rewind may not restore those edits.',
    guard: 'Cover Xcode’s write tools with ask rules, plus a PreToolUse hook on mcp__xcode__.* that checks the target path. Commit before big sessions.',
    src: 'cc-permissions',
    tags: ['mcp-edit-gap'],
  },
  {
    kind: 'idea',
    title: 'Don’t automate the dialog away',
    body: 'Xcode’s connection prompt can get repetitive, and some people script a SessionStart hook that clicks “Allow” for them. That removes the one gate that lives outside Claude Code. If the prompt bothers you, fix the cause (one long-lived session) rather than the gate.',
    src: 'community',
    tags: ['two-gates'],
  },
  {
    kind: 'quiz',
    title: 'You deny Edit(./Config/**). Through the bridge, can Claude change Config/Secrets.xcconfig?',
    options: ['No, the deny rule covers every write', 'Possibly: XcodeUpdate is an MCP tool, not the Edit tool, so the rule doesn’t match it', 'No, MCP tools are read-only', 'Only with the sandbox off'],
    answer: 1,
    why: 'Edit rules apply to built-in file tools. Add an ask or deny rule for the MCP write tool, or a PreToolUse hook on mcp__xcode__.* that inspects the path, and keep secrets out of the repo.',
    src: 'cc-permissions',
    tags: ['mcp-edit-gap'],
  },
];
