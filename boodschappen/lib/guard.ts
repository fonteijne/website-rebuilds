import { NextResponse } from "next/server";
import { currentUser } from "./session";
import type { User } from "./types";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function requireUser(): Promise<User | NextResponse> {
  return (await currentUser()) ?? json({ error: "Niet ingelogd" }, 401);
}

export async function requireAdmin(): Promise<User | NextResponse> {
  const u = await requireUser();
  if (u instanceof NextResponse) return u;
  return u.admin ? u : json({ error: "Alleen voor de beheerder" }, 403);
}

/** Basis CSRF-bescherming: mutaties moeten van dezelfde origin komen. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
