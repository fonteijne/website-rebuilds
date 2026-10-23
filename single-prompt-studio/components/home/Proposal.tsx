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
    <section aria-labelledby="proposal-title" className="bg-paper py-20 text-ink sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#c2410c]">{proposal.eyebrow}</p>
          <SplitHeading id="proposal-title" className="mt-4 text-title font-semibold">
            {proposal.title}
          </SplitHeading>
          <p className="mt-5 text-lg text-muted-ink">{proposal.lead}</p>
          <Reveal className="mt-8">
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {proposal.includes.map((item, i) => (
                <li key={item} data-reveal className="flex items-baseline gap-3 border-b border-line-ink py-2.5">
                  <span className="font-mono text-xs text-muted-ink">{String(i + 1).padStart(2, "0")}</span>
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
            className="rounded-[28px] bg-white p-5 shadow-[0_30px_80px_-40px_rgb(11_11_12/0.45)] ring-1 ring-line-ink sm:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-ink">Voorstel</p>
              <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-paper">
                {proposal.badge}
              </span>
            </div>
            <blockquote className="mt-5 border-l-2 border-signal bg-paper/70 px-4 py-3 font-mono text-sm leading-relaxed">
              {ex.prompt}
            </blockquote>
            <dl className="mt-6 divide-y divide-line-ink">
              {ex.rows.map((r) => (
                <div key={r.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm text-muted-ink">{r.label}</dt>
                  <dd className="font-medium">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
