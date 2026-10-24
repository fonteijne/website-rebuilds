import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80dvh] max-w-3xl flex-col justify-center px-4 pt-24 sm:px-6">
      <p className="font-mono text-sm text-muted">
        <span className="text-signal">&gt;</span> 404: deze pagina bestaat niet
        <span aria-hidden="true" className="caret" />
      </p>
      <h1 className="mt-6 text-title font-semibold">Deze prompt leverde niets op.</h1>
      <p className="mt-5 text-lg text-muted">Gelukkig begint alles met één nieuwe.</p>
      <Link
        href="/#prompt"
        className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-signal px-6 py-4 font-semibold text-ink"
      >
        Schrijf je prompt <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
