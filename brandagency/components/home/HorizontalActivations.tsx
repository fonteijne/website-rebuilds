"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { services } from "@/lib/content";
import { ArrowLink } from "@/components/ui/Button";

/**
 * De horizontale scroll van de originele homepage, opnieuw opgebouwd:
 * de sectie wordt vastgezet en verticaal scrollen schuift de panelen opzij.
 * Binnen elk paneel parallaxen foto en tekst via containerAnimation.
 * Zonder animatie-voorkeur valt hij terug op native horizontaal swipen.
 */
export default function HorizontalActivations() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const el = track.current;
      if (!section || !el) return;
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      if (prefersReducedMotion()) {
        section.dataset.native = "";
        return;
      }

      const distance = () => el.scrollWidth - window.innerWidth;
      const scroller = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            gsap.set(q("[data-progress]"), { scaleX: self.progress });
          },
        },
      });

      // Panelen: foto parallax + tekst die binnenkomt.
      q("[data-panel]").forEach((panel, i) => {
        const media = panel.querySelector("[data-media]");
        const word = panel.querySelector("[data-word]");
        const items = panel.querySelectorAll("[data-item]");
        if (media) {
          gsap.fromTo(
            media,
            { xPercent: -18 },
            {
              xPercent: 18,
              ease: "none",
              scrollTrigger: { trigger: panel, containerAnimation: scroller, start: "left right", end: "right left", scrub: true },
            },
          );
        }
        if (i === 0) return;
        if (word) {
          gsap.from(word, {
            xPercent: 30,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: scroller, start: "left 95%", end: "left 35%", scrub: true },
          });
        }
        if (items.length) {
          gsap.from(items, {
            x: 120,
            opacity: 0,
            stagger: 0.15,
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: scroller, start: "left 85%", end: "left 25%", scrub: true },
          });
        }
      });

      // Tellertje 01/03 dat meeloopt.
      const counter = q("[data-counter]")[0] as HTMLElement | undefined;
      q("[data-panel]").forEach((panel, i) => {
        if (i === 0) return;
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: scroller,
          start: "left 50%",
          end: "right 50%",
          onToggle: (self) => {
            if (self.isActive && counter) gsap.to(counter, { yPercent: -100 * (i - 1), duration: 0.6, ease: "expo.out" });
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="activations-title"
      className="group/h relative h-[100svh] overflow-hidden bg-black data-[native]:overflow-x-auto data-[native]:[scroll-snap-type:x_mandatory]"
    >
      <div ref={track} className="flex h-full w-max will-change-transform">
        {/* Intro-paneel */}
        <div data-panel className="relative flex h-full w-[100vw] shrink-0 items-center md:w-[70vw] lg:w-[55vw] [scroll-snap-align:start]">
          <div className="container-x">
            <p className="kicker text-pink" data-reveal>
              Wat we doen
            </p>
            <h2 id="activations-title" className="mt-6 font-black uppercase leading-[0.85] tracking-tight" data-reveal>
              <span className="block text-[clamp(3rem,13vw,8.5rem)]">Brand</span>
              <span className="block text-[clamp(3rem,13vw,8.5rem)] text-pink">Agency</span>
              <span className="spaced mt-5 block text-[clamp(0.85rem,2.4vw,1.4rem)] font-light text-paper/80">
                Activation
              </span>
            </h2>
            <p className="mt-10 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-paper/50">
              <span className="block h-px w-12 bg-paper/40" />
              Scroll om te ontdekken
            </p>
          </div>
        </div>

        {services.map((s, i) => (
          <article
            key={s.slug}
            data-panel
            className="relative h-full w-[100vw] shrink-0 overflow-hidden [scroll-snap-align:start]"
            aria-labelledby={`panel-${s.slug}`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div data-media className="absolute -inset-x-[20%] inset-y-0 will-change-transform">
                <Image
                  src={s.homeImage}
                  alt=""
                  fill
                  sizes="140vw"
                  quality={60}
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/65" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/30" />
            </div>
            {i > 0 && <div className="absolute inset-y-0 left-0 w-px bg-white/10" aria-hidden="true" />}

            <div className="container-x relative flex h-full flex-col justify-end pb-28 pt-28 md:justify-center md:pb-0">
              <div className="max-w-2xl">
                <h3 id={`panel-${s.slug}`} className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <span
                    data-word
                    className={`block text-[clamp(3rem,13.5vw,9rem)] font-black uppercase leading-[0.85] tracking-tight ${
                      s.accent === "pink" ? "text-pink" : "text-blue"
                    }`}
                  >
                    {s.word}
                  </span>
                  <span data-item className="spaced block text-[clamp(0.9rem,2.6vw,1.6rem)] text-white">
                    Activation
                  </span>
                </h3>
                <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-paper/80 md:mt-8 md:text-lg">
                  <p data-item>{s.summary[0]}</p>
                  <p data-item className="hidden md:block">
                    {s.summary[1]}
                  </p>
                </div>
                <div data-item className="mt-8">
                  <ArrowLink href={`/${s.slug}`} accent={s.accent}>
                    Meer informatie
                  </ArrowLink>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Voortgang + teller */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 group-data-[native]/h:hidden">
        <div className="container-x flex items-center gap-5 pb-6 md:pb-10">
          <span className="flex h-[1.1em] overflow-hidden text-sm font-semibold tabular-nums text-paper">
            <span data-counter className="flex flex-col">
              {services.map((_, i) => (
                <span key={i} className="block h-[1.1em] leading-[1.1em]">
                  0{i + 1}
                </span>
              ))}
            </span>
          </span>
          <span className="relative h-px flex-1 bg-white/15">
            <span data-progress className="absolute inset-0 origin-left scale-x-0 bg-pink" />
          </span>
          <span className="text-sm font-semibold tabular-nums text-paper/50">0{services.length}</span>
        </div>
      </div>
    </section>
  );
}
