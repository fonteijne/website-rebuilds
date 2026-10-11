"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Sentence with image "pills" that grow open as you scroll past it. */
export default function Statement() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pill", {
          width: 0,
          marginInline: 0,
          ease: "none",
          stagger: 0.15,
          scrollTrigger: { trigger: ref.current, start: "top 85%", end: "center 45%", scrub: 0.6 },
        });
      });
    },
    { scope: ref }
  );

  const Pill = ({ src }: { src: string }) => (
    <span
      aria-hidden
      className="pill mx-[0.12em] inline-block h-[0.78em] w-[1.9em] translate-y-[0.06em] overflow-hidden rounded-full bg-cover bg-center align-baseline"
      style={{ backgroundImage: `url(${src})` }}
    />
  );

  return (
    <section ref={ref} aria-label="Wat we doen" className="px-4 pb-24 sm:px-6 md:px-10 md:pb-40">
      <h2 className="font-display font-condensed text-[clamp(2.6rem,10.5vw,9rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
        We maken van je <Pill src="/images/work/bakje-geluk.webp" /> bedrijf een{" "}
        <span className="text-pink">merk</span>, met sterke
        <Pill src="/images/work/dgv-guitars.webp" /> en herkenbare <span className="italic text-pink">visuele</span>{" "}
        <Pill src="/images/work/easytoys.webp" />
        uitingen.
      </h2>
    </section>
  );
}
