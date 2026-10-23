import type { Metadata } from "next";
import ContactBlock from "@/components/ContactBlock";
import PageHero from "@/components/PageHero";
import VelocityMarquee from "@/components/VelocityMarquee";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met Amaezin Design in Wijk bij Duurstede. Bel +31 6 24 80 13 18 of mail info@amaezindesign.nl.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title={
          <>
            We like a<br />
            <span className="text-pink">challenge</span>
          </>
        }
        subtitle="Let’s create something amaezin!"
      />
      <ContactBlock />
      <VelocityMarquee
        text="Let's create something amaezin"
        className="border-t border-white/10 py-6 font-display font-condensed text-[clamp(2.5rem,9vw,7rem)] font-extrabold uppercase leading-none"
      />
    </>
  );
}
