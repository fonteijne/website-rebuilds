"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { homeCases } from "@/lib/content";
import Button, { ArrowLink } from "@/components/ui/Button";
import TLink from "@/components/TLink";

/**
 * Cases op de homepage. Desktop: tekst scrollt links, rechts een vastgezet
 * beeld dat per case met een clip-path-wipe wisselt + teller (01/03), zoals
 * op de originele site. Mobiel: beeld boven elke case.
 */
export default function CaseShowcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const blocks = q("[data-case-block]");
        const frames = q("[data-case-frame]");
        const counter = q("[data-case-counter]")[0];
        frames.forEach((frame, i) => {
          if (i === 0) return;
          const img = frame.querySelector("[data-case-img]");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: blocks[i], start: "top 85%", end: "top 35%", scrub: 0.5 },
          });
          tl.fromTo(frame, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }).fromTo(
            img,
            { scale: 1.25, yPercent: 8 },
            { scale: 1, yPercent: 0, ease: "none" },
            0,
          );
        });
        blocks.forEach((block, i) => {
          ScrollTrigger.create({
            trigger: block,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive) gsap.to(counter, { yPercent: -100 * i, duration: 0.7, ease: "expo.out" });
              block.toggleAttribute("data-active", self.isActive);
            },
          });
        });
      });

      // Tekstblokken komen binnen.
      q("[data-case-block]").forEach((block) => {
        gsap.from(block.querySelectorAll("[data-case-item]"), {
          y: 50,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1,
          clearProps: "opacity,visibility,transform",
          scrollTrigger: { trigger: block, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-smoke" aria-labelledby="cases-title">
      <div className="container-x pb-10 pt-24 md:pt-32">
        <p className="kicker text-blue" data-reveal>
          Brand Agency cases
        </p>
        <h2 id="cases-title" className="mt-4 text-[clamp(2.4rem,8vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-tight" data-reveal>
          Wat we <span className="text-blue">deden</span>
        </h2>
      </div>

      <div className="lg:grid lg:grid-cols-2">
        <div>
          {homeCases.map((c, i) => (
            <article
              key={c.slug}
              data-case-block
              className="group/case flex flex-col justify-center pb-20 lg:min-h-screen lg:py-24"
              aria-labelledby={`case-${c.slug}`}
            >
              <TLink href={`/cases/${c.slug}`} className="relative mb-10 block aspect-[4/3] overflow-hidden lg:hidden" tabIndex={-1} aria-hidden="true">
                <Image src={c.image} alt="" fill sizes="100vw" placeholder="blur" className="object-cover" />
              </TLink>
              <div className="container-x lg:max-w-[40rem] lg:pl-16 lg:pr-12 xl:pl-24">
                <p
                  data-case-item
                  className={`kicker ${i % 2 === 0 ? "text-pink" : "text-blue"} lg:opacity-60 lg:transition-opacity lg:duration-500 lg:group-data-[active]/case:opacity-100`}
                >
                  Brand Agency case
                </p>
                <h3 id={`case-${c.slug}`} data-case-item className="mt-3 text-[clamp(1.8rem,4.4vw,3rem)] font-light uppercase leading-tight">
                  {c.home!.title}
                </h3>
                <div className="prose-ba mt-8 text-[0.95rem] leading-[1.85] text-paper/70" data-case-item>
                  {c.home!.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                <div className="mt-8" data-case-item>
                  <ArrowLink href={`/cases/${c.slug}`} accent={i % 2 === 0 ? "pink" : "blue"}>
                    Lees de case
                  </ArrowLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Vastgezet beeld (desktop) */}
        <div className="relative hidden lg:block">
          <div className="sticky top-0 h-screen overflow-hidden">
            {homeCases.map((c, i) => (
              <TLink
                key={c.slug}
                href={`/cases/${c.slug}`}
                data-case-frame
                data-cursor="Bekijk"
                className="absolute inset-0 block overflow-hidden"
                style={i > 0 ? { clipPath: "inset(100% 0% 0% 0%)" } : undefined}
                aria-label={`Bekijk case ${c.title}`}
              >
                <div data-case-img className="absolute inset-0 will-change-transform">
                  <Image src={c.image} alt={c.title} fill sizes="50vw" placeholder="blur" className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </TLink>
            ))}
            <div className="pointer-events-none absolute bottom-8 left-8 flex items-center gap-1 rounded-sm bg-black/60 px-4 py-2 text-3xl font-light tabular-nums backdrop-blur-sm">
              <span className="flex h-[1.15em] overflow-hidden">
                <span data-case-counter className="flex flex-col">
                  {homeCases.map((_, i) => (
                    <span key={i} className="block h-[1.15em] leading-[1.15em]">
                      0{i + 1}
                    </span>
                  ))}
                </span>
              </span>
              <span className="text-paper/60">/0{homeCases.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x flex justify-center pb-24 pt-4 md:pb-32">
        <Button href="/cases" variant="blue" size="lg">
          Bekijk alle cases
        </Button>
      </div>
    </section>
  );
}
