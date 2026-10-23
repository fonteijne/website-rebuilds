import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/content";

export default function ContactBlock({ intro }: { intro?: string }) {
  return (
    <Reveal as="section" aria-label="Contact" className="grid gap-12 px-4 pb-24 sm:px-6 md:grid-cols-12 md:gap-10 md:px-10 md:pb-36">
      <div className="md:col-span-5">
        <p data-reveal className="text-lg leading-relaxed text-paper/80 md:text-xl">
          {intro ??
            "Ben je net zo enthousiast en gemotiveerd geworden als wij om voor jou aan de slag te gaan? Neem contact op of laat hieronder een bericht achter. Tot snel!"}
        </p>
        <ul data-reveal className="mt-10 grid gap-3" role="list">
          <li>
            <a
              href={site.phoneHref}
              className="group flex min-h-16 items-center justify-between rounded-2xl border border-white/10 px-6 transition-colors hover:border-pink"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-mute">Bel</span>
                <span className="font-display text-xl font-bold">{site.phone}</span>
              </span>
              <span aria-hidden className="text-pink transition-transform group-hover:translate-x-1">→</span>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${site.email}`}
              className="group flex min-h-16 items-center justify-between rounded-2xl border border-white/10 px-6 transition-colors hover:border-pink"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-mute">Mail</span>
                <span className="block truncate font-display text-xl font-bold">{site.email}</span>
              </span>
              <span aria-hidden className="text-pink transition-transform group-hover:translate-x-1">→</span>
            </a>
          </li>
          <li className="flex min-h-16 items-center rounded-2xl border border-white/10 px-6">
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-widest text-mute">Studio</span>
              <span className="font-display text-xl font-bold">{site.location}</span>
            </span>
          </li>
        </ul>
        <ul data-reveal className="mt-6 flex flex-wrap gap-2" role="list">
          {site.socials.map((s) => (
            <li key={s.link}>
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold transition-colors hover:border-pink hover:text-pink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div data-reveal className="md:col-span-6 md:col-start-7">
        <ContactForm />
      </div>
    </Reveal>
  );
}
