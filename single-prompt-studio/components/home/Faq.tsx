import SplitHeading from "@/components/fx/SplitHeading";
import { faq } from "@/lib/content";

/** Native <details>: werkt met toetsenbord en screenreader, zonder JS. */
export default function Faq() {
  return (
    <section id="vragen" aria-labelledby="faq-title" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-gt-blue">{faq.eyebrow}</p>
          <SplitHeading id="faq-title" className="mt-4 text-title font-semibold">
            {faq.title}
          </SplitHeading>
        </div>
        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {faq.items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-lg font-medium sm:text-xl">
                {item.q}
                <span
                  aria-hidden="true"
                  className="faq-plus grid size-8 shrink-0 place-items-center rounded-full border border-line text-signal transition-transform duration-300"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
