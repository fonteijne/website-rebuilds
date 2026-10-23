"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import SplitHeading from "@/components/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

// WebGL background is client-only and not needed for first paint.
const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-meta", { autoAlpha: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Intro: background blooms in, meta rows follow the headline.
        gsap.from(".hero-bg", { scale: 1.25, autoAlpha: 0, duration: 2, ease: "expo.out" });
        gsap.fromTo(
          ".hero-meta",
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1, delay: 0.6, ease: "expo.out" }
        );

        // Scroll-out: headline lifts and the gradient sinks away (scrubbed, one timeline on the section).
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } })
          .to(".hero-content", { yPercent: -18, autoAlpha: 0.15, ease: "none" }, 0)
          .to(".hero-bg", { scale: 1.15, yPercent: 12, ease: "none" }, 0);
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} aria-label="Intro" className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <div className="hero-bg absolute inset-0 will-change-transform" aria-hidden>
        <Grainient
          color1="#FD62C2"
          color2="#6a2bd9"
          color3="#0b0b0c"
          timeSpeed={0.2}
          warpStrength={1.1}
          warpAmplitude={45}
          grainAmount={0.06}
          contrast={1.35}
          zoom={0.85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink" />
      </div>

      <div className="hero-content relative z-10 mt-auto px-4 pb-8 pt-28 sm:px-6 md:px-10 md:pb-12">
        <p className="hero-meta font-mono text-[11px] uppercase tracking-[0.25em] text-paper/80 md:text-xs">
          Ontwerpstudio — Wijk bij Duurstede
        </p>

        <SplitHeading
          as="h1"
          trigger="load"
          type="chars"
          delay={0.2}
          className="mt-4 font-display font-condensed text-[clamp(4.5rem,25vw,19rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.02em]"
        >
          Do it
          <br />
          different<span className="text-pink">.</span>
        </SplitHeading>

        <div className="mt-8 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between">
          <p className="hero-meta max-w-md text-base leading-relaxed text-paper/85 md:text-lg">
            Grafisch ontwerp, huisstijl en DTP met een hoge dosis positiviteit. Van logo tot gevelreclame — wij
            ontzorgen van A tot Z.
          </p>
          <div className="hero-meta flex flex-wrap gap-3">
            <Link
              href="/portfolio"
              className="inline-flex min-h-12 items-center rounded-full bg-paper px-6 text-sm font-semibold text-ink transition-colors hover:bg-pink"
            >
              Bekijk ons werk
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center rounded-full border border-paper/40 px-6 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-pink hover:text-pink"
            >
              Daag ons uit
            </Link>
          </div>
        </div>
      </div>

      <RotatingBadge />
    </section>
  );
}

function RotatingBadge() {
  return (
    <div
      aria-hidden
      className="hero-meta absolute right-4 top-24 z-10 size-24 sm:right-6 md:right-10 md:top-28 md:size-36"
    >
      <svg viewBox="0 0 200 200" className="size-full animate-[spin_18s_linear_infinite]">
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-paper font-mono text-[15px] uppercase">
          <textPath href="#badge-circle" textLength="488" lengthAdjust="spacing">Isn&apos;t it amaezin? ✦ Do it different ✦</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto block size-3 rounded-full bg-pink md:size-4" />
    </div>
  );
}
