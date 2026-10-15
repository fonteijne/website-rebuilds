"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/lib/content";
import { Flip, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const filters = [
  { id: "all", label: "Alles", match: () => true },
  { id: "logo", label: "Logo’s", match: (p: Project) => p.tags.some((t) => /logo/i.test(t)) },
  { id: "branding", label: "Branding", match: (p: Project) => p.tags.some((t) => /branding|kleding|visitekaart/i.test(t)) },
  {
    id: "print",
    label: "Drukwerk",
    match: (p: Project) => p.tags.some((t) => /brochure|poster|flyer|sticker|verpakking/i.test(t)),
  },
  { id: "digital", label: "Social & schermen", match: (p: Project) => p.tags.some((t) => /social|tv/i.test(t)) },
] as const;

type FilterId = (typeof filters)[number]["id"];

export default function PortfolioGrid() {
  const root = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [active, setActive] = useState<FilterId>("all");
  const [open, setOpen] = useState<Project | null>(null);
  const lenis = useLenis();

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(".pf-card", { autoAlpha: 1 }));
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".pf-card", { autoAlpha: 0, y: 60 });
        ScrollTrigger.batch(".pf-card", {
          start: "top 92%",
          once: true,
          onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1, ease: "expo.out", overwrite: true }),
        });
      });
    },
    { scope: root }
  );

  const choose = contextSafe((id: FilterId) => {
    if (id === active) return;
    // Record positions before React re-renders, animate in the layout effect below.
    flipState.current = Flip.getState(".pf-card", { props: "opacity" });
    setActive(id);
  });

  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.7,
        ease: "expo.inOut",
        absolute: true,
        scale: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.8, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
      flipState.current = null;
    },
    { scope: root, dependencies: [active] }
  );

  // Lightbox: lock smooth scroll, close on Escape.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  // Deep link from the homepage (/portfolio#slug).
  useEffect(() => {
    const slug = window.location.hash.slice(1);
    const p = projects.find((x) => x.slug === slug);
    if (p) setOpen(p);
  }, []);

  const current = filters.find((f) => f.id === active)!;

  return (
    <div ref={root} className="px-4 pb-24 sm:px-6 md:px-10 md:pb-36">
      <div role="toolbar" aria-label="Filter projecten" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => choose(f.id)}
            className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors ${
              active === f.id ? "border-pink bg-pink text-ink" : "border-white/20 hover:border-pink hover:text-pink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul role="list" className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {projects.map((p) => {
          const visible = current.match(p);
          return (
            <li
              key={p.slug}
              id={p.slug}
              data-flip-id={p.slug}
              className={`pf-card ${visible ? "" : "hidden"}`}
            >
              <button
                type="button"
                onClick={() => setOpen(p)}
                className="group block w-full text-left"
                aria-label={`Bekijk ${p.name}`}
              >
                <div className="relative aspect-[3/4.4] overflow-hidden rounded-2xl" style={{ backgroundColor: p.tint }}>
                  <Image
                    src={p.image}
                    alt={`${p.name} — ${p.tags.join(", ")}`}
                    fill
                    sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    +
                  </span>
                </div>
                <h2 className="mt-3 font-display text-lg font-bold leading-tight md:text-xl">{p.name}</h2>
                <p className="mt-1 text-xs text-paper/55 md:text-sm">{p.tags.join(" · ")}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {open && <Lightbox project={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Lightbox({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".lb-backdrop", { autoAlpha: 0, duration: 0.4 });
      gsap.from(".lb-panel", { yPercent: 8, autoAlpha: 0, duration: 0.7, ease: "expo.out" });
      ref.current?.querySelector<HTMLButtonElement>(".lb-close")?.focus();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={project.name} className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="lb-backdrop absolute inset-0 bg-ink/90 backdrop-blur-md" onClick={onClose} />
      <div className="lb-panel relative flex max-h-[92svh] w-full max-w-5xl flex-col gap-5 md:flex-row md:items-end">
        <div className="relative mx-auto aspect-[1233/2560] h-[70svh] max-w-full overflow-hidden rounded-2xl md:h-[86svh]" style={{ backgroundColor: project.tint }}>
          <Image src={project.image} alt={project.name} fill sizes="50vw" className="object-cover" />
        </div>
        <div className="md:flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-pink">Project</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold md:text-5xl">{project.name}</h2>
          <ul role="list" className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li key={t} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lb-close absolute -top-1 right-0 grid size-12 place-items-center rounded-full bg-paper text-2xl text-ink md:-right-2 md:-top-2"
          aria-label="Sluiten"
        >
          ×
        </button>
      </div>
    </div>
  );
}
