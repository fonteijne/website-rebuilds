"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** "load" plays immediately (heroes), "scroll" plays when it enters the viewport. */
  trigger?: "load" | "scroll";
  type?: "chars" | "words" | "lines";
  delay?: number;
  id?: string;
};

/**
 * Masked text reveal with GSAP SplitText (autoSplit re-splits on resize/font load;
 * returning the tween from onSplit lets SplitText keep progress in sync).
 */
export default function SplitHeading({
  as: Tag = "h2",
  children,
  className = "",
  trigger = "scroll",
  type = "lines",
  delay = 0,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { visibility: "visible" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(el, {
          type: type === "lines" ? "lines" : `lines, ${type}`,
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });
            const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
            return gsap.from(targets, {
              yPercent: 110,
              rotate: type === "lines" ? 2 : 0,
              duration: type === "chars" ? 1 : 1.1,
              ease: "expo.out",
              stagger: type === "chars" ? 0.025 : type === "words" ? 0.06 : 0.1,
              delay,
              scrollTrigger:
                trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
            });
          },
        });
        return () => split.revert();
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} id={id} data-split className={className}>
      {children}
    </Tag>
  );
}
