import Reveal from "@/components/fx/Reveal";
import SplitHeading from "@/components/fx/SplitHeading";
import { proposal } from "@/lib/content";

/**
 * Stap 5 van de funnel, als voorbeeld: hoe een voorstel eruitziet. Bewust zonder prijs of termijn,
 * want die liggen nog niet vast (vision.md, "Open besluiten").
 */
export default function Proposal() {
  const ex = proposal.example;
  return (
    <section aria-labelledby="proposal-title" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-gt-blue">{proposal.eyebrow}</p>
          <SplitHeading id="proposal-title" className="mt-4 text-title font-semibold">
            {proposal.title}
          </SplitHeading>
          <p className="mt-5 text-lg text-muted">{proposal.lead}</p>
          <Reveal className="mt-8">
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {proposal.includes.map((item, i) => (
                <li key={item} data-reveal className="flex items-baseline gap-3 border-b border-line py-2.5">
                  <span className="font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7">
          <article
            data-reveal
            aria-label="Voorbeeld van een voorstel"
            className="relative overflow-hidden rounded-[28px] bg-gt-blue p-5 text-ink shadow-[0_40px_100px_-40px_rgb(171_224_224/0.35)] sm:p-8"
          >
            {/* Racestreep: oranje met een dunne inktlijn, zoals op de livrei. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 right-10 w-5 border-x-2 border-ink/80 bg-signal sm:right-14 sm:w-7"
            />
            <div className="relative flex items-center justify-between gap-3 pr-12 sm:pr-20">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-ink">Voorstel</p>
              <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-paper">
                {proposal.badge}
              </span>
            </div>
            <blockquote className="relative mt-5 mr-12 border-l-4 border-ink bg-paper/60 px-4 py-3 font-mono text-sm leading-relaxed sm:mr-20">
              {ex.prompt}
            </blockquote>
            <dl className="relative mt-6 mr-12 divide-y divide-line-ink sm:mr-20">
              {ex.rows.map((r) => (
                <div key={r.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm text-muted-ink">{r.label}</dt>
                  <dd className="font-medium">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="relative mt-6 mr-12 flex flex-col gap-3 sm:mr-20 sm:flex-row sm:items-center sm:justify-between">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 font-semibold text-paper"
              >
                {ex.cta} <span className="text-signal">→</span>
              </span>
              <p className="text-sm text-muted-ink">Deze knop staat in jouw echte voorstel.</p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
