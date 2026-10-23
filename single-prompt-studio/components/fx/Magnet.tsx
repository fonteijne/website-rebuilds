"use client";

import { useRef, type ReactNode } from "react";
import { FINE_POINTER, gsap, useGSAP } from "@/lib/gsap";

/**
 * Adapted from React Bits — Magnet (https://reactbits.dev).
 * Changes: gsap.quickTo instead of React state per mousemove (gsap-performance skill), and it only
 * activates for a fine pointer without reduced motion; on touch it's a plain wrapper.
 */
type Props = { children: ReactNode; padding?: number; strength?: number; className?: string };

export default function Magnet({ children, padding = 60, strength = 4, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const el = inner.current!;
        const w = wrap.current!;
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.45)" });

        const move = (e: PointerEvent) => {
          const r = w.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const inside =
            Math.abs(e.clientX - cx) < r.width / 2 + padding && Math.abs(e.clientY - cy) < r.height / 2 + padding;
          xTo(inside ? (e.clientX - cx) / strength : 0);
          yTo(inside ? (e.clientY - cy) / strength : 0);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      });
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={`inline-block ${className}`}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
