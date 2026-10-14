import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { b64, saveCred } from "@/lib/credentials";
import { json, sameOrigin } from "@/lib/guard";
import { addMember, checkJoin, createFamily } from "@/lib/family";
import { currentUser, relyingParty, startSession, takeChallenge } from "@/lib/session";
import type { User } from "@/lib/types";

type Chal = { kind: "new" | "add"; challenge: string; userId: string; name?: string; familyId?: string; invite?: string; familyName?: string };

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const chal = await takeChallenge<Chal>();
  if (!chal) return json({ error: "Sessie verlopen, probeer opnieuw" }, 400);
  const response = (await req.json()) as RegistrationResponseJSON;
  const { rpID, origin } = await relyingParty();

  if (chal.kind === "add") {
    const me = await currentUser();
    if (!me || me.id !== chal.userId) return json({ error: "Niet ingelogd" }, 401);
  }
  // Opnieuw controleren: de schakelaars kunnen veranderd zijn sinds de eerste stap.
  const join = chal.kind === "new" ? await checkJoin(chal.invite) : null;
  if (join && !join.ok) return json({ error: join.error }, join.status);

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
    // Eerste account wordt globale beheerder; de NX-set voorkomt dat twee gelijktijdige registraties beide admin worden.
    const admin = await db().set("adminId", chal.userId, { nx: true });
    const name = chal.name ?? "Gebruiker";
    let fam = join?.ok ? join.family : null;
    let owner = false;
    if (!fam) {
      fam = await createFamily(chal.familyName ?? `Familie ${name}`, chal.userId); // eerste lid = eigenaar
      owner = true;
    }
    const user: User = { id: chal.userId, name, admin, owner, fam: fam.id, createdAt: Date.now() };
    await db().set(`user:${user.id}`, user);
    await addMember(fam.id, user.id);
    await startSession(user.id);
    return json({ ok: true, user });
  }
  return json({ ok: true });
}
