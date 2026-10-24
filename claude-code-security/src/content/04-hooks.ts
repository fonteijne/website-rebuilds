import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Deterministic, unlike a prompt',
    body: 'A hook is a command (or HTTP call, MCP tool, or model check) that Claude Code runs at a lifecycle event. A CLAUDE.md instruction is a suggestion the model may forget; a hook runs every time the event fires.',
    src: 'cc-hooks',
    tags: ['hook-what'],
  },
  {
    kind: 'idea',
    title: 'The events that matter for security',
    body: 'There are over thirty events. For guarding, start with these: PreToolUse (before a tool call; can block it), PermissionRequest (when a prompt would appear; can answer it), PostToolUse (after a call; can check results), UserPromptSubmit, SessionStart, and ConfigChange (to audit or block settings changes mid-session).',
    src: 'cc-hooks',
    tags: ['hook-events'],
  },
  {
    kind: 'idea',
    title: 'Event → matcher → handler',
    body: 'Three levels. The matcher selects tools: exact names, or lists like Edit|Write. Any other character turns it into an unanchored JavaScript regex, like mcp__.* for every MCP tool. The optional if field uses permission-rule syntax, but it’s best-effort: use the permission system for hard rules.',
    code: `{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "\${CLAUDE_PROJECT_DIR}/.claude/hooks/guard-bash.sh",
        "timeout": 30
      }]
    }]
  }
}`,
    src: 'cc-hooks',
    tags: ['hook-config'],
  },
  {
    kind: 'idea',
    title: 'What the hook receives',
    body: 'JSON on stdin: session_id, cwd, permission_mode, hook_event_name and, for tool events, tool_name and tool_input (for Bash: command, description, timeout). CLAUDE_PROJECT_DIR points at the project root, even inside a worktree.',
    code: `cmd=$(jq -r '.tool_input.command // ""')`,
    src: 'cc-hooks',
    tags: ['hook-input'],
  },
  {
    kind: 'demo',
    title: 'Exit codes decide',
    demo: 'hooksim',
    body: 'Pick what your hook script does and what rules exist. See what Claude Code does with the call.',
    src: 'cc-hooks',
    tags: ['hook-exit', 'hook-json', 'hook-precedence'],
  },
  {
    kind: 'idea',
    title: 'exit 1 does not block',
    body: 'Exit 0 is success. Exit 2 is a blocking error: the call stops and stderr goes back to Claude as the reason. Any other code, including the Unix-standard 1, is a non-blocking error: the user sees a notice and the action proceeds. A crashing guard script waves everything through.',
    guard: 'End every deny path with exit 2. Test the crash path too.',
    src: 'cc-hooks',
    tags: ['hook-exit'],
  },
  {
    kind: 'idea',
    title: 'Answering with JSON',
    body: 'Exit 0 and print one JSON object to decide more precisely: permissionDecision allow, deny, ask or defer, with a permissionDecisionReason. updatedInput can rewrite the tool’s arguments; additionalContext adds a note to Claude’s context. Saying nothing is not approval: the call falls through to the normal permission flow.',
    code: `{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Force pushes are not allowed here"
  }
}`,
    src: 'cc-hooks',
    tags: ['hook-json'],
  },
  {
    kind: 'idea',
    title: 'Hooks tighten, they never loosen',
    body: 'A hook’s allow does not override rules: matching deny rules still block and ask rules still prompt. A blocking hook, though, stops the call before rules are evaluated, so it beats allow rules. That gives a useful pattern: allow Bash broadly, and let a PreToolUse hook reject the few commands you never want.',
    src: 'cc-permissions',
    tags: ['hook-precedence'],
  },
  {
    kind: 'idea',
    title: 'PostToolUse checks after the fact',
    body: 'After an edit, run the formatter, a linter or a validator. It can’t undo what happened, but exit 2 sends stderr to Claude, which then fixes its own mistake in the next step.',
    code: `"PostToolUse": [{
  "matcher": "Edit|Write",
  "hooks": [{ "type": "command",
    "command": "\${CLAUDE_PROJECT_DIR}/.claude/hooks/format.sh" }]
}]`,
    src: 'cc-hooks',
    tags: ['hook-post'],
  },
  {
    kind: 'idea',
    title: 'Hooks run with your rights',
    body: 'Command hooks inherit your environment and run on the host, outside the Bash sandbox. A hook from a repository you cloned is code from that repository. Read hook scripts like any other code, and use /hooks to see every hook and the file it came from.',
    src: 'cc-envs',
    tags: ['hook-risk'],
  },
  {
    kind: 'idea',
    title: 'Fail closed',
    body: 'If the guard can’t decide (jq missing, JSON unparseable, timeout), it should block, not shrug. Check dependencies first and exit 2 when they’re missing. For command and http hooks you can also set "onFailure": "block" so a failure, timeout or invalid output blocks the action.',
    code: `command -v jq >/dev/null || { echo "guard: jq not installed" >&2; exit 2; }`,
    src: 'cc-hooks',
    verify: true,
    tags: ['fail-closed'],
  },
  {
    kind: 'idea',
    title: 'Five handler types',
    body: 'command (shell), http (POST the input to a URL; restrict with allowedHttpHookUrls), mcp_tool (call an MCP tool), prompt (a single model call that returns a decision) and agent (a subagent with read tools; experimental). Prompt and agent hooks add judgment, but they are models: use them as a second opinion, not as your only guard.',
    src: 'cc-hooks',
    tags: ['hook-types'],
  },
  {
    kind: 'quiz',
    title: 'Your PreToolUse guard crashes with exit code 1 on an odd command. That command was rm -rf build/ in acceptEdits mode. What happens?',
    options: ['It is blocked, because the hook failed', 'It runs: exit 1 is a non-blocking error, and acceptEdits auto-approves rm in the working directory', 'Claude Code asks you', 'Claude Code stops the session'],
    answer: 1,
    why: 'Only exit 2 (or onFailure: "block") blocks. Exit 1 shows an error notice and the call continues through the normal flow, where acceptEdits approves rm inside the project.',
    src: 'cc-hooks',
    tags: ['hook-exit', 'fail-closed'],
  },
  {
    kind: 'dogfood',
    title: 'Dogfood: add hooks',
    step: 'hooks',
    body: 'Choose the hooks for your policy. The Builder writes the scripts for you, fail-closed.',
    tags: ['hook-config'],
  },
];
