import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { K } from "@/lib/family";
import { bump } from "@/lib/items";
import type { Item } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const item = await db().hget<Item>(K(me.fam).items, id);
  if (!item) return json({ error: "Niet gevonden" }, 404);
  const body = (await req.json().catch(() => ({}))) as { done?: boolean; qty?: number };
  const next: Item = { ...item };
  if (typeof body.done === "boolean") {
    next.done = body.done;
    next.doneAt = body.done ? Date.now() : undefined;
  }
  if (typeof body.qty === "number") next.qty = Math.min(Math.max(Math.round(body.qty), 1), 99);
  await db().hset(K(me.fam).items, id, next);
  await bump(me.fam);
  return json({ item: next });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  await db().hdel(K(me.fam).items, id);
  await bump(me.fam);
  return json({ ok: true });
}
