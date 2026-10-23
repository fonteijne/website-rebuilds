"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const REDUCE = "(prefers-reduced-motion: reduce)";

/**
 * Lenis smooth scroll driven by GSAP's ticker (one rAF loop), synced with ScrollTrigger.
 * Reference: amaezin-design/src/components/SmoothScroll.tsx. Touch stays native (syncTouch: false).
 * With prefers-reduced-motion the wheel is not smoothed and anchors jump natively. The tree shape
 * stays the same either way, so toggling the preference never remounts the page.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [smooth, setSmooth] = useState(() => typeof window !== "undefined" && !window.matchMedia(REDUCE).matches);

  useEffect(() => {
    const mq = window.matchMedia(REDUCE);
    const sync = () => setSmooth(!mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  const options = useMemo(
    () => ({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: smooth,
      anchors: smooth ? { offset: -96 } : false,
      syncTouch: false,
    }),
    [smooth],
  );

  return (
    <ReactLenis root ref={lenisRef} options={options}>
      <ScrollSync />
      {children}
    </ReactLenis>
  );
}

function ScrollSync() {
  const pathname = usePathname();
  const lenis = useLenis(ScrollTrigger.update);

  // On route change: back to top (unless jumping to an anchor) and recalculate triggers.
  // Not on first load: ScrollTrigger refreshes on window load by itself.
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  // Fonts shift layout after first paint; refresh trigger positions once they're in.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return null;
}
