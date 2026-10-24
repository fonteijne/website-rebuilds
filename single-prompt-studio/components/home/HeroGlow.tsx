"use client";

import { useRef } from "react";
import { FINE_POINTER, gsap, useGSAP } from "@/lib/gsap";

/**
 * Zachte signaalgloed achter de hero die de muis volgt (gsap.quickTo, alleen transform).
 * Op touch en bij reduced motion staat hij stil. Geen WebGL, geen blur-filter: alleen een gradient.
 */
export default function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const el = ref.current!;
        const xTo = gsap.quickTo(el, "x", { duration: 1.4, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 1.4, ease: "power3" });
        const section = el.parentElement!;
        const move = (e: PointerEvent) => {
          const r = section.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.35);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        };
        section.addEventListener("pointermove", move, { passive: true });
        return () => section.removeEventListener("pointermove", move);
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[38%] -z-10 aspect-square w-[150vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 sm:w-[90vw]"
      style={{
        background:
          "radial-gradient(closest-side, rgb(238 112 65 / 0.24), rgb(171 224 224 / 0.09) 55%, transparent 72%)",
      }}
    />
  );
}
