import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import ParallaxImage from "@/components/fx/ParallaxImage";
import Reveal from "@/components/fx/Reveal";
import ScrollWords from "@/components/fx/ScrollWords";
import SplitReveal from "@/components/fx/SplitReveal";
import CountUp from "@/components/fx/CountUp";
import Cta from "@/components/sections/Cta";
import Button from "@/components/ui/Button";
import { about } from "@/lib/content";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Wie zijn we",
  description:
    "Brand Agency combineert verschillende fieldmarketing & sales diensten om de consument effectief te bereiken en bedrijven optimaal te ondersteunen.",
  alternates: { canonical: "/over-brand-agency" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero word="Brand" spaced="Agency" accent="pink" kicker="Wie zijn we">
        <p className="max-w-2xl text-lg leading-relaxed text-paper/80 md:text-xl">{about.intro[0]}</p>
      </PageHero>

      <section className="bg-black pb-24 md:pb-36">
        <div className="container-x">
          <ParallaxImage src={img.over1} alt="Brand Agency team" className="aspect-[16/10] w-full md:aspect-[21/9]" sizes="100vw" amount={20} />
        </div>
        <div className="container-x mt-20 grid gap-12 md:mt-32 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ScrollWords className="text-[clamp(1.4rem,3.2vw,2.5rem)] font-semibold leading-[1.25] tracking-tight">
              {about.intro[2]}
            </ScrollWords>
          </div>
          <Reveal className="prose-ba space-y-0 text-base leading-[1.85] text-paper/70 lg:col-span-5">
            <p data-reveal-item>{about.intro[1]}</p>
            <p data-reveal-item>{about.intro[3]}</p>
            <p data-reveal-item>{about.intro[4]}</p>
            <div data-reveal-item className="mt-10">
              <Button href="/contact">Ook werken met Brand Agency</Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-coal py-16 md:py-24" aria-label="Ervaring">
        <div className="container-x grid gap-10 text-center sm:grid-cols-3">
          {[
            { to: 35, suffix: " jaar", label: "bureau-ervaring en retailkennis" },
            { to: 3, suffix: "", label: "disciplines: brand, shopper & retail activation" },
            { to: 2, suffix: "", label: "landen: Nederland en België" },
          ].map((s) => (
            <Reveal key={s.label}>
              <p className="whitespace-nowrap text-[clamp(3rem,8vw,6rem)] font-black leading-none text-pink">
                <CountUp to={s.to} suffix={s.suffix} />
              </p>
              <p className="mx-auto mt-3 max-w-[14rem] text-sm text-paper/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-black py-12 md:py-20" aria-label="Waar we voor staan">
        {about.pillars.map((p, i) => {
          const flip = i % 2 === 1;
          return (
            <div key={p.title} className="container-x grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
              <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                <ParallaxImage src={p.image} alt={p.title} className="aspect-[4/3] w-full" reveal={flip ? "right" : "left"} />
              </div>
              <div className={`lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
                <Reveal>
                  <p className={`kicker ${i % 2 === 0 ? "text-pink" : "text-blue"}`}>{p.kicker}</p>
                </Reveal>
                <SplitReveal
                  as="h2"
                  type="chars"
                  className="mt-4 text-[clamp(2.4rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-tight"
                >
                  {p.title}
                </SplitReveal>
                <Reveal className="prose-ba mt-8 text-[1rem] leading-[1.85] text-paper/75">
                  {p.paragraphs.map((t, j) => (
                    <p key={j} data-reveal-item>
                      {t}
                    </p>
                  ))}
                </Reveal>
              </div>
            </div>
          );
        })}
      </section>

      <Cta />
    </>
  );
}
