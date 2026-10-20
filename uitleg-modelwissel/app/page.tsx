import Motion from "@/components/Motion";
import SplitText from "@/components/reactbits/SplitText";

const redenen = [
  {
    titel: "De context blijft hangen",
    tekst:
      "Binnen één sessie neemt een ander model alles mee: je research, de afwegingen en de opties die je hebt afgeslagen. Dat is ruis voor degene die alleen nog hoeft uit te voeren.",
  },
  {
    titel: "De cache is weg",
    tekst: "Wissel je van model, dan kan de prompt-cache niet meer gebruikt worden. Je betaalt de hele context opnieuw, zonder er iets voor terug te krijgen.",
  },
];

const stappen = [
  { kleur: "plan", label: "1 · Plannen", titel: "Zwaar model, eigen sessie", tekst: "Research, afwegen, opties afschieten. Hier mag het rommelig zijn." },
  { kleur: "plan", label: "2 · Overdragen", titel: "Een uitgewerkt implementatieplan", tekst: "Het resultaat van stap 1 in één document: wat, waar en in welke volgorde." },
  { kleur: "build", label: "3 · Uitvoeren", titel: "Nieuwe sessie, lichter model", tekst: "De ‘developer’ start schoon met alleen het plan en hoeft enkel nog uit te voeren." },
] as const;

const modellen = [
  { lijn: "Claude", plan: "Opus of Sonnet", bouw: "Sonnet of Haiku" },
  { lijn: "GPT", plan: "Sol", bouw: "Luna" },
];

export default function Page() {
  return (
    <Motion>
      <main className="mx-auto max-w-3xl px-5 pb-24">
        {/* Hero */}
        <header className="flex min-h-svh flex-col justify-center py-16">
          <p className="mb-4 text-sm font-semibold tracking-widest text-plan uppercase">Werken met AI-modellen</p>
          <SplitText
            tag="h1"
            text="Plan heavy, implement lightly."
            splitType="words"
            delay={90}
            textAlign="left"
            from={{ opacity: 0, y: 48 }}
            rootMargin="0px"
            className="font-display text-[clamp(2.75rem,13vw,6rem)] leading-[0.95] font-extrabold tracking-tight"
          />
          <p className="mt-6 max-w-xl text-lg text-ink2">
            Plan met een zwaar model. Laat een lichter model het plan uitvoeren, in een <em>nieuwe</em> sessie. Waarom dat beter is dan binnen één sessie van model wisselen.
          </p>
          <a href="#vraag" className="nudge mt-12 inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink2" style={{ animation: "nudge 1.8s ease-in-out infinite" }}>
            Lees verder <span aria-hidden>↓</span>
          </a>
        </header>

        {/* Vraag */}
        <section id="vraag" className="scroll-mt-8 py-12">
          <h2 data-reveal className="mb-5 text-sm font-semibold tracking-widest text-ink2 uppercase">De vraag</h2>
          <blockquote data-reveal className="card border-l-[6px] border-l-plan p-6 text-lg leading-relaxed sm:p-8 sm:text-xl">
            “Jij zei laatst dat je het beste een plan kan maken met model X en in een andere sessie model Y het kan laten uitvoeren. Wat is effectief het verschil met het wisselen van model <em>binnen</em> een sessie?”
          </blockquote>
        </section>

        {/* Twee redenen */}
        <section className="py-12">
          <h2 data-reveal className="font-display mb-3 text-3xl font-bold sm:text-4xl">Binnen één sessie wisselen kost je twee dingen</h2>
          <p data-reveal className="mb-8 text-ink2">Precies dat zijn de redenen om een nieuwe sessie te starten. Dat mag ook met hetzelfde model: het zijn twee losse zaken.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {redenen.map((r, i) => (
              <article key={r.titel} data-reveal className="card p-6">
                <span className="font-display text-5xl font-extrabold text-plan/30">0{i + 1}</span>
                <h3 className="font-display mt-2 text-xl font-bold">{r.titel}</h3>
                <p className="mt-2 text-ink2">{r.tekst}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Vergelijking */}
        <section className="py-12">
          <h2 data-reveal className="font-display mb-8 text-3xl font-bold sm:text-4xl">Het verschil in één blik</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <article data-reveal className="card p-6">
              <h3 className="font-display text-xl font-bold">Model wisselen in dezelfde sessie</h3>
              <ul className="mt-4 space-y-2 text-ink2">
                <li>✕ Plan-context en research blijven in beeld</li>
                <li>✕ Afgeslagen afwegingen blijven meeliften</li>
                <li>✕ Geen gebruik meer van de cache</li>
              </ul>
            </article>
            <article data-reveal className="card border-plan/50 p-6">
              <h3 className="font-display text-xl font-bold">Nieuwe sessie met het plan</h3>
              <ul className="mt-4 space-y-2 text-ink2">
                <li>✓ Schone start, alleen het uitgewerkte plan</li>
                <li>✓ Geen ruis van research en afgeslagen opties</li>
                <li>✓ De uitvoerder hoeft alleen nog uit te voeren</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Flow */}
        <section data-flow className="py-12">
          <h2 data-reveal className="font-display mb-8 text-3xl font-bold sm:text-4xl">Zo ziet het eruit</h2>
          <div className="relative pl-10">
            <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-line" aria-hidden />
            <div data-line className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-gradient-to-b from-plan to-build" aria-hidden />
            <ol className="space-y-6">
              {stappen.map((s) => (
                <li key={s.label} data-reveal className="relative">
                  <span className={`absolute top-1.5 -left-10 size-6 rounded-full border-4 border-bg ${s.kleur === "plan" ? "bg-plan" : "bg-build"}`} aria-hidden />
                  <div className="card p-5">
                    <p className={`text-xs font-bold tracking-widest uppercase ${s.kleur === "plan" ? "text-plan" : "text-build"}`}>{s.label}</p>
                    <h3 className="font-display mt-1 text-xl font-bold">{s.titel}</h3>
                    <p className="mt-1 text-ink2">{s.tekst}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Modellen */}
        <section className="py-12">
          <h2 data-reveal className="font-display mb-3 text-3xl font-bold sm:text-4xl">Welk model waarvoor?</h2>
          <p data-reveal className="mb-8 text-ink2">Vuistregel: zwaar plannen, licht uitvoeren. Dat slaat op de modellen.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {modellen.map((m) => (
              <article key={m.lijn} data-reveal className="card p-6">
                <h3 className="font-display text-xl font-bold">{m.lijn}</h3>
                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-xs font-bold tracking-widest text-plan uppercase">Plannen</dt>
                    <dd className="text-lg font-semibold">{m.plan}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold tracking-widest text-build uppercase">Uitvoeren</dt>
                    <dd className="text-lg font-semibold">{m.bouw}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <footer data-reveal className="card mt-8 bg-ink p-8 text-center">
          <p className="font-display text-2xl font-extrabold text-bg sm:text-3xl">Plan heavy, implement lightly.</p>
        </footer>
      </main>
    </Motion>
  );
}
