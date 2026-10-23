"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Lichte versie van React Bits' Magnet: het element trekt naar de cursor toe
 * binnen `padding` px. Alleen actief bij een fijne pointer (geen touch).
 */
type Props = { children: ReactNode; padding?: number; strength?: number; className?: string };

export default function Magnet({ children, padding = 80, strength = 3, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = inner.current;
      const w = wrap.current;
      if (!el || !w || !window.matchMedia("(pointer: fine)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });

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
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={`inline-block ${className}`}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
