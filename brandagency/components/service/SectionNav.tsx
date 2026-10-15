"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useTransitionNavigate } from "@/components/providers/PageTransition";

/** Plakkende chip-navigatie langs de onderdelen van een dienst; markeert het actieve onderdeel. */
export default function SectionNav({ items, accent }: { items: { id: string; title: string }[]; accent: "pink" | "blue" }) {
  const [active, setActive] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const navigate = useTransitionNavigate();

  useGSAP(
    () => {
      items.forEach((it) => {
        const el = document.getElementById(it.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(it.id);
            const chip = bar.current?.querySelector<HTMLElement>(`[data-chip="${it.id}"]`);
            chip?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
          },
        });
      });
    },
    { scope: bar, dependencies: [items] },
  );

  return (
    <div className="sticky top-0 z-30 border-y border-white/10 bg-black/80 backdrop-blur-md">
      <div ref={bar} className="container-x flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]" data-lenis-prevent>
        {items.map((it, i) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            data-chip={it.id}
            onClick={(e) => {
              e.preventDefault();
              navigate?.(`#${it.id}`);
            }}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
              active === it.id
                ? accent === "pink"
                  ? "border-pink bg-pink text-white"
                  : "border-blue bg-blue text-white"
                : "border-white/15 text-paper/70 hover:border-white/40 hover:text-paper"
            }`}
          >
            <span className="mr-2 opacity-60">0{i + 1}</span>
            {it.title}
          </a>
        ))}
      </div>
    </div>
  );
}
