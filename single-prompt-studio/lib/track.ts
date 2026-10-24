"use client";

import type { FunnelEvent } from "./lead";

/** Stuurt een funnel-event één keer per sessie, zonder de pagina op te houden. */
export function track(name: Exclude<FunnelEvent, "lead">) {
  try {
    const key = `sps:t:${name}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Geen sessionStorage (privévenster): dan gewoon tellen.
  }
  const body = new Blob([JSON.stringify({ name })], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/event", body)) {
    fetch("/api/event", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}
