import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { familyMembers, getFamily, registrationOpen } from "@/lib/family";
import { json, requireAdmin, sameOrigin } from "@/lib/guard";
import type { Family } from "@/lib/types";

/** Globale instellingen voor de beheerder: de hoofdschakelaar en een overzicht van alle families. */
export async function GET() {
  const me = await requireAdmin();
  if (me instanceof NextResponse) return me;
  const ids = await db().smembers("families");
  const fams = (await Promise.all(ids.map((id) => getFamily(id)))).filter((f): f is Family => !!f);
  const families = await Promise.all(
    fams
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(async (f) => {
        const members = await familyMembers(f.id);
        return { id: f.id, name: f.name, registrationOpen: f.registrationOpen, members: members.length, owner: members.find((u) => u.id === f.ownerId)?.name ?? "?" };
      }),
  );
  return json({ registrationOpen: await registrationOpen(), families });
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
