import type { Option, Recipe, Step, SubStep } from "./types";

// Maakt modeluitvoer (of opgeslagen data) veilig: juiste types, begrensde lengtes, geen lege stappen.

const MAX_STEPS = 80;
const MAX_TEXT = 200;

const str = (v: unknown, max = MAX_TEXT) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? Math.round(v) : Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};
const list = (v: unknown) => (Array.isArray(v) ? v : []);

function subStep(raw: unknown): SubStep | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const text = str(r.text);
  if (!text) return null;
  const timerSeconds = int(r.timerSeconds, 0, 24 * 3600);
  return { text, timerSeconds, parallel: timerSeconds > 0 && r.parallel === true, source: int(r.source, 0, 99) };
}

function option(raw: unknown): Option | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const label = str(r.label, 40);
  const steps = list(r.steps).map(subStep).filter((s): s is SubStep => s !== null).slice(0, 20);
  return label && steps.length ? { label, steps } : null;
}

function steps(raw: unknown): Step[] {
  const out: Step[] = [];
  for (const item of list(raw)) {
    const base = subStep(item);
    if (!base) continue;
    const options = list((item as Record<string, unknown>).options)
      .map(option)
      .filter((o): o is Option => o !== null)
      .slice(0, 4);
    if (options.length === 1) {
      // Eén "alternatief" is geen keuze: zet de stappen gewoon in de lijst.
      for (const s of options[0].steps) out.push({ ...s, options: [] });
    } else if (options.length > 1) {
      out.push({ ...base, timerSeconds: 0, parallel: false, options });
    } else {
      out.push({ ...base, options: [] });
    }
  }
  return out.slice(0, MAX_STEPS);
}

export function normalizeRecipe(raw: unknown, id: string, createdAt: number): Recipe {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id,
    title: str(r.title, 80) || "Recept",
    ingredients: list(r.ingredients).map((i) => str(i, 80)).filter(Boolean).slice(0, 40),
    tips: list(r.tips).map((t) => str(t, 300)).filter(Boolean).slice(0, 6),
    steps: steps(r.steps),
    createdAt,
  };
}

/** Haalt het eerste JSON-object uit een modelantwoord (ook als het in ```json-blokken staat). */
export function extractJson(content: string): unknown {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Geen JSON in antwoord");
  return JSON.parse(content.slice(start, end + 1));
}
