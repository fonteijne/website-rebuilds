import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import TLink from "@/components/TLink";
import type { Job } from "@/lib/content";

const typeLabel = { "field-service": "Field service", kantoor: "Kantoor" } as const;

/** Vacaturekaarten. */
export default function JobList({ items }: { items: Job[] }) {
  return (
    <Reveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((j) => (
        <TLink key={j.slug} href={`/vacatures/${j.slug}`} data-reveal-item data-cursor="Bekijk" className="group block">
          <div className="relative aspect-[4/3] overflow-hidden bg-coal">
            <Image
              src={j.image}
              alt=""
              fill
              sizes="(min-width:1024px) 30vw, (min-width:768px) 50vw, 100vw"
              placeholder="blur"
              className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110"
            />
            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white ${
                j.type === "kantoor" ? "bg-blue" : "bg-pink"
              }`}
            >
              {typeLabel[j.type]}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 border-b border-white/10 py-5">
            <h3 className="text-lg font-semibold uppercase leading-tight transition-colors group-hover:text-pink md:text-xl">{j.title}</h3>
            <span aria-hidden="true" className="mt-1 text-pink transition-transform duration-500 group-hover:translate-x-1.5">
              »
            </span>
          </div>
        </TLink>
      ))}
    </Reveal>
  );
}
