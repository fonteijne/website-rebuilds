import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactBlock from "@/components/ContactBlock";
import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import ServiceIntro from "@/components/ServiceIntro";
import VelocityMarquee from "@/components/VelocityMarquee";
import { cities, services } from "@/lib/content";

// Local SEO landing pages: /grafisch-vormgever-<stad> (same URLs as the old site).
export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ slug: c.slug }));
}

const findCity = (slug: string) => cities.find((c) => c.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const city = findCity((await params).slug);
  if (!city) return {};
  return {
    title: `Grafisch vormgever ${"local" in city ? "in " : ""}${city.name}`,
    description: `Op zoek naar een grafisch vormgever ${"local" in city ? "in" : "in de buurt van"} ${city.name}? Amaezin Design ontwerpt logo’s, huisstijlen, drukwerk en signing — persoonlijk, uniek en opvallend.`,
    alternates: { canonical: `/${city.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const city = findCity((await params).slug);
  if (!city) notFound();

  const local = "local" in city;
  const where = local ? `in ${city.name}` : `in de buurt van ${city.name}`;
  const design = services[0];

  const lead = [
    `Amaezin Design is dé grafisch vormgever ${where}. Met passie, kennis van de laatste trends en een berg motivatie zorgen we ervoor dat jouw bedrijf, merk of organisatie op de juiste manier opvalt. Van een nieuw logo met complete huisstijl tot bijpassend drukwerk, en van signing tot online- en offline communicatiemiddelen: alles is vorm te geven.`,
    `Op zoek naar een grafisch vormgever ${where} die buiten de lijntjes kleurt en het nét even persoonlijker en unieker maakt? Die meedenkt in jouw wensen en ideeën en dit omzet in een opvallend design? Neem dan zeker contact op.${
      local ? "" : " Met onze studio in Wijk bij Duurstede zijn we altijd in de buurt."
    }`,
  ];

  return (
    <>
      <PageHero
        kicker="Grafisch vormgever"
        title={city.name}
        subtitle={local ? `Isn’t it amaezin in ${city.name}?` : `Grafisch vormgever ${city.name}`}
      />
      <ServiceIntro lead={lead} image={design.image} imageAlt="Voorbeeld grafisch ontwerp" cta="Ik wil samenwerken" />
      <VelocityMarquee
        text={`Grafisch vormgever ${city.name}`}
        className="mt-20 border-y border-white/10 py-5 font-display font-condensed text-[clamp(2.5rem,9vw,7rem)] font-extrabold uppercase leading-none md:mt-32"
      />
      <FeatureGrid features={design.features} />
      <section className="px-4 pb-6 sm:px-6 md:px-10">
        <h2 className="font-display font-condensed text-[clamp(2.5rem,9vw,7rem)] font-extrabold uppercase leading-[0.85]">
          Let&apos;s create <span className="text-pink">something amaezin</span>
        </h2>
      </section>
      <ContactBlock intro={`Benieuwd wat onze grafisch vormgever ${where} voor jou kan betekenen? Let us know!`} />
    </>
  );
}
