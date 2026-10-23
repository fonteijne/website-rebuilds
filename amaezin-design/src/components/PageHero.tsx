import type { ReactNode } from "react";
import SplitHeading from "@/components/SplitHeading";

type Props = {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
};

export default function PageHero({ kicker, title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-32 sm:px-6 md:px-10 md:pb-24 md:pt-48">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20vw] -top-[30vw] size-[70vw] rounded-full bg-pink/25 blur-[100px] md:-right-[10vw] md:-top-[20vw] md:size-[50vw]"
      />
      <p className="relative font-mono text-xs uppercase tracking-[0.25em] text-pink">{kicker}</p>
      <SplitHeading
        as="h1"
        trigger="load"
        type="chars"
        className="relative mt-4 font-display font-condensed text-[clamp(3.5rem,16vw,13rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.01em]"
      >
        {title}
      </SplitHeading>
      {subtitle && (
        <p className="relative mt-6 font-display text-xl font-semibold text-paper/80 md:mt-10 md:text-3xl">{subtitle}</p>
      )}
    </section>
  );
}
