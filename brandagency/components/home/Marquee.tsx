import ScrollVelocity from "@/components/fx/ScrollVelocity";

const Star = ({ className }: { className: string }) => (
  <span className={`mx-[0.35em] inline-block text-[0.5em] ${className}`} aria-hidden="true">
    ✦
  </span>
);

/** Twee banden die met scrollsnelheid meebewegen, in tegengestelde richting. */
export default function Marquee() {
  const words = ["Brand Activation", "Shopper Activation", "Retail Activation"];
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black py-8 md:py-12" aria-hidden="true">
      <ScrollVelocity
        items={words}
        velocity={70}
        itemClassName="text-[clamp(2.6rem,9vw,7.5rem)] font-black uppercase leading-[1.05] tracking-tight"
        separator={<Star className="text-pink" />}
      />
      <ScrollVelocity
        items={words}
        velocity={-70}
        itemClassName="text-ghost text-[clamp(2.6rem,9vw,7.5rem)] font-black uppercase leading-[1.05] tracking-tight"
        separator={<Star className="text-blue" />}
      />
    </section>
  );
}
