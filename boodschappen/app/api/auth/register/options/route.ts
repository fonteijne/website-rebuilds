import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { credsOf } from "@/lib/credentials";
import { json, sameOrigin } from "@/lib/guard";
import { checkJoin } from "@/lib/family";
import { currentUser, relyingParty, saveChallenge } from "@/lib/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const body = (await req.json().catch(() => ({}))) as { name?: string; setupCode?: string; add?: boolean; invite?: string; familyName?: string };
  const { rpID, rpName } = await relyingParty();

  // Extra passkey voor een bestaand, ingelogd account
  if (body.add) {
    const me = await currentUser();
    if (!me) return json({ error: "Niet ingelogd" }, 401);
    const existing = await credsOf(me.id);
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: me.name,
      userID: new TextEncoder().encode(me.id),
      attestationType: "none",
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
      excludeCredentials: existing.map((c) => ({ id: c.id })),
    });
    await saveChallenge({ kind: "add", challenge: options.challenge, userId: me.id });
    return json(options);
  }

  const join = await checkJoin(body.invite?.trim() || undefined);
  if (!join.ok) return json({ error: join.error }, join.status);
  const name = (body.name ?? "").trim().slice(0, 24);
  if (name.length < 1) return json({ error: "Vul een naam in" }, 400);

  const hasUsers = (await db().smembers("users")).length > 0;
  const required = process.env.SETUP_CODE;
  if (!hasUsers && required && body.setupCode?.trim() !== required) {
    return json({ error: "Onjuiste setup-code" }, 403);
  }

  const familyName = join.family ? undefined : (body.familyName?.trim().slice(0, 30) || `Familie ${name}`);
  const userId = crypto.randomUUID();
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: name,
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
  });
  await saveChallenge({ kind: "new", challenge: options.challenge, userId, name, familyId: join.family?.id, invite: body.invite?.trim() || undefined, familyName });
  return json(options);
}
