"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitReveal from "@/components/fx/SplitReveal";
import TLink from "@/components/TLink";
import type { Accent } from "@/lib/content";

/** Case-kop: beeld opent vanuit een smalle strook naar volle breedte terwijl je scrolt. */
export default function CaseHero({ title, tag, accent, image }: { title: string; tag: string; accent: Accent; image: StaticImageData }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      if (prefersReducedMotion()) return;
      const frame = q("[data-frame]")[0];
      gsap.fromTo(
        frame,
        { clipPath: "inset(18% 12% 0% 12% round 4px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: { trigger: frame, start: "top 85%", end: "top 15%", scrub: true },
        },
      );
      gsap.fromTo(
        q("[data-frame-img]"),
        { scale: 1.25 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-black pt-32 md:pt-44">
      <div className="container-x">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]" data-reveal>
          <TLink href="/cases" className="text-paper/60 hover:text-paper">
            Cases
          </TLink>
          <span className="text-paper/30">/</span>
          <span className={accent === "pink" ? "text-pink" : "text-blue"}>{tag}</span>
        </div>
        <SplitReveal
          as="h1"
          type="words"
          immediate
          delay={0.3}
          className="mt-6 max-w-6xl text-[clamp(2.6rem,9vw,8rem)] font-black uppercase leading-[0.9] tracking-tight"
        >
          {title}
        </SplitReveal>
      </div>
      <div data-frame className="relative mt-12 h-[60svh] overflow-hidden md:mt-16 md:h-[90svh]">
        <div data-frame-img className="absolute inset-0 will-change-transform">
          <Image src={image} alt={title} fill preload sizes="100vw" placeholder="blur" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
