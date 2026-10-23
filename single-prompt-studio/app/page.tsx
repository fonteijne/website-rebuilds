import ScrollVelocity from "@/components/fx/ScrollVelocity";
import Demos from "@/components/home/Demos";
import Faq from "@/components/home/Faq";
import FinalCta from "@/components/home/FinalCta";
import Hero from "@/components/home/Hero";
import Proposal from "@/components/home/Proposal";
import Services from "@/components/home/Services";
import Steps from "@/components/home/Steps";
import ZeroIterations from "@/components/home/ZeroIterations";
import { faq, marquee } from "@/lib/content";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((i) => ({
    "@type": "Question",
    name: i.q,
    acceptedAnswer: { "@type": "Answer", text: i.a },
  })),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Hero />
      <ScrollVelocity
        className="border-y-[6px] border-signal bg-gt-blue py-5 text-ink"
        items={marquee}
        itemClassName="text-2xl font-semibold tracking-tight sm:text-4xl"
        separator={<span className="mx-6 inline-block size-3 rounded-full bg-signal sm:mx-10" />}
      />
      <Demos />
      <ZeroIterations />
      <Steps />
      <Services />
      <Proposal />
      <Faq />
      <FinalCta />
    </>
  );
}
