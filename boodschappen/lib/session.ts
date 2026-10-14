import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";
import { migrateLegacy } from "./family";
import type { User } from "./types";

const COOKIE = "sid";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 dagen

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET ontbreekt");
    return new TextEncoder().encode("dev-only-secret-dev-only-secret-dev-only");
  }
  return new TextEncoder().encode(s);
}

export async function startSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Laadt een gebruiker; accounts van vóór de families worden eenmalig naar familie "home" gemigreerd. */
export async function getUser(id: string): Promise<User | null> {
  let u = await db().get<User>(`user:${id}`);
  if (u && !u.fam) {
    await migrateLegacy();
    u = await db().get<User>(`user:${id}`);
  }
  return u?.fam ? u : null;
}

/** Geeft de ingelogde gebruiker, of null. Verwijderde gebruikers zijn meteen uitgelogd. */
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return await getUser(payload.sub);
  } catch {
    return null;
  }
}

/** Kleine challenge-opslag voor WebAuthn (5 min, eenmalig). */
export async function saveChallenge(data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db().set(`chal:${id}`, data, { ex: 300 });
  (await cookies()).set("chal", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 300,
  });
}

export async function takeChallenge<T = Record<string, unknown>>(): Promise<T | null> {
  const id = (await cookies()).get("chal")?.value;
  if (!id) return null;
  (await cookies()).delete({ name: "chal", path: "/api/auth" });
  return db().getdel<T>(`chal:${id}`);
}

/** rpID + origin volgen de host waarop de app draait (werkt op localhost en op Vercel). */
export async function relyingParty() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "localhost").split(",")[0].trim();
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = (h.get("x-forwarded-proto") ?? (local ? "http" : "https")).split(",")[0].trim();
  return { rpID: host.replace(/:\d+$/, ""), origin: `${proto}://${host}`, rpName: "Boodschappen" };
}

export { registrationOpen } from "./family";
