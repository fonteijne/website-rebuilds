"use client";

import { useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP, whenNear } from "@/lib/gsap";

/**
 * Adapted from React Bits — ScrollVelocity (https://reactbits.dev), via brandagency/components/fx.
 * Changes: GSAP port (no motion library): an endless band that speeds up, flips direction and skews
 * with scroll velocity, runs on gsap.ticker and idles while off-screen. Static row for reduced motion.
 */
type Props = {
  items: ReactNode[];
  /** px per second, negative = to the right. */
  velocity?: number;
  className?: string;
  itemClassName?: string;
  separator?: ReactNode;
  copies?: number;
  skew?: number;
};

export default function ScrollVelocity({
  items,
  velocity = 50,
  className = "",
  itemClassName = "",
  separator,
  copies = 3,
  skew = 6,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) =>
        whenNear(root.current, ctx, () => {
          const el = track.current!;
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
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (visible = self.isActive),
            onUpdate: (self) => {
              const v = self.getVelocity();
              if (Math.abs(v) > 20) dir = (v > 0 ? 1 : -1) * Math.sign(velocity || 1);
              boost = Math.min(Math.abs(v) / 300, 6);
              skewTo(gsap.utils.clamp(-skew, skew, -v / 250));
            },
          });

          const tick = (_t: number, dt: number) => {
            if (!visible || !copyWidth) return;
            boost *= 0.94;
            if (boost < 0.01) skewTo(0);
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
        }),
      );
    },
    { scope: root },
  );

  const row = items.map((item, i) => (
    <span key={i} className={`flex shrink-0 items-center ${itemClassName}`}>
      {item}
      {separator}
    </span>
  ));

  return (
    <div ref={root} className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <div ref={track} className="flex w-max">
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} className="flex shrink-0">
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}
