import { NextResponse } from "next/server";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { addItem, readList } from "@/lib/items";

export async function GET(req: Request) {
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const list = await readList(me.fam);
  const since = Number(new URL(req.url).searchParams.get("since"));
  if (Number.isFinite(since) && since === list.rev) return json({ rev: list.rev, unchanged: true });
  return json(list);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { text, id } = (await req.json().catch(() => ({}))) as { text?: string; id?: string };
  if (!text?.trim()) return json({ error: "Leeg" }, 400);
  const item = await addItem(text, me, id);
  return json({ item });
}
