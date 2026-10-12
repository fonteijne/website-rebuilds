// Pure helpers shared by the Lab, the Top-Task Tester and the tests.

export const CONSEQUENCES = [
  { id: 'none', label: 'Nothing much' },
  { id: 'mild', label: 'Mild / awkward' },
  { id: 'serious', label: 'Serious' }
];

/**
 * Classify a task by Perry's two criteria plus our honesty guardrail.
 *  - 'real'   : genuine consequence if late -> never use as fuel (guardrail, not in the essay)
 *  - 'fuel'   : seems due AND seems vital, with no real consequence -> ideal top-of-list task
 *  - 'filler' : everything else that is worth doing -> what you do to avoid the fuel
 *  - 'audit'  : consequence not yet checked
 */
export function classifyTask({ importance = 3, seemsDue = false, consequence = 'unset' }) {
  if (consequence === 'serious') return 'real';
  if (consequence === 'unset') return 'audit';
  if (importance >= 4 && seemsDue) return 'fuel';
  return 'filler';
}

export const VERDICTS = {
  fuel: {
    label: 'Perfect fuel',
    tone: 'tomato',
    text: 'Feels due and vital, but nothing breaks if it slips. Park it at the top and let it power everything beneath.'
  },
  filler: {
    label: 'Worthwhile filler',
    tone: 'leaf',
    text: 'Genuinely useful but not pressing. This is what you do to avoid the fuel above — keep plenty of these.'
  },
  real: {
    label: 'Real deadline — off the shelf',
    tone: 'ink',
    text: 'Serious consequences. This is outside the trick’s safe zone: do it first or time-box it, and never hide it at the top.'
  },
  audit: {
    label: 'Needs an audit',
    tone: 'sun',
    text: 'Ask: what actually happens if this slips two more weeks? Perry’s book-order form was softer than it looked.'
  }
};

/** Order the stack: felt-importance first (Perry’s ordering), real-deadlines flagged at the very top. */
export function orderStack(tasks) {
  const rank = (t) => {
    const k = classifyTask(t);
    if (k === 'real') return 0;
    return 1;
  };
  return [...tasks].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      rank(a) - rank(b) ||
      (b.importance ?? 3) - (a.importance ?? 3) ||
      (a.createdAt ?? 0) - (b.createdAt ?? 0)
  );
}

/** The thing to do now: highest open task beneath the one you're avoiding. */
export function suggestNext(tasks) {
  const open = orderStack(tasks).filter((t) => !t.done);
  const avoided = open.find((t) => classifyTask(t) === 'fuel') ?? open[0];
  const next = open.find((t) => t !== avoided && classifyTask(t) !== 'real');
  const real = open.find((t) => classifyTask(t) === 'real');
  return { avoided, next, real };
}
