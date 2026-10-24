import { GuessGame } from './ui';

const ITEMS: { q: string; a: 'works' | 'tweak' | 'blocked'; why: string }[] = [
  { q: 'xcodebuild -scheme App build', a: 'tweak', why: 'Default DerivedData is in ~/Library, outside the project. Add -derivedDataPath ./build/DerivedData.' },
  { q: 'xcodebuild -scheme App -derivedDataPath ./build/DerivedData build', a: 'works', why: 'Build output stays inside the working directory.' },
  { q: 'swift package resolve   (github.com not allowed)', a: 'tweak', why: 'Add the package hosts to allowedDomains, knowing github.com is a broad host.' },
  { q: 'git clone git@github.com:me/Lib.git', a: 'blocked', why: 'SSH ignores the proxy. Use https URLs for packages and remotes.' },
  { q: 'open MyApp.xcodeproj', a: 'blocked', why: 'Apple Events are blocked. Open Xcode yourself.' },
  { q: 'osascript -e \'quit app "Simulator"\'', a: 'blocked', why: 'Same: AppleScript can drive other apps, so it stays blocked.' },
  { q: 'xcrun swift format --in-place Sources/App/View.swift', a: 'works', why: 'Reads and writes a file inside the project.' },
  { q: 'xcrun simctl boot "iPhone 17"', a: 'tweak', why: 'Talks to system simulator services; if it fails, exclude exactly this command, not all of xcrun.' },
  { q: 'cat ~/.appstoreconnect/private_keys/AuthKey_X.p8', a: 'works', why: 'Reads are open by default. That’s the problem: add the folder to denyRead.' },
  { q: "echo 'export PATH=…' >> ~/.zshrc", a: 'blocked', why: 'Outside the project, and a protected shell startup file.' },
];

export default function XcodeSandbox() {
  return (
    <GuessGame
      prompt="Default sandbox on macOS"
      items={ITEMS}
      choices={[
        ['works', 'Works', 'var(--color-ok)'],
        ['tweak', 'Needs a tweak', 'var(--color-warn)'],
        ['blocked', 'Blocked by design', 'var(--color-bad)'],
      ]}
    />
  );
}
