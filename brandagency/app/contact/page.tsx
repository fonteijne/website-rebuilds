import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Reveal from "@/components/fx/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import { ArrowLink } from "@/components/ui/Button";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact opnemen met Brand Agency",
  description:
    "Contact opnemen kan eenvoudig door te bellen naar 030-633 60 03 of WhatsApp naar 06-46 07 77 74. Mailen kan ook naar info@brandagency.nl",
  alternates: { canonical: "/contact" },
};

const channels = [
  { label: "Bellen", value: site.phone, href: site.phoneHref },
  { label: "WhatsApp", value: site.whatsapp, href: site.whatsappHref },
  { label: "Mailen", value: site.email, href: `mailto:${site.email}` },
];

export default function ContactPage() {
  return (
    <>
      <PageHero word="Contact" spaced="Opnemen" accent="pink" kicker="Challenge ons" size="lg">
        <p className="max-w-xl text-lg leading-relaxed text-paper/80 md:text-xl">
          Benieuwd naar de mogelijkheden om jouw doel zo effectief en efficiënt mogelijk te behalen? Neem contact op en
          challenge ons!
        </p>
      </PageHero>

      <section className="bg-black pb-24 md:pb-36">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal className="space-y-0">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  data-reveal-item
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-end justify-between gap-4 border-b border-white/10 py-6"
                >
                  <span>
                    <span className="kicker block text-paper/40">{c.label}</span>
                    <span className="mt-2 block text-xl font-semibold transition-colors group-hover:text-pink md:text-2xl">{c.value}</span>
                  </span>
                  <span aria-hidden="true" className="text-2xl text-pink transition-transform duration-500 group-hover:-rotate-45">
                    →
                  </span>
                </a>
              ))}
              <div data-reveal-item className="py-6">
                <span className="kicker block text-paper/40">Adres</span>
                <address className="mt-2 text-lg not-italic text-paper/80">
                  Molenvliet 17
                  <br />
                  3961 MT Wijk bij Duurstede
                </address>
              </div>
              <div data-reveal-item className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
                <ArrowLink href="/brand-activation" accent="blue">
                  Brand Activation
                </ArrowLink>
                <ArrowLink href="/shopper-activation">Shopper Activation</ArrowLink>
                <ArrowLink href="/retail-activation" accent="blue">
                  Retail Activation
                </ArrowLink>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
