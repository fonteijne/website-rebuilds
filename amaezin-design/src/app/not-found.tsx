import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-start justify-center px-4 pt-28 sm:px-6 md:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">404</p>
      <h1 className="mt-4 font-display font-condensed text-[clamp(3.5rem,16vw,12rem)] font-extrabold uppercase leading-[0.85]">
        Niet zo <span className="text-pink">amaezin</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-paper/75">Deze pagina bestaat niet (meer). Maar er is genoeg moois te zien.</p>
      <Link href="/" className="mt-10 inline-flex min-h-14 items-center rounded-full bg-pink px-8 font-semibold text-ink">
        Terug naar home
      </Link>
    </section>
  );
}
