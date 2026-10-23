"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Footer-inhoud schuift gestaggerd in; de grote achtergrondtekst schuift mee met scroll. */
export default function FooterReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(ref);
      gsap.from([q("[data-footer-logo]"), q("[data-footer-col]")], {
        y: 50,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
      gsap.fromTo(
        q("[data-footer-giant]"),
        { xPercent: 12 },
        { xPercent: -12, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true } },
      );
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
