import type { Option, Recipe } from "./types";

// Zet een recept + gemaakte keuzes om in één platte lijst met afvinkbare items.

export type Item = {
  id: string;
  text: string;
  timerSeconds: number;
  parallel: boolean;
  source: number;
  /** Keuzestap: afgerond zodra er een optie gekozen is. */
  options?: Option[];
  /** Label van de gekozen optie waar deze stap bij hoort. */
  group?: string;
};

export type Progress = {
  done: Record<string, true>;
  choices: Record<string, number>;
  /** Ingrediënten die al klaarstaan (index). */
  prep: Record<number, true>;
  prepSkipped: boolean;
};

export const emptyProgress = (): Progress => ({ done: {}, choices: {}, prep: {}, prepSkipped: false });

export function flatten(recipe: Recipe, choices: Progress["choices"]): Item[] {
  const items: Item[] = [];
  recipe.steps.forEach((step, i) => {
    const id = `s${i}`;
    if (step.options.length < 2) {
      items.push({ id, text: step.text, timerSeconds: step.timerSeconds, parallel: step.parallel, source: step.source });
      return;
    }
    items.push({ id, text: step.text, timerSeconds: 0, parallel: false, source: step.source, options: step.options });
    const chosen = choices[id];
    const option = chosen === undefined ? undefined : step.options[chosen];
    option?.steps.forEach((sub, j) => items.push({ ...sub, id: `${id}o${chosen}x${j}`, group: option.label }));
  });
  return items;
}

export const isDone = (item: Item, progress: Progress) =>
  item.options ? progress.choices[item.id] !== undefined : Boolean(progress.done[item.id]);

export function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/** "2½ min", "15 sec" voor op knoppen. */
export function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const min = totalSeconds / 60;
  if (Number.isInteger(min)) return `${min} min`;
  if (Number.isInteger(min * 2)) return `${Math.floor(min) || ""}½ min`;
  return formatTime(totalSeconds);
}
