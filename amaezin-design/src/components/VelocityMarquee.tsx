"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Props = {
  text: string;
  className?: string;
  /** seconds for one full loop at rest */
  speed?: number;
  reverse?: boolean;
};

/**
 * Infinite marquee whose speed and direction follow scroll velocity — a GSAP take on
 * React Bits' ScrollVelocity (which depends on motion/react), so the site has one animation engine.
 */
export default function VelocityMarquee({ text, className = "", speed = 22, reverse = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = ref.current!.querySelector<HTMLElement>(".vm-track")!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const loop = gsap.to(track, {
          xPercent: reverse ? 50 : -50,
          ease: "none",
          duration: speed,
          repeat: -1,
        });
        if (reverse) loop.progress(0.5);

        const skewTo = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
        let settle: gsap.core.Tween | undefined;

        const st = ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate(self) {
            const v = self.getVelocity();
            const dir = self.direction;
            const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(v) / 400);
            loop.timeScale(dir * boost);
            skewTo(gsap.utils.clamp(-8, 8, v / -300));
            settle?.kill();
            settle = gsap.to(loop, { timeScale: dir, duration: 0.8, ease: "power2.out", delay: 0.1 });
            gsap.delayedCall(0.15, () => skewTo(0));
          },
        });
        return () => st.kill();
      });
    },
    { scope: ref }
  );

  const chunk = (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-[0.35em]">{text}</span>
          <svg aria-hidden viewBox="0 0 24 24" className="mx-[0.2em] size-[0.6em] shrink-0 fill-pink">
            <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z" />
          </svg>
        </span>
      ))}
    </span>
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`} aria-label={text} role="marquee">
      <div className="vm-track flex w-max will-change-transform" aria-hidden>
        {chunk}
        {chunk}
      </div>
    </div>
  );
}
