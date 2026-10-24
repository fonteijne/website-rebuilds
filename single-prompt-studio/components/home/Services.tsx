import PromptButton from "@/components/funnel/PromptButton";
import Reveal from "@/components/fx/Reveal";
import SplitHeading from "@/components/fx/SplitHeading";
import SpotlightCard from "@/components/fx/SpotlightCard";
import { services } from "@/lib/content";

/** De vier initiële services. Elke kaart stuurt terug naar het promptveld, met een passende startzin. */
export default function Services() {
  return (
    <section id="diensten" aria-labelledby="services-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gt-blue">{services.eyebrow}</p>
        <SplitHeading id="services-title" className="mt-4 max-w-4xl text-title font-semibold">
          {services.title}
        </SplitHeading>
        <p className="mt-5 max-w-2xl text-lg text-muted">{services.lead}</p>

        <Reveal className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5">
          {services.items.map((s) => (
            <div key={s.id} data-reveal>
              <SpotlightCard className="flex h-full flex-col rounded-[26px] border border-line bg-ink-2 p-6 sm:p-8">
                <h3 className="font-mono text-sm text-gt-blue">{s.name}</h3>
                <p className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{s.pitch}</p>
                <p className="mt-4 flex-1 leading-relaxed text-muted">{s.text}</p>
                <PromptButton
                  starter={s.starter}
                  className="group mt-8 inline-flex items-center gap-2 self-start rounded-full border border-paper/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-signal hover:text-signal"
                >
                  {services.cta}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </PromptButton>
              </SpotlightCard>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
