"use client";

import { useRef, type ReactNode } from "react";
import { FINE_POINTER, gsap, useGSAP } from "@/lib/gsap";

/**
 * Adapted from React Bits — SpotlightCard (https://reactbits.dev).
 * Changes: the spotlight position is tweened as CSS variables with gsap.quickTo (no React state per
 * pointermove), only on fine pointers, and the glow is a single radial-gradient layer whose opacity
 * fades in/out. The card itself is plain markup, so it renders fully without JS.
 */
type Props = { children: ReactNode; className?: string; as?: "article" | "div" | "li" };

export default function SpotlightCard({ children, className = "", as: Tag = "article" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const el = ref.current!;
        const glow = el.querySelector<HTMLElement>("[data-glow]")!;
        const xTo = gsap.quickTo(el, "--mx", { duration: 0.35, ease: "power3" });
        const yTo = gsap.quickTo(el, "--my", { duration: 0.35, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo(e.clientX - r.left);
          yTo(e.clientY - r.top);
        };
        const enter = () => gsap.to(glow, { opacity: 1, duration: 0.3 });
        const leave = () => gsap.to(glow, { opacity: 0, duration: 0.5 });
        el.addEventListener("pointermove", move, { passive: true });
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <Tag
      ref={ref as never}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ ["--mx" as string]: "0px", ["--my" as string]: "0px" }}
    >
      <div
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx) var(--my), color-mix(in srgb, var(--color-signal) 22%, transparent), transparent 60%)",
        }}
      />
      {children}
    </Tag>
  );
}
