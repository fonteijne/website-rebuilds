export type User = { id: string; name: string; admin: boolean; createdAt: number };

export type Item = {
  id: string;
  text: string;
  qty: number;
  cat: string;
  done: boolean;
  by: string; // user id
  at: number;
  doneAt?: number;
  rec?: { id: string; label: string }[]; // recepten waaruit dit item komt
  man?: boolean; // ook los toegevoegd: blijft staan als het recept eraf gaat
};

export type Member = { id: string; name: string; admin: boolean; passkeys: number };

export type ListPayload = {
  rev: number;
  items: Item[];
  suggestions: string[];
  members: Record<string, string>;
};

export type Recipe = {
  id: string;
  label: string;
  ingredients: string[]; // zoals getypt, bv. "2x melk"
  by: string;
  at: number;
};
