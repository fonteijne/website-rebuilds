import Magnet from "@/components/fx/Magnet";
import ScrollVelocity from "@/components/fx/ScrollVelocity";
import SplitReveal from "@/components/fx/SplitReveal";
import Reveal from "@/components/fx/Reveal";
import Button from "@/components/ui/Button";

/** "Thirsty for more? / Stand out from the crowd" — de afsluiter van iedere pagina. */
export default function Cta({
  text = "Ook benieuwd hoe het anders kan? Of wil je graag eens een frisse blik? Graag kijken we samen met je naar jouw uitdagingen. Projectmatig (Ad hoc) of als strategisch partner, wij komen met een concreet plan.",
}: {
  text?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-coal py-20 md:py-32" aria-labelledby="cta-title">
      <ScrollVelocity
        items={["Challenge ons", "Stand out from the crowd"]}
        velocity={50}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-[0.06]"
        itemClassName="text-[18vw] font-black uppercase leading-none tracking-tighter text-white md:text-[12vw]"
        separator={<span className="mx-[3vw] text-pink">✦</span>}
      />
      <div className="container-x relative text-center">
        <p className="kicker text-pink">Thirsty for more?</p>
        <SplitReveal
          as="h2"
          id="cta-title"
          type="chars"
          className="mx-auto mt-5 max-w-5xl text-[clamp(2.2rem,8vw,6.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight"
        >
          Stand out from the crowd
        </SplitReveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-paper/75 md:text-lg">{text}</p>
          <div className="mt-10 flex justify-center">
            <Magnet>
              <Button href="/contact" size="lg">
                Challenge ons
              </Button>
            </Magnet>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
