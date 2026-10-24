import { useSyncExternalStore } from 'react';

export type Profile = 'web' | 'ios';
export type StartMode = 'default' | 'acceptEdits' | 'plan';
export type IosSetup = 'xcode' | 'bridge' | 'cli';

/** The learner's own guardrail policy, built up by the dogfood cards and turned into files by the Policy Builder. */
export interface Policy {
  name: string;
  profile: Profile;
  // permissions
  denySecrets: boolean;
  askPush: boolean;
  denyNetCli: boolean;
  startMode: StartMode;
  disableBypass: boolean;
  // hooks
  guardHook: boolean;
  formatHook: boolean;
  // sandbox
  sandbox: boolean;
  strictSandbox: boolean;
  domains: string;
  // iOS
  iosSetup: IosSetup;
  iosShipAsk: boolean;
  iosKeychainDeny: boolean;
  iosPackageAsk: boolean;
  pbxprojHook: boolean;
  xcodeMcpRules: boolean;
}

export interface State {
  done: Record<string, boolean>;
  quiz: Record<string, boolean>;
  policy: Policy;
}

export const DEFAULT_DOMAINS: Record<Profile, string> = {
  web: 'registry.npmjs.org\ngithub.com\n*.githubusercontent.com',
  ios: 'github.com\n*.githubusercontent.com\nswiftpackageindex.com',
};

export const emptyPolicy = (): Policy => ({
  name: '',
  profile: 'web',
  denySecrets: true,
  askPush: true,
  denyNetCli: false,
  startMode: 'default',
  disableBypass: true,
  guardHook: true,
  formatHook: false,
  sandbox: true,
  strictSandbox: true,
  domains: DEFAULT_DOMAINS.web,
  iosSetup: 'bridge',
  iosShipAsk: true,
  iosKeychainDeny: true,
  iosPackageAsk: true,
  pbxprojHook: true,
  xcodeMcpRules: true,
});

const KEY = 'guardrail-academy:v1';

function load(): State {
  const base: State = { done: {}, quiz: {}, policy: emptyPolicy() };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<State>;
    return { ...base, ...p, policy: { ...base.policy, ...(p.policy ?? {}) } };
  } catch {
    return base;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: keep in-memory state */
  }
  listeners.forEach((l) => l());
}

export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getState = () => state;
export const useStore = () => useSyncExternalStore(subscribe, getState);

export const markDone = (key: string, quizCorrect?: boolean) =>
  commit({
    ...state,
    done: { ...state.done, [key]: true },
    quiz: quizCorrect === undefined ? state.quiz : { ...state.quiz, [key]: quizCorrect },
  });

export const updatePolicy = (patch: Partial<Policy>) => commit({ ...state, policy: { ...state.policy, ...patch } });

export const resetAll = () => commit({ done: {}, quiz: {}, policy: emptyPolicy() });
