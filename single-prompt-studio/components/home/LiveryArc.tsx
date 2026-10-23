/**
 * Racelivrei-boog: blauwe band met een oranje middenstreep en dunne inktlijnen ertussen
 * (GT-blauw/oranje, vision.md "Merk en vormgeving"). Statische SVG, decoratief.
 */
export default function LiveryArc({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 420 840" fill="none" className={className}>
      <circle cx="420" cy="420" r="330" stroke="var(--color-gt-blue)" strokeWidth="84" />
      <circle cx="420" cy="420" r="330" stroke="var(--color-ink)" strokeWidth="40" />
      <circle cx="420" cy="420" r="330" stroke="var(--color-gt-orange)" strokeWidth="32" />
    </svg>
  );
}
