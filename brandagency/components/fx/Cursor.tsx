"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Custom cursor (alleen muis/trackpad): een roze stip die meeloopt, groeit boven
 * links en een label toont boven elementen met [data-cursor="Label"].
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = dot.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const label = el.querySelector<HTMLElement>("[data-label]")!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    let state = "";

    const move = (e: PointerEvent) => {
      if (el.style.opacity !== "1") gsap.to(el, { opacity: 1, duration: 0.3 });
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as HTMLElement | null;
      const withLabel = t?.closest<HTMLElement>("[data-cursor]");
      const next = withLabel ? `label:${withLabel.dataset.cursor}` : t?.closest("a,button,[role=button],input,textarea,label") ? "link" : "";
      if (next === state) return;
      state = next;
      if (next.startsWith("label:")) {
        label.textContent = next.slice(6);
        gsap.to(el, { width: 96, height: 96, duration: 0.4, ease: "expo.out" });
        gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.3 });
      } else {
        gsap.to(label, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
        gsap.to(el, { width: next === "link" ? 44 : 12, height: next === "link" ? 44 : 12, duration: 0.4, ease: "expo.out" });
      }
    };
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.3 });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  });

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden size-3 items-center justify-center rounded-full bg-pink opacity-0 mix-blend-difference [@media(pointer:fine)]:flex"
      style={{ translate: "-50% -50%" }}
    >
      <span data-label className="invisible scale-50 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white" />
    </div>
  );
}
