import { useState } from 'react';
import { Tabs } from './ui';

type T = 'pkg' | 'ui' | 'night' | 'review' | 'ship';
const TASKS: [T, string, { where: string; how: string; why: string }][] = [
  ['pkg', 'Refactor a pure Swift package', { where: 'Cloud session or dev container', how: 'swift build / swift test on Linux', why: 'No UIKit or SwiftUI means Linux can build and test it, inside a full boundary.' }],
  ['ui', 'Fix a SwiftUI screen', { where: 'Your Mac: Xcode agent (A) or Claude Code + mcpbridge (B)', how: 'Manual or acceptEdits, Bash sandbox on, previews via Xcode', why: 'Needs Xcode and previews. You are there to approve, so a per-command sandbox is enough.' }],
  ['night', 'Unattended: fix failing UI tests overnight', { where: 'macOS VM or a dedicated Mac/user', how: 'Sandbox runtime or dontAsk, narrow allow list, no signing keys in reach', why: 'Simulators need macOS; nobody is watching, so the whole process needs a boundary.' }],
  ['review', 'Review an unknown open-source iOS app', { where: 'macOS VM (or a cloud session for reading only)', how: 'Plan mode first; claude -p only with --setting-sources user', why: 'Its project may run scripts, plugins and macros at build time, and may ship its own hooks.' }],
  ['ship', 'Upload a build to TestFlight', { where: 'You, not the agent', how: 'ask rules on fastlane / altool / notarytool; API keys out of reach', why: 'Outward-facing and irreversible from the agent’s side.' }],
];

export default function IosEnv() {
  const [t, setT] = useState<T>('night');
  const r = TASKS.find((x) => x[0] === t)![2];
  return (
    <div>
      <Tabs label="Task" value={t} onChange={setT} options={TASKS.map(([id, l]) => [id, l])} />
      <dl className="grid gap-3 rounded-xl border border-ios/30 bg-ios/[0.05] p-4 text-sm sm:grid-cols-[8rem_1fr]" role="status">
        <dt className="mono text-xs uppercase tracking-wider text-ios">Where</dt>
        <dd className="font-medium">{r.where}</dd>
        <dt className="mono text-xs uppercase tracking-wider text-ios">How</dt>
        <dd>{r.how}</dd>
        <dt className="mono text-xs uppercase tracking-wider text-ios">Why</dt>
        <dd className="text-mute">{r.why}</dd>
      </dl>
    </div>
  );
}
