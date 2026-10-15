"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Gebaseerd op React Bits' ScrollReveal: woorden lichten één voor één op
 * terwijl je scrolt (gescrubd, dus omkeerbaar).
 */
type Props = { as?: ElementType; children: ReactNode; className?: string; start?: string; end?: string };

export default function ScrollWords({ as: Tag = "p", children, className = "", start = "top 80%", end = "bottom 45%" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      let split: SplitText | undefined;
      const run = () => {
        split = SplitText.create(el, { type: "words", wordsClass: "will-change-[opacity]" });
        gsap.fromTo(
          split.words,
          { opacity: 0.12 },
          { opacity: 1, ease: "none", stagger: 0.05, scrollTrigger: { trigger: el, start, end, scrub: true } },
        );
      };
      if (document.fonts?.status === "loaded") run();
      else document.fonts.ready.then(run);
      return () => split?.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
