import CountUp from "@/components/fx/CountUp";
import Reveal from "@/components/fx/Reveal";
import { stats } from "@/lib/content";

/** Kerncijfers uit de diensten-pagina's, als tellers. */
export default function Stats() {
  return (
    <section className="bg-black py-20 md:py-28" aria-label="Kerncijfers">
      <Reveal className="container-x grid grid-cols-2 border-l border-t border-white/10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            data-reveal-item
            className="group relative overflow-hidden border-b border-r border-white/10 p-5 sm:p-8 md:p-10"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-out-expo group-hover:scale-y-100 ${
                i % 2 === 0 ? "bg-pink" : "bg-blue"
              }`}
            />
            <p className="relative whitespace-nowrap text-[clamp(2.2rem,7vw,4.5rem)] font-black leading-none tracking-tight lg:text-[clamp(2.5rem,4.6vw,4.5rem)]">
              <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="relative mt-4 max-w-[16rem] text-xs leading-relaxed text-paper/65 group-hover:text-white sm:text-sm">
              {s.label}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
