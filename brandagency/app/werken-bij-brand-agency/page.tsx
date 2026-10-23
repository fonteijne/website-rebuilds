import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/sections/PageHero";
import ParallaxImage from "@/components/fx/ParallaxImage";
import Reveal from "@/components/fx/Reveal";
import SplitReveal from "@/components/fx/SplitReveal";
import ScrollVelocity from "@/components/fx/ScrollVelocity";
import Button, { ArrowLink } from "@/components/ui/Button";
import JobList from "@/components/jobs/JobList";
import { careers, jobs, site } from "@/lib/content";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Werken bij Brand Agency",
  description:
    "Ga aan de slag als Brand Agent en werk voor de vetste merken, of kom ons kantoorteam versterken. Bekijk de vacatures van Brand Agency.",
  alternates: { canonical: "/werken-bij-brand-agency" },
};

export default function CareersPage() {
  return (
    <>
      <PageHero word="Werken bij" spaced="Brand Agency" accent="pink" kicker="Join the crowd" size="lg">
        <p className="max-w-2xl text-lg leading-relaxed text-paper/80 md:text-xl">{careers.intro}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#vacatures">Bekijk vacatures</Button>
          <Button href={site.registration} variant="ghost">
            Schrijf je direct in
          </Button>
        </div>
      </PageHero>

      <section id="vacatures" className="scroll-mt-20 bg-black py-16 md:py-24" aria-labelledby="vac-title">
        <div className="container-x">
          <p className="kicker text-blue">Brand Agency</p>
          <SplitReveal as="h2" id="vac-title" type="chars" className="mt-3 text-[clamp(2.4rem,7vw,5.5rem)] font-black uppercase leading-[0.9]">
            Vacatures
          </SplitReveal>
          <div className="mt-12">
            <JobList items={jobs} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-pink py-24 text-white md:py-36" aria-labelledby="agent-title">
        <ScrollVelocity
          items={["Brand Agent"]}
          velocity={45}
          className="pointer-events-none absolute inset-x-0 bottom-4 opacity-15"
          itemClassName="text-[18vw] font-black uppercase leading-none tracking-tighter text-black"
          separator={<span className="mx-[3vw]">✦</span>}
        />
        <div className="container-x relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="kicker text-black/70">Flexibele baan</p>
            <SplitReveal as="h2" id="agent-title" type="chars" className="mt-3 text-[clamp(2.8rem,8vw,6rem)] font-black uppercase leading-[0.9]">
              Brand Agent
            </SplitReveal>
            <Reveal className="mt-8">
              <p className="max-w-lg text-xl font-medium leading-relaxed">{careers.agent.text}</p>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-6 lg:pt-10">
            <ul className="space-y-4">
              {careers.agent.usps.map((u, i) => (
                <li key={u} data-reveal-item className="flex items-center gap-5 border-b border-white/30 pb-4 text-lg font-semibold md:text-xl">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-sm tabular-nums">0{i + 1}</span>
                  {u}
                </li>
              ))}
            </ul>
            <div data-reveal-item className="mt-10">
              <Button href={site.registration} variant="ghost" className="border-white text-white hover:border-white">
                Schrijf je direct in
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-black py-24 md:py-36" aria-labelledby="app-title">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="grid grid-cols-5 gap-3 lg:col-span-6">
            <ParallaxImage src={img.werken1} alt="Brand Agents aan het werk" className="col-span-3 aspect-[3/4]" sizes="(min-width:1024px) 30vw, 60vw" />
            <ParallaxImage src={img.werken2} alt="Brand Agents op een event" className="col-span-2 mt-20 aspect-[3/4]" sizes="(min-width:1024px) 20vw, 40vw" reveal="right" amount={22} />
          </div>
          <div className="lg:col-span-6">
            <p className="kicker text-pink">Eigen baas = geen dag hetzelfde</p>
            <SplitReveal as="h2" id="app-title" type="words" className="mt-3 text-[clamp(2.2rem,6vw,4.5rem)] font-black uppercase leading-[0.92]">
              Brand Agency app
            </SplitReveal>
            <Reveal className="prose-ba mt-8 text-[1rem] leading-[1.85] text-paper/75">
              {careers.app.map((p, i) => (
                <p key={i} data-reveal-item>
                  {p}
                </p>
              ))}
              <div data-reveal-item className="mt-10 flex flex-wrap items-center gap-4">
                <a href={site.appStore} target="_blank" rel="noopener noreferrer" className="transition-transform hover:-translate-y-1">
                  <Image src="/img/downloadontheappstore.png" alt="Download in de App Store" width={160} height={47} className="h-12 w-auto" />
                </a>
                <a href={site.playStore} target="_blank" rel="noopener noreferrer" className="transition-transform hover:-translate-y-1">
                  <Image src="/img/google-play-badge.png" alt="Ontdek het op Google Play" width={160} height={47} className="h-12 w-auto" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-coal py-24 md:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="kicker text-blue">Wie zijn wij?</p>
            <h2 className="mt-3 text-[clamp(2rem,5vw,3.6rem)] font-black uppercase leading-[0.92]">Brand Agency</h2>
            <p className="mt-6 text-[1rem] leading-[1.85] text-paper/75">{careers.who}</p>
            <div className="mt-8">
              <ArrowLink href="/over-brand-agency" accent="blue">
                Meer weten
              </ArrowLink>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="kicker text-pink">Aanmelden</p>
            <h2 className="mt-3 text-[clamp(2rem,5vw,3.6rem)] font-black uppercase leading-[0.92]">Zie jij het zitten?</h2>
            <p className="mt-6 text-[1rem] leading-[1.85] text-paper/75">{careers.signup}</p>
            <div className="mt-8">
              <Button href={site.registration}>Schrijf je direct in</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
