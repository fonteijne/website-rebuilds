import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { K } from "@/lib/family";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { addItems } from "@/lib/items";
import type { Recipe } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const [me, { id }, body] = await Promise.all([requireUser(), params, req.json().catch(() => ({}))]);
  if (me instanceof NextResponse) return me;
  const recipe = await db().hget<Recipe>(K(me.fam).recipes, id);
  if (!recipe) return json({ error: "Recept niet gevonden" }, 404);
  // ids: door de client (optimistisch) gekozen id's per ingrediënt, zodat de lijst niet verspringt.
  const ids = Array.isArray((body as { ids?: unknown }).ids) ? (body as { ids: unknown[] }).ids : [];
  const items = await addItems(recipe.ingredients, me, { id: recipe.id, label: recipe.label }, ids);
  return json({ added: items.length, label: recipe.label });
}
