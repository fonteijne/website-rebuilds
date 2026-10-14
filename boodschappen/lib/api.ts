export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(path, {
    credentials: "same-origin",
    cache: "no-store",
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Er ging iets mis");
  return data as T;
}

export function friendly(e: unknown): string {
  const err = e as { name?: string; message?: string };
  if (err?.name === "NotAllowedError") return "Geannuleerd of verlopen. Probeer het nog eens.";
  if (err?.name === "InvalidStateError") return "Deze passkey bestaat al op dit apparaat.";
  return err?.message || "Er ging iets mis";
}

export function colorFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 42%)`;
}
