import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { addItem } from "@/lib/items";
import type { Recipe } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const recipe = await db().hget<Recipe>("recipes", id);
  if (!recipe) return json({ error: "Recept niet gevonden" }, 404);
  // Na elkaar, zodat dubbele ingrediënten correct samenvallen.
  let added = 0;
  for (const ing of recipe.ingredients) if (await addItem(ing, me, undefined, { id: recipe.id, label: recipe.label })) added++;
  return json({ added, label: recipe.label });
}
