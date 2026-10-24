import Link from "next/link";
import { nav } from "@/lib/content";
import Wordmark from "./Wordmark";

/**
 * Bewust geen mobiel menu: op telefoon is er één actie (de prompt), op desktop een paar ankers.
 */
export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between gap-4 rounded-full border border-line bg-ink/85 px-4 py-2.5 backdrop-blur-sm sm:mx-4 xl:mx-auto">
        <Link href="/" className="shrink-0 py-1" aria-label="Single Prompt Studio, naar de homepage">
          <Wordmark />
        </Link>
        <nav aria-label="Hoofdmenu" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm text-muted">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3 py-2 transition-colors hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/#prompt"
          className="shrink-0 rounded-full bg-gt-blue px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-signal"
        >
          Schrijf je prompt
        </Link>
      </div>
    </header>
  );
}
