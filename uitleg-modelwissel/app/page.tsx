import Motion from "@/components/Motion";
import SplitText from "@/components/reactbits/SplitText";
import HairlineDemo from "@/components/HairlineDemo";
import ContextBars from "@/components/ContextBars";

const bronnen = [
  ["Claude Code: how Claude Code uses prompt caching", "https://code.claude.com/docs/en/prompt-caching"],
  ["Claude API: prompt caching (prefix, TTL, prijzen)", "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"],
  ["Claude Code: manage costs (/clear, modelkeuze, plan mode)", "https://code.claude.com/docs/en/costs"],
  ["Chroma: Context Rot (juli 2025, 18 modellen)", "https://trychroma.com/research/context-rot"],
  ["Liu e.a.: Lost in the Middle (TACL 2024)", "https://aclanthology.org/2024.tacl-1.9/"],
  ["Hairline: interactieve lijnfiguren (MIT)", "https://github.com/lucasmarkes/hairline"],
] as const;

const opties = [
  { titel: "/model in dezelfde sessie", context: "Alles blijft: research, afwegingen, afgeslagen opties.", cache: "Eigen cache per model: de eerstvolgende beurt leest alles ongecachet.", kleur: "text-build" },
  { titel: "opusplan", context: "Zelfde sessie; Opus in plan mode, Sonnet bij uitvoeren.", cache: "Elke wissel van plan mode is een modelwissel, dus telkens een nieuwe cache.", kleur: "text-build" },
  { titel: "/compact", context: "Geschiedenis wordt een samenvatting. Je bepaalt wat er behouden blijft.", cache: "Bouwt het gesprek opnieuw op; goedkoop zolang de cache nog warm is.", kleur: "text-plan" },
  { titel: "Nieuwe sessie + plan", context: "Alleen het uitgewerkte plan gaat mee. Rest blijft weg.", cache: "Eigen, kleine prefix die direct warm loopt.", kleur: "text-plan" },
] as const;

