import ScrollWords from "@/components/fx/ScrollWords";
import Reveal from "@/components/fx/Reveal";
import { ArrowLink } from "@/components/ui/Button";
import { about } from "@/lib/content";

/** Openingsstatement: woorden lichten op tijdens het scrollen. */
export default function Intro() {
  return (
    <section className="relative bg-black py-24 md:py-40" aria-label="Over Brand Agency">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p className="kicker text-pink">Brand Agency</p>
          <p className="mt-3 text-sm text-paper/50">Fieldmarketing & sales · Benelux</p>
        </Reveal>
        <div className="lg:col-span-9">
          <ScrollWords className="text-[clamp(1.55rem,4.2vw,3.4rem)] font-semibold leading-[1.18] tracking-tight">
            {about.intro[0]}
          </ScrollWords>
          <Reveal className="mt-10">
            <ArrowLink href="/over-brand-agency">Wie zijn we</ArrowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
