// Gedeeld tussen server (API) en client.

export type SubStep = {
  /** Eén handeling, gebiedende wijs, kort. */
  text: string;
  /** Wachttijd in seconden; 0 = geen timer. */
  timerSeconds: number;
  /** true als je tijdens deze timer al met de volgende stappen verder kunt. */
  parallel: boolean;
  /** Nummer van de stap in de originele instructies (0 = onbekend). */
  source: number;
};

export type Option = {
  label: string;
  steps: SubStep[];
};

export type Step = SubStep & {
  /** Twee of meer alternatieven (bijv. koekenpan / oven / magnetron); anders leeg. */
  options: Option[];
};

export type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  tips: string[];
  steps: Step[];
  createdAt: number;
};

export type StepsRequest = {
  images?: string[];
  text?: string;
};

export type StepsResponse = { recipe: Recipe } | { error: string; code?: "no-key" | "bad-code" | "no-steps" | "upstream" | "bad-input" };

export type StatusResponse = {
  configured: boolean;
  needsCode: boolean;
  model: string;
};
