import { useSyncExternalStore } from 'react';

export interface Stage {
  name: string;
  job: string;
}
export interface Reference {
  file: string;
  purpose: string;
}
export interface Contract {
  inputs: string;
  process: string;
  outputs: string;
  verify: string;
}
export interface Workspace {
  name: string;
  goal: string;
  fit: { seq: boolean; rev: boolean; rep: boolean };
  stages: Stage[];
  references: Reference[];
  contracts: Contract[];
  gates: boolean[];
  sourceFix: string;
}
export interface State {
  done: Record<string, boolean>;
  quiz: Record<string, boolean>;
  ws: Workspace;
}

export const emptyWs = (): Workspace => ({
  name: '',
  goal: '',
  fit: { seq: false, rev: false, rep: false },
  stages: [],
  references: [],
  contracts: [],
  gates: [],
  sourceFix:
    'If I make the same kind of edit to a stage output three runs in a row, propose a change to that stage’s CONTEXT.md or to a _config/ file instead of just editing the output.',
});

const KEY = 'icm-academy:v1';

function load(): State {
  const base: State = { done: {}, quiz: {}, ws: emptyWs() };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<State>;
    return { ...base, ...p, ws: { ...base.ws, ...(p.ws ?? {}) } };
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

export const updateWs = (fn: (w: Workspace) => Workspace) => commit({ ...state, ws: fn(state.ws) });

export const resetAll = () => commit({ done: {}, quiz: {}, ws: emptyWs() });
