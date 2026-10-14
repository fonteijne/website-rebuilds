import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { credsOf } from "@/lib/credentials";
import { json, requireAdmin, requireUser, sameOrigin } from "@/lib/guard";
import { registrationOpen } from "@/lib/session";
import type { Member, User } from "@/lib/types";

export async function GET() {
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const ids = await db().smembers("users");
  const users = (await Promise.all(ids.map((id) => db().get<User>(`user:${id}`)))).filter((u): u is User => !!u);
  const members: Member[] = await Promise.all(
    users.sort((a, b) => a.createdAt - b.createdAt).map(async (u) => ({ id: u.id, name: u.name, admin: u.admin, passkeys: (await credsOf(u.id)).length })),
  );
  return json({ registrationOpen: await registrationOpen(), members });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;
  const { registrationOpen: open } = (await req.json().catch(() => ({}))) as { registrationOpen?: boolean };
  if (typeof open !== "boolean") return json({ error: "Ongeldige waarde" }, 400);
  await db().set("registrationOpen", open);
  return json({ registrationOpen: open });
}
