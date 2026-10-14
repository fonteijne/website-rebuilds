import { verifyAuthenticationResponse, type AuthenticationResponseJSON, type AuthenticatorTransport } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { b64, type Cred } from "@/lib/credentials";
import { json, sameOrigin } from "@/lib/guard";
import { getUser, relyingParty, startSession, takeChallenge } from "@/lib/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const chal = await takeChallenge<{ challenge: string }>();
  if (!chal) return json({ error: "Sessie verlopen, probeer opnieuw" }, 400);
  const response = (await req.json()) as AuthenticationResponseJSON;
  const cred = await db().get<Cred>(`cred:${response.id}`);
  const user = cred ? await getUser(cred.userId) : null;
  if (!cred || !user) return json({ error: "Deze passkey is onbekend" }, 401);

  const { rpID, origin } = await relyingParty();
  try {
    const v = await verifyAuthenticationResponse({
      response,
      expectedChallenge: chal.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: cred.id,
        publicKey: b64.dec(cred.publicKey) as Uint8Array<ArrayBuffer>,
        counter: cred.counter,
        transports: cred.transports as AuthenticatorTransport[] | undefined,
      },
    });
    if (!v.verified) return json({ error: "Inloggen mislukt" }, 401);
    await db().set(`cred:${cred.id}`, { ...cred, counter: v.authenticationInfo.newCounter });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Inloggen mislukt" }, 401);
  }
  await startSession(user.id);
  return json({ ok: true, user });
}
