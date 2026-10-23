import ParallaxImage from "@/components/fx/ParallaxImage";
import Reveal from "@/components/fx/Reveal";
import ScrollWords from "@/components/fx/ScrollWords";
import SplitReveal from "@/components/fx/SplitReveal";
import CountUp from "@/components/fx/CountUp";
import PageHero from "@/components/sections/PageHero";
import Cta from "@/components/sections/Cta";
import CaseGrid from "@/components/sections/CaseGrid";
import ScrollVelocity from "@/components/fx/ScrollVelocity";
import Button, { ArrowLink } from "@/components/ui/Button";
import { cases, type Service } from "@/lib/content";
import SectionNav from "./SectionNav";

export default function ServicePage({ service: s }: { service: Service }) {
  const accentText = s.accent === "pink" ? "text-pink" : "text-blue";
  const related = cases.filter((c) => c.tag === `${s.word} Activation`).slice(0, 3);

  return (
    <>
      <PageHero
        word={s.word}
        spaced="Activation"
        accent={s.accent}
        kicker="Brand Agency"
        aside={
          <div className="relative hidden pb-24 lg:block">
            <ParallaxImage
              src={s.heroImages[0]}
              alt={`${s.word} activation`}
              className="ml-auto aspect-[4/5] w-[78%]"
              sizes="32vw"
              preload
            />
            <ParallaxImage
              src={s.heroImages[1]}
              alt={`${s.word} activation`}
              className="absolute bottom-0 left-0 aspect-square w-[46%] outline outline-8 outline-black"
              sizes="20vw"
              amount={24}
              reveal="left"
            />
          </div>
        }
      >
        <p className="max-w-2xl text-lg leading-relaxed text-paper/80 md:text-xl">{s.intro}</p>
        <div className="mt-10">
          <Button href="/contact" variant={s.accent}>
            Challenge ons
          </Button>
        </div>
      </PageHero>

      {/* Mobiel: de twee hero-beelden naast elkaar */}
      <div className="container-x grid grid-cols-5 gap-3 lg:hidden">
        <ParallaxImage src={s.heroImages[0]} alt="" className="col-span-3 aspect-[4/5]" sizes="60vw" />
        <ParallaxImage src={s.heroImages[1]} alt="" className="col-span-2 mt-16 aspect-[3/4]" sizes="40vw" reveal="left" />
      </div>

      <section className="bg-black py-24 md:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ScrollWords className="text-[clamp(1.4rem,3.4vw,2.6rem)] font-semibold leading-[1.25] tracking-tight">
              {s.body[0]}
            </ScrollWords>
          </div>
          {s.body[1] && (
            <Reveal className="self-end lg:col-span-4">
              <p className="text-base leading-[1.85] text-paper/70">{s.body[1]}</p>
            </Reveal>
          )}
        </div>
      </section>

      {s.highlight && (
        <section className="relative overflow-hidden bg-pink py-20 text-white md:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="flex flex-wrap gap-x-10 gap-y-6 lg:col-span-5">
              <div>
                <p className="text-[clamp(3.5rem,9vw,6rem)] font-black leading-none tracking-tighter">
                  <CountUp to={70} prefix=">" suffix="%" />
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider">beslist op de winkelvloer</p>
              </div>
              <div>
                <p className="text-[clamp(3.5rem,9vw,6rem)] font-black leading-none tracking-tighter text-black/80">
                  <CountUp to={48} suffix="%" />
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wider">invloed instore</p>
              </div>
            </div>
            <Reveal className="space-y-5 text-lg leading-relaxed lg:col-span-7">
              {s.highlight.map((p, i) => (
                <p key={i} className={i === 0 ? "text-xl font-semibold md:text-2xl" : ""}>
                  {p}
                </p>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <SectionNav items={s.sections.map(({ id, title }) => ({ id, title }))} accent={s.accent} />

      <div className="bg-black">
        {s.sections.map((sec, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={sec.id}
              id={sec.id}
              aria-labelledby={`${sec.id}-title`}
              className="scroll-mt-24 border-b border-white/5 py-20 md:py-32"
            >
              <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                  <ParallaxImage
                    src={sec.image}
                    alt={sec.title}
                    className="aspect-[4/3] w-full lg:aspect-[4/5]"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    reveal={flip ? "right" : "left"}
                  />
                </div>
                <div className={`lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
                  <Reveal>
                    <p className={`text-sm font-bold tabular-nums ${accentText}`}>
                      0{i + 1} <span className="text-paper/30">/ 0{s.sections.length}</span>
                    </p>
                  </Reveal>
                  <SplitReveal
                    as="h2"
                    id={`${sec.id}-title`}
                    type="words"
                    className="mt-4 text-[clamp(1.5rem,6.4vw,2.4rem)] font-extrabold uppercase leading-[0.95] tracking-tight lg:text-[clamp(1.9rem,2.7vw,3.4rem)]"
                  >
                    {sec.title}
                  </SplitReveal>
                  <Reveal className="prose-ba mt-8 text-[0.98rem] leading-[1.85] text-paper/75">
                    {sec.paragraphs.map((p, j) => (
                      <p key={j} data-reveal-item>
                        {p}
                      </p>
                    ))}
                  </Reveal>
                  <Reveal className="mt-10">
                    <ArrowLink href="/contact" accent={s.accent}>
                      {sec.cta}
                    </ArrowLink>
                  </Reveal>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {s.extra && (
        <section className="relative overflow-hidden bg-blue py-24 md:py-36" aria-labelledby="extra-title">
          <ScrollVelocity
            items={["Online", "Offline"]}
            velocity={40}
            className="pointer-events-none absolute inset-x-0 top-6 opacity-15"
            itemClassName="text-[16vw] font-black uppercase leading-none tracking-tighter text-black"
            separator={<span className="mx-[2vw]">+</span>}
          />
          <div className="container-x relative grid gap-10 lg:grid-cols-12">
            <SplitReveal
              as="h2"
              id="extra-title"
              type="words"
              className="text-[clamp(2.2rem,6vw,4.6rem)] font-extrabold uppercase leading-[0.95] tracking-tight lg:col-span-6"
            >
              {s.extra.title}
            </SplitReveal>
            <Reveal className="prose-ba text-lg leading-relaxed text-white/90 lg:col-span-6">
              {s.extra.paragraphs.map((p, i) => (
                <p key={i} data-reveal-item>
                  {p}
                </p>
              ))}
              <div className="mt-10" data-reveal-item>
                <Button href="/contact" variant="pink">
                  Challenge ons
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {related.length > 0 && <CaseGrid items={related} title={`${s.word} Activation in de praktijk`} />}

      <Cta text={s.closing} />
    </>
  );
}
