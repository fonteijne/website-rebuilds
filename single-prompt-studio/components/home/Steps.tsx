"use client";

import { useRef } from "react";
import SplitHeading from "@/components/fx/SplitHeading";
import { steps } from "@/lib/content";
import { gsap, MOTION_OK, useGSAP, whenNear } from "@/lib/gsap";

/**
 * Werkwijze: een voortgangslijn die met de scroll meeloopt (scaleX op desktop, scaleY op mobiel)
 * en stappen die oplichten als de lijn ze bereikt. Eén gescrubde tijdlijn per breakpoint.
 */
export default function Steps() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: `(min-width: 1024px) and ${MOTION_OK}`, mobile: `(max-width: 1023px) and ${MOTION_OK}` },
        (ctx) =>
          whenNear(root.current, ctx, () => {
            const desktop = ctx.conditions?.desktop;
            const items = gsap.utils.toArray<HTMLElement>("[data-step-card]");
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: "[data-steps]",
                start: "top 75%",
                end: desktop ? "bottom 60%" : "bottom 65%",
                scrub: 0.5,
              },
            });
            tl.fromTo(
              "[data-progress]",
              desktop ? { scaleX: 0 } : { scaleY: 0 },
              desktop ? { scaleX: 1, duration: items.length } : { scaleY: 1, duration: items.length },
              0,
            );
            items.forEach((item, i) => {
              tl.from(item, { opacity: 0.25, duration: 0.6 }, i).from(
                item.querySelector("[data-dot]"),
                { scale: 0.4, duration: 0.4 },
                i,
              );
            });
          }),
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="werkwijze" aria-labelledby="steps-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-signal">{steps.eyebrow}</p>
        <SplitHeading id="steps-title" className="mt-4 text-title font-semibold">
          {steps.title}
        </SplitHeading>

        <div data-steps className="relative mt-14">
          {/* Lijn: verticaal op mobiel, horizontaal op desktop. */}
          <div
            aria-hidden="true"
            className="absolute bottom-4 left-[11px] top-4 w-px bg-line lg:inset-x-0 lg:bottom-auto lg:left-0 lg:top-[11px] lg:h-px lg:w-auto"
          >
            <div data-progress className="h-full w-full origin-top bg-signal lg:origin-left" />
          </div>
          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {steps.items.map((s) => (
              <li key={s.n} data-step-card className="relative pl-10 lg:pl-0 lg:pt-12">
                <span
                  data-dot
                  aria-hidden="true"
                  className="absolute left-0 top-0 grid size-[23px] place-items-center rounded-full border border-signal bg-ink"
                >
                  <span className="size-2 rounded-full bg-signal" />
                </span>
                <span className="font-mono text-sm text-muted">{s.n}</span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
