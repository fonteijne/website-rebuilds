import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { json, sameOrigin } from "@/lib/guard";
import { relyingParty, saveChallenge } from "@/lib/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const { rpID } = await relyingParty();
  // Geen allowCredentials: de browser toont de passkeys van dit domein (discoverable credentials).
  const options = await generateAuthenticationOptions({ rpID, userVerification: "preferred" });
  await saveChallenge({ kind: "login", challenge: options.challenge });
  return json(options);
}
