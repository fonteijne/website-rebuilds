import { GuessGame } from './ui';

const ITEMS: { q: string; a: 'allow' | 'ask' | 'deny'; why: string }[] = [
  { q: 'xcodebuild -scheme App test', a: 'allow', why: 'Routine and local. (Remember it runs build scripts and plugins.)' },
  { q: 'swift test', a: 'allow', why: 'Local, repeatable, no side effects outside the project.' },
  { q: 'xcrun simctl list', a: 'allow', why: 'Read-only.' },
  { q: 'Edit Package.swift', a: 'ask', why: 'A new dependency is new code that runs at build time.' },
  { q: 'xcrun simctl erase all', a: 'ask', why: 'Wipes every simulator’s data. Rarely what you meant.' },
  { q: 'fastlane beta', a: 'ask', why: 'Uploads to TestFlight: outward-facing.' },
  { q: 'xcrun notarytool submit App.zip', a: 'ask', why: 'Sends your build to Apple.' },
  { q: 'git push origin feature', a: 'ask', why: 'Publishes commits; can’t be rewound locally.' },
  { q: 'security find-generic-password -s api -w', a: 'deny', why: 'Prints a keychain secret into the transcript.' },
  { q: 'cat ./Keys/AuthKey_ABC123.p8', a: 'deny', why: 'An App Store Connect API key. Deny reading .p8 files.' },
];

export default function IosRules() {
  return (
    <GuessGame
      prompt="Which list does it belong in?"
      items={ITEMS}
      choices={[
        ['allow', 'allow', 'var(--color-ok)'],
        ['ask', 'ask', 'var(--color-warn)'],
        ['deny', 'deny', 'var(--color-bad)'],
      ]}
    />
  );
}
