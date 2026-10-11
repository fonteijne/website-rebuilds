"use client";

import Image from "next/image";
import { useRef } from "react";
import Reveal from "@/components/Reveal";
import SplitHeading from "@/components/SplitHeading";
import { site } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";

export default function About() {
  const media = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          media.current,
          { clipPath: "inset(18% 12% 18% 12% round 24px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            ease: "none",
            scrollTrigger: { trigger: media.current, start: "top 90%", end: "top 30%", scrub: true },
          }
        );
        gsap.fromTo(
          ".about-img",
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 8,
            scale: 1.15,
            ease: "none",
            scrollTrigger: { trigger: media.current, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    },
    { scope: media }
  );

  return (
    <section aria-labelledby="about-title" className="px-4 py-24 sm:px-6 md:px-10 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div
            ref={media}
            className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-2 will-change-[clip-path]"
          >
            <div className="about-img absolute inset-0">
              <Image
                src="/images/mari-mae.webp"
                alt="Mari-Mae, oprichter van Amaezin Design"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <span className="absolute bottom-4 left-4 rounded-full bg-pink px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink">
              Founder &amp; ontwerper
            </span>
          </div>
        </div>

        <Reveal className="md:col-span-6 md:col-start-7 md:self-center">
          <p data-reveal className="font-mono text-xs uppercase tracking-[0.25em] text-pink">
            (04) — Wie zit erachter
          </p>
          <SplitHeading
            id="about-title"
            type="words"
            className="mt-4 font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight"
          >
            Hi, ik ben Mari-Mae. Aangenaam!
          </SplitHeading>
          <p data-reveal className="mt-8 text-lg leading-relaxed text-paper/85 md:text-xl">
            Een creatieve duizendpoot met een hoge dosis positiviteit en enthousiasme — that&apos;s me!
          </p>
          <p data-reveal className="mt-5 leading-relaxed text-paper/70">
            Kwaliteit en heldere communicatie zijn ‘the key’: alleen zo wordt een opdracht succesvol uitgevoerd en
            afgerond. Daar doen we het voor. Naast kwaliteit leveren is persoonlijk contact met mijn klanten net zo
            belangrijk. Ben jij tevreden? Dan kan mijn dag niet meer stuk.
          </p>
          <ul data-reveal className="mt-8 flex flex-wrap gap-2" role="list">
            {site.socials.map((s) => (
              <li key={s.link}>
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold transition-colors hover:border-pink hover:text-pink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
