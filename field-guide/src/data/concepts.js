// The 20 atomic ideas in Perry's essay. Every card and quiz question is tagged
// with these ids, so "coverage" is a measurable thing instead of a feeling.
// 19 of 20 mastered = 95% — the bar this site sets for "ready to practise".

export const CONCEPTS = [
  { id: 'def', label: 'What it is', gist: 'Shaping your task list so that avoiding one thing gets other things done.' },
  { id: 'not-nothing', label: 'Procrastinators do something', gist: 'They rarely do nothing; they do marginally useful things.' },
  { id: 'avoidance-fuel', label: 'Avoidance is the engine', gist: 'Those side tasks happen because they dodge something more important.' },
  { id: 'trivial-only', label: 'Trivia alone fails', gist: 'If pencil-sharpening is all that is left, nothing moves you to do it.' },
  { id: 'ordered-list', label: 'The ordered list', gist: 'Tasks are ranked by importance; urgent-feeling ones sit on top.' },
  { id: 'lower-tasks', label: 'Lower tasks matter', gist: 'Worthwhile work lower down becomes the way of not doing what is above.' },
  { id: 'reputation', label: 'The reputation payoff', gist: 'Result: you get a lot done and are seen as effective (Soto House).' },
  { id: 'no-minimize', label: 'Don’t minimise commitments', gist: 'Shrinking your list removes your main source of motivation.' },
  { id: 'couch-potato', label: 'The couch-potato outcome', gist: 'Few, truly important tasks mean the only escape is doing nothing.' },
  { id: 'top-problem', label: 'The top-of-list problem', gist: 'The tasks at the top never get done — so choose them carefully.' },
  { id: 'fake-deadline', label: 'Criterion 1: seems due', gist: 'Top tasks should seem to have clear deadlines, but really don’t.' },
  { id: 'fake-importance', label: 'Criterion 2: seems vital', gist: 'Top tasks should seem awfully important, but really aren’t.' },
  { id: 'institutions', label: 'Such tasks are everywhere', gist: 'Universities and big institutions overflow with them.' },
  { id: 'late-essay', label: 'The 11-months-late essay', gist: 'Even the guilt-letter to the editor was a way of avoiding the article.' },
  { id: 'not-behind', label: 'Check how late you really are', gist: 'He was not much further behind than anyone else.' },
  { id: 'deadlines-late', label: 'Deadlines press late', gist: 'Real pressure starts a week or two after a deadline passes.' },
  { id: 'verify', label: 'Verify the real cost', gist: 'The bookstore was busy anyway; mid-summer orders were fine.' },
  { id: 'swap', label: 'The swap', gist: 'A new, apparently more important task arrives and frees the old top item.' },
  { id: 'pyramid', label: 'The pyramid scheme on yourself', gist: 'You must commit to inflated tasks and feel them as important and urgent.' },
  { id: 'noble', label: 'One flaw offsets another', gist: 'Self-deception is a flaw too; use it to cancel out procrastination.' }
];

export const CONCEPT_IDS = CONCEPTS.map((c) => c.id);
export const READY_THRESHOLD = 0.95;
