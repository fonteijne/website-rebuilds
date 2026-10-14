import { json, sameOrigin } from "@/lib/guard";
import { endSession } from "@/lib/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  await endSession();
  return json({ ok: true });
}
