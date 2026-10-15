import test from 'node:test';
import assert from 'node:assert/strict';
import { CONCEPT_IDS, READY_THRESHOLD } from '../src/data/concepts.js';
import { MODULES, ALL_CARDS } from '../src/data/modules.js';
import { QUIZ } from '../src/data/quiz.js';
import { classifyTask, orderStack, suggestNext } from '../src/lib/classify.js';
import { computeMastery } from '../src/lib/mastery.js';

test('every concept is taught by at least one non-check card', () => {
  for (const id of CONCEPT_IDS) {
    assert.ok(ALL_CARDS.some((c) => c.type !== 'check' && c.concepts?.includes(id)), `no teaching card for ${id}`);
  }
});

test('every concept is testable (check card or quiz question)', () => {
  const tested = new Set([...ALL_CARDS.filter((c) => c.type === 'check'), ...QUIZ].flatMap((x) => x.concepts));
  for (const id of CONCEPT_IDS) assert.ok(tested.has(id), `untested concept ${id}`);
});

test('all concept tags are valid', () => {
  const valid = new Set(CONCEPT_IDS);
  for (const x of [...ALL_CARDS, ...QUIZ]) for (const c of x.concepts ?? []) assert.ok(valid.has(c), `${x.id} -> ${c}`);
});

test('card and question ids are unique', () => {
  const ids = [...ALL_CARDS.map((c) => c.id), ...QUIZ.map((q) => q.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test('questions have a valid answer index', () => {
  for (const x of [...ALL_CARDS.filter((c) => c.type === 'check'), ...QUIZ]) {
    assert.ok(Number.isInteger(x.answer) && x.answer >= 0 && x.answer < x.options.length, x.id);
  }
});

test('snack cards stay snack-sized (≤ 60 words)', () => {
  for (const c of ALL_CARDS) {
    const words = (c.body ?? '').split(/\s+/).filter(Boolean).length;
    assert.ok(words <= 60, `${c.id} has ${words} words`);
  }
});

test('every module ends with a dogfood action', () => {
  for (const m of MODULES) assert.equal(m.cards.at(-1).type, 'dogfood', m.id);
});

test('answering every quiz question correctly reaches 100% and is "ready"', () => {
  const answers = Object.fromEntries(QUIZ.map((q) => [q.id, { correct: true, attempts: 1, concepts: q.concepts }]));
  const m = computeMastery(answers, {});
  assert.equal(m.score, 1);
  assert.ok(m.ready);
});

test('95% threshold: 19/20 is ready, 18/20 is not', () => {
  assert.equal(READY_THRESHOLD, 0.95);
  const full = Object.fromEntries(QUIZ.map((q) => [q.id, { correct: true, attempts: 1, concepts: q.concepts }]));
  const withoutOne = (n) => {
    const drop = new Set(CONCEPT_IDS.slice(0, n));
    const answers = Object.fromEntries(
      Object.entries(full).map(([k, v]) => [k, { ...v, concepts: v.concepts.filter((c) => !drop.has(c)) }])
    );
    return computeMastery(answers, {});
  };
  assert.equal(withoutOne(1).masteredCount, 19);
  assert.equal(withoutOne(1).ready, true);
  assert.equal(withoutOne(2).masteredCount, 18);
  assert.equal(withoutOne(2).ready, false);
});

test('classification follows Perry’s criteria plus the honesty guardrail', () => {
  assert.equal(classifyTask({ importance: 5, seemsDue: true, consequence: 'none' }), 'fuel');
  assert.equal(classifyTask({ importance: 5, seemsDue: true, consequence: 'mild' }), 'fuel');
  assert.equal(classifyTask({ importance: 5, seemsDue: true, consequence: 'serious' }), 'real');
  assert.equal(classifyTask({ importance: 2, seemsDue: false, consequence: 'none' }), 'filler');
  assert.equal(classifyTask({ importance: 5, seemsDue: false, consequence: 'none' }), 'filler');
  assert.equal(classifyTask({ importance: 5, seemsDue: true, consequence: 'unset' }), 'audit');
});

test('suggestNext avoids the fuel and recommends the next open filler', () => {
  const tasks = [
    { id: 'a', title: 'Report', importance: 5, seemsDue: true, consequence: 'none', done: false, createdAt: 1 },
    { id: 'b', title: 'Receipts', importance: 3, seemsDue: false, consequence: 'none', done: false, createdAt: 2 },
    { id: 'c', title: 'Pencils', importance: 2, seemsDue: false, consequence: 'none', done: false, createdAt: 3 }
  ];
  const { avoided, next } = suggestNext(tasks);
  assert.equal(avoided.id, 'a');
  assert.equal(next.id, 'b');
  assert.deepEqual(orderStack(tasks).map((t) => t.id), ['a', 'b', 'c']);
});
