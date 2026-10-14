import { db } from "./db";

export type Cred = {
  id: string;
  userId: string;
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
  createdAt: number;
};

export const b64 = {
  enc: (u: Uint8Array) => Buffer.from(u).toString("base64url"),
  dec: (s: string) => new Uint8Array(Buffer.from(s, "base64url")),
};

export async function saveCred(c: Cred) {
  await db().set(`cred:${c.id}`, c);
  await db().sadd(`ucreds:${c.userId}`, c.id);
}

export async function credsOf(userId: string): Promise<Cred[]> {
  const ids = await db().smembers(`ucreds:${userId}`);
  const all = await Promise.all(ids.map((id) => db().get<Cred>(`cred:${id}`)));
  return all.filter((c): c is Cred => !!c);
}
