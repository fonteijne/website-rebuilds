import { useState } from 'react';
import { Badge, Tabs, type Verdict } from './ui';

type Out = 'silent' | 'allow' | 'ask' | 'deny' | 'exit2' | 'exit1';
type Rule = 'none' | 'allow' | 'ask' | 'deny';

const OUT: [Out, string][] = [
  ['silent', 'exit 0, no output'],
  ['allow', 'exit 0 + JSON allow'],
  ['ask', 'exit 0 + JSON ask'],
  ['deny', 'exit 0 + JSON deny'],
  ['exit2', 'exit 2 + stderr'],
  ['exit1', 'crash: exit 1'],
];
const RULE: [Rule, string][] = [
  ['none', 'no rule matches'],
  ['allow', 'allow rule matches'],
  ['ask', 'ask rule matches'],
  ['deny', 'deny rule matches'],
];

/** Manual mode. Logic from the Hooks and Permissions docs. */
function decide(o: Out, r: Rule): [Verdict, string] {
  if (o === 'exit2') return ['blocked', 'Exit 2 blocks before rules are evaluated. stderr goes to Claude as the reason.'];
  if (o === 'deny') return ['blocked', 'The hook denied it; permissionDecisionReason goes to Claude.'];
  const fall = o === 'silent' || o === 'exit1';
  const pre = o === 'exit1' ? 'Exit 1 is a non-blocking error: you see a notice, and the call continues. ' : fall ? 'Silence isn’t approval: the call falls through. ' : '';
  if (r === 'deny') return ['blocked', `${pre}The deny rule still applies; a hook can’t loosen it.`];
  if (r === 'ask') return ['prompts', `${pre}The ask rule still prompts, even if the hook said allow.`];
  if (o === 'ask') return ['prompts', 'The hook asked for a prompt.'];
  if (o === 'allow') return ['runs', 'The hook’s allow skips the prompt (no deny or ask rule in the way).'];
  if (r === 'allow') return ['runs', `${pre}The allow rule approves it.`];
  return ['prompts', `${pre}No rule matches, so Manual mode asks you.`];
}

export default function HookSim() {
  const [o, setO] = useState<Out>('exit1');
  const [r, setR] = useState<Rule>('none');
  const [v, why] = decide(o, r);
  return (
    <div>
      <div className="label">Your PreToolUse hook</div>
      <Tabs label="Hook outcome" value={o} onChange={setO} options={OUT} />
      <div className="label">Permission rules for this call</div>
      <Tabs label="Matching rule" value={r} onChange={setR} options={RULE} />
      <div className="flex flex-wrap items-start gap-3 rounded-xl border border-line p-4" role="status">
        <Badge v={v} />
        <p className="min-w-0 flex-1 text-sm leading-relaxed">{why}</p>
      </div>
      <p className="mt-3 text-xs text-mute">Manual mode, a Bash call. Hooks run before the permission check.</p>
    </div>
  );
}
