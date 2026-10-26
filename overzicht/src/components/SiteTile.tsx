import type { CSSProperties } from 'react';
import type { Site } from '../content/sites';

export default function SiteTile({ site, index }: { site: Site; index: number }) {
  const host = new URL(site.url).host;

  return (
    <li className="tile" style={{ '--i': index } as CSSProperties}>
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-1.5 border-b border-line px-3 py-2" aria-hidden="true">
            <span className="size-2 rounded-full bg-line" />
            <span className="size-2 rounded-full bg-line" />
            <span className="size-2 rounded-full bg-line" />
            <span className="ml-2 truncate font-mono text-[11px] text-mute">{host}</span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            {site.protected ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,transparent_0_10px,var(--color-line)_10px_11px)] text-mute">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <span className="text-sm">Vercel-login vereist</span>
              </div>
            ) : (
              <img
                src={`/previews/${site.slug}.webp`}
                alt={`Voorbeeld van de homepage van ${site.name}`}
                width={960}
                height={600}
                loading={index < 3 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{site.name}</h2>
          <span
            aria-hidden="true"
            className="mt-1 text-mute transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent motion-reduce:transition-none"
          >
            ↗
          </span>
        </div>
        <p className="mt-1 text-sm text-pretty text-mute">{site.description}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px]">
          <li className="rounded-md bg-ink px-2 py-0.5 text-bg">{site.kind}</li>
          <li className="rounded-md border border-line px-2 py-0.5">{site.stack}</li>
          <li className="rounded-md border border-line px-2 py-0.5 text-mute">/{site.folder}</li>
          {site.branch !== 'main' && (
            <li className="rounded-md border border-dashed border-accent px-2 py-0.5 text-accent">
              branch {site.branch}
            </li>
          )}
        </ul>
        <span className="sr-only"> (opent in nieuw tabblad)</span>
      </a>
    </li>
  );
}
