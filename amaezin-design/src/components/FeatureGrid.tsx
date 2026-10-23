import Image from "next/image";
import Reveal from "@/components/Reveal";
import type { Feature } from "@/lib/content";

export default function FeatureGrid({ features, title = "Wat we doen" }: { features: Feature[]; title?: string }) {
  return (
    <section aria-label={title} className="px-4 py-20 sm:px-6 md:px-10 md:py-32">
      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5" as="ul">
        {features.map((f, i) => (
          <li
            key={f.title}
            data-reveal
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-2 p-7 transition-colors duration-500 hover:border-pink/60 md:p-9"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-24 size-56 rounded-full bg-pink opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-30"
            />
            <div className="flex items-start justify-between">
              <Image src={f.icon} alt="" width={64} height={64} className="size-14 opacity-90 md:size-16" />
              <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-10 font-display text-2xl font-bold md:text-3xl">{f.title}</h3>
            <p className="mt-3 leading-relaxed text-paper/70">{f.text}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
