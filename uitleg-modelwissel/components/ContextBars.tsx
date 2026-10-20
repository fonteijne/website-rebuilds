"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";

type Seg = { label: string; w: number; cls: string };

// Schematisch, geen meting: de verhouding laat zien wat er in de context blijft zitten.
const zelfde: Seg[] = [
  { label: "Systeem + project", w: 12, cls: "bg-ink2/40" },
  { label: "Research", w: 30, cls: "bg-plan/45" },
  { label: "Afgeslagen opties", w: 18, cls: "bg-plan/25" },
  { label: "Plan", w: 10, cls: "bg-plan" },
  { label: "Uitvoering", w: 30, cls: "bg-build" },
];
const nieuw: Seg[] = [
  { label: "Systeem + project", w: 12, cls: "bg-ink2/40" },
  { label: "Plan", w: 10, cls: "bg-plan" },
  { label: "Uitvoering", w: 30, cls: "bg-build" },
];

function Bar({ title, segs }: { title: string; segs: Seg[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex h-12 overflow-hidden rounded-xl border border-line" role="img" aria-label={`${title}: ${segs.map((s) => s.label).join(", ")}`}>
        {segs.map((s) => (
          <div key={s.label} data-seg className={`${s.cls} h-full border-r border-bg/60 last:border-r-0`} style={{ width: `${s.w}%`, transformOrigin: "left" }} />
        ))}
      </div>
    </div>
  );
}

export default function ContextBars() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from("[data-seg]", { scaleX: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    },
    { scope: root },
  );

  const legend = [
    ["bg-ink2/40", "Systeem + project"],
    ["bg-plan/45", "Research"],
    ["bg-plan/25", "Afgeslagen opties"],
    ["bg-plan", "Plan"],
    ["bg-build", "Uitvoering"],
  ];

  return (
    <div ref={root} data-reveal className="card space-y-6 p-5 sm:p-6">
      <Bar title="Model wisselen in dezelfde sessie" segs={zelfde} />
      <Bar title="Nieuwe sessie met alleen het plan" segs={nieuw} />
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink2">
        {legend.map(([cls, label]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`${cls} size-3 rounded-sm`} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink2">Schematisch: de lengte van een balk is de hoeveelheid context die bij elke volgende beurt opnieuw meegestuurd wordt. De verhoudingen zijn illustratief, niet gemeten.</p>
    </div>
  );
}
