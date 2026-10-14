import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { credsOf } from "@/lib/credentials";
import { K } from "@/lib/family";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import type { User } from "@/lib/types";

/** Een lid verwijderen: de eigenaar van de familie voor eigen leden, de globale beheerder voor iedereen. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const user = await db().get<User>(`user:${id}`);
  if (!user) return json({ error: "Niet gevonden" }, 404);
  if (!me.admin && !(me.owner && user.fam === me.fam)) return json({ error: "Geen rechten om dit lid te verwijderen" }, 403);
  if (user.admin) return json({ error: "De beheerder kan niet verwijderd worden" }, 400);
  if (user.owner) return json({ error: "De eigenaar van een familie kan niet verwijderd worden" }, 400);
  for (const c of await credsOf(id)) await db().del(`cred:${c.id}`);
  await db().del(`ucreds:${id}`);
  await db().del(`user:${id}`);
  await db().srem("users", id);
  if (user.fam) await db().srem(K(user.fam).users, id);
  return json({ ok: true });
}
