// Course content. Each module is a deck of snack-sized cards (≤ ~50 words each).
//
// Card types
//   idea     – one idea from the essay            (source: essay)
//   example  – a worked example from the essay    (source: essay)
//   mistake  – a trap the essay warns about       (source: essay)
//   beyond   – practical extension, NOT in essay  (source: beyond)
//   visual   – interactive explainer
//   check    – one-question retrieval practice (counts toward mastery)
//   dogfood  – apply it to your own list, right now (feeds the Lab)
//
// Inline markup: **bold**. Paraphrased from John Perry's essay; short quotes only.

export const MODULES = [
  {
    id: 'confession',
    n: 1,
    title: 'The Confession',
    tagline: 'An essay written as a way of not doing everything else.',
    minutes: 4,
    hue: 'tomato',
    cards: [
      {
        id: 'm1-c1',
        type: 'example',
        title: 'The essay that almost didn’t exist',
        body: 'John Perry, a Stanford philosopher, had meant to write this essay for months. He finally did — not from free time, but because he had **papers to grade, a grant proposal to referee and dissertations to read**. Writing it was how he avoided them.',
        concepts: ['def', 'avoidance-fuel']
      },
      {
        id: 'm1-c2',
        type: 'idea',
        title: 'The definition, in one breath',
        body: '**Structured procrastination** is the art of making a bad trait work for you. You still put off what matters most — but you arrange your tasks so that the putting-off produces other useful work.',
        concepts: ['def']
      },
      {
        id: 'm1-c3',
        type: 'idea',
        title: 'It doesn’t cure you. It redirects you.',
        body: 'Perry’s claim is bold: the method turns procrastinators into effective people, “respected and admired” for what they get done. Not by fighting your nature, but by **pointing it** somewhere productive.',
        concepts: ['def', 'reputation']
      },
      {
        id: 'm1-c4',
        type: 'check',
        title: 'Quick check',
        q: 'Why was Perry able to finally write the essay?',
        options: [
          'He found a block of uncommitted free time',
          'Writing it was a way of not doing more pressing tasks',
          'A publisher gave him a hard deadline'
        ],
        answer: 1,
        why: 'Exactly the point: the essay itself was structured procrastination in action. Free time had nothing to do with it.',
        concepts: ['def', 'avoidance-fuel']
      },
      {
        id: 'm1-c5',
        type: 'dogfood',
        title: 'Dogfood #1 — name your dragon',
        body: 'You’re about to learn this method **by using it**. First: what important thing are you quietly avoiding right now? That is your fuel. Studying this guide is now your productive way of *not* doing it.',
        dogfood: { role: 'avoid', placeholder: 'e.g. Finish the Q3 report', count: 1, label: 'Your #1 avoided thing' },
        concepts: ['def']
      }
    ]
  },
  {
    id: 'insight',
    n: 2,
    title: 'You Never Do Nothing',
    tagline: 'The hidden motor behind every procrastinator.',
    minutes: 4,
    hue: 'sun',
    cards: [
      {
        id: 'm2-c1',
        type: 'idea',
        title: 'Procrastinators are busy people',
        body: 'Perry’s key observation: procrastinating does **not** mean doing absolutely nothing. Procrastinators do marginally useful things — gardening, sharpening pencils, sketching how they’ll reorganise their files “when they get around to it”.',
        concepts: ['not-nothing']
      },
      {
        id: 'm2-c2',
        type: 'idea',
        title: 'Why those side-quests happen',
        body: 'The pencils, the garden, the file diagram — they exist because they’re **a way of not doing something more important**. Avoidance isn’t the bug in your motivation. It *is* the motivation.',
        concepts: ['avoidance-fuel']
      },
      {
        id: 'm2-c3',
        type: 'idea',
        title: 'The pencil test',
        body: 'If sharpening pencils were the only thing left on your plate, Perry says **no force on earth** could make you do it. The same task is irresistible when it dodges something bigger, and dead weight when it dodges nothing.',
        concepts: ['trivial-only', 'avoidance-fuel']
      },
      {
        id: 'm2-c4',
        type: 'idea',
        title: 'The twist: hard things get done too',
        body: 'A procrastinator *can* be motivated to do difficult, timely, important work — **as long as it’s a way of not doing something even more important.** Importance is relative to what you’re fleeing.',
        concepts: ['avoidance-fuel', 'lower-tasks']
      },
      {
        id: 'm2-c5',
        type: 'check',
        title: 'Quick check',
        q: 'Your list has exactly one item left: “sharpen pencils”. What does the method predict?',
        options: [
          'You’ll finally sharpen them — it’s easy',
          'Nothing will move you to do it; there’s nothing bigger to avoid',
          'You’ll sharpen them faster than before'
        ],
        answer: 1,
        why: 'A trivial task only gets done when it dodges something bigger. With nothing above it, there is no avoidance fuel.',
        concepts: ['trivial-only']
      },
      {
        id: 'm2-c6',
        type: 'dogfood',
        title: 'Dogfood #2 — your side-quests',
        body: 'What marginally useful things do *you* do when avoiding? Name three. These are your **natural fillers** — the engine already runs; we’re just aiming it.',
        dogfood: { role: 'filler', placeholder: 'e.g. Tidy my desktop files', count: 3, label: 'Your natural side-quests' },
        concepts: ['not-nothing']
      }
    ]
  },
  {
    id: 'stack',
    n: 3,
    title: 'The Stack',
    tagline: 'A list that powers itself from the top down.',
    minutes: 5,
    hue: 'leaf',
    cards: [
      {
        id: 'm3-c1',
        type: 'idea',
        title: 'Shape the list, not the person',
        body: 'Your tasks sit in an order — **most urgent and important-feeling on top**. That ordering is the structure in “structured procrastination”. You don’t change your behaviour; you change what it has to work with.',
        concepts: ['ordered-list', 'def']
      },
      {
        id: 'm3-c2',
        type: 'idea',
        title: 'Worthwhile work lives lower down',
        body: 'Beneath the top items sit genuinely worthwhile tasks. Doing them **becomes a way of not doing what’s above**. Every rung of the list is both the thing you avoid and the thing you flee to.',
        concepts: ['lower-tasks', 'ordered-list']
      },
      {
        id: 'm3-c3',
        type: 'visual',
        visual: 'stack',
        title: 'Watch the stack run',
        body: 'Press play. The top task stays untouched while everything beneath it gets done.',
        concepts: ['ordered-list', 'lower-tasks']
      },
      {
        id: 'm3-c4',
        type: 'example',
        title: 'The perfect set-up: Soto House',
        body: 'Perry lived as a Resident Fellow in a Stanford dorm. Faced with grading and committee work, he’d head to the lounge for **ping-pong, chats and the paper** — avoiding duty by being present for students.',
        concepts: ['reputation', 'lower-tasks']
      },
      {
        id: 'm3-c5',
        type: 'idea',
        title: 'The payoff: Mr. Chips',
        body: 'Result: a reputation as a terrific Resident Fellow, one of the rare professors who knew undergraduates. **Avoidance, structured, looked like dedication.** That’s the whole promise of the method.',
        concepts: ['reputation']
      },
      {
        id: 'm3-c6',
        type: 'check',
        title: 'Quick check',
        q: 'In the method, what makes a task lower on the list get done?',
        options: [
          'It is urgent and has a real deadline',
          'Doing it lets you avoid something higher up the list',
          'You schedule it in a calendar'
        ],
        answer: 1,
        why: 'Lower tasks are fuelled by the avoidance of higher ones. That’s the cascade.',
        concepts: ['lower-tasks', 'ordered-list']
      },
      {
        id: 'm3-c7',
        type: 'dogfood',
        title: 'Dogfood #3 — build your stack',
        body: 'Add **three worthwhile tasks** you could do instead of your avoided item — real value, any size. Together with your dragon, that’s the skeleton of your stack.',
        dogfood: { role: 'filler', placeholder: 'e.g. Reply to Sam’s email', count: 3, label: 'Worthwhile tasks beneath your top item' },
        concepts: ['lower-tasks']
      }
    ]
  },
  {
    id: 'mistake',
    n: 4,
    title: 'The Classic Mistake',
    tagline: 'Why “fewer commitments” makes you worse.',
    minutes: 4,
    hue: 'tomato',
    cards: [
      {
        id: 'm4-c1',
        type: 'mistake',
        title: 'The instinct that backfires',
        body: 'Procrastinators usually try to **minimise commitments**, assuming a short list means they’ll finally do everything on it. Perry says this goes against your basic nature — and destroys your most important source of motivation.',
        concepts: ['no-minimize']
      },
      {
        id: 'm4-c2',
        type: 'mistake',
        title: 'Why a tiny list is a trap',
        body: 'The few tasks left are, by definition, the **most important**. With nothing else to escape to, the only way to avoid them is to do nothing at all.',
        concepts: ['couch-potato', 'no-minimize']
      },
      {
        id: 'm4-c3',
        type: 'idea',
        title: 'Couch potato vs. effective human',
        body: 'Perry’s verdict on the minimalist route: it’s “a way to become a couch potato, not an effective human being”. **More worthwhile options = more places to flee to = more gets done.**',
        concepts: ['couch-potato', 'no-minimize']
      },
      {
        id: 'm4-c4',
        type: 'visual',
        visual: 'engine',
        title: 'Try the engine',
        body: 'Slide the number of tasks on your list and watch the output.',
        concepts: ['no-minimize', 'couch-potato']
      },
      {
        id: 'm4-c5',
        type: 'check',
        title: 'Quick check',
        q: 'A procrastinator cuts their list to just three huge tasks to “focus”. What does Perry predict?',
        options: [
          'Focus improves and all three get done',
          'Motivation collapses — avoiding them means doing nothing',
          'They become more disciplined'
        ],
        answer: 1,
        why: 'Strip away the alternatives and the only available avoidance is idleness: the couch-potato outcome.',
        concepts: ['couch-potato', 'no-minimize']
      },
      {
        id: 'm4-c6',
        type: 'dogfood',
        title: 'Dogfood #4 — add, don’t prune',
        body: 'Add **two more** useful low-stakes tasks you’ve been dropping — a thank-you note, clearing a shelf, a call. More runway under your top item. (Real obligations aren’t what we’re stacking here.)',
        dogfood: { role: 'filler', placeholder: 'e.g. Write a thank-you note', count: 2, label: 'Two more worthwhile tasks' },
        concepts: ['no-minimize']
      }
    ]
  },
  {
    id: 'top',
    n: 5,
    title: 'What Goes on Top',
    tagline: 'The two-part test for perfect avoidance fuel.',
    minutes: 5,
    hue: 'sun',
    cards: [
      {
        id: 'm5-c1',
        type: 'idea',
        title: 'The obvious objection',
        body: '“What about the important tasks at the top that you never do?” Perry admits there’s a **potential problem** here. The solution isn’t willpower — it’s picking the *right sort* of project for the top.',
        concepts: ['top-problem']
      },
      {
        id: 'm5-c2',
        type: 'idea',
        title: 'Criterion 1 — seems due',
        body: 'Top tasks should **seem to have clear deadlines (but really don’t).** The felt pressure creates the avoidance; the lack of real consequence means nothing breaks while you dodge it.',
        concepts: ['fake-deadline']
      },
      {
        id: 'm5-c3',
        type: 'idea',
        title: 'Criterion 2 — seems vital',
        body: 'Top tasks should **seem awfully important (but really aren’t).** Felt importance makes it worth avoiding, so you’ll do real work to escape it — yet the world doesn’t end if it slips.',
        concepts: ['fake-importance']
      },
      {
        id: 'm5-c4',
        type: 'idea',
        title: 'Luckily, they’re everywhere',
        body: 'Life abounds with such tasks. In universities, Perry says, the **vast majority** fall into this category, and he suspects the same of most large institutions: reports, forms, committees, “alignment” decks.',
        concepts: ['institutions']
      },
      {
        id: 'm5-c5',
        type: 'visual',
        visual: 'tester',
        title: 'Try the Top-Task Tester',
        body: 'Answer two questions about any task and see where it belongs.',
        concepts: ['fake-deadline', 'fake-importance']
      },
      {
        id: 'm5-c6',
        type: 'check',
        title: 'Scenario check',
        q: 'Which is the best candidate for the top of the list?',
        options: [
          'Filing taxes due Friday, with a late penalty',
          'A “strategy vision” write-up a manager mentioned, no fixed date, no consequence',
          'Sharpening pencils'
        ],
        answer: 1,
        why: 'It feels important and due but isn’t. Taxes have a genuine penalty (not fuel!), and pencils feel like neither.',
        concepts: ['fake-deadline', 'fake-importance']
      },
      {
        id: 'm5-c7',
        type: 'dogfood',
        title: 'Dogfood #5 — find real fuel',
        body: 'Look at your world — work, home, side projects. Name **one task that seems pressing and vital but wouldn’t actually cause damage** if it slipped a few weeks. Add it to the top of your stack.',
        dogfood: { role: 'fuel', placeholder: 'e.g. Redesign the team wiki', count: 1, label: 'A genuine fuel task' },
        concepts: ['fake-deadline', 'fake-importance', 'institutions']
      }
    ]
  },
  {
    id: 'deadlines',
    n: 6,
    title: 'Soft Deadlines',
    tagline: 'Two worked examples from the master himself.',
    minutes: 6,
    hue: 'leaf',
    cards: [
      {
        id: 'm6-c1',
        type: 'example',
        title: 'Example 1: the essay 11 months late',
        body: 'At the top of Perry’s list: an essay for a philosophy volume, due **eleven months ago**. He’s done an enormous number of important things as a way of not working on it. It isn’t so important that something more pressing won’t appear.',
        concepts: ['late-essay', 'top-problem']
      },
      {
        id: 'm6-c2',
        type: 'example',
        title: 'Even guilt became fuel',
        body: 'Bothered by guilt, he wrote the editor a letter apologising and promising to get to work. **That letter was itself a way of not writing the article.** Notice how every response to the problem became more avoidance.',
        concepts: ['late-essay', 'avoidance-fuel']
      },
      {
        id: 'm6-c3',
        type: 'idea',
        title: 'Reality check: who’s really behind?',
        body: 'It turned out he **wasn’t much further behind schedule than anyone else.** Many “deadlines” are softer than they feel. Asking what lateness actually costs is part of picking good fuel.',
        concepts: ['not-behind', 'verify']
      },
      {
        id: 'm6-c4',
        type: 'example',
        title: 'Example 2: the book-order form',
        body: 'In June he must still order books for an October course. The form is overdue; the secretary sends reminders; students ask; it sits on his desk under a sandwich wrapper. It **nags, so it motivates other work.**',
        concepts: ['deadlines-late', 'verify', 'ordered-list']
      },
      {
        id: 'm6-c5',
        type: 'idea',
        title: 'Deadlines press late',
        body: 'Perry’s aside for non-procrastinators: deadlines **“really start to press a week or two after they pass.”** The date on the form is not the date of consequences — find the second date.',
        concepts: ['deadlines-late']
      },
      {
        id: 'm6-c6',
        type: 'idea',
        title: 'He checked the real cost',
        body: 'The bookstore is busy with non-procrastinators’ forms, yet mid-summer is fine if he orders **popular books from efficient publishers**. He knows the true constraint — and keeps the felt urgency.',
        concepts: ['verify', 'deadlines-late']
      },
      {
        id: 'm6-c7',
        type: 'idea',
        title: 'The swap',
        body: 'He’ll accept some apparently more important task before August 1st. Then filling out the form becomes **a way of not doing the new task.** Top items rotate; when something bigger arrives, the old one becomes doable.',
        concepts: ['swap']
      },
      {
        id: 'm6-c8',
        type: 'check',
        title: 'Quick check',
        q: 'What usually triggers a long-stalled top task to finally get done?',
        options: [
          'Guilt, which finally becomes unbearable',
          'A new task that seems even more important takes the top spot',
          'The deadline arrives'
        ],
        answer: 1,
        why: 'The old top item turns into a way of avoiding the new one. Guilt alone just produces more avoidance (like the apology letter).',
        concepts: ['swap', 'late-essay']
      },
      {
        id: 'm6-c9',
        type: 'dogfood',
        title: 'Dogfood #6 — deadline audit',
        body: 'Pick a task you feel is “overdue”. Ask: **what actually happens if it slips two more weeks, and who notices?** Write the honest answer — that single line is what separates fuel from a real fire.',
        dogfood: { role: 'audit', placeholder: 'e.g. Nothing; Priya would just ask once', count: 1, label: 'Real consequence of two more weeks' },
        concepts: ['verify', 'not-behind', 'deadlines-late']
      }
    ]
  },
  {
    id: 'honest',
    n: 7,
    title: 'The Honest Part',
    tagline: 'The self-deception — and where to draw the line.',
    minutes: 6,
    hue: 'tomato',
    cards: [
      {
        id: 'm7-c1',
        type: 'idea',
        title: 'A pyramid scheme on yourself',
        body: 'Perry owns up: the method needs a measure of **self-deception**. You must commit to tasks with inflated importance and unreal deadlines — and make yourself *feel* them as important and urgent.',
        concepts: ['pyramid']
      },
      {
        id: 'm7-c2',
        type: 'idea',
        title: 'Using one flaw to offset another',
        body: 'Perry’s defence: virtually all procrastinators are excellent self-deceivers too. “What could be more noble than using one character flaw to offset the bad effects of another?”',
        concepts: ['noble', 'pyramid']
      },
      {
        id: 'm7-c3',
        type: 'check',
        title: 'Quick check',
        q: 'Why does Perry say the method needs self-deception?',
        options: [
          'You must feel top tasks are important and urgent even though they are not truly so',
          'You need to lie to your boss about your progress',
          'You should pretend to like procrastinating'
        ],
        answer: 0,
        why: 'The deception is internal: it keeps inflated top tasks emotionally real enough to avoid.',
        concepts: ['pyramid', 'noble']
      },
      {
        id: 'm7-c4',
        type: 'beyond',
        title: 'Guardrail 1 — fake the feeling, not the facts',
        body: 'The deception is about **how it feels**, never about consequences. Before a task earns a top slot, know its real downside. If you can’t say “nothing breaks”, it isn’t fuel.',
        concepts: ['pyramid', 'verify']
      },
      {
        id: 'm7-c5',
        type: 'beyond',
        title: 'Guardrail 2 — keep these off the top shelf',
        body: 'Never stack: **health or safety, legal/tax penalties, money owed, or anything that blocks other people.** Handle those first or time-box them. Structured procrastination is for flexible, low-damage tasks.',
        concepts: ['top-problem', 'verify']
      },
      {
        id: 'm7-c6',
        type: 'beyond',
        title: 'Guardrail 3 — refuel as you go',
        body: 'Fuel runs out when top tasks are finished or you stop believing in them. Keep **a standing reserve** and run a weekly check: has a fuel item grown a real consequence? If so, promote it to “do now”.',
        concepts: ['swap', 'verify']
      },
      {
        id: 'm7-c7',
        type: 'check',
        title: 'Scenario check',
        q: 'Your top item is a client invoice you’ve been dodging. Money depends on it. What now?',
        options: [
          'Keep it on top; it’ll work as fuel',
          'Remove it from the fuel slot and do it first — it has a real consequence',
          'Add more pencils to the list'
        ],
        answer: 1,
        why: 'Real consequences disqualify a task from being fuel. The method assumes the top is low-damage.',
        concepts: ['verify', 'fake-deadline']
      },
      {
        id: 'm7-c8',
        type: 'dogfood',
        title: 'Dogfood #7 — integrity pass',
        body: 'Open your Lab and tag every task with its **real consequence if late**. Anything marked “serious” gets pulled off the top shelf — the Lab will flag it for you.',
        dogfood: { role: 'lab', label: 'Go tag your tasks', cta: 'Open the Lab' },
        concepts: ['verify', 'pyramid']
      }
    ]
  },
  {
    id: 'practice',
    n: 8,
    title: 'Put It to Work',
    tagline: 'Your 7-day setup and a daily ritual that fits in two minutes.',
    minutes: 6,
    hue: 'leaf',
    cards: [
      {
        id: 'm8-c1',
        type: 'beyond',
        title: 'Your 7-day setup',
        body: '**Day 1** dump every task · **2** rate real consequence · **3** pick 1–3 fuel tasks · **4** stock 10+ worthwhile fillers · **5** audit deadlines · **6** run the ritual · **7** review and refuel.',
        concepts: ['ordered-list']
      },
      {
        id: 'm8-c2',
        type: 'beyond',
        title: 'The two-minute daily ritual',
        body: '1. Look at the top. 2. **Say aloud which item you’re avoiding.** 3. Start the best worthwhile task beneath it. 4. Tick it off. The point is to name the dodge, then steer it.',
        concepts: ['avoidance-fuel', 'lower-tasks']
      },
      {
        id: 'm8-c3',
        type: 'beyond',
        title: 'Weekly 10-minute review',
        body: 'Check each fuel item: still low-stakes? Has something bigger arrived (**the swap**)? Add new fuel, retire old fuel, restock fillers to 10+. Five questions, ten minutes, done.',
        concepts: ['swap', 'verify']
      },
      {
        id: 'm8-c4',
        type: 'beyond',
        title: 'Troubleshooting',
        body: '**Doing nothing?** List too short — add fillers. **Fillers feel pointless?** Make them genuinely useful. **Top item suddenly burning?** It grew a real consequence — move it to “do now”.',
        concepts: ['couch-potato', 'trivial-only']
      },
      {
        id: 'm8-c5',
        type: 'idea',
        title: 'The method on one slide',
        body: '1) Procrastinators do *something*. 2) Avoidance is the engine. 3) Keep a long, ordered list. 4) Top = seems due & vital, isn’t. 5) Lower tasks get done as escape. 6) Swap when bigger arrives.',
        concepts: ['def', 'avoidance-fuel', 'ordered-list', 'swap']
      },
      {
        id: 'm8-c6',
        type: 'dogfood',
        title: 'Dogfood #8 — run it for real',
        body: 'You’ve been dogfooding all along. Now run your stack: head to the Lab, mark what you’re avoiding, and **do the first worthwhile task beneath it.** Then take the mastery check.',
        dogfood: { role: 'lab', label: 'Run your stack', cta: 'Go to the Lab' },
        concepts: ['def']
      }
    ]
  }
];

export const ALL_CARDS = MODULES.flatMap((m) => m.cards.map((c) => ({ ...c, moduleId: m.id })));
export const getModule = (id) => MODULES.find((m) => m.id === id);
