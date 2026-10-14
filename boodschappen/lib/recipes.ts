import { db } from "./db";
import type { Recipe } from "./types";

/** Ingrediënten uit vrije tekst: één per regel (of komma-gescheiden), ontdubbeld. */
export function parseIngredients(input: unknown): string[] {
  const lines = Array.isArray(input) ? input.map(String) : String(input ?? "").split(/[\n,;]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of lines) {
    const t = l.trim().replace(/\s+/g, " ").slice(0, 60);
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      out.push(t);
    }
  }
  return out.slice(0, 60);
}

export async function listRecipes(): Promise<Recipe[]> {
  const all = await db().hgetall<Recipe>("recipes");
  return Object.values(all).sort((a, b) => a.label.localeCompare(b.label, "nl"));
}
