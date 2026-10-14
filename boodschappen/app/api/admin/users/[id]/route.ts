import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { credsOf } from "@/lib/credentials";
import { json, requireAdmin, sameOrigin } from "@/lib/guard";
import type { User } from "@/lib/types";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;
  const user = await db().get<User>(`user:${id}`);
  if (!user) return json({ error: "Niet gevonden" }, 404);
  if (user.admin) return json({ error: "De beheerder kan niet verwijderd worden" }, 400);
  for (const c of await credsOf(id)) await db().del(`cred:${c.id}`);
  await db().del(`ucreds:${id}`);
  await db().del(`user:${id}`);
  await db().srem("users", id);
  return json({ ok: true });
}
