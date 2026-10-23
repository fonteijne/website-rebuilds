import { NextResponse } from "next/server";
import { isValidEmail, isValidPrompt, type Lead } from "@/lib/lead";
import { confirmToVisitor, mailConfigured, notifyTeam } from "@/lib/mail";
import { getStore } from "@/lib/store";

/**
 * Primaire conversie (vision.md): een ingediende prompt met een bruikbaar e-mailadres.
 * Slaat de aanvraag op (Upstash) en stuurt een interne melding + ontvangstbevestiging (Resend).
 * Is geen van beide gekoppeld, dan 501 en valt de client terug op mailto.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots vullen het verborgen veld; doe alsof het gelukt is.
  if (body.website) return NextResponse.json({ ok: true, mailed: false });

  const prompt = String(body.prompt ?? "").trim();
  const email = String(body.email ?? "").trim();
  const marketing = body.marketing === true;
  if (!isValidPrompt(prompt) || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const store = getStore();
  const canMail = mailConfigured();
  if (!store && !canMail) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  if (store) {
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    if ((await store.hit(`lead:${ip}`, 3600)) > 8) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  const now = new Date().toISOString();
  const lead: Lead = {
    id: crypto.randomUUID().slice(0, 13),
    prompt,
    email,
    marketing,
    status: "nieuw",
    createdAt: now,
    updatedAt: now,
    source: String(body.source ?? "home").slice(0, 40),
  };

  let stored = false;
  if (store) {
    try {
      await store.saveLead(lead);
      if (marketing) await store.optIn(email);
      await store.track("lead");
      stored = true;
    } catch (err) {
      console.error("[aanvraag] opslaan mislukt", err);
    }
  }

  let mailed = false;
  if (canMail) {
    const [team, visitor] = await Promise.allSettled([notifyTeam(lead), confirmToVisitor(lead)]);
    const teamOk = team.status === "fulfilled" && team.value;
    mailed = visitor.status === "fulfilled" && visitor.value;
    if (!teamOk) console.error("[aanvraag] interne melding mislukt", lead.id);
    if (!stored && !teamOk) return NextResponse.json({ error: "send_failed" }, { status: 502 });
  } else if (!stored) {
    return NextResponse.json({ error: "store_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, mailed });
}
