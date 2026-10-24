import type { Card } from './types';

export const cards: Card[] = [
  {
    kind: 'idea',
    title: 'Where iOS secrets live',
    body: 'Signing identities sit in your login keychain; exported ones are .p12 files. Provisioning profiles are .mobileprovision files under ~/Library. App Store Connect API keys are .p8 files, which tools like altool look for in folders such as ~/.appstoreconnect/private_keys and ~/private_keys. fastlane match has a passphrase. Many projects keep API keys in .xcconfig files.',
    src: 'practice',
    verify: true,
    tags: ['ios-secrets'],
  },
  {
    kind: 'idea',
    title: 'Deny them twice',
    body: 'Read deny rules stop Claude’s file tools and recognised readers. sandbox denyRead stops scripts too. Do both.',
    code: `"deny": [
  "Read(./**/*.p8)", "Read(./**/*.p12)",
  "Read(./**/*.mobileprovision)", "Read(./**/Secrets*.xcconfig)",
  "Read(~/.appstoreconnect/**)", "Read(~/private_keys/**)"
],
"sandbox": { "filesystem": {
  "denyRead": ["~/.appstoreconnect", "~/private_keys", "~/.ssh"]
} }`,
    src: 'cc-permissions',
    tags: ['ios-secrets'],
  },
  {
    kind: 'idea',
    title: 'The keychain has a CLI',
    body: 'security find-generic-password -w prints a stored password; security dump-keychain and security export go further. One command and a secret is in the transcript. Deny them by name and back that up with a hook, because a text rule misses /usr/bin/security.',
    code: `"deny": [
  "Bash(security find-generic-password *)",
  "Bash(security find-internet-password *)",
  "Bash(security dump-keychain *)",
  "Bash(security export *)"
]`,
    src: 'cc-permissions',
    tags: ['keychain-cli'],
  },
  {
    kind: 'idea',
    title: 'Shipping is outward-facing',
    body: 'Uploading to TestFlight or the App Store, notarising, or pushing tags can’t be undone by /rewind or Xcode’s History. Gate them with ask rules: fastlane lanes, xcrun altool --upload-app, xcrun notarytool submit, git push. An ask rule prompts even in auto and bypass mode.',
    code: `"ask": ["Bash(fastlane *)", "Bash(xcrun altool *)",
        "Bash(xcrun notarytool *)", "Bash(git push *)"]`,
    src: 'cc-modes',
    tags: ['ship-actions'],
  },
  {
    kind: 'idea',
    title: 'Guard project.pbxproj',
    body: 'Xcode’s project file is a large, fragile property list. One wrong brace and the project won’t open. A PostToolUse hook that runs plutil -lint after each edit catches it immediately, and exit 2 hands the error to Claude to fix.',
    code: `f=$(jq -r '.tool_input.file_path // ""')
case "$f" in *.pbxproj)
  plutil -lint "$f" >&2 || exit 2 ;;
esac`,
    src: 'cc-hooks',
    verify: true,
    tags: ['pbxproj'],
  },
  {
    kind: 'idea',
    title: 'Format Swift after every edit',
    body: 'Recent Xcode toolchains ship swift-format as swift format. A PostToolUse hook on Edit|Write keeps Claude’s Swift in house style without spending tokens on it. Skip silently if the tool isn’t installed: formatting isn’t a security control, so this hook may fail open.',
    code: `case "$f" in *.swift)
  xcrun swift format --in-place "$f" 2>/dev/null || true ;;
esac`,
    src: 'practice',
    verify: true,
    tags: ['swift-format'],
  },
  {
    kind: 'idea',
    title: 'Hooks inside Xcode: test before you trust',
    body: 'All of the above works in Claude Code (setups B and C). Apple doesn’t document hooks or settings.json permission rules for the agent launched inside Xcode. It may honour a settings file in ClaudeAgentConfig because it’s the same engine; prove it with a harmless test hook (one that only logs) before you count on it. Until then, Xcode’s Permissions lists are your enforced layer there.',
    src: 'apple-agents',
    verify: true,
    tags: ['xcode-hooks'],
  },
  {
    kind: 'demo',
    title: 'Allow, ask or deny?',
    demo: 'iosrules',
    body: 'Sort ten everyday iOS commands into the list where they belong.',
    tags: ['ship-actions', 'keychain-cli', 'build-code'],
  },
  {
    kind: 'quiz',
    title: 'Which iOS action should never be auto-approved, whatever the mode?',
    options: ['xcodebuild test', 'swift package resolve', 'fastlane pilot upload (TestFlight)', 'xcrun simctl list'],
    answer: 2,
    why: 'Uploading a build publishes something outside your machine and can’t be rolled back from the agent side. Put it in ask, which prompts in every mode.',
    src: 'cc-modes',
    tags: ['ship-actions'],
  },
];
