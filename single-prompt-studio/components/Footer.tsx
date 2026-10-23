import Link from "next/link";
import { footer, site } from "@/lib/content";
import Wordmark from "./Wordmark";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Wordmark />
          <p className="max-w-sm text-sm text-muted">{footer.line}</p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted md:items-end">
          <a href={`mailto:${site.email}`} className="text-paper underline-offset-4 hover:underline">
            {site.email}
          </a>
          <ul className="flex gap-4">
            {footer.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline-offset-4 hover:text-paper hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
