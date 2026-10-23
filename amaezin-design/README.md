# Amaezin Design — website rebuild

Mobile-first rebuild of [amaezindesign.nl](https://amaezindesign.nl).

**Stack:** Next.js 15 (App Router) · Tailwind CSS v4 · GSAP 3 (ScrollTrigger, SplitText, Flip, `@gsap/react`) · Lenis smooth scroll · React Bits components (adapted, in `src/components/reactbits`).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Structure
- `src/lib/content.ts` — all copy, services, projects, testimonials, city pages
- `src/lib/gsap.ts` — single place where GSAP plugins are registered
- `src/components/SmoothScroll.tsx` — Lenis driven by GSAP's ticker, synced with ScrollTrigger
- `src/components/reactbits/` — Grainient (hero WebGL), StaggeredMenu (nav), FlowingMenu (services), ScrollReveal, Magnet
- `src/app/[slug]` — local SEO pages `/grafisch-vormgever-<stad>` (same URLs as the old site)

## Contact form
`/api/contact` sends mail through [Resend](https://resend.com) when these env vars are set in Vercel:
- `RESEND_API_KEY` (required)
- `CONTACT_TO_EMAIL` (default `info@amaezindesign.nl`)
- `CONTACT_FROM_EMAIL` (a verified sender, e.g. `Amaezin Website <website@amaezindesign.nl>`)

Without `RESEND_API_KEY` the form falls back to opening the visitor's mail client.

## Vercel
Project root directory: `amaezin-design`. Framework preset: Next.js.
