import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParallaxImage from "@/components/fx/ParallaxImage";
import Reveal from "@/components/fx/Reveal";
import SplitReveal from "@/components/fx/SplitReveal";
import Button from "@/components/ui/Button";
import TLink from "@/components/TLink";
import JobList from "@/components/jobs/JobList";
import { jobs } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vacatures/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const j = jobs.find((x) => x.slug === slug);
  if (!j) return {};
  const description = (j.sections[0].paragraphs?.[0] ?? "").slice(0, 155);
  return { title: `Vacature ${j.title}`, description, alternates: { canonical: `/vacatures/${j.slug}` } };
}

export default async function JobPage({ params }: PageProps<"/vacatures/[slug]">) {
  const { slug } = await params;
  const job = jobs.find((x) => x.slug === slug);
  if (!job) notFound();
  const others = jobs.filter((x) => x.slug !== job.slug);
  const applyHref = job.apply.kind === "link" ? job.apply.href : `mailto:${job.apply.email}?subject=${encodeURIComponent(`Sollicitatie ${job.title}`)}`;

  const JobPosting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.list ?? [])]).join(" "),
    employmentType: job.type === "kantoor" ? "FULL_TIME" : ["PART_TIME", "CONTRACTOR"],
    hiringOrganization: { "@type": "Organization", name: "Brand Agency", sameAs: "https://brandagency.nl" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "NL" } },
    datePosted: "2022-03-29",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JobPosting) }} />
      <section className="bg-black pb-10 pt-32 md:pt-44">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]">
              <TLink href="/vacatures" className="text-paper/60 hover:text-paper">
                ← Vacatures
              </TLink>
              <span className="text-paper/30">/</span>
              <span className="text-pink">Vacature</span>
            </Reveal>
            <SplitReveal
              as="h1"
              type="words"
              immediate
              delay={0.3}
              className="mt-6 text-[clamp(2.4rem,7vw,5.6rem)] font-black uppercase leading-[0.92] tracking-tight"
            >
              {job.title}
            </SplitReveal>
            <Reveal delay={0.6} className="mt-10">
              <Button href={applyHref}>{job.apply.kind === "link" ? "Schrijf je direct in" : "Solliciteer direct"}</Button>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <ParallaxImage src={job.image} alt={job.title} className="aspect-[4/3] w-full lg:aspect-[4/5]" preload sizes="(min-width:1024px) 40vw, 100vw" />
          </div>
        </div>
      </section>

      <article className="bg-black py-16 md:py-24">
        <div className="container-x max-w-4xl">
          {job.sections.map((s, i) => (
            <Reveal key={i} className="border-t border-white/10 py-10 first:border-t-0 first:pt-0">
              {s.title && <h2 className="mb-5 text-xl font-bold uppercase tracking-wide text-pink md:text-2xl">{s.title}</h2>}
              <div className="prose-ba text-[1.02rem] leading-[1.9] text-paper/80">
                {s.paragraphs?.map((p, j) => (
                  <p key={j} className={i === 0 && j === 0 ? "text-xl font-semibold leading-relaxed text-paper md:text-2xl" : ""}>
                    {p}
                  </p>
                ))}
              </div>
              {s.list && (
                <ul className="mt-6 space-y-3">
                  {s.list.map((li) => (
                    <li key={li} className="flex gap-4 text-[1.02rem] leading-relaxed text-paper/80">
                      <span aria-hidden="true" className="mt-0.5 text-pink">
                        »
                      </span>
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
          <Reveal className="mt-6 rounded-2xl bg-pink p-8 md:p-12">
            <p className="text-2xl font-extrabold uppercase leading-tight md:text-3xl">
              {job.apply.kind === "link" ? "Leuk, dat willen wij ook!" : "Klinkt dit als jou?"}
            </p>
            <p className="mt-3 text-white/90">
              {job.apply.kind === "link"
                ? "Schrijf je direct in. We zullen je snel uitnodigen voor een intake gesprek online of bij ons op kantoor!"
                : `Stuur jouw verhaal inclusief CV naar ${job.apply.name}: ${job.apply.email}`}
            </p>
            <div className="mt-8">
              <Button href={applyHref} variant="ghost" className="border-white text-white">
                {job.apply.kind === "link" ? "Schrijf je direct in" : "Mail je sollicitatie"}
              </Button>
            </div>
          </Reveal>
        </div>
      </article>

      <section className="bg-coal py-20 md:py-28" aria-label="Andere vacatures">
        <div className="container-x">
          <h2 className="mb-10 text-[clamp(1.8rem,4vw,3rem)] font-extrabold uppercase leading-none">Andere vacatures</h2>
          <JobList items={others} />
        </div>
      </section>
    </>
  );
}
