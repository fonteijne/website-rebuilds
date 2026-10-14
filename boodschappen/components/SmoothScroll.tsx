"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";

/**
 * Lenis (smooth scroll) gekoppeld aan de GSAP-ticker, zodat ScrollTrigger
 * en scroll één frame-loop delen (zie lenis/react README, "GSAP integration").
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = ref.current?.lenis;
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <ReactLenis root ref={ref} options={{ autoRaf: false, lerp: 0.1, smoothWheel: !reducedMotion(), anchors: true }} />
      {children}
    </>
  );
}
