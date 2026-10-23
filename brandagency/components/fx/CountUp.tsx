"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** GSAP-port van React Bits' CountUp: telt op zodra het getal in beeld komt. */
type Props = { to: number; from?: number; duration?: number; prefix?: string; suffix?: string; className?: string };

const fmt = new Intl.NumberFormat("nl-NL");

export default function CountUp({ to, from = 0, duration = 2, prefix = "", suffix = "", className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const obj = { v: from };
      el.textContent = prefix + fmt.format(from) + suffix;
      gsap.to(obj, {
        v: to,
        duration,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = prefix + fmt.format(Math.round(obj.v)) + suffix;
        },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix + fmt.format(to) + suffix}
    </span>
  );
}
