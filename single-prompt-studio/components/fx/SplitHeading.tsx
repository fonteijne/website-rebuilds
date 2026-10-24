"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, MOTION_OK, SplitText, useGSAP, whenNear } from "@/lib/gsap";

/**
 * Adapted from React Bits — SplitText (https://reactbits.dev).
 * Changes: line-masked reveal (mask: "lines") instead of per-char fades, autoSplit so lines are
 * recalculated after font load/resize, one ScrollTrigger per heading (once), set up lazily when the
 * heading nears the viewport, and nothing at all for prefers-reduced-motion (the heading is simply there).
 */
type Props = { as?: ElementType; children: ReactNode; className?: string; id?: string };

export default function SplitHeading({ as: Tag = "h2", children, className = "", id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) =>
        whenNear(el, ctx, () => {
          const split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 0.9,
                stagger: 0.09,
                ease: "power4.out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
          return () => split.revert();
        }),
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
