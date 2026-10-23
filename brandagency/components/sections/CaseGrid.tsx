import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import SplitReveal from "@/components/fx/SplitReveal";
import TLink from "@/components/TLink";
import type { Case } from "@/lib/content";

/** Kaarten met cases (o.a. "in de praktijk" op dienstpagina's en "meer cases"). */
export default function CaseGrid({ items, title }: { items: Case[]; title: string }) {
  return (
    <section className="bg-smoke py-20 md:py-32" aria-labelledby="case-grid-title">
      <div className="container-x">
        <SplitReveal
          as="h2"
          id="case-grid-title"
          type="words"
          className="max-w-3xl text-[clamp(2rem,5vw,3.8rem)] font-extrabold uppercase leading-[0.95] tracking-tight"
        >
          {title}
        </SplitReveal>
        <Reveal className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <TLink
              key={c.slug}
              href={`/cases/${c.slug}`}
              data-reveal-item
              data-cursor="Lees"
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110"
                />
                <span
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white ${
                    c.accent === "pink" ? "bg-pink" : "bg-blue"
                  }`}
                >
                  {c.tag}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 py-5">
                <h3 className="text-xl font-semibold uppercase leading-tight transition-colors group-hover:text-pink">{c.title}</h3>
                <span aria-hidden="true" className="mt-1 text-pink transition-transform duration-500 group-hover:translate-x-1.5">
                  »
                </span>
              </div>
            </TLink>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
