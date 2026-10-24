import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { downloadZip, generateFiles, permissionLists, slug } from '../lib/generate';
import { href } from '../lib/route';
import Dogfood from './dogfood';
import type { DogfoodId } from '../content/types';

const STEPS: { id: DogfoodId; title: string; hint: string; ios?: boolean; air?: boolean }[] = [
  { id: 'profile', title: '1 · Project', hint: 'name · stack' },
  { id: 'rules', title: '2 · Permission rules', hint: 'deny · ask · allow' },
  { id: 'mode', title: '3 · Starting mode', hint: 'defaultMode' },
  { id: 'hooks', title: '4 · Hooks', hint: 'PreToolUse · PostToolUse' },
  { id: 'sandbox', title: '5 · Sandbox', hint: 'filesystem · network' },
  { id: 'ios', title: '6 · iOS / Xcode', hint: 'setup · signing · shipping', ios: true },
  { id: 'offline', title: '7 · Offline & telemetry', hint: 'local model · zero telemetry', air: true },
];

const colorOf = (p: string) =>
  p.startsWith('offline/') ? 'var(--color-air)' : p.endsWith('settings.json') ? 'var(--color-guard)' : p.endsWith('.sh') ? 'var(--color-warn)' : p.startsWith('xcode/') ? 'var(--color-ios)' : 'var(--color-info)';

export default function Builder() {
  const { policy: p } = useStore();
  const files = useMemo(() => generateFiles(p), [p]);
  const paths = Object.keys(files);
  const [sel, setSel] = useState('.claude/settings.json');
  const [open, setOpen] = useState<DogfoodId | ''>('profile');
  const current = files[sel] !== undefined ? sel : '.claude/settings.json';
  const { deny, ask } = permissionLists(p);
  const ios = p.profile === 'ios';

  // Readiness checks: the minimum the academy considers a sound local policy.
  const checks: [string, boolean][] = [
    ['Named project', !!p.name.trim()],
    ['Secrets denied for file tools', p.denySecrets],
    ['A human sees every push', p.askPush],
    ['Bypass mode disabled', p.disableBypass],
    ['A PreToolUse guard that fails closed', p.guardHook],
    ['Sandbox on, with a short host allowlist', p.sandbox && p.domains.split('\n').filter((l) => l.trim()).length > 0 && p.domains.split('\n').filter((l) => l.trim()).length <= 8],
    ['No unsandboxed retries', p.sandbox && p.strictSandbox],
  ];
  if (ios) {
    checks.push(['Shipping actions gated by ask rules', p.iosShipAsk], ['Keychain CLI denied', p.iosKeychainDeny], ['project.pbxproj validated after edits', p.pbxprojHook]);
    if (p.iosSetup === 'bridge') checks.push(['Xcode MCP write tool covered', p.xcodeMcpRules && p.guardHook]);
  }
  if (p.offline)
    checks.push(
      ['Model endpoint pinned in managed settings', true],
      ['Telemetry and nonessential traffic off', true],
      ['WebFetch preflight skipped, WebFetch/WebSearch denied', true],
    );
  const ok = checks.filter((c) => c[1]).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mono text-sm text-guard">The dogfood capstone</div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">Policy Builder</h1>
      <p className="mt-2 max-w-2xl text-mute">
        The same forms you met in the modules. The files on the right are generated live: a <code className="mono text-ink">.claude/settings.json</code>, fail-closed hook scripts and a SECURITY.md that explains every rule. Unzip into your project, run <code className="mono text-ink">chmod +x .claude/hooks/*.sh</code>, and check with <code className="mono text-ink">/permissions</code>.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          {STEPS.map((s) => (
            <section key={s.id} className={`panel overflow-hidden ${s.ios ? '!border-ios/30' : s.air ? '!border-air/30' : ''}`}>
              <button className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? '' : s.id)}>
                <span className="font-medium">{s.title}</span>
                <span className="mono text-right text-xs text-mute">{s.hint}</span>
              </button>
              {open === s.id && (
                <div className="px-4 pb-4">
                  <Dogfood step={s.id} />
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="min-w-0 space-y-4">
          <section className="panel p-4" aria-label="Readiness">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Checks</h2>
              <span className="mono text-sm text-mute">
                {ok}/{checks.length}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {checks.map(([l, pass]) => (
                <li key={l} className="flex gap-2.5">
                  <span className={pass ? 'text-ok' : 'text-mute'} aria-hidden>
                    {pass ? '✓' : '○'}
                  </span>
                  <span className={pass ? '' : 'text-mute'}>{l}</span>
                  <span className="sr-only">{pass ? 'done' : 'not yet'}</span>
                </li>
              ))}
            </ul>
            <div className="mono mt-3 text-xs text-mute">
              {deny.length} deny · {ask.length} ask · profile {p.profile}
              {ios ? ` · setup ${p.iosSetup.toUpperCase()}` : ''}
            </div>
            <button className="btn btn-primary mt-4 w-full justify-center" onClick={() => downloadZip(p)}>
              Download {slug(p.name)}-guardrails.zip
            </button>
            <p className="mt-2 text-xs text-mute">Generated in your browser; nothing is uploaded. Review the scripts before you use them.</p>
          </section>

          <section className="panel overflow-hidden" aria-label="Generated files">
            <div className="grid sm:grid-cols-[13rem_minmax(0,1fr)]">
              <ul className="mono max-h-96 overflow-auto border-b border-line p-2 text-[12px] sm:border-b-0 sm:border-r" data-lenis-prevent>
                {paths.map((path) => (
                  <li key={path}>
                    <button onClick={() => setSel(path)} aria-pressed={current === path} className={`w-full truncate rounded px-2 py-1 text-left ${current === path ? 'bg-white/10' : 'hover:bg-white/5'}`} style={{ color: colorOf(path) }} title={path}>
                      {path}
                    </button>
                  </li>
                ))}
              </ul>
              <pre className="mono max-h-96 overflow-auto whitespace-pre p-4 text-[12px] leading-6 text-ink/90" data-lenis-prevent tabIndex={0} aria-label={`Contents of ${current}`}>
                {files[current]}
              </pre>
            </div>
          </section>

          <p className="text-sm text-mute">
            Unsure about a step? Revisit <a className="underline" href={href.module('permissions')}>permission rules</a>, <a className="underline" href={href.module('hooks')}>hooks</a> or the <a className="underline" href={href.ios}>iOS track</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
