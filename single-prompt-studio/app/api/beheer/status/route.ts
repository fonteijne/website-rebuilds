import { NextResponse } from "next/server";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/lead";
import { getStore } from "@/lib/store";

/** Status van een aanvraag bijwerken vanuit /beheer. Beveiligd door proxy.ts (Basic Auth). */
export async function POST(req: Request) {
  const store = getStore();
  if (!store) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "") as LeadStatus;
  if (!id || !LEAD_STATUSES.some((s) => s.id === status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  await store.setStatus(id, status);
  return NextResponse.redirect(new URL(`/beheer#${id}`, req.url), 303);
}
