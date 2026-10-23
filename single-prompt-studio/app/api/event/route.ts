import { FUNNEL_EVENTS, type FunnelEvent } from "@/lib/lead";
import { getStore } from "@/lib/store";

/** Basismeting van de funnel: alleen anonieme tellers, via navigator.sendBeacon. */
export async function POST(req: Request) {
  const store = getStore();
  if (!store) return new Response(null, { status: 204 });
  let name = "";
  try {
    name = String((await req.json()).name ?? "");
  } catch {
    return new Response(null, { status: 400 });
  }
  // "lead" telt de server zelf bij een geslaagde aanvraag.
  if (!FUNNEL_EVENTS.includes(name as FunnelEvent) || name === "lead") return new Response(null, { status: 400 });
  try {
    await store.track(name as FunnelEvent);
  } catch (err) {
    console.error("[event]", err);
  }
  return new Response(null, { status: 204 });
}
