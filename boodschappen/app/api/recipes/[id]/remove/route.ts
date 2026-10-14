import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { bump } from "@/lib/items";
import type { Item } from "@/lib/types";

/** Haalt de ingrediënten van dit recept van de lijst. Items die ook los of via een ander recept op de lijst staan blijven. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const all = await db().hgetall<Item>("items");
  let removed = 0;
  for (const it of Object.values(all)) {
    if (!it.rec?.some((r) => r.id === id)) continue;
    const rec = it.rec.filter((r) => r.id !== id);
    if (!rec.length && !it.man) {
      await db().hdel("items", it.id);
      removed++;
    } else {
      await db().hset("items", it.id, { ...it, rec: rec.length ? rec : undefined });
    }
  }
  await bump();
  return json({ removed });
}
