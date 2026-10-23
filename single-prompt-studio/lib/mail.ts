import "server-only";
import { site, thanks } from "./content";
import type { Lead } from "./lead";

/**
 * E-mail via Resend (https://resend.com), zonder SDK: één fetch per bericht.
 * Zonder RESEND_API_KEY wordt er niets verstuurd (mailConfigured() === false).
 * Let op: vanaf onboarding@resend.dev kun je alleen naar je eigen Resend-adres mailen;
 * voor ontvangstbevestigingen aan bezoekers moet het domein in Resend geverifieerd zijn.
 */
const FROM = () => process.env.LEAD_FROM_EMAIL ?? `${site.name} <onboarding@resend.dev>`;
const TO = () => process.env.LEAD_TO_EMAIL ?? site.email;

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function send(payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM(), ...payload }),
  });
  return res.ok;
}

const quote = (prompt: string) =>
  `<blockquote style="margin:16px 0;padding:16px 20px;border-left:3px solid #ee7041;background:#e6f4f4;font-family:ui-monospace,Menlo,monospace;font-size:14px;line-height:1.6;color:#081215">${escapeHtml(prompt).replace(/\n/g, "<br/>")}</blockquote>`;

/** Interne melding met de volledige aanvraag. */
export function notifyTeam(lead: Lead) {
  return send({
    to: [TO()],
    reply_to: lead.email,
    subject: `Nieuwe prompt: ${lead.prompt.slice(0, 60)}${lead.prompt.length > 60 ? "…" : ""}`,
    html: `<p><strong>E-mail:</strong> ${escapeHtml(lead.email)}<br/><strong>Marketing:</strong> ${lead.marketing ? "ja" : "nee"}<br/><strong>ID:</strong> ${lead.id}</p>${quote(lead.prompt)}`,
  });
}

/** Ontvangstbevestiging (vision.md, e-mail 1): de oorspronkelijke prompt en de volgende stap. */
export function confirmToVisitor(lead: Lead) {
  const steps = thanks.steps
    .map(
      (s, i) =>
        `<p style="margin:0 0 12px"><strong>${i + 1}. ${escapeHtml(s.title)}</strong><br/>${escapeHtml(s.text)}</p>`,
    )
    .join("");
  return send({
    to: [lead.email],
    reply_to: TO(),
    subject: "Dit is jouw prompt. Dit gebeurt er nu.",
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#081215;max-width:560px">
<p style="font-size:22px;font-weight:700;margin:0 0 8px">${escapeHtml(thanks.title)}</p>
<p>${escapeHtml(thanks.lead)}</p>
<p style="margin-bottom:0"><strong>Jouw prompt:</strong></p>${quote(lead.prompt)}
${steps}
<p style="color:#3d5a5c;font-size:13px">Je ontvangt deze mail omdat je via ${site.url.replace("https://", "")} een opdracht hebt ingediend. Antwoord gerust op deze mail als je iets wilt toevoegen.</p>
</div>`,
  });
}
