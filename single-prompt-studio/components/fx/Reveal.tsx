"use client";

import { useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP, whenNear } from "@/lib/gsap";

/**
 * Fades/slides in children marked [data-reveal] with a single ScrollTrigger.batch
 * (gsap-skills: gsap-performance), instead of one trigger per item. Opacity only (no autoAlpha), so
 * not-yet-revealed content stays focusable and in the accessibility tree.
 */
export default function Reveal({
  children,
  className = "",
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) =>
        whenNear(ref.current, ctx, () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
          if (!items.length) return;
          gsap.set(items, { opacity: 0, y });
          const triggers = ScrollTrigger.batch(items, {
            start: "top 90%",
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, overwrite: true }),
          });
          return () => triggers.forEach((t) => t.kill());
        }),
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
