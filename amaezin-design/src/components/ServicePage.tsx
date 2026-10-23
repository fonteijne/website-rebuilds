import CallToAction from "@/components/CallToAction";
import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import ServiceIntro from "@/components/ServiceIntro";
import VelocityMarquee from "@/components/VelocityMarquee";
import type { Service } from "@/lib/content";

export default function ServicePage({ service }: { service: Service }) {
  return (
    <>
      <PageHero kicker={`${service.index} — Diensten`} title={service.title} subtitle="Isn’t it amaezin?" />
      <ServiceIntro lead={service.lead} image={service.image} imageAlt={`Voorbeeld ${service.title.toLowerCase()}`} />
      <VelocityMarquee
        text={service.title}
        className="mt-20 border-y border-white/10 py-5 font-display font-condensed text-[clamp(2.5rem,9vw,7rem)] font-extrabold uppercase leading-none md:mt-32"
      />
      <FeatureGrid features={service.features} />
      <CallToAction />
    </>
  );
}
