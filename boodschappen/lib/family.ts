import { db } from "./db";
import type { Family, User } from "./types";

/** Alle data van één familie leeft onder `f:<id>:…`, zodat families nooit elkaars lijst zien. */
export const K = (fam: string) => ({
  items: `f:${fam}:items`,
  recipes: `f:${fam}:recipes`,
  hist: `f:${fam}:hist`,
  rev: `f:${fam}:rev`,
  users: `f:${fam}:users`,
});

export const newInvite = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);

export const getFamily = (id: string) => db().get<Family>(`family:${id}`);

export async function familyByInvite(code: string): Promise<Family | null> {
  if (!/^[a-f0-9]{8,40}$/.test(code)) return null;
  const id = await db().get<string>(`invite:${code}`);
  return id ? getFamily(id) : null;
}

export async function createFamily(name: string, ownerId: string): Promise<Family> {
  const f: Family = { id: crypto.randomUUID().slice(0, 12), name, ownerId, registrationOpen: true, invite: newInvite(), createdAt: Date.now() };
  await saveFamily(f);
  await db().sadd("families", f.id);
  await db().set(`invite:${f.invite}`, f.id);
  return f;
}

export const saveFamily = (f: Family) => db().set(`family:${f.id}`, f);

export async function addMember(fam: string, userId: string) {
  await db().sadd("users", userId);
  await db().sadd(K(fam).users, userId);
}

export async function familyMembers(fam: string): Promise<User[]> {
  const ids = await db().smembers(K(fam).users);
  const users = await Promise.all(ids.map((id) => db().get<User>(`user:${id}`)));
  return users.filter((u): u is User => !!u);
}

/**
 * Eenmalige migratie van de oude, losse lijst naar één familie "home":
 * bestaande gebruikers en data blijven gewoon werken. Idempotent, dus veilig bij gelijktijdige aanroepen.
 */
export async function migrateLegacy() {
  const d = db();
  if (await d.get("legacyMigrated")) return;
  const fam = "home";
  const k = K(fam);
  const ids = await d.smembers("users");
  const users = (await Promise.all(ids.map((id) => d.get<User & { fam?: string }>(`user:${id}`)))).filter((u): u is User => !!u);
  const adminId = (await d.get<string>("adminId")) ?? users.find((u) => u.admin)?.id ?? users[0]?.id;
  if (!(await getFamily(fam)) && adminId) {
    const f: Family = { id: fam, name: "Ons huishouden", ownerId: adminId, registrationOpen: (await d.get<boolean>("registrationOpen")) !== false, invite: newInvite(), createdAt: Date.now() };
    await saveFamily(f);
    await d.sadd("families", fam);
    await d.set(`invite:${f.invite}`, fam);
  }
  for (const [legacy, scoped] of [["items", k.items], ["recipes", k.recipes]] as const) {
    const all = await d.hgetall<unknown>(legacy);
    for (const [field, v] of Object.entries(all)) await d.hset(scoped, field, v);
  }
  const rev = await d.get<number>("rev");
  if (rev != null && (await d.get(k.rev)) == null) await d.set(k.rev, rev);
  const hist = await d.ztop("hist", 200);
  for (const [i, h] of hist.entries()) await d.zincr(k.hist, h, hist.length - i); // volgorde blijft behouden
  for (const u of users) {
    if (u.fam) continue;
    await d.set(`user:${u.id}`, { ...u, fam, owner: u.id === adminId });
    await d.sadd(k.users, u.id);
  }
  await d.set("legacyMigrated", true);
}

/** Globale schakelaar van de beheerder: staat die dicht, dan kan niemand zich registreren, ook niet via een familielink. */
export async function registrationOpen() {
  return (await db().get<boolean>("registrationOpen")) !== false;
}

export type Join = { ok: true; family: Family | null } | { ok: false; error: string; status: number };

/** Mag je nu een account maken? Globaal dicht wint altijd van de instelling van een familie. */
export async function checkJoin(invite?: string): Promise<Join> {
  if (!(await registrationOpen())) return { ok: false, error: "Registratie is gesloten", status: 403 };
  if (!invite) return { ok: true, family: null };
  const family = await familyByInvite(invite);
  if (!family) return { ok: false, error: "Deze uitnodigingslink is ongeldig of vervangen", status: 404 };
  if (!family.registrationOpen) return { ok: false, error: `Registratie voor ${family.name} is gesloten`, status: 403 };
  return { ok: true, family };
}
