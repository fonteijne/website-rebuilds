import { db } from "./db";
import { categorize, normKey, parseItem } from "./categories";
import type { Item, ListPayload, User } from "./types";

export async function bump() {
  return db().incr("rev");
}

export async function readList(): Promise<ListPayload> {
  const [rev, raw, hist, ids] = await Promise.all([
    db().get<number>("rev"),
    db().hgetall<Item>("items"),
    db().ztop("hist", 40),
    db().smembers("users"),
  ]);
  const items = Object.values(raw).sort((a, b) => a.at - b.at);
  const onList = new Set(items.map((i) => normKey(i.text)));
  const suggestions = hist.filter((h) => !onList.has(normKey(h))).slice(0, 10);
  const users = await Promise.all(ids.map((id) => db().get<User>(`user:${id}`)));
  const members = Object.fromEntries(users.filter((u): u is User => !!u).map((u) => [u.id, u.name]));
  return { rev: rev ?? 0, items, suggestions, members };
}

export async function addItem(raw: string, user: User, clientId?: string): Promise<Item | null> {
  const { text, qty } = parseItem(raw);
  if (!text) return null;
  const all = await db().hgetall<Item>("items");
  const key = normKey(text);
  const dupe = Object.values(all).find((i) => normKey(i.text) === key);
  if (dupe) {
    // Staat er al: terug op de lijst zetten i.p.v. dubbel toevoegen
    const next: Item = { ...dupe, done: false, doneAt: undefined, qty: dupe.done ? qty : dupe.qty + (qty > 1 ? qty : 0), by: user.id };
    await db().hset("items", dupe.id, next);
    await db().zincr("hist", text, 1);
    await bump();
    return next;
  }
  const item: Item = { id: clientId && /^[a-z0-9-]{6,24}$/.test(clientId) && !all[clientId] ? clientId : crypto.randomUUID().slice(0, 12), text, qty, cat: categorize(text), done: false, by: user.id, at: Date.now() };
  await db().hset("items", item.id, item);
  await db().zincr("hist", text, 1);
  await bump();
  return item;
}
