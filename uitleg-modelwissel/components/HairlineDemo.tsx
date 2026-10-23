"use client";

import { useState, type CSSProperties } from "react";
import { Lockers, Loupe, Rebuild, Sieve, Terminal } from "@lucasmarkes/hairline/react";

const figures = { Terminal, Rebuild, Lockers, Loupe, Sieve };

/** Interactieve Hairline-figuur (lucasmarkes/hairline) als beeld bij een stukje uitleg. */
export default function HairlineDemo({ figure, label, hint }: { figure: keyof typeof figures; label: string; hint: string }) {
  const Figure = figures[figure];
  const [caption, setCaption] = useState("");

  return (
    <figure data-reveal className="card overflow-hidden p-3" style={{ "--hairline-plate": "var(--card)" } as CSSProperties}>
      <Figure play intensity={0.6} label={label} onRead={setCaption} className="w-full" />
      <figcaption className="flex items-center justify-between gap-3 px-2 pt-3 text-xs text-ink2">
        <span>{hint}</span>
        <span aria-hidden className="font-mono tabular-nums">{caption}</span>
      </figcaption>
    </figure>
  );
}
