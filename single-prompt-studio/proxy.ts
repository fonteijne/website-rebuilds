import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic Auth voor het interne overzicht (/beheer) en de beheer-API.
 * Zonder ADMIN_USER/ADMIN_PASSWORD bestaat /beheer niet (404).
 */
export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return new NextResponse("Not found", { status: 404 });

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const i = decoded.indexOf(":");
    if (i > -1 && safeEqual(decoded.slice(0, i), user) && safeEqual(decoded.slice(i + 1), pass)) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authenticatie vereist", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Single Prompt Studio beheer", charset="UTF-8"' },
  });
}

/** Vergelijking zonder vroegtijdig afbreken, tegen timing-aanvallen. */
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const config = {
  matcher: ["/beheer/:path*", "/api/beheer/:path*"],
};
