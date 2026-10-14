/** admin = globale beheerder (eerste gebruiker van de app), owner = eigenaar van de eigen familie. */
export type User = { id: string; name: string; admin: boolean; owner: boolean; fam: string; createdAt: number };

export type Family = {
  id: string;
  name: string;
  ownerId: string;
  registrationOpen: boolean; // uitnodigingslink werkt (alleen als de globale registratie ook open staat)
  invite: string; // geheime code in de uitnodigingslink
  createdAt: number;
};

export type Item = {
  id: string;
  text: string;
  qty: number;
  cat: string;
  done: boolean;
  by: string; // user id
  at: number;
  doneAt?: number;
  rec?: { id: string; label: string; q?: number }[]; // recepten waaruit dit item komt
  man?: boolean; // ook los toegevoegd: blijft staan als het recept eraf gaat
};

export type Member = { id: string; name: string; admin: boolean; owner: boolean; passkeys: number };

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
