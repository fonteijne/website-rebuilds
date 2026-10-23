/** Woordmerk: lowercase naam met de knipperende merkcursor. */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-mono text-[0.95rem] font-medium tracking-tight ${className}`}>
      <span aria-hidden="true" className="mr-2 text-signal">
        &gt;
      </span>
      single<span className="text-muted">_</span>prompt<span className="text-muted">_</span>studio
      <span aria-hidden="true" className="caret" />
    </span>
  );
}
