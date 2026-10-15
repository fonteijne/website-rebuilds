"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * GSAP-port van React Bits' ScrollVelocity: oneindige band tekst die versnelt,
 * van richting wisselt en scheef trekt met de scrollsnelheid. Pauzeert buiten beeld.
 */
type Props = {
  items: ReactNode[];
  /** px per seconde, negatief = naar rechts. */
  velocity?: number;
  className?: string;
  itemClassName?: string;
  separator?: ReactNode;
  copies?: number;
  skew?: number;
};

export default function ScrollVelocity({
  items,
  velocity = 60,
  className = "",
  itemClassName = "",
  separator,
  copies = 4,
  skew = 8,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      const wrapEl = root.current;
      if (!el || !wrapEl || prefersReducedMotion()) return;

      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      let copyWidth = first.offsetWidth;
      const ro = new ResizeObserver(() => (copyWidth = first.offsetWidth));
      ro.observe(first);

      const setX = gsap.quickSetter(el, "x", "px");
      const skewTo = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3" });
      let x = 0;
      let dir = Math.sign(velocity) || 1;
      let boost = 0;
      let visible = false;

      const st = ScrollTrigger.create({
        trigger: wrapEl,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (visible = self.isActive),
        onUpdate: (self) => {
          const v = self.getVelocity();
          if (Math.abs(v) > 20) dir = (v > 0 ? 1 : -1) * Math.sign(velocity || 1);
          boost = Math.min(Math.abs(v) / 300, 8);
          skewTo(gsap.utils.clamp(-skew, skew, -v / 250));
        },
      });

      const tick = (_t: number, dt: number) => {
        if (!visible || !copyWidth) return;
        boost *= 0.94;
        if (Math.abs(boost) < 0.01) skewTo(0);
        x -= dir * Math.abs(velocity) * (1 + boost) * (dt / 1000);
        x = gsap.utils.wrap(-copyWidth, 0, x);
        setX(x);
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        st.kill();
      };
    },
    { scope: root },
  );

  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className={`flex shrink-0 items-center ${itemClassName}`}>
          {item}
          {separator}
        </span>
      ))}
    </>
  );

  return (
    <div ref={root} className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <div ref={track} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} className="flex shrink-0">
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}
