import { db } from "./db";
import { K, familyMembers } from "./family";
import { normKey } from "./categories";
import { mergeAdd, validId, type RecipeTag } from "./merge";
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

export async function addItem(raw: string, user: User, clientId?: string, recipe?: RecipeTag): Promise<Item | null> {
  const k = K(user.fam);
  const all = await db().hgetall<Item>(k.items);
  const item = mergeAdd(all, raw, user.id, clientId, recipe);
  if (!item) return null;
  await Promise.all([db().hset(k.items, item.id, item), db().zincr(k.hist, item.text, 1)]);
  await bump(user.fam);
  return item;
}

/**
 * Meerdere regels in één keer (recept op de lijst): één keer lezen, alles in het geheugen
 * samenvoegen en dan in één ronde wegschrijven i.p.v. ~4 Redis-aanvragen per ingrediënt.
 */
export async function addItems(lines: string[], user: User, recipe?: RecipeTag, clientIds: unknown[] = []): Promise<Item[]> {
  const k = K(user.fam);
  const all = await db().hgetall<Item>(k.items);
  const at = Date.now();
  const touched = new Map<string, Item>();
  const texts: string[] = [];
  lines.forEach((raw, n) => {
    const item = mergeAdd(all, raw, user.id, validId(clientIds[n]) ? clientIds[n] : undefined, recipe, at);
    if (!item) return;
    touched.set(item.id, item);
    texts.push(item.text);
  });
  if (!touched.size) return [];
  await Promise.all([db().hsetMany(k.items, Object.fromEntries(touched)), db().zincrMany(k.hist, texts)]);
  await bump(user.fam);
  return [...touched.values()];
}
