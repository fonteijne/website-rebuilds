"use client";

import { useRef } from "react";
import SplitHeading from "@/components/fx/SplitHeading";
import { demos } from "@/lib/content";
import { gsap, MOTION_OK, useGSAP, whenNear } from "@/lib/gsap";

type Kind = 0 | 1 | 2 | 3;

/**
 * Stap 1 van de funnel: laat zien wat één prompt oplevert.
 * Per kaart één tijdlijn (once): de prompt typt zich, de pijl tekent zich (DrawSVG), het resultaat valt op zijn plek.
 * Mobiel: native swipe-rij met scroll-snap in plaats van pinned scroll.
 */
export default function Demos() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) =>
        whenNear(root.current, ctx, () => {
          gsap.utils.toArray<HTMLElement>("[data-demo]", root.current).forEach((card) => {
            const typed = card.querySelector<HTMLElement>("[data-typed]")!;
            const text = typed.dataset.typed ?? "";
            const p = { n: 0 };
            typed.textContent = "";
            const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 80%", once: true } });
            tl.to(p, {
              n: text.length,
              duration: text.length * 0.035,
              ease: "none",
              onUpdate: () => (typed.textContent = text.slice(0, Math.round(p.n))),
            })
              .from(
                card.querySelector("[data-arrow] path"),
                { drawSVG: "0%", duration: 0.5, ease: "power2.inOut" },
                "+=0.1",
              )
              .from(
                card.querySelectorAll("[data-piece]"),
                { autoAlpha: 0, y: 12, scale: 0.96, duration: 0.5, stagger: 0.06 },
                "-=0.1",
              )
              .from(
                card.querySelectorAll("[data-result]"),
                { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 },
                "-=0.25",
              );
          });
        }),
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="demos" aria-labelledby="demos-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-signal">{demos.eyebrow}</p>
        <SplitHeading id="demos-title" className="mt-4 max-w-4xl text-title font-semibold">
          {demos.title}
        </SplitHeading>
        <p className="mt-5 max-w-2xl text-lg text-muted">{demos.lead}</p>
      </div>

      <ul
        className="swipe-row mt-12 flex gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-6 lg:overflow-visible"
        aria-label="Voorbeelden van prompt naar resultaat"
      >
        {demos.items.map((d, i) => (
          <li
            key={d.service}
            data-demo
            className="relative flex w-[86vw] max-w-[440px] shrink-0 flex-col rounded-[26px] border border-line bg-ink-2 p-5 sm:p-6 lg:w-auto lg:max-w-none"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-sm text-paper/90">{d.service}</h3>
              <span className="rounded-full border border-signal/50 px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-signal">
                {demos.badge}
              </span>
            </div>

            <p className="mt-5 rounded-2xl bg-ink-3 px-4 py-3.5 font-mono text-[0.95rem] leading-relaxed text-paper ring-1 ring-line">
              <span className="sr-only">Prompt: {d.prompt}</span>
              <span aria-hidden="true">
                <span className="text-signal">&gt; </span>“<span data-typed={d.prompt}>{d.prompt}</span>”
              </span>
            </p>

            <svg
              data-arrow
              aria-hidden="true"
              viewBox="0 0 24 48"
              className="mx-auto my-3 h-10 w-6 text-signal"
              fill="none"
            >
              <path
                d="M12 2v40m0 0-8-8m8 8 8-8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <DemoVisual kind={i as Kind} />

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Resultaat">
              {d.result.map((r) => (
                <li key={r} data-result className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium text-ink">
                  {r}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Abstracte mock-ups van het resultaat (decoratief, alleen divs). */
function DemoVisual({ kind }: { kind: Kind }) {
  const box = "relative h-44 overflow-hidden rounded-2xl border border-line bg-ink-3/60 sm:h-52";
  if (kind === 0)
    return (
      <div aria-hidden="true" className={box}>
        <div data-piece className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-2 rounded-full bg-paper/25" />
          ))}
          <span className="ml-3 h-2 w-28 rounded-full bg-paper/10" />
        </div>
        <div className="space-y-3 p-4">
          <div data-piece className="h-4 w-3/4 rounded bg-paper/80" />
          <div data-piece className="h-2.5 w-1/2 rounded bg-paper/25" />
          <div data-piece className="flex gap-2 pt-1">
            <span className="h-7 w-24 rounded-full bg-signal" />
            <span className="h-7 w-20 rounded-full border border-paper/25" />
          </div>
          <div data-piece className="grid grid-cols-3 gap-2 pt-2">
            {[0, 1, 2].map((c) => (
              <span key={c} className="h-10 rounded-lg bg-paper/10" />
            ))}
          </div>
        </div>
      </div>
    );
  if (kind === 1)
    return (
      <div aria-hidden="true" className={`${box} flex items-center justify-center gap-4 p-4`}>
        <div className="relative h-32 w-40">
          {[2, 1, 0].map((n) => (
            <div
              key={n}
              data-piece
              className="absolute inset-x-0 rounded-xl border border-line bg-ink-2 p-3"
              style={{ top: n * 14, left: n * 10, right: -n * 10, zIndex: 3 - n }}
            >
              <span className="block h-2 w-16 rounded bg-signal/80" />
              <span className="mt-2 block h-2 w-24 rounded bg-paper/30" />
              <span className="mt-1.5 block h-2 w-20 rounded bg-paper/15" />
            </div>
          ))}
        </div>
        <div data-piece className="flex size-24 shrink-0 flex-col gap-1.5 rounded-xl bg-paper p-2">
          <span className="flex-1 rounded-md bg-gradient-to-br from-signal to-ink/80" />
          <span className="h-1.5 w-3/4 rounded bg-ink/40" />
        </div>
      </div>
    );
  if (kind === 2)
    return (
      <div aria-hidden="true" className={`${box} flex items-center justify-center gap-3`}>
        {[0, 1].map((s) => (
          <div
            key={s}
            data-piece
            className="relative h-36 w-20 rounded-[18px] border border-paper/25 bg-ink-2 p-2 sm:h-40 sm:w-24"
          >
            <span className="mx-auto block h-1 w-6 rounded-full bg-paper/25" />
            <span className="mt-3 block h-8 rounded-md bg-paper/15" />
            <span className="mt-2 block h-1.5 w-3/4 rounded bg-paper/30" />
            <span className="mt-1 block h-1.5 w-1/2 rounded bg-paper/15" />
            <span className={`absolute inset-x-2 bottom-3 block h-5 rounded-full ${s ? "bg-paper/20" : "bg-signal"}`} />
            {s === 0 && <span className="absolute bottom-2 right-1 size-5 rounded-full border-2 border-paper/70" />}
          </div>
        ))}
        <span data-piece className="font-mono text-xl text-signal">
          ⇢
        </span>
      </div>
    );
  return (
    <div aria-hidden="true" className={`${box} flex items-center justify-between gap-1 px-3 sm:px-5`}>
      {["Formulier", "Workflow", "Mail"].map((n, i) => (
        <div key={n} className="contents">
          <div data-piece className="flex flex-col items-center gap-2">
            <span
              className={`grid size-14 place-items-center rounded-2xl border ${i === 1 ? "border-signal bg-signal/15" : "border-line bg-ink-2"}`}
            >
              <span className={`size-4 rounded ${i === 1 ? "rotate-45 bg-signal" : "bg-paper/50"}`} />
            </span>
            <span className="font-mono text-[0.68rem] text-muted">{n}</span>
          </div>
          {i < 2 && <span data-piece className="mb-6 h-px flex-1 bg-gradient-to-r from-paper/40 to-signal/70" />}
        </div>
      ))}
    </div>
  );
}
