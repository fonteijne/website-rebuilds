"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import SplitHeading from "@/components/SplitHeading";
import { projects } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";

const featured = projects.slice(0, 8);

/**
 * Mobile: native swipeable scroll-snap row (touch stays native, no scroll-jacking).
 * md+: section pins and vertical scroll drives the row horizontally (containerAnimation),
 * with per-card parallax tied to the horizontal movement.
 */
export default function WorkShowcase() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const track = section.current!.querySelector<HTMLElement>(".work-track")!;
        const distance = () => track.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none", // required for containerAnimation
          scrollTrigger: {
            trigger: ".work-pin",
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.to(".work-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: ".work-pin", start: "top top", end: () => `+=${distance()}`, scrub: true },
        });

        gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
          gsap.fromTo(
            card.querySelector(".work-img"),
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: "left right", end: "right left", scrub: true },
            }
          );
        });
      });
    },
    { scope: section }
  );

  return (
    <section ref={section} aria-labelledby="work-title" className="bg-paper text-ink">
      <div className="work-pin flex min-h-[100svh] flex-col justify-center overflow-hidden py-20 md:py-0">
        <div className="flex items-end justify-between gap-6 px-4 sm:px-6 md:px-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink-deep">(03) — Portfolio</p>
            <SplitHeading
              id="work-title"
              className="mt-4 font-display font-condensed text-[clamp(2.75rem,10vw,8rem)] font-extrabold uppercase leading-[0.85] tracking-tight"
            >
              Isn&apos;t it amaezin?
            </SplitHeading>
          </div>
          <Link
            href="/portfolio"
            className="hidden min-h-12 shrink-0 items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-pink hover:text-ink md:inline-flex"
          >
            Alle projecten
          </Link>
        </div>

        <ul
          role="list"
          className="work-track mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 md:mt-14 md:snap-none md:gap-6 md:overflow-visible md:px-10 md:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {featured.map((p, i) => (
            <li
              key={p.slug}
              className="work-card group relative w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-[clamp(260px,24vw,380px)]"
            >
              <Link href={`/portfolio#${p.slug}`} className="block">
                <div
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl md:aspect-[3/4.6]"
                  style={{ backgroundColor: p.tint }}
                >
                  <div className="work-img absolute inset-y-0 -left-[10%] w-[120%]">
                    <Image
                      src={p.image}
                      alt={`${p.name} — ${p.tags.join(", ")}`}
                      fill
                      sizes="(min-width: 768px) 26vw, 72vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      priority={i < 2}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-bold md:text-2xl">{p.name}</h3>
                  <span className="font-mono text-xs text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-1 text-sm text-ink/60">{p.tags.join(" · ")}</p>
              </Link>
            </li>
          ))}
          <li className="flex w-[60vw] shrink-0 snap-start items-center justify-center sm:w-[36vw] md:w-[clamp(240px,20vw,320px)]">
            <Link
              href="/portfolio"
              className="group grid aspect-square w-full place-items-center rounded-full border-2 border-ink text-center font-display text-2xl font-bold uppercase leading-tight transition-colors hover:bg-ink hover:text-paper md:text-3xl"
            >
              <span>
                Bekijk
                <br />
                alles <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </li>
        </ul>

        <div className="mx-4 mt-10 hidden h-px bg-ink/15 sm:mx-6 md:mx-10 md:block">
          <div className="work-progress h-full origin-left scale-x-0 bg-ink" />
        </div>
      </div>
    </section>
  );
}
