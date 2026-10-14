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
