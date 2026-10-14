"use client";

import { memo, useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import Noise from "./reactbits/Noise";

/**
 * Drijvende kleurvlakken + korrel (React Bits Noise), gedreven door GSAP.
 * memo: rendert niet mee bij elke lijstwijziging. will-change houdt de geblurde
 * vlakken op een eigen laag, zodat de blur niet elk frame opnieuw gerasterd wordt.
 */
function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".blob").forEach((el, i) => {
          gsap.to(el, {
            x: gsap.utils.random(-60, 60),
            y: gsap.utils.random(-50, 50),
            scale: gsap.utils.random(0.9, 1.2),
            duration: gsap.utils.random(7, 11),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.6,
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="blob absolute -left-24 -top-20 h-80 w-80 rounded-full will-change-transform bg-sun opacity-40 blur-3xl" />
      <div className="blob absolute -right-28 top-1/3 h-96 w-96 rounded-full will-change-transform bg-leaf opacity-25 blur-3xl" />
      <div className="blob absolute -bottom-32 left-1/4 h-80 w-80 rounded-full will-change-transform bg-brand opacity-20 blur-3xl" />
      <Noise fixed opacity={0.07} fps={reducedMotion() ? 0 : 12} blendMode="multiply" />
    </div>
  );
}

export default memo(Backdrop);
