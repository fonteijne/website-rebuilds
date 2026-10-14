const SHA = process.env.NEXT_PUBLIC_BUILD_SHA;
const DATE = process.env.NEXT_PUBLIC_BUILD_DATE;

function formatDate(iso?: string) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(+d) ? d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" }) : "";
}

/** Disclaimer en versie-info (datum + korte commit-hash van de laatste release). */
export default function AppInfo({ className = "" }: { className?: string }) {
  const date = formatDate(DATE);
  return (
    <footer className={`text-center text-xs leading-relaxed text-muted ${className}`}>
      <p>Dit is een vibe-coded app. Gebruik op eigen risico.</p>
      <p data-testid="app-version">
        Laatste release{date ? ` ${date}` : ""} · <code className="font-mono">{SHA}</code>
      </p>
    </footer>
  );
}
