"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { Case } from "@/lib/content";
import TLink from "@/components/TLink";

/**
 * Case-overzicht als grote lijst. Desktop: een zwevende preview volgt de cursor
 * en wisselt per regel van beeld. Mobiel: beeld + titel als kaart.
 */
export default function CaseIndex({ items }: { items: Case[] }) {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      if (!prefersReducedMotion()) {
        gsap.from(q("[data-row]"), {
          yPercent: 60,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 1,
          ease: "expo.out",
          delay: 0.3,
          clearProps: "transform,opacity,visibility",
        });
      }

      const el = preview.current;
      if (!el || !window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches || !contextSafe) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      const rTo = gsap.quickTo(el, "rotate", { duration: 0.8, ease: "power3" });
      let lastX = 0;

      const move = contextSafe((e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
        lastX = e.clientX;
      });
      const enter = contextSafe((index: number) => {
        gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" });
        el.querySelectorAll<HTMLElement>("[data-preview]").forEach((p, i) => {
          gsap.to(p, { clipPath: i === index ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", duration: 0.6, ease: "expo.out" });
        });
      });
      const leave = contextSafe(() => gsap.to(el, { autoAlpha: 0, scale: 0.85, duration: 0.4 }));

      const rows = q("[data-row]");
      const listeners = rows.map((row, i) => {
        const onEnter = () => enter(i);
        row.addEventListener("pointerenter", onEnter);
        return () => row.removeEventListener("pointerenter", onEnter);
      });
      const list = q("[data-list]")[0];
      list?.addEventListener("pointerleave", leave);
      window.addEventListener("pointermove", move, { passive: true });
      return () => {
        listeners.forEach((off) => off());
        list?.removeEventListener("pointerleave", leave);
        window.removeEventListener("pointermove", move);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <ul data-list className="border-t border-white/10">
        {items.map((c, i) => (
          <li key={c.slug} data-row className="border-b border-white/10">
            <TLink
              href={`/cases/${c.slug}`}
              data-cursor="Lees"
              className="group relative grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-4 py-6 md:grid-cols-[4rem_1fr_auto] md:py-9"
            >
              <div className="relative col-span-2 aspect-[16/10] overflow-hidden md:hidden">
                <Image src={c.image} alt="" fill sizes="100vw" placeholder="blur" className="object-cover" />
              </div>
              <span className="text-sm font-semibold tabular-nums text-paper/40">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="relative text-[clamp(1.6rem,5.2vw,4.4rem)] font-extrabold uppercase leading-[1] tracking-tight transition-transform duration-700 ease-out-expo md:group-hover:translate-x-6">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-pink">{c.title}</span>
              </h2>
              <span
                className={`col-span-2 justify-self-start rounded-full border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider md:col-span-1 md:justify-self-end ${
                  c.accent === "pink" ? "border-pink/50 text-pink" : "border-blue/50 text-blue"
                }`}
              >
                {c.tag}
              </span>
            </TLink>
          </li>
        ))}
      </ul>

      {/* Zwevende preview (desktop) */}
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden aspect-[4/3] w-[26vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-0 lg:block"
        style={{ visibility: "hidden" }}
      >
        {items.map((c, i) => (
          <div key={c.slug} data-preview className="absolute inset-0" style={{ clipPath: "inset(0% 0% 100% 0%)", zIndex: i }}>
            <Image src={c.image} alt="" fill sizes="420px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
