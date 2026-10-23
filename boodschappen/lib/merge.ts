import { categorize, normKey, parseItem } from "./categories";
import type { Item } from "./types";

export type RecipeTag = { id: string; label: string };

export const validId = (id: unknown): id is string => typeof id === "string" && /^[a-z0-9-]{6,24}$/.test(id);

/**
 * Zet één regel tekst op de lijst (in `all`, dat ter plekke wordt bijgewerkt).
 * Puur, zodat server en client (optimistisch) exact dezelfde uitkomst berekenen.
 * Staat het er al, dan gaat het bestaande item terug op de lijst i.p.v. dubbel.
 */
export function mergeAdd(all: Record<string, Item>, raw: string, by: string, clientId?: string, recipe?: RecipeTag, at = Date.now()): Item | null {
  const { text, qty } = parseItem(raw);
  if (!text) return null;
  const tag = recipe && { ...recipe, ...(qty > 1 ? { q: qty } : {}) };
  const key = normKey(text);
  const dupe = Object.values(all).find((i) => normKey(i.text) === key);
  if (dupe) {
    const rec = recipe && !dupe.rec?.some((r) => r.id === recipe.id) ? [...(dupe.rec ?? []), tag!] : dupe.rec;
    const man = recipe ? dupe.man || !dupe.rec?.length : dupe.rec?.length ? true : dupe.man;
    const next: Item = { ...dupe, rec, man, done: false, doneAt: undefined, qty: dupe.done ? qty : dupe.qty + (qty > 1 ? qty : 0), by };
    all[dupe.id] = next;
    return next;
  }
  const id = validId(clientId) && !all[clientId] ? clientId : crypto.randomUUID().slice(0, 12);
  const item: Item = { id, text, qty, cat: categorize(text), done: false, by, at, ...(tag ? { rec: [tag] } : {}) };
  all[id] = item;
  return item;
}
