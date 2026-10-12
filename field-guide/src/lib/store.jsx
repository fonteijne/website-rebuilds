import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { computeMastery } from './mastery.js';

const KEY = 'field-guide:v1';

const initial = {
  tasks: [], // {id,title,role,importance,seemsDue,consequence,done,avoided,createdAt,doneAt}
  notes: [], // deadline-audit answers
  seen: {}, // cardId -> true
  answers: {}, // id -> {correct,attempts,concepts}
  doneToday: 0
};

const uid = () => Math.random().toString(36).slice(2, 9);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'seen':
      if (state.seen[action.id]) return state;
      return { ...state, seen: { ...state.seen, [action.id]: true } };
    case 'answer': {
      const prev = state.answers[action.id];
      const correct = Boolean(prev?.correct) || action.correct; // best attempt sticks
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.id]: { correct, attempts: (prev?.attempts ?? 0) + 1, concepts: action.concepts }
        }
      };
    }
    case 'addTask': {
      const t = { id: uid(), createdAt: Date.now(), done: false, consequence: 'unset', ...action.task };
      return { ...state, tasks: [...state.tasks, t] };
    }
    case 'updateTask':
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)) };
    case 'toggleTask':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, done: !t.done, doneAt: t.done ? undefined : Date.now() } : t
        )
      };
    case 'removeTask':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case 'swap': {
      // Something bigger arrived: it becomes the new fuel; the old fuel drops to a doable filler.
      const next = { id: uid(), createdAt: Date.now(), done: false, consequence: 'mild', importance: 5, seemsDue: true, role: 'fuel', ...action.task };
      const tasks = state.tasks.map((t) =>
        t.role === 'fuel' && !t.done ? { ...t, role: 'filler', importance: Math.min(t.importance ?? 3, 3), seemsDue: false } : t
      );
      return { ...state, tasks: [...tasks, next] };
    }
    case 'addNote':
      return { ...state, notes: [...state.notes, { id: uid(), text: action.text, at: Date.now() }] };
    case 'reset':
      return initial;
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode etc: the app still works, just doesn't persist */
    }
  }, [state]);

  const mastery = useMemo(() => computeMastery(state.answers, state.seen), [state.answers, state.seen]);
  const value = useMemo(() => ({ state, dispatch, mastery }), [state, mastery]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}
