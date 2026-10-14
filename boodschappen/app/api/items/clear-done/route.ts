import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { bump } from "@/lib/items";
import type { Item } from "@/lib/types";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const all = await db().hgetall<Item>("items");
  await Promise.all(Object.values(all).filter((i) => i.done).map((i) => db().hdel("items", i.id)));
  await bump();
  return json({ ok: true });
}
