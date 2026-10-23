import ScrollReveal from "@/components/reactbits/ScrollReveal";

export default function Intro() {
  return (
    <section aria-label="Over Amaezin Design" className="px-4 py-24 sm:px-6 md:px-10 md:py-40">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">(01) — Amaezin Design</p>
      <ScrollReveal className="mt-6 max-w-6xl font-display text-[clamp(1.6rem,5.2vw,4rem)] font-semibold leading-[1.12] tracking-tight">
        Gespecialiseerd in grafisch ontwerp en alles wat daarbij komt kijken. Van een logo met compleet uitgedachte
        huisstijl, opvallend drukwerk en indoor- en outdoor signing tot bedrijfskleding, social media en websites. Jij
        hoeft nergens naar om te kijken — alleen naar het proces en het resultaat.
      </ScrollReveal>
    </section>
  );
}
