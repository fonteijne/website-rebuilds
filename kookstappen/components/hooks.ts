"use client";

import { useEffect, useState } from "react";

/** Huidige tijd, die alleen tikt zolang er een timer loopt (één interval voor de hele app). */
export function useNow(active: boolean, intervalMs = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

/** Houdt het scherm aan tijdens het koken (Screen Wake Lock API, waar beschikbaar). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) void lock.release();
      } catch {
        // Bijv. batterijbesparing: geen probleem.
      }
    };
    void request();
    const onVisible = () => {
      if (document.visibilityState === "visible" && (!lock || lock.released)) void request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
