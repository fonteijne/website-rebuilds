import type { Metadata } from "next";
import CallToAction from "@/components/CallToAction";
import PageHero from "@/components/PageHero";
import PortfolioGrid from "@/components/PortfolioGrid";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Bekijk het werk van Amaezin Design: logo’s, huisstijlen, brochures, posters en social media voor o.a. EasyToys, Heineken, NFC One en TeamSport E-Karting.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        kicker="Portfolio"
        title={
          <>
            Ons <span className="text-pink">werk</span>
          </>
        }
        subtitle="Een greep uit de merken die we mochten laten knallen."
      />
      <PortfolioGrid />
      <CallToAction title="Jouw merk hier?" />
    </>
  );
}
