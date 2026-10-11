import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

type Props = { lead: string[]; image: string; imageAlt: string; cta?: string };

export default function ServiceIntro({ lead, image, imageAlt, cta = "Dit wil ik" }: Props) {
  return (
    <Reveal as="section" className="grid gap-10 px-4 sm:px-6 md:grid-cols-12 md:gap-10 md:px-10">
      <div className="md:col-span-7">
        {lead.map((p, i) => (
          <p
            key={i}
            data-reveal
            className={
              i === 0
                ? "font-display text-[clamp(1.35rem,3.4vw,2.4rem)] font-semibold leading-[1.25] tracking-tight"
                : "mt-6 max-w-2xl text-lg leading-relaxed text-paper/70"
            }
          >
            {p}
          </p>
        ))}
        <div data-reveal className="mt-10">
          <Link
            href="/contact"
            className="inline-flex min-h-14 items-center gap-3 rounded-full bg-pink px-8 font-semibold text-ink transition-transform active:scale-95"
          >
            {cta}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div data-reveal className="md:col-span-4 md:col-start-9">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-ink-2">
          <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        </div>
      </div>
    </Reveal>
  );
}
