import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { b64, saveCred } from "@/lib/credentials";
import { json, sameOrigin } from "@/lib/guard";
import { currentUser, registrationOpen, relyingParty, startSession, takeChallenge } from "@/lib/session";
import type { User } from "@/lib/types";

type Chal = { kind: "new" | "add"; challenge: string; userId: string; name?: string };

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const chal = await takeChallenge<Chal>();
  if (!chal) return json({ error: "Sessie verlopen, probeer opnieuw" }, 400);
  const response = (await req.json()) as RegistrationResponseJSON;
  const { rpID, origin } = await relyingParty();

  if (chal.kind === "add") {
    const me = await currentUser();
    if (!me || me.id !== chal.userId) return json({ error: "Niet ingelogd" }, 401);
  } else if (!(await registrationOpen())) {
    return json({ error: "Registratie is gesloten" }, 403);
  }

  let info;
  try {
    const v = await verifyRegistrationResponse({
      response,
      expectedChallenge: chal.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
    if (!v.verified) return json({ error: "Passkey niet geverifieerd" }, 400);
    info = v.registrationInfo;
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Verificatie mislukt" }, 400);
  }
  if (!info) return json({ error: "Verificatie mislukt" }, 400);

  const { credential } = info;
  await saveCred({
    id: credential.id,
    userId: chal.userId,
    publicKey: b64.enc(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports,
    createdAt: Date.now(),
  });

  if (chal.kind === "new") {
    // Eerste account wordt admin; de NX-set voorkomt dat twee gelijktijdige registraties beide admin worden.
    const admin = await db().set("adminId", chal.userId, { nx: true });
    const user: User = { id: chal.userId, name: chal.name ?? "Gebruiker", admin, createdAt: Date.now() };
    await db().set(`user:${user.id}`, user);
    await db().sadd("users", user.id);
    await startSession(user.id);
    return json({ ok: true, user });
  }
  return json({ ok: true });
}
