import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { credsOf } from "@/lib/credentials";
import { familyMembers, getFamily, newInvite, registrationOpen, saveFamily } from "@/lib/family";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import type { Member } from "@/lib/types";

/** Mijn familie: leden, en voor de eigenaar de uitnodigingscode en schakelaar. */
export async function GET() {
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const family = await getFamily(me.fam);
  if (!family) return json({ error: "Familie niet gevonden" }, 404);
  const users = (await familyMembers(me.fam)).sort((a, b) => a.createdAt - b.createdAt);
  const members: Member[] = await Promise.all(users.map(async (u) => ({ id: u.id, name: u.name, admin: u.admin, owner: u.owner, passkeys: (await credsOf(u.id)).length })));
  return json({
    name: family.name,
    registrationOpen: family.registrationOpen,
    globalOpen: await registrationOpen(),
    invite: me.owner ? family.invite : undefined,
    members,
  });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  if (!me.owner) return json({ error: "Alleen de eigenaar van de familie kan dit" }, 403);
  const family = await getFamily(me.fam);
  if (!family) return json({ error: "Familie niet gevonden" }, 404);
  const body = (await req.json().catch(() => ({}))) as { registrationOpen?: boolean; name?: string; regenerate?: boolean };
  if (typeof body.registrationOpen === "boolean") family.registrationOpen = body.registrationOpen;
  if (typeof body.name === "string" && body.name.trim()) family.name = body.name.trim().slice(0, 30);
  if (body.regenerate) {
    await db().del(`invite:${family.invite}`);
    family.invite = newInvite();
    await db().set(`invite:${family.invite}`, family.id);
  }
  await saveFamily(family);
  return json({ name: family.name, registrationOpen: family.registrationOpen, invite: family.invite });
}
