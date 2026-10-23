import Link from "next/link";
import Magnet from "@/components/reactbits/Magnet";
import SplitHeading from "@/components/SplitHeading";
import VelocityMarquee from "@/components/VelocityMarquee";

export default function CallToAction({ title = "Let's create something amaezin" }: { title?: string }) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-pink text-ink">
      <VelocityMarquee
        text="Do it different"
        className="border-b border-ink/15 py-4 font-display text-[clamp(2rem,7vw,4.5rem)] font-extrabold uppercase leading-none [&_svg]:fill-ink"
        speed={28}
      />
      <div className="px-4 py-20 text-center sm:px-6 md:px-10 md:py-32">
        <p className="font-mono text-xs uppercase tracking-[0.25em]">Klaar voor iets nieuws?</p>
        <SplitHeading
          as="h2"
          id="cta-title"
          type="words"
          className="mx-auto mt-5 max-w-5xl font-display text-[clamp(2.75rem,11vw,8.5rem)] font-extrabold uppercase leading-[0.88] tracking-tight"
        >
          {title}
        </SplitHeading>
        <div className="mt-12 flex flex-col items-center gap-6">
          <Magnet>
            <Link
              href="/contact"
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-8 text-base font-semibold text-paper transition-transform active:scale-95 md:min-h-16 md:px-10 md:text-lg"
            >
              Contact opnemen
              <span className="grid size-8 place-items-center rounded-full bg-pink text-ink transition-transform duration-300 group-hover:rotate-45">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
