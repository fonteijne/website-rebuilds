import FlowingMenu from "@/components/reactbits/FlowingMenu";
import SplitHeading from "@/components/SplitHeading";
import { services } from "@/lib/content";

export default function Services() {
  return (
    <section aria-labelledby="services-title" className="px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <div className="mb-10 flex items-end justify-between gap-6 md:mb-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">(02) — Diensten</p>
          <SplitHeading
            id="services-title"
            className="mt-4 font-display text-[clamp(2.2rem,7vw,5rem)] font-bold leading-[0.95] tracking-tight"
          >
            Dit wil ik.
          </SplitHeading>
        </div>
        <p className="hidden max-w-xs text-white/60 md:block">
          Drie disciplines, één aanspreekpunt. Van eerste schets tot eindproduct op locatie.
        </p>
      </div>
      <FlowingMenu
        items={services.map((s) => ({
          link: `/${s.slug}`,
          text: s.title,
          image: s.image,
          index: s.index,
          description: s.short,
        }))}
      />
    </section>
  );
}
