"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger, reducedMotion } from "@/lib/gsap";

/** Houdt ScrollTrigger gelijk met de Lenis-scrollpositie. */
function SyncScrollTrigger() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

/**
 * Lenis (smooth scroll) met zijn eigen frame-loop (autoRaf). Eerder hing de
 * loop aan de GSAP-ticker via een ref in een effect; als die ref op dat moment
 * nog leeg was, werd Lenis nooit aangedreven terwijl het het wiel wel blokkeerde.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ReactLenis root options={{ autoRaf: true, lerp: 0.1, smoothWheel: !reducedMotion(), anchors: true }} />
      <SyncScrollTrigger />
      {children}
    </>
  );
}
