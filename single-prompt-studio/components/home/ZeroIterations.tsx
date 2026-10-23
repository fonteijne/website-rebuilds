"use client";

import { useRef } from "react";
import Reveal from "@/components/fx/Reveal";
import SplitHeading from "@/components/fx/SplitHeading";
import { zero } from "@/lib/content";
import { gsap, MOTION_OK, useGSAP, whenNear } from "@/lib/gsap";

/**
 * "Nul iteraties" in één beeld: de bekende versiereeks wordt doorgestreept terwijl je scrollt,
 * de teller loopt van 4 naar 0. Eén gescrubde tijdlijn, alleen transform/opacity + één tekstnode.
 * Zonder animatie (SSR/reduced motion) staat de eindstand er: alles doorgestreept, 0.
 */
export default function ZeroIterations() {
  const root = useRef<HTMLElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) =>
        whenNear(root.current, ctx, () => {
          const rows = gsap.utils.toArray<HTMLElement>("[data-version]");
          const n = rows.length;
          const c = { v: n };
          const write = () => {
            if (count.current) count.current.textContent = String(Math.round(c.v));
          };
          write();
          gsap.set("[data-strike]", { scaleX: 0 });
          gsap.set("[data-name]", { opacity: 1 });
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: "[data-versions]", start: "top 78%", end: "bottom 38%", scrub: 0.6 },
          });
          rows.forEach((row, i) => {
            tl.to(row.querySelector("[data-strike]"), { scaleX: 1, duration: 1 }, i)
              .to(row.querySelector("[data-name]"), { opacity: 0.5, duration: 1 }, i)
              .to(c, { v: n - i - 1, duration: 1, onUpdate: write }, i);
          });
        }),
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="nul-iteraties"
      aria-labelledby="zero-title"
      className="relative border-y border-line bg-ink-2/60 py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-gt-blue">{zero.eyebrow}</p>
          <SplitHeading id="zero-title" className="mt-4 text-title font-semibold">
            {zero.title}
          </SplitHeading>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{zero.lead}</p>
        </div>

        <div data-versions className="rounded-[26px] border border-line bg-ink p-5 sm:p-7">
          <ul className="space-y-1" aria-label="Wat je bij ons niet krijgt: eindeloze versies">
            {zero.versions.map((v) => (
              <li
                key={v}
                data-version
                className="relative flex items-center gap-3 rounded-xl px-3 py-3 font-mono text-sm sm:text-base"
              >
                <span aria-hidden="true" className="text-muted">
                  ▤
                </span>
                <span data-name className="opacity-50">
                  <span className="sr-only">Niet nodig: </span>
                  {v}
                </span>
                <span
                  data-strike
                  aria-hidden="true"
                  className="absolute left-3 right-3 top-1/2 h-[2px] origin-left bg-signal"
                />
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-end gap-4 border-t border-line pt-6">
            <span
              ref={count}
              className="text-[clamp(5rem,4rem+8vw,9rem)] font-semibold leading-[0.8] tracking-tighter tabular-nums"
            >
              0
            </span>
            <span className="pb-2 text-lg font-medium leading-tight">{zero.counterLabel}</span>
          </div>
        </div>
      </div>

      <Reveal className="mx-auto mt-16 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {zero.rules.map((r) => (
          <div key={r.title} data-reveal className="rounded-2xl border border-line p-5">
            <h3 className="font-semibold">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{r.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