const planInhoud = [
  "Doel en wat nadrukkelijk niet bij de scope hoort",
  "De gemaakte keuzes, met één regel reden. Niet alle opties die je afwoog.",
  "Bestanden en stappen, in volgorde",
  "Hoe je weet dat het klaar is: tests, commando's, verwachte uitkomst",
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p data-reveal className="mb-3 text-sm font-semibold tracking-widest text-plan uppercase">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 data-reveal className="font-display mb-4 text-3xl leading-tight font-bold sm:text-4xl">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p data-reveal className="mb-6 max-w-2xl text-lg leading-relaxed text-ink2">{children}</p>;
}
function Note({ children }: { children: React.ReactNode }) {
  return <p data-reveal className="mt-4 rounded-xl border border-line bg-bg-2/50 px-4 py-3 text-sm text-ink2">{children}</p>;
}

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
            Plan met een zwaar model en laat een lichter model het plan uitvoeren, in een <em>nieuwe</em> sessie. Hieronder zie je waarom dat meer is dan een kwestie van smaak.
          </p>
          <a href="#vraag" className="nudge mt-12 inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink2" style={{ animation: "nudge 1.8s ease-in-out infinite" }}>
            Lees verder <span aria-hidden>↓</span>
          </a>
        </header>

        {/* Vraag + kort antwoord */}
        <section id="vraag" className="scroll-mt-8 py-12">
          <Kicker>De vraag</Kicker>
          <blockquote data-reveal className="card border-l-[6px] border-l-plan p-6 text-lg leading-relaxed sm:p-8 sm:text-xl">
            “Wat is effectief het verschil tussen plannen met model X en uitvoeren met model Y in een <em>andere</em> sessie, of gewoon van model wisselen <em>binnen</em> een sessie?”
          </blockquote>
          <div data-reveal className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Alles gaat mee", "Wissel je binnen een sessie, dan reist de volledige geschiedenis mee. Ook de ruis."],
              ["Cache vervalt", "Elk model heeft een eigen cache. Na een wissel lees je alles opnieuw, tegen volle prijs en trager."],
              ["Schone start", "Een nieuwe sessie met een plan begint met alleen wat de uitvoerder nodig heeft."],
            ].map(([t, d]) => (
              <div key={t} className="card p-4">
                <h3 className="font-display text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-ink2">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 1. Geen geheugen */}
        <section className="py-12">
          <Kicker>Stap 1 · Hoe het werkt</Kicker>
          <H2>Een model onthoudt niets. Het leest elke beurt alles opnieuw.</H2>
          <P>
            Tussen twee verzoeken bewaart het model zelf niets. Een tool als Claude Code stuurt daarom bij elke beurt de hele conversatie opnieuw mee: systeemprompt, projectcontext, al je berichten en alle tool-resultaten. Hoe langer de sessie, hoe zwaarder elke beurt.
          </P>
          <HairlineDemo figure="Terminal" label="Een sessie als terminal vol geschiedenis" hint="Beweeg of tik: de regels zijn alles wat bij elke beurt meegaat." />
        </section>

        {/* 2. Prefix-cache */}
        <section className="py-12">
          <Kicker>Stap 2 · De cache</Kicker>
          <H2>De cache werkt als een prefix: verander iets vooraan en alles erna telt opnieuw.</H2>
          <P>
            Om niet alles telkens opnieuw te verwerken, onthoudt de API het begin van je verzoek, de <em>prefix</em>. De volgorde is vast: tools, dan systeemprompt, dan berichten. Een cache-hit vraagt een exacte match. Verandert er vroeg iets, dan moet alles erachter opnieuw worden berekend.
          </P>
          <HairlineDemo figure="Rebuild" label="Een boom van afhankelijkheden: wijzig één knoop en alles erna herbouwt" hint="Beweeg over een blok: wat daarvan afhangt, rekent mee." />
          <Note>
            Een cache-lezing kost standaard 0,1× de normale invoerprijs (bij sommige modellen 0,05×). Schrijven kost 1,25× voor 5 minuten, 2× voor 1 uur. De cache verloopt na inactiviteit: 5 minuten standaard, in Claude Code op een abonnement 1 uur.
          </Note>
        </section>

        {/* 3. Modelwissel */}
        <section className="py-12">
          <Kicker>Stap 3 · Wisselen van model</Kicker>
          <H2>Elk model heeft een eigen kluisje.</H2>
          <P>
            Volgens de Claude Code-documentatie heeft elk model zijn eigen cache. Wissel je met <code className="rounded bg-bg-2 px-1.5 py-0.5 text-base">/model</code>, dan leest het nieuwe model de hele geschiedenis zonder cache-hit, ook al is de inhoud identiek. Claude Code vraagt zelfs om bevestiging zolang de cache nog warm is. Dat geldt ook voor <code className="rounded bg-bg-2 px-1.5 py-0.5 text-base">opusplan</code>: elke keer dat je plan mode in- of uitgaat, wissel je van model.
          </P>
          <HairlineDemo figure="Lockers" label="Rij kluisjes, één per model" hint="Beweeg: één kluisje open. De inhoud van een ander kluisje kun je niet hergebruiken." />
          <Note>
            Eerlijk: één trage, duurdere beurt is geen ramp. Het echte probleem is wat er <em>meegaat</em>. Daarom hoort deze stap bij de volgende.
          </Note>
        </section>

        {/* 4. Context rot */}
        <section className="py-12">
          <Kicker>Stap 4 · Meer context is niet beter</Kicker>
          <H2>Ruis in de context maakt het model slechter, niet slimmer.</H2>
          <P>
            Chroma testte in juli 2025 18 modellen (waaronder GPT-4.1, Claude 4 en Gemini 2.5) en zag dat prestaties minder betrouwbaar worden naarmate de input langer wordt, ook bij simpele taken. Afleiders die inhoudelijk dicht bij het doel liggen, doen extra pijn. Eerder liet <em>Lost in the Middle</em> (Liu e.a., TACL 2024) een U-vorm zien: informatie vooraan of achteraan wordt goed gebruikt, in het midden veel minder.
          </P>
          <P>
            Precies dat is wat je overhoudt na een planfase: veel research en afgeslagen alternatieven, die lijken op de oplossing maar het niet zijn. Voor de uitvoerder is het afleiding.
          </P>
          <HairlineDemo figure="Loupe" label="Een vergrootglas over een lijnenblad" hint="Sleep: het model leest nooit alles even scherp." />
          <Note>Kanttekening: Chroma verkoopt zelf een vector-database. Het onderzoek is open en herhaalbaar, maar lees het met dat in het achterhoofd.</Note>
        </section>

        {/* 5. Nieuwe sessie */}
        <section className="py-12">
          <Kicker>Stap 5 · Wat een nieuwe sessie doet</Kicker>
          <H2>Zeef de research tot een plan en start schoon.</H2>
          <P>
            Een nieuwe sessie is geen cache-truc: ook die begint koud. Het verschil is dat de prefix klein is. In plaats van de hele plan-sessie neem je alleen het uitgewerkte plan mee. De uitvoerder hoeft niet te denken, alleen te doen.
          </P>
          <HairlineDemo figure="Sieve" label="Drie zeven boven een opvangbak" hint="Beweeg omhoog en omlaag: ruwe research gaat erin, een plan komt eruit." />
          <div className="mt-6">
            <ContextBars />
          </div>
          <div data-reveal className="card mt-6 p-5 sm:p-6">
            <h3 className="font-display text-xl font-bold">Wat hoort er in zo’n plan?</h3>
            <p className="mt-1 text-sm text-ink2">Praktisch advies, geen vaste regel.</p>
            <ul className="mt-3 space-y-2 text-ink2">
              {planInhoud.map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-plan" aria-hidden>→</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Opties vergeleken */}
        <section className="py-12">
          <Kicker>Alle opties naast elkaar</Kicker>
          <H2>Vier manieren om van plannen naar uitvoeren te gaan</H2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {opties.map((o) => (
              <article key={o.titel} data-reveal className="card p-5">
                <h3 className={`font-display text-lg font-bold ${o.kleur}`}>{o.titel}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="font-semibold">Context</dt><dd className="text-ink2">{o.context}</dd></div>
                  <div><dt className="font-semibold">Cache</dt><dd className="text-ink2">{o.cache}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {/* 7. Modellen */}
        <section className="py-12">
          <Kicker>Welk model waarvoor?</Kicker>
          <H2>Zwaar plannen, licht uitvoeren</H2>
          <P>
            Het slaat op de modellen. Anthropic adviseert Sonnet voor de meeste codeertaken en Opus voor complexe architectuurkeuzes of redeneren in meerdere stappen. Een goed plan maakt de uitvoering eenvoudiger, dus daar volstaat een lichter, goedkoper model.
          </P>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { lijn: "Claude", plan: "Opus of Sonnet", bouw: "Sonnet of Haiku" },
              { lijn: "GPT", plan: "Sol", bouw: "Luna" },
            ].map((m) => (
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
          <Note>
            Een vuistregel, geen wet. Voor een kleine taak is een nieuwe sessie meer gedoe dan winst: blijf dan gewoon in je sessie, en gebruik <code>/clear</code> tussen losse taken.
          </Note>
        </section>

        {/* Bronnen */}
        <section className="py-12">
          <Kicker>Bronnen</Kicker>
          <ul className="space-y-2">
            {bronnen.map(([t, u]) => (
              <li key={u} data-reveal>
                <a href={u} target="_blank" rel="noreferrer" className="text-plan underline underline-offset-4">{t}</a>
              </li>
            ))}
          </ul>
        </section>

        <footer data-reveal className="card mt-8 bg-ink p-8 text-center">
          <p className="font-display text-2xl font-extrabold text-bg sm:text-3xl">Plan heavy, implement lightly.</p>
        </footer>
      </main>
    </Motion>
  );
}
