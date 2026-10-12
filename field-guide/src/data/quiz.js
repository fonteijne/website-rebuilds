// Mastery check. Every one of the 20 concepts is hit by at least one question,
// and the trickier ones (criteria, verify, swap) by several scenario questions.
// `answer` is the index of the correct option.

export const QUIZ = [
  {
    id: 'q1',
    kind: 'recall',
    q: 'What is the essence of structured procrastination?',
    options: [
      'Eliminating procrastination through strict scheduling',
      'Shaping your tasks so that avoiding one thing makes you do other useful things',
      'Doing nothing until a deadline forces you to act'
    ],
    answer: 1,
    why: 'It makes the bad trait work for you rather than trying to remove it.',
    concepts: ['def']
  },
  {
    id: 'q2',
    kind: 'recall',
    q: 'According to Perry, what do procrastinators typically do instead of the important task?',
    options: ['Absolutely nothing', 'Marginally useful things like gardening or sharpening pencils', 'Extra work on the most important task'],
    answer: 1,
    why: 'They seldom do absolutely nothing — and that’s the lever the method pulls.',
    concepts: ['not-nothing']
  },
  {
    id: 'q3',
    kind: 'recall',
    q: 'Why do those side activities happen?',
    options: [
      'They are the procrastinator’s true priorities',
      'They are a way of not doing something more important',
      'They are relaxing'
    ],
    answer: 1,
    why: 'Avoidance of the bigger thing is the motivation behind the smaller thing.',
    concepts: ['avoidance-fuel']
  },
  {
    id: 'q4',
    kind: 'recall',
    q: 'If sharpening pencils were literally the only task left, what would happen?',
    options: ['It would get done quickly', 'No force on earth could get you to do it', 'You would delegate it'],
    answer: 1,
    why: 'Without something bigger to dodge, a trivial task has no pull.',
    concepts: ['trivial-only']
  },
  {
    id: 'q5',
    kind: 'recall',
    q: 'How is the task list organised in the method?',
    options: [
      'Alphabetically, so nothing is missed',
      'By importance, with the most urgent-feeling tasks on top',
      'By effort, easiest first'
    ],
    answer: 1,
    why: 'The ordering by felt importance is what sets up the cascade of avoidance.',
    concepts: ['ordered-list']
  },
  {
    id: 'q6',
    kind: 'recall',
    q: 'What role do worthwhile tasks lower on the list play?',
    options: [
      'They are ignored until the top is done',
      'Doing them becomes a way of not doing the tasks above',
      'They should be deleted to reduce clutter'
    ],
    answer: 1,
    why: 'Each lower task is the escape route from the task above it.',
    concepts: ['lower-tasks']
  },
  {
    id: 'q7',
    kind: 'recall',
    q: 'What reputation did Perry earn at Soto House, and why?',
    options: [
      'An absent-minded professor, from skipping duties',
      'A terrific Resident Fellow, from ping-pong and chatting as a way of avoiding grading',
      'A strict disciplinarian, from running the dorm by the book'
    ],
    answer: 1,
    why: 'Structured avoidance looked like dedication to the students.',
    concepts: ['reputation']
  },
  {
    id: 'q8',
    kind: 'recall',
    q: 'What mistake do procrastinators commonly make about their commitments?',
    options: [
      'They take on too many',
      'They try to minimise them, hoping a short list means they will finish',
      'They never write them down'
    ],
    answer: 1,
    why: 'Minimising commitments goes against the procrastinator’s nature and removes motivation.',
    concepts: ['no-minimize']
  },
  {
    id: 'q9',
    kind: 'recall',
    q: 'Why does a very short list of truly important tasks backfire?',
    options: [
      'Important tasks are boring',
      'The only way to avoid them is to do nothing — the couch-potato outcome',
      'There is too much pressure to finish'
    ],
    answer: 1,
    why: 'With no alternative worthwhile tasks, avoidance can only mean idleness.',
    concepts: ['couch-potato', 'no-minimize']
  },
  {
    id: 'q10',
    kind: 'recall',
    q: 'What is the “potential problem” Perry admits to?',
    options: [
      'Low-priority tasks never get done',
      'The important tasks at the top of the list may never get done',
      'The method only works for professors'
    ],
    answer: 1,
    why: 'Which is why choosing the right tasks for the top is the crux.',
    concepts: ['top-problem']
  },
  {
    id: 'q11',
    kind: 'recall',
    q: 'The first quality of an ideal top-of-list task is that it…',
    options: [
      'has a genuine, immovable deadline',
      'seems to have a clear deadline, but really doesn’t',
      'is quick to finish'
    ],
    answer: 1,
    why: 'Felt pressure with no real consequence is the perfect avoidance fuel.',
    concepts: ['fake-deadline']
  },
  {
    id: 'q12',
    kind: 'recall',
    q: 'The second quality of an ideal top-of-list task is that it…',
    options: [
      'is truly critical to your career',
      'seems awfully important, but really isn’t',
      'is something other people ask for'
    ],
    answer: 1,
    why: 'It feels important enough to be worth dodging but doesn’t carry real damage if it slips.',
    concepts: ['fake-importance']
  },
  {
    id: 'q13',
    kind: 'recall',
    q: 'Where does Perry say such tasks are plentiful?',
    options: ['Only in academia', 'In universities, and likely most large institutions', 'Mainly in small startups'],
    answer: 1,
    why: 'Large institutions overflow with reports, forms and committees that feel pressing but aren’t.',
    concepts: ['institutions']
  },
  {
    id: 'q14',
    kind: 'recall',
    q: 'How late was the philosophy-of-language essay, and what did the apology letter do?',
    options: [
      'Eleven months late; the letter was another way of not writing it',
      'Two weeks late; the letter got him an extension',
      'Not yet due; the letter was unnecessary'
    ],
    answer: 0,
    why: 'Even guilt-driven responses were avoidance — and productive-looking.',
    concepts: ['late-essay']
  },
  {
    id: 'q15',
    kind: 'recall',
    q: 'What did Perry discover about how far behind he really was on the essay?',
    options: [
      'Further behind than anyone',
      'Not much further behind schedule than anyone else',
      'Right on schedule'
    ],
    answer: 1,
    why: 'Many deadlines are softer than they feel — checking the real cost is part of the craft.',
    concepts: ['not-behind', 'verify']
  },
  {
    id: 'q16',
    kind: 'recall',
    q: 'What does Perry say about deadlines, for the non-procrastinators?',
    options: [
      'They press the instant they are missed',
      'They really start to press a week or two after they pass',
      'They never press at all'
    ],
    answer: 1,
    why: 'The nominal date and the date consequences begin are different things.',
    concepts: ['deadlines-late']
  },
  {
    id: 'q17',
    kind: 'recall',
    q: 'Why was Perry comfortable delaying the book-order form until mid-summer?',
    options: [
      'He had a personal exemption',
      'The bookstore was busy with others’ forms anyway, and popular books from efficient publishers were low-risk',
      'He planned to skip the course'
    ],
    answer: 1,
    why: 'He understood the actual constraint instead of the nominal deadline.',
    concepts: ['verify', 'deadlines-late']
  },
  {
    id: 'q18',
    kind: 'recall',
    q: 'What happens to the stalled form when a new, more important-seeming task arrives?',
    options: [
      'It stays stalled forever',
      'Doing the form becomes a way of avoiding the new task',
      'It gets deleted'
    ],
    answer: 1,
    why: 'This is the swap: the top slot moves up and the previous top item becomes the escape route.',
    concepts: ['swap']
  },
  {
    id: 'q19',
    kind: 'recall',
    q: 'What does Perry call the self-deception the method requires?',
    options: ['A pyramid scheme on oneself', 'A mindfulness exercise', 'A trust fall'],
    answer: 0,
    why: 'You perpetually motivate yourself with inflated importance and unreal deadlines.',
    concepts: ['pyramid']
  },
  {
    id: 'q20',
    kind: 'recall',
    q: 'Why does Perry think the self-deception is not a problem?',
    options: [
      'It is illegal otherwise',
      'Procrastinators are excellent self-deceivers anyway — one flaw offsets another',
      'Self-deception makes you more honest'
    ],
    answer: 1,
    why: 'Using one character flaw to cancel the bad effects of another is, in his words, noble.',
    concepts: ['noble', 'pyramid']
  },
  {
    id: 'q21',
    kind: 'scenario',
    q: 'Dana’s list: “annual self-review (no date set, nobody’s chasing)”, “file expenses (due Friday, reimbursed after)”, plus 12 chores. Which belongs on top as fuel?',
    options: [
      'File expenses — it has a real date',
      'The self-review — it feels weighty but has no consequence date',
      'Neither; delete both'
    ],
    answer: 1,
    why: 'The self-review seems vital but carries no real penalty; expenses have a genuine cost if skipped.',
    concepts: ['fake-deadline', 'fake-importance', 'verify']
  },
  {
    id: 'q22',
    kind: 'scenario',
    q: 'Sam cut his list to three “super important” tasks to focus. A week later nothing is done. Best diagnosis?',
    options: [
      'Not enough willpower',
      'The classic mistake: too few options means avoidance can only mean doing nothing',
      'The tasks were too easy'
    ],
    answer: 1,
    why: 'Add worthwhile tasks beneath the top so avoidance has somewhere productive to go.',
    concepts: ['no-minimize', 'couch-potato', 'lower-tasks']
  },
  {
    id: 'q23',
    kind: 'scenario',
    q: 'Your fuel task is “reorganise the shared drive”. Your manager just said the launch slipped and wants the migration plan by Monday. What happens in the method?',
    options: [
      'You do the drive now',
      'The migration plan takes the top slot; the drive becomes an escape route you can finally do',
      'You write an apology letter'
    ],
    answer: 1,
    why: 'That’s the swap: a bigger thing arrives and the old top item becomes the way of not doing it.',
    concepts: ['swap', 'lower-tasks']
  },
  {
    id: 'q24',
    kind: 'scenario',
    q: 'You’re avoiding a prescription refill, which would lapse in three days. Should it be your fuel task?',
    options: [
      'Yes — it’s very important and nearly due',
      'No — it has a genuine health consequence, so do it first',
      'Yes, as long as you feel guilty'
    ],
    answer: 1,
    why: 'Fuel must be low-damage. Health, safety, legal and financial penalties are off the top shelf.',
    concepts: ['verify', 'fake-importance', 'top-problem']
  },
  {
    id: 'q25',
    kind: 'scenario',
    q: 'Which is the best example of structured procrastination in action?',
    options: [
      'Scrolling social media for four hours',
      'Cleaning the garage, filing receipts and answering emails to avoid an overdue-but-soft report',
      'Making a to-do list with one item'
    ],
    answer: 1,
    why: 'Three genuinely useful tasks, all fuelled by avoiding one soft-deadline item.',
    concepts: ['def', 'not-nothing', 'avoidance-fuel']
  },
  {
    id: 'q26',
    kind: 'scenario',
    q: 'A colleague says: “Your plan only works by fooling yourself.” What’s the most faithful reply?',
    options: [
      'Correct — and it is fine, because the felt importance is inflated while the real stakes are known to be low',
      'No, the method has no deception at all',
      'Correct — so we should stop using it'
    ],
    answer: 0,
    why: 'Perry says as much. The practical guardrail: fake the feeling, never the facts.',
    concepts: ['pyramid', 'noble', 'verify']
  }
];
