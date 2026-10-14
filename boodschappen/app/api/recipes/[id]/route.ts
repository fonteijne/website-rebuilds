import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { K } from "@/lib/family";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { parseIngredients } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const cur = await db().hget<Recipe>(K(me.fam).recipes, id);
  if (!cur) return json({ error: "Recept niet gevonden" }, 404);
  const body = (await req.json().catch(() => ({}))) as { label?: string; ingredients?: unknown };
  const label = body.label?.trim().slice(0, 40);
  const ingredients = parseIngredients(body.ingredients);
  if (!label) return json({ error: "Geef het recept een label" }, 400);
  if (!ingredients.length) return json({ error: "Voeg minstens één ingrediënt toe" }, 400);
  const recipe: Recipe = { ...cur, label, ingredients };
  await db().hset(K(me.fam).recipes, id, recipe);
  return json({ recipe });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  await db().hdel(K(me.fam).recipes, id);
  return json({ ok: true });
}
