"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once, before any useGSAP/ScrollTrigger usage (gsap-skills: gsap-react / gsap-scrolltrigger).
// Only the plugins this site actually uses (gsap-skills: gsap-performance).
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

gsap.defaults({ ease: "power3.out", duration: 0.8 });

/** matchMedia condition for every motion branch; the else-branch is the static, fully readable variant. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** Pointer effects only where a real mouse exists. */
export const FINE_POINTER = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };

type Cleanup = void | (() => void);

/**
 * Run an animation setup only once `el` gets near the viewport, inside the given gsap.Context so
 * useGSAP/matchMedia still revert it. Keeps hydration free of SplitText/ScrollTrigger work for
 * sections far below the fold (gsap-skills: gsap-performance; CLAUDE.md: TBT/INP budget).
 * Returns a cleanup for the surrounding matchMedia/useGSAP callback.
 */
export function whenNear(
  el: Element | null,
  ctx: gsap.Context,
  setup: () => Cleanup,
  rootMargin = "50% 0px",
): () => void {
  let inner: Cleanup;
  if (!el) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      ctx.add(() => {
        inner = setup();
      });
    },
    { rootMargin },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    if (typeof inner === "function") inner();
  };
}
