import { normalizeRecipe } from "./normalize";
import { emptyProgress, type Progress } from "./flow";
import type { Recipe } from "./types";

// Alles blijft op dit apparaat (localStorage). Lezen/schrijven kan falen (privémodus), dus altijd try/catch.

const KEY = "kookstappen:v1";

export type Timer = {
  id: string;
  /** Item waar de timer bij hoort. */
  itemId: string;
  label: string;
  durationMs: number;
  /** Eindtijd (ms) als de timer loopt; null als gepauzeerd. */
  endsAt: number | null;
  /** Resterende tijd bij pauze. */
  remainingMs: number;
};

export type Session = {
  recipe: Recipe;
  progress: Progress;
  timers: Timer[];
};

export type Saved = {
  current: Session | null;
  history: Recipe[];
  view: "focus" | "list";
  code: string;
};

export const emptySaved = (): Saved => ({ current: null, history: [], view: "focus", code: "" });

export function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySaved();
    const data = JSON.parse(raw) as Partial<Saved>;
    const fix = (r: Recipe) => normalizeRecipe(r, r.id, r.createdAt);
    return {
      current: data.current?.recipe
        ? { recipe: fix(data.current.recipe), progress: { ...emptyProgress(), ...data.current.progress }, timers: data.current.timers ?? [] }
        : null,
      history: (data.history ?? []).map(fix),
      view: data.view === "list" ? "list" : "focus",
      code: typeof data.code === "string" ? data.code : "",
    };
  } catch {
    return emptySaved();
  }
}

export function save(state: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Opslag vol of geblokkeerd: de app werkt gewoon door, alleen zonder geheugen.
  }
}
