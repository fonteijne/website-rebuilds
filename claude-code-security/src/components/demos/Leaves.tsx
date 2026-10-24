import { GuessGame } from './ui';

const ITEMS: { q: string; a: 'stays' | 'leaves'; why: string }[] = [
  { q: 'A prompt to qwen3-coder at 127.0.0.1:11434', a: 'stays', why: 'Local model on a loopback address.' },
  { q: 'A request for gemma4:cloud before OLLAMA_NO_CLOUD was set', a: 'leaves', why: 'Models ending in :cloud run on Ollama’s servers.' },
  { q: 'WebFetch of docs.swift.org, preflight not skipped', a: 'leaves', why: 'The hostname goes to api.anthropic.com for the safety check, then the page is fetched.' },
  { q: 'A telemetry event with DISABLE_TELEMETRY=1', a: 'stays', why: 'Usage metrics are off; nothing is sent.' },
  { q: 'Ollama checking for an app update', a: 'leaves', why: 'The macOS app downloads updates automatically.' },
  { q: 'Your LM Studio chat history', a: 'stays', why: 'LM Studio says messages and histories are never transmitted.' },
  { q: 'Xcode’s conversation history', a: 'stays', why: 'Stored in Xcode, where you can view or delete it.' },
  { q: 'Request counts while using a cloud provider in Xcode', a: 'leaves', why: 'Apple collects limited request data (counts, sizes) to operate the feature.' },
  { q: 'The agent runs swift package resolve', a: 'leaves', why: 'Package resolution fetches from GitHub or other hosts.' },
  { q: 'An mcp__xcode__BuildProject call via xcrun mcpbridge', a: 'stays', why: 'The bridge talks to Xcode on the same Mac.' },
  { q: 'Predictive code completion', a: 'stays', why: 'It uses an on-device model (IDEProhibitOnDeviceModelInteraction turns it off).' },
];

export default function Leaves() {
  return (
    <GuessGame
      prompt="Does it leave the Mac?"
      items={ITEMS}
      choices={[
        ['stays', 'Stays on the Mac', 'var(--color-ok)'],
        ['leaves', 'Leaves the Mac', 'var(--color-air)'],
      ]}
    />
  );
}
