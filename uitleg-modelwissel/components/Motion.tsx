"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import SmoothScroll from "./SmoothScroll";

/** Wikkelt de pagina: Lenis-scroll + reveal van [data-reveal] + de lijn in de flow. */
export default function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;

      gsap.set("[data-reveal]", { opacity: 0, y: 32 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12, overwrite: true }),
      });

      // Verbindingslijn tussen de stappen "tekent" mee met scrollen.
      gsap.fromTo(
        "[data-line]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: "[data-flow]", start: "top 70%", end: "bottom 70%", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <SmoothScroll>
      <div ref={root}>{children}</div>
    </SmoothScroll>
  );
}
