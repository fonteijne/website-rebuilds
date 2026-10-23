"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { img } from "@/lib/images";
import Logo from "@/components/Logo";

/**
 * Hero: de bekende drukke-oversteekplaats-foto met het logo. Bij laden schuift
 * BRAND uit een masker omhoog en spreiden de AGENCY-letters zich uit; bij
 * scrollen zoomt de foto in en zakt het logo weg.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const brand = q("[data-logo-part=brand]");
      const agency = q("[data-logo-part=agency]");
      if (prefersReducedMotion()) {
        gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
        return;
      }

      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      const intro = gsap.timeline({ delay: 0.15 });
      intro
        .fromTo(q("[data-hero-img]"), { scale: 1.35 }, { scale: 1.08, duration: 2.4, ease: "expo.out" }, 0)
        .fromTo(q("[data-hero-shade]"), { opacity: 1 }, { opacity: 0.55, duration: 1.8, ease: "power2.out" }, 0)
        .fromTo(
          q("[data-logo=brand]"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.out" },
          0.25,
        )
        .from(brand, { yPercent: 40, duration: 1.3, ease: "expo.out", stagger: 0.06 }, 0.25)
        .from(
          agency,
          { opacity: 0, x: (i) => (i - 2.5) * -30, duration: 1.4, ease: "expo.out", stagger: { each: 0.05, from: "center" } },
          0.7,
        )
        .from(q("[data-hero-meta]"), { autoAlpha: 0, y: 20, duration: 0.9, stagger: 0.1 }, 1.0);

      // Scroll: foto zoomt verder, logo krimpt en vervaagt.
      const out = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      out
        .to(q("[data-hero-media]"), { yPercent: 25, ease: "none" }, 0)
        .to(q("[data-hero-logo]"), { yPercent: -40, scale: 0.8, autoAlpha: 0, ease: "none" }, 0)
        .to(q("[data-hero-meta]"), { autoAlpha: 0, ease: "none", duration: 0.4 }, 0);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-black" aria-label="Brand Agency">
      <div data-hero-media className="absolute inset-0 will-change-transform">
        <div data-hero-img className="absolute inset-0 will-change-transform">
          <Image
            src={img.heroCrowd}
            alt="Drukke voetgangersoversteekplaats van bovenaf"
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            quality={60}
            placeholder="blur"
            className="object-cover grayscale"
          />
        </div>
        <div data-hero-shade className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <h1 data-hero-logo className="w-[min(82vw,640px)] text-white" data-reveal>
          <Logo className="h-auto w-full overflow-visible" title="Brand Agency" />
        </h1>
        <p data-hero-meta className="spaced mt-8 whitespace-nowrap text-center text-[0.55rem] !tracking-[0.3em] text-paper/80 sm:text-xs sm:!tracking-[0.45em]" data-reveal>
          Brand <span className="text-pink">·</span> Shopper <span className="text-blue">·</span> Retail Activation
        </p>
      </div>

      <div data-hero-meta className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 md:bottom-10" data-reveal>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-paper/60">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-0 block bg-pink [animation:scroll-cue_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
        </span>
      </div>
    </section>
  );
}
