import PromptButton from "@/components/funnel/PromptButton";
import Magnet from "@/components/fx/Magnet";
import SplitHeading from "@/components/fx/SplitHeading";
import { finalCta, promptForm } from "@/lib/content";

export default function FinalCta() {
  return (
    <section
      aria-labelledby="final-title"
      className="grain relative isolate overflow-hidden border-t border-line py-24 sm:py-36"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{ background: "radial-gradient(60% 80% at 50% 100%, rgb(255 91 34 / 0.25), transparent 70%)" }}
      />
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <SplitHeading id="final-title" className="text-display font-semibold">
          {finalCta.title.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </SplitHeading>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{promptForm.support}</p>
        <Magnet className="mt-10">
          <PromptButton className="group inline-flex items-center gap-3 rounded-full bg-signal px-8 py-5 text-lg font-semibold text-ink transition-colors hover:bg-signal-soft">
            {finalCta.button}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </PromptButton>
        </Magnet>
      </div>
    </section>
  );
}
