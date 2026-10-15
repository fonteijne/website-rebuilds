import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import SplitReveal from "@/components/fx/SplitReveal";
import JobList from "@/components/jobs/JobList";
import Cta from "@/components/sections/Cta";
import { jobs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Vacatures",
  description: "Vacatures bij Brand Agency: field service (Brand Agent / promotiemedewerker) en kantoor (project manager).",
  alternates: { canonical: "/vacatures" },
};

const groups = [
  { id: "field-service", title: "Field service", type: "field-service" as const },
  { id: "kantoor", title: "Kantoor", type: "kantoor" as const },
];

export default function JobsPage() {
  return (
    <>
      <PageHero word="Vacatures" spaced="Brand Agency" accent="blue" size="lg" />
      <div className="bg-black pb-16">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-24 py-12 md:py-16" aria-labelledby={`${g.id}-title`}>
            <div className="container-x">
              <SplitReveal
                as="h2"
                id={`${g.id}-title`}
                type="words"
                className="mb-10 text-[clamp(1.8rem,4vw,3rem)] font-extrabold uppercase leading-none"
              >
                {`Vacatures ${g.title}`}
              </SplitReveal>
              <JobList items={jobs.filter((j) => j.type === g.type)} />
            </div>
          </section>
        ))}
      </div>
      <Cta text="Geen passende vacature gevonden, maar zie jij het helemaal zitten met ons? Neem contact op en challenge ons!" />
    </>
  );
}
