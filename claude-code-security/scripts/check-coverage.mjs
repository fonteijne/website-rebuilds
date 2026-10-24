// Checks that every concept in coverage.ts is taught by at least one card, and that every tag and src exists.
// Run: npm run check (uses Node's built-in TypeScript type stripping, Node 22.18+).
import { register } from 'node:module';

register('./ts-resolve.mjs', import.meta.url);
const { modules, concepts, SOURCES } = await import('../src/content/index.ts');

const ids = new Set(concepts.map((c) => c.id));
const taught = new Set();
const errors = [];
for (const m of modules) {
  if (m.count !== m.cards.length) errors.push(`${m.id}: meta.ts count ${m.count} but ${m.cards.length} cards`);
  m.cards.forEach((c, i) => {
    for (const t of c.tags ?? []) {
      if (!ids.has(t)) errors.push(`${m.id}:${i} unknown tag "${t}"`);
      taught.add(t);
    }
    if (c.src && !SOURCES[c.src]) errors.push(`${m.id}:${i} unknown src "${c.src}"`);
    if (c.kind === 'quiz' && (c.answer < 0 || c.answer >= c.options.length)) errors.push(`${m.id}:${i} answer out of range`);
  });
}
for (const c of concepts) if (!taught.has(c.id)) errors.push(`concept "${c.id}" is not taught by any card`);
const cards = modules.reduce((n, m) => n + m.cards.length, 0);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`ok: ${modules.length} modules, ${cards} cards, ${concepts.length} concepts, all covered`);
