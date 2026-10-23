import Logo from "@/components/Logo";
import TLink from "@/components/TLink";
import { footerColumns, site } from "@/lib/content";
import FooterReveal from "./FooterReveal";

const icons: Record<string, React.ReactNode> = {
  Instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.9 1.4 1.4 0 000-2.9z" />
  ),
  Facebook: (
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
  ),
  LinkedIn: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  ),
  YouTube: (
    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
  ),
};

export default function Footer() {
  return (
    <FooterReveal>
      <footer className="relative overflow-hidden bg-black pt-20 text-paper md:pt-28">
        <div className="container-x">
          <TLink href="/" aria-label="Brand Agency – home" className="mx-auto block w-48 md:w-64" data-footer-logo>
            <Logo className="h-auto w-full" />
          </TLink>

          <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {footerColumns.map((col) => (
              <div key={col.title} data-footer-col>
                <TLink href={col.href} className="text-sm font-semibold uppercase tracking-wide text-pink hover:text-paper">
                  {col.title}
                </TLink>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <TLink
                        href={href}
                        className="group inline-flex items-center gap-2 text-[0.95rem] text-paper/75 transition-colors hover:text-paper"
                      >
                        <span
                          aria-hidden="true"
                          className="text-blue transition-transform duration-300 group-hover:translate-x-1"
                        >
                          »
                        </span>
                        {label}
                      </TLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 border-t border-white/10 pt-10 text-sm text-paper/70 md:grid-cols-3">
            <p>{site.address}</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1">
              <a className="link-underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <a className="link-underline" href={site.phoneHref}>
                {site.phone}
              </a>
            </p>
            <ul className="flex gap-4 md:justify-end">
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full border border-white/15 text-paper/80 transition-all duration-300 hover:-translate-y-1 hover:border-pink hover:bg-pink hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                      {icons[s.label]}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          data-footer-giant
          className="pointer-events-none mt-10 select-none whitespace-nowrap text-center text-[19vw] font-black uppercase leading-[0.78] tracking-tighter text-white/[0.04]"
        >
          Stand out
        </p>
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>Copyright © 2022-{new Date().getFullYear()} ‧ Brand Agency</p>
          <p>Brand · Shopper · Retail Activation</p>
        </div>
      </footer>
    </FooterReveal>
  );
}
