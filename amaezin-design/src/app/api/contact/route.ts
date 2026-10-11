import { NextResponse } from "next/server";

const TO = process.env.CONTACT_TO_EMAIL ?? "info@amaezindesign.nl";
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Amaezin Website <onboarding@resend.dev>";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  // Not configured: tell the client to fall back to mailto.
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  if (body.company) return NextResponse.json({ ok: true }); // honeypot hit
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Nieuwe aanvraag van ${name}`,
      html: `<p><strong>Naam:</strong> ${escape(name)}<br/><strong>E-mail:</strong> ${escape(email)}</p><p>${escape(message).replace(/\n/g, "<br/>")}</p>`,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "send_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
