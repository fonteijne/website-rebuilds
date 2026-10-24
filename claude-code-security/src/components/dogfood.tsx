import type { ReactNode } from 'react';
import type { DogfoodId } from '../content/types';
import { DEFAULT_DOMAINS, updatePolicy, useStore, type IosSetup, type Policy, type Profile, type StartMode } from '../lib/store';

function Toggle({ k, label, hint }: { k: keyof Policy; label: string; hint?: ReactNode }) {
  const { policy } = useStore();
  const on = policy[k] as boolean;
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3.5 py-3 transition-colors hover:border-white/25">
      <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--color-guard)]" checked={on} onChange={(e) => updatePolicy({ [k]: e.target.checked } as Partial<Policy>)} />
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-relaxed text-mute">{hint}</span>}
      </span>
    </label>
  );
}

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map(([v, l, d]) => (
          <label key={v} className={`cursor-pointer rounded-xl border px-3.5 py-3 text-sm transition-colors ${value === v ? 'border-guard bg-guard/[0.07]' : 'border-line hover:border-white/25'}`}>
            <input type="radio" className="sr-only" name={label} checked={value === v} onChange={() => onChange(v)} />
            <span className="block font-medium">{l}</span>
            <span className="mt-0.5 block text-[13px] leading-relaxed text-mute">{d}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const code = (s: string) => <code className="mono text-ink/90">{s}</code>;

export default function Dogfood({ step }: { step: DogfoodId }) {
  const { policy: p } = useStore();

  if (step === 'profile')
    return (
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="pname">
            Project name
          </label>
          <input id="pname" className="field" placeholder="e.g. weather-app" value={p.name} onChange={(e) => updatePolicy({ name: e.target.value })} />
        </div>
        <Choice<Profile>
          label="Stack"
          value={p.profile}
          onChange={(v) => updatePolicy({ profile: v, domains: DEFAULT_DOMAINS[v] })}
          options={[
            ['web', 'Web / Node', 'npm, Vite, Next.js, …'],
            ['ios', 'iOS / Xcode', 'Swift, Xcode, SwiftPM, fastlane'],
          ]}
        />
      </div>
    );

  if (step === 'rules')
    return (
      <div className="grid gap-2">
        <Toggle k="denySecrets" label="Deny reading secrets" hint={<>{code('Read(./.env)')}, {code('./secrets/**')}, {code('~/.ssh/**')}, {code('~/.aws/**')}{p.profile === 'ios' && <>, plus {code('.p8')}, {code('.p12')}, profiles and secret xcconfigs</>}.</>} />
        <Toggle k="askPush" label="Ask before every git push" hint={<>{code('Bash(git push *)')} in ask: prompts even in auto and bypass mode.</>} />
        <Toggle k="denyNetCli" label="Deny curl and wget" hint="Stops the usual spelling only. Pair it with the sandbox allowlist for real enforcement." />
      </div>
    );

  if (step === 'mode')
    return (
      <div className="space-y-3">
        <Choice<StartMode>
          label="Sessions start in"
          value={p.startMode}
          onChange={(v) => updatePolicy({ startMode: v })}
          options={[
            ['default', 'Manual', 'Ask before edits and commands'],
            ['acceptEdits', 'acceptEdits', 'Edits run, commands ask'],
            ['plan', 'Plan', 'Explore first, edit after approval'],
          ]}
        />
        <p className="text-[13px] text-mute">Auto and bypass can’t be a project default: Claude Code ignores them in .claude/settings.json.</p>
        <Toggle k="disableBypass" label="Disable bypass mode for this project" hint={<>{code('"disableBypassPermissionsMode": "disable"')}</>} />
      </div>
    );

  if (step === 'hooks')
    return (
      <div className="grid gap-2">
        <Toggle k="guardHook" label="PreToolUse guard for Bash" hint="Blocks force pushes, reset --hard, curl | sh, rm -rf of / or ~, writes to .git/hooks. Catches /usr/bin/… and sh -c forms. Fails closed without jq." />
        <Toggle k="formatHook" label="PostToolUse formatter" hint={p.profile === 'ios' ? 'swift format after each Swift edit. Fails open: formatting isn’t security.' : 'Prettier after each edit. Fails open: formatting isn’t security.'} />
      </div>
    );

  if (step === 'sandbox')
    return (
      <div className="grid gap-2">
        <Toggle k="sandbox" label="Turn on the Bash sandbox" hint="Seatbelt on macOS, bubblewrap on Linux. Adds denyRead for ~/.ssh and ~/.aws, and failIfUnavailable." />
        {p.sandbox && (
          <>
            <Toggle k="strictSandbox" label="Strict: no unsandboxed retries" hint={<>{code('"allowUnsandboxedCommands": false')} ignores dangerouslyDisableSandbox.</>} />
            <div>
              <label className="label mt-2" htmlFor="domains">
                Allowed hosts (one per line)
              </label>
              <textarea id="domains" className="field" rows={4} value={p.domains} onChange={(e) => updatePolicy({ domains: e.target.value })} />
            </div>
          </>
        )}
      </div>
    );

  // ios
  return (
    <div className="space-y-3">
      {p.profile !== 'ios' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ios/40 bg-ios/[0.06] p-3 text-sm">
          Your policy uses the web profile.
          <button className="btn btn-ios !py-1.5 text-sm" onClick={() => updatePolicy({ profile: 'ios', domains: DEFAULT_DOMAINS.ios })}>
            Switch to iOS
          </button>
        </div>
      )}
      <Choice<IosSetup>
        label="How you run Claude"
        value={p.iosSetup}
        onChange={(v) => updatePolicy({ iosSetup: v })}
        options={[
          ['xcode', 'A · Inside Xcode', 'Claude Agent in the coding assistant'],
          ['bridge', 'B · Terminal + bridge', 'Claude Code with xcrun mcpbridge'],
          ['cli', 'C · Terminal only', 'xcodebuild, swift, simctl'],
        ]}
      />
      <div className="grid gap-2">
        <Toggle k="iosShipAsk" label="Ask before shipping" hint="fastlane, altool, notarytool and simctl erase go in ask." />
        <Toggle k="iosKeychainDeny" label="Deny keychain reads via the security CLI" hint="find-generic-password, find-internet-password, dump-keychain, export." />
        <Toggle k="iosPackageAsk" label="Ask on Package.swift and project.pbxproj edits" hint="New dependencies are new code that runs at build time." />
        <Toggle k="pbxprojHook" label="Lint project.pbxproj after every edit" hint={<>PostToolUse hook with {code('plutil -lint')}.</>} />
        {p.iosSetup === 'bridge' && <Toggle k="xcodeMcpRules" label="Rules for Xcode’s MCP tools" hint="Allow build, test, read and docs tools; ask on XcodeUpdate; a hook checks what MCP edits target." />}
      </div>
      {p.iosSetup === 'xcode' && <p className="text-[13px] leading-relaxed text-mute">Setup A: the download includes xcode/README.md, because the agent inside Xcode reads its own config folder, not your project’s .claude/.</p>}
    </div>
  );
}
