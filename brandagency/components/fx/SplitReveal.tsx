"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Tekst die per regel / woord / letter uit een masker omhoog komt (GSAP SplitText,
 * gebaseerd op React Bits' SplitText). Speelt één keer af zodra hij in beeld komt.
 */
type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  type?: "lines" | "words" | "chars";
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  /** Direct afspelen i.p.v. bij scrollen (bijv. hero). */
  immediate?: boolean;
  id?: string;
  lang?: string;
};

export default function SplitReveal({
  as: Tag = "div",
  children,
  className = "",
  type = "lines",
  delay = 0,
  stagger,
  duration = 1.1,
  start = "top 88%",
  immediate = false,
  id,
  lang,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      let split: SplitText | undefined;
      const run = () => {
        split = SplitText.create(el, {
          type: type === "chars" ? "words,chars" : type,
          mask: type === "chars" ? "words" : type,
          linesClass: "split-line",
          autoSplit: type === "lines",
          onSplit(self) {
            const targets = type === "lines" ? self.lines : type === "words" ? self.words : self.chars;
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(targets, {
              yPercent: 115,
              rotate: type === "chars" ? 0 : 2,
              duration,
              delay,
              ease: "expo.out",
              stagger: stagger ?? (type === "chars" ? 0.025 : type === "words" ? 0.05 : 0.1),
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            });
          },
        });
      };
      // Wacht op fonts zodat regels correct gesplitst worden.
      if (document.fonts?.status === "loaded") run();
      else document.fonts.ready.then(run);
      return () => split?.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-reveal id={id} lang={lang}>
      {children}
    </Tag>
  );
}
