import Image from "next/image";
import Link from "next/link";
import { cities, services, site } from "@/lib/content";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink px-4 pb-8 pt-16 sm:px-6 md:px-10 md:pt-24">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="max-w-sm font-display text-2xl font-bold leading-tight md:text-3xl">
            Ontwerpstudio voor merken die <span className="text-pink">anders</span> durven zijn.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" role="list">
            {site.socials.map((s) => (
              <li key={s.link}>
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold transition-colors hover:border-pink hover:bg-pink hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Diensten" className="md:col-span-2">
          <h2 className="font-mono text-xs uppercase tracking-widest text-mute">Diensten</h2>
          <ul className="mt-4 space-y-1" role="list">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="inline-flex min-h-10 items-center hover:text-pink">
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/portfolio" className="inline-flex min-h-10 items-center hover:text-pink">
                Portfolio
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="font-mono text-xs uppercase tracking-widest text-mute">Contact</h2>
          <address className="mt-4 space-y-1 not-italic">
            <a href={site.phoneHref} className="flex min-h-10 items-center hover:text-pink">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex min-h-10 items-center break-all hover:text-pink">
              {site.email}
            </a>
            <p className="flex min-h-10 items-center text-white/70">{site.location}</p>
          </address>
        </div>

        <nav aria-label="Regio" className="md:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-mute">Grafisch vormgever</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 md:grid-cols-1" role="list">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="inline-flex min-h-10 items-center text-white/80 hover:text-pink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="relative mt-16 md:mt-24">
        <Image
          src="/images/logo-wit.png"
          alt=""
          width={800}
          height={321}
          className="h-auto w-full max-w-3xl opacity-[0.07] select-none"
          aria-hidden
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
        <p>
          © 2022–{year} {site.name}. Reclamebureau, ontwerpstudio en grafisch vormgever in Wijk bij Duurstede.
        </p>
        <a href={site.terms} target="_blank" rel="noopener" className="underline-offset-4 hover:text-pink hover:underline">
          Algemene voorwaarden (PDF)
        </a>
      </div>
    </footer>
  );
}
