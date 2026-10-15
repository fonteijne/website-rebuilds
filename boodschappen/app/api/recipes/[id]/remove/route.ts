import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { K } from "@/lib/family";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { bump } from "@/lib/items";
import type { Item } from "@/lib/types";

/** Haalt de ingrediënten van dit recept van de lijst. Items die ook los of via een ander recept op de lijst staan blijven. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const all = await db().hgetall<Item>(K(me.fam).items);
  const drop: string[] = [];
  const keep: Record<string, Item> = {};
  for (const it of Object.values(all)) {
    if (!it.rec?.some((r) => r.id === id)) continue;
    const rec = it.rec.filter((r) => r.id !== id);
    if (!rec.length && !it.man) drop.push(it.id);
    else keep[it.id] = { ...it, rec: rec.length ? rec : undefined };
  }
  // In één ronde i.p.v. een Redis-aanvraag per item.
  await Promise.all([db().hdel(K(me.fam).items, ...drop), Object.keys(keep).length ? db().hsetMany(K(me.fam).items, keep) : null]);
  await bump(me.fam);
  const removed = drop.length;
  return json({ removed });
}
