import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { K } from "@/lib/family";
import { bump } from "@/lib/items";
import type { Item } from "@/lib/types";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const all = await db().hgetall<Item>(K(me.fam).items);
  await Promise.all(Object.values(all).filter((i) => i.done).map((i) => db().hdel(K(me.fam).items, i.id)));
  await bump(me.fam);
  return json({ ok: true });
}
