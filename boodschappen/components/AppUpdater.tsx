"use client";

import { useEffect, useRef, useState } from "react";

const BUILD = process.env.NEXT_PUBLIC_BUILD_ID;
const THRESHOLD = 80;

/**
 * Een PWA op het iPhone-beginscherm heeft geen verversknop. Daarom:
 * 1. bij terugkeren in de app controleren of er een nieuwe versie is en dan zelf herladen,
 * 2. een banner als de nieuwe versie opduikt terwijl je de app open hebt,
 * 3. omlaag trekken (pull-to-refresh) bovenaan de pagina.
 */
export default function AppUpdater() {
  const [stale, setStale] = useState(false);
  const pill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let busy = false;
    const check = async (reloadNow: boolean) => {
      if (busy) return;
      busy = true;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { v } = (await res.json()) as { v?: string };
        if (v && BUILD && v !== BUILD) {
          if (reloadNow) location.reload();
          else setStale(true);
        }
      } catch {
        /* offline */
      } finally {
        busy = false;
      }
    };
    const onVisible = () => document.visibilityState === "visible" && check(true);
    const id = setInterval(() => document.visibilityState === "visible" && check(false), 60_000);
    document.addEventListener("visibilitychange", onVisible);
    check(false);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    let startY = 0;
    let pull = 0;
    let active = false;
    const el = () => pill.current;
    const paint = (p: number) => {
      const n = el();
      if (!n) return;
      const ready = p >= THRESHOLD;
      n.style.opacity = p > 8 ? "1" : "0";
      n.style.transform = `translate(-50%, ${Math.min(p, 120) * 0.6}px)`;
      n.dataset.ready = ready ? "1" : "0";
      n.firstElementChild?.setAttribute("style", `transform: rotate(${Math.min(p / THRESHOLD, 1) * 180}deg)`);
    };
    const start = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null;
      active = window.scrollY <= 0 && !t?.closest("[role=dialog], [data-lenis-prevent], input, textarea");
      startY = e.touches[0].clientY;
      pull = 0;
    };
    const move = (e: TouchEvent) => {
      if (!active) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0 || window.scrollY > 0) {
        active = dy > 0 && window.scrollY <= 0;
        paint(0);
        return;
      }
      pull = dy * 0.55;
      paint(pull);
    };
    const end = () => {
      if (active && pull >= THRESHOLD) {
        const n = el();
        if (n) n.dataset.loading = "1";
        navigator.vibrate?.(10);
        location.reload();
      } else paint(0);
      active = false;
      pull = 0;
    };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
    };
  }, []);

  return (
    <>
      <div
        ref={pill}
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[max(0.5rem,env(safe-area-inset-top))] z-[60] grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-line bg-card opacity-0 shadow-lg data-[ready='1']:bg-leaf data-[ready='1']:text-white data-[loading='1']:animate-spin"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </div>
      {stale && (
        <button
          onClick={() => location.reload()}
          className="fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-[60] mx-auto w-fit rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg shadow-xl"
        >
          Nieuwe versie beschikbaar · <span className="font-extrabold text-sun underline underline-offset-2">Vernieuwen</span>
        </button>
      )}
    </>
  );
}
