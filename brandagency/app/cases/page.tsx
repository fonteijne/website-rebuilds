import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import CaseIndex from "@/components/cases/CaseIndex";
import Cta from "@/components/sections/Cta";
import { cases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Onze cases",
  description:
    "Cases: bekijk en lees meer over onze projecten voor Brand Activation, Shopper Activation en Retail Activation.",
  alternates: { canonical: "/cases" },
};

export default function CasesPage() {
  return (
    <>
      <PageHero word="Cases" spaced="Brand Agency" accent="blue" />
      <section className="bg-black pb-24 md:pb-36" aria-label="Alle cases">
        <div className="container-x">
          <CaseIndex items={cases} />
        </div>
      </section>
      <Cta />
    </>
  );
}
