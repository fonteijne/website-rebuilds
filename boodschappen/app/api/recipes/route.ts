import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json, requireUser, sameOrigin } from "@/lib/guard";
import { listRecipes, parseIngredients } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

export async function GET() {
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  return json({ recipes: await listRecipes() });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Ongeldige origin" }, 403);
  const me = await requireUser();
  if (me instanceof NextResponse) return me;
  const body = (await req.json().catch(() => ({}))) as { label?: string; ingredients?: unknown };
  const label = body.label?.trim().slice(0, 40);
  const ingredients = parseIngredients(body.ingredients);
  if (!label) return json({ error: "Geef het recept een label" }, 400);
  if (!ingredients.length) return json({ error: "Voeg minstens één ingrediënt toe" }, 400);
  const recipe: Recipe = { id: crypto.randomUUID().slice(0, 12), label, ingredients, by: me.id, at: Date.now() };
  await db().hset("recipes", recipe.id, recipe);
  return json({ recipe });
}
