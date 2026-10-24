import { GuessGame } from './ui';

// Facts from the Permissions docs: wrappers and env assignments are stripped, any matching subcommand triggers deny,
// but absolute paths, sh -c and git -C are different command text.
const ITEMS: { q: string; a: 'caught' | 'slips'; why: string }[] = [
  { q: 'curl https://example.com', a: 'caught', why: 'The plain form Bash(curl *) was written for.' },
  { q: '/usr/bin/curl https://example.com', a: 'slips', why: 'Same program, different command text.' },
  { q: 'timeout 30 curl https://example.com', a: 'caught', why: 'timeout is one of the wrappers stripped before matching.' },
  { q: "sh -c 'curl https://example.com'", a: 'slips', why: 'The command is sh. Rules don’t look inside sh -c strings.' },
  { q: 'FOO=bar rm -rf tmp/', a: 'caught', why: 'Deny and ask rules match past any leading variable assignment.' },
  { q: 'npm test && rm -rf build/', a: 'caught', why: 'Compound commands are split; a deny applies if any part matches.' },
  { q: 'find . -name "*.tmp" | xargs rm', a: 'caught', why: 'Bare xargs (no flags) is stripped, so the rm part matches.' },
  { q: "python3 -c \"import shutil; shutil.rmtree('build')\"", a: 'slips', why: 'An interpreter deleting files is not an rm command.' },
  { q: 'git -C . push origin main', a: 'slips', why: 'The text no longer starts with “git push”.' },
  { q: 'git push origin main', a: 'caught', why: 'Exactly what Bash(git push *) matches.' },
];

export default function Bypass() {
  return (
    <div>
      <p className="mb-3 text-sm text-mute">
        Deny list: <code className="mono text-ink">Bash(curl *)</code> · <code className="mono text-ink">Bash(rm *)</code> · <code className="mono text-ink">Bash(git push *)</code>
      </p>
      <GuessGame
        prompt="Is it caught by the deny list?"
        items={ITEMS}
        choices={[
          ['caught', 'Caught by deny', 'var(--color-ok)'],
          ['slips', 'Slips through', 'var(--color-bad)'],
        ]}
      />
    </div>
  );
}
