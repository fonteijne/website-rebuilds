import type { ReactNode } from "react";
import SplitReveal from "@/components/fx/SplitReveal";
import Reveal from "@/components/fx/Reveal";
import type { Accent } from "@/lib/content";

/**
 * Paginakop in het typografische motief van de originele site:
 * een zwaar woord in kleur + een gespatieerd lichter woord.
 */
export default function PageHero({
  word,
  spaced,
  accent = "pink",
  kicker,
  children,
  aside,
  size = "xl",
}: {
  word: string;
  spaced: string;
  accent?: Accent;
  kicker?: string;
  children?: ReactNode;
  aside?: ReactNode;
  /** "lg" voor langere woorden (bijv. "Werken bij"). */
  size?: "xl" | "lg";
}) {
  return (
    <section className="relative overflow-hidden bg-black pb-16 pt-32 md:pb-24 md:pt-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[25vw] -top-[25vw] size-[80vw] opacity-30"
        style={{
          background: `radial-gradient(closest-side, ${accent === "pink" ? "#ff0064" : "#1f7ffc"}, transparent)`,
        }}
      />
      <div className="container-x relative">
        {kicker && (
          <Reveal>
            <p className={`kicker ${accent === "pink" ? "text-pink" : "text-blue"}`}>{kicker}</p>
          </Reveal>
        )}
        <h1 className="mt-4 uppercase">
          <SplitReveal
            as="span"
            type="chars"
            immediate
            delay={0.35}
            className={`block ${size === "xl" ? "text-[clamp(3.4rem,17vw,14rem)]" : "text-[clamp(2.6rem,12.5vw,11rem)]"} font-black leading-[0.82] tracking-tight ${
              accent === "pink" ? "text-pink" : "text-blue"
            }`}
          >
            {word}
          </SplitReveal>
          <SplitReveal
            as="span"
            type="chars"
            immediate
            delay={0.75}
            stagger={0.04}
            className="spaced mt-4 block text-[clamp(1rem,3.6vw,2.6rem)] font-light text-paper md:mt-6"
          >
            {spaced}
          </SplitReveal>
        </h1>
        {(children || aside) && (
          <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12">
            {children && (
              <Reveal delay={0.9} className="lg:col-span-7">
                {children}
              </Reveal>
            )}
            {aside && <div className="lg:col-span-5">{aside}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
