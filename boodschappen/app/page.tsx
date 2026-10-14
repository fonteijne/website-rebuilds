import { db } from "@/lib/db";
import { currentUser, registrationOpen } from "@/lib/session";
import Root from "@/components/Root";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const [user, open, ids] = await Promise.all([currentUser(), registrationOpen(), db().smembers("users")]);
    return (
      <Root
        user={user}
        registrationOpen={open}
        hasUsers={ids.length > 0}
        needsSetupCode={ids.length === 0 && !!process.env.SETUP_CODE}
      />
    );
  } catch (e) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-6">
        <h1 className="font-display text-3xl">Bijna klaar</h1>
        <p className="text-ink2">De database is nog niet gekoppeld. Voeg Upstash Redis toe aan dit Vercel-project en deploy opnieuw.</p>
        <p className="text-sm text-muted">{e instanceof Error ? e.message : ""}</p>
      </main>
    );
  }
}
