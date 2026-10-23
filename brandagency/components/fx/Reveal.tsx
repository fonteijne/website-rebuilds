"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Zachte fade-up voor blokken. Kinderen met [data-reveal-item] worden
 * gestaggerd (ScrollTrigger.batch), anders animeert het hele blok.
 */
type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  id?: string;
};

export default function Reveal({ as: Tag = "div", children, className = "", y = 40, delay = 0, stagger = 0.1, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.set(el, { autoAlpha: 1 });
      if (prefersReducedMotion()) return;
      const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, y });
        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, delay, stagger, ease: "power3.out", overwrite: true }),
        });
      } else {
        gsap.from(el, {
          autoAlpha: 0,
          y,
          duration: 1.1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      }
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-reveal id={id}>
      {children}
    </Tag>
  );
}
