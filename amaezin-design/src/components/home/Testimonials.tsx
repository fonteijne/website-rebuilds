import Reveal from "@/components/Reveal";
import SplitHeading from "@/components/SplitHeading";
import { testimonials } from "@/lib/content";

export default function Testimonials() {
  return (
    <section aria-labelledby="reviews-title" className="bg-ink-2 px-4 py-24 sm:px-6 md:px-10 md:py-36">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">(05) — Reviews</p>
      <SplitHeading
        id="reviews-title"
        className="mt-4 font-display font-condensed text-[clamp(2.75rem,10vw,8rem)] font-extrabold uppercase leading-[0.85] tracking-tight"
      >
        Onze klanten <span className="text-pink">aan het woord</span>
      </SplitHeading>

      <Reveal className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2 md:gap-6">
        {testimonials.map((t, i) => (
          <figure
            key={t.author}
            data-reveal
            className={`relative flex flex-col justify-between rounded-3xl p-7 md:p-10 ${
              i % 2 ? "bg-pink text-ink md:mt-24" : "bg-paper text-ink"
            }`}
          >
            <svg aria-hidden viewBox="0 0 48 36" className="h-8 w-auto fill-current opacity-90 md:h-10">
              <path d="M0 36V22.5C0 9.6 6.4 2.1 19.2 0l1.8 5.4C14 7.1 10.5 11 10.2 17.1H19V36H0Zm28 0V22.5C28 9.6 34.4 2.1 47.2 0L49 5.4c-7 1.7-10.5 5.6-10.8 11.7H47V36H28Z" />
            </svg>
            <blockquote className="mt-6 font-display text-xl font-semibold leading-snug md:text-2xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
              <span className="h-px w-8 bg-current" />
              {t.author}
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}
