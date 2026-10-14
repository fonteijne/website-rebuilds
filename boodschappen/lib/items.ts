import { db } from "./db";
import { K, familyMembers } from "./family";
import { categorize, normKey, parseItem } from "./categories";
import type { Item, ListPayload, User } from "./types";

export async function bump(fam: string) {
  return db().incr(K(fam).rev);
}

export async function readList(fam: string): Promise<ListPayload> {
  const k = K(fam);
  const [rev, raw, hist, users] = await Promise.all([
    db().get<number>(k.rev),
    db().hgetall<Item>(k.items),
    db().ztop(k.hist, 40),
    familyMembers(fam),
  ]);
  const items = Object.values(raw).sort((a, b) => a.at - b.at);
  const onList = new Set(items.map((i) => normKey(i.text)));
  const suggestions = hist.filter((h) => !onList.has(normKey(h))).slice(0, 10);
  const members = Object.fromEntries(users.map((u) => [u.id, u.name]));
  return { rev: rev ?? 0, items, suggestions, members };
}

export async function addItem(raw: string, user: User, clientId?: string, recipe?: { id: string; label: string }): Promise<Item | null> {
  const { text, qty } = parseItem(raw);
  if (!text) return null;
  const k = K(user.fam);
  const tag = recipe && { ...recipe, ...(qty > 1 ? { q: qty } : {}) };
  const all = await db().hgetall<Item>(k.items);
  const key = normKey(text);
  const dupe = Object.values(all).find((i) => normKey(i.text) === key);
  if (dupe) {
    // Staat er al: terug op de lijst zetten i.p.v. dubbel toevoegen
    const rec = recipe && !dupe.rec?.some((r) => r.id === recipe.id) ? [...(dupe.rec ?? []), tag!] : dupe.rec;
    const man = recipe ? dupe.man || !dupe.rec?.length : dupe.rec?.length ? true : dupe.man;
    const next: Item = { ...dupe, rec, man, done: false, doneAt: undefined, qty: dupe.done ? qty : dupe.qty + (qty > 1 ? qty : 0), by: user.id };
    await db().hset(k.items, dupe.id, next);
    await db().zincr(k.hist, text, 1);
    await bump(user.fam);
    return next;
  }
  const item: Item = { id: clientId && /^[a-z0-9-]{6,24}$/.test(clientId) && !all[clientId] ? clientId : crypto.randomUUID().slice(0, 12), text, qty, cat: categorize(text), done: false, by: user.id, at: Date.now(), ...(tag ? { rec: [tag] } : {}) };
  await db().hset(k.items, item.id, item);
  await db().zincr(k.hist, text, 1);
  await bump(user.fam);
  return item;
}
