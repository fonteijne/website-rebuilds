import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import CaseHero from "@/components/cases/CaseHero";
import Reveal from "@/components/fx/Reveal";
import CaseGrid from "@/components/sections/CaseGrid";
import Cta from "@/components/sections/Cta";
import TLink from "@/components/TLink";
import { cases } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = cases.find((x) => x.slug === slug);
  if (!c) return {};
  const description = c.paragraphs[0].slice(0, 155).replace(/\s+\S*$/, "") + "…";
  return {
    title: c.title,
    description,
    alternates: { canonical: `/cases/${c.slug}` },
    openGraph: { title: `${c.title} - Brand Agency`, description, images: [{ url: c.image.src }] },
  };
}

/** Lange paragrafen met een citaat (begint met “ of ‘) krijgen een quote-opmaak. */
const isQuote = (p: string) => /^[“‘"]/.test(p);

export default async function CasePage({ params }: PageProps<"/cases/[slug]">) {
  const { slug } = await params;
  const index = cases.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const c = cases[index];
  const next = cases[(index + 1) % cases.length];
  const more = cases.filter((x) => x.slug !== c.slug && x.slug !== next.slug).slice(0, 3);
  const accentText = c.accent === "pink" ? "text-pink" : "text-blue";

  return (
    <>
      <CaseHero title={c.title} tag={c.tag} accent={c.accent} image={c.image} />

      <article className="bg-black py-20 md:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <Reveal className="lg:sticky lg:top-28">
              <dl className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 text-sm lg:grid-cols-1">
                <div>
                  <dt className="kicker text-paper/40">Case</dt>
                  <dd className="mt-2 font-semibold uppercase">{c.title}</dd>
                </div>
                <div>
                  <dt className="kicker text-paper/40">Discipline</dt>
                  <dd className={`mt-2 font-semibold uppercase ${accentText}`}>{c.tag}</dd>
                </div>
              </dl>
              <div className="mt-10 hidden lg:block">
                <TLink href="/cases" className="text-sm font-semibold uppercase tracking-[0.15em] text-paper/60 hover:text-paper">
                  ← Alle cases
                </TLink>
              </div>
            </Reveal>
          </aside>

          <Reveal className="lg:col-span-8">
            <p data-reveal-item className="text-[clamp(1.25rem,2.6vw,1.9rem)] font-semibold leading-[1.4] tracking-tight">
              {c.paragraphs[0]}
            </p>
            <div className="mt-10 space-y-6 text-[1.02rem] leading-[1.9] text-paper/75">
              {c.paragraphs.slice(1).map((p, i) =>
                isQuote(p) ? (
                  <blockquote
                    key={i}
                    data-reveal-item
                    className={`border-l-2 py-1 pl-6 text-lg italic leading-relaxed text-paper/90 ${
                      c.accent === "pink" ? "border-pink" : "border-blue"
                    }`}
                  >
                    {p}
                  </blockquote>
                ) : (
                  <p key={i} data-reveal-item>
                    {p}
                  </p>
                ),
              )}
              {c.link && (
                <p data-reveal-item>
                  <a href={c.link.href} target="_blank" rel="noopener noreferrer" className={`link-underline font-semibold ${accentText}`}>
                    {c.link.label} ↗
                  </a>
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </article>

      {/* Volgende case */}
      <TLink href={`/cases/${next.slug}`} className="group relative block h-[70svh] overflow-hidden bg-black" data-cursor="Volgende">
        <Image
          src={next.image}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover opacity-40 grayscale transition-all duration-[1.2s] ease-out-expo group-hover:scale-105 group-hover:opacity-70 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="container-x relative flex h-full flex-col justify-end pb-14">
          <p className="kicker text-pink">Volgende case</p>
          <p className="mt-4 text-[clamp(2.4rem,9vw,7rem)] font-black uppercase leading-[0.9] tracking-tight">{next.title}</p>
        </div>
      </TLink>

      <CaseGrid items={more} title="Meer cases" />
      <Cta />
    </>
  );
}
