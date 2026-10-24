import PromptForm from "@/components/funnel/PromptForm";
import { hero } from "@/lib/content";
import HeroGlow from "./HeroGlow";

/**
 * Hero = belofte + promptveld (vision.md: het invoerveld is het belangrijkste element).
 * Intro-animatie in CSS (globals.css: .hero-line/.hero-fade) zodat de LCP-kop niet op JS wacht.
 */
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="grain relative isolate overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-36"
    >
      <HeroGlow />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-[0.35] [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          className="hero-fade hidden font-mono text-xs uppercase tracking-[0.22em] text-muted sm:block"
          style={{ ["--i" as string]: 0 }}
        >
          <span className="text-signal">●</span> {hero.eyebrow}
        </p>

        <h1 id="hero-title" className="mt-2 text-display font-semibold sm:mt-5">
          {hero.title.map((line, i) => (
            <span key={line} className="hero-line">
              <span style={{ ["--i" as string]: i }}>
                {line}
                {i === hero.title.length - 1 && <span aria-hidden="true" className="caret" />}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="hero-fade mt-4 flex flex-wrap gap-x-3 gap-y-0.5 text-base font-medium text-paper/90 sm:mt-6 sm:gap-x-4 sm:text-2xl"
          style={{ ["--i" as string]: 1 }}
        >
          {hero.kinds.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </p>

        <div className="mt-6 grid gap-6 sm:mt-10 sm:gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="hero-fade lg:col-span-4 lg:pt-4" style={{ ["--i" as string]: 2 }}>
            <p className="max-w-md text-base leading-relaxed text-paper/85 sm:text-xl">{hero.lead}</p>
            <ul className="mt-6 hidden space-y-2 lg:block">
              {hero.nots.map((n) => (
                <li key={n} className="flex items-center gap-3 text-muted">
                  <span aria-hidden="true" className="font-mono text-signal">
                    ✕
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="hero-fade lg:col-span-8" style={{ ["--i" as string]: 3 }}>
            <PromptForm />
          </div>
          <ul className="space-y-2 lg:hidden">
            {hero.nots.map((n) => (
              <li key={n} className="flex items-center gap-3 text-muted">
                <span aria-hidden="true" className="font-mono text-signal">
                  ✕
                </span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
