---
name: website-revamp
description: Revamp/rebuild van een bestaande website in deze repo (eigen folder, Vercel-ready). Gebruik wanneer de gebruiker een bestaande site (URL) opnieuw wil laten bouwen, "revamp", "rebuild" of "vernieuwen" noemt.
---

# Website revamp

Bouw een bestaande website opnieuw op: zelfde merk, inhoud en URL's, maar mobile first, snel en met nette animaties. Lees eerst `CLAUDE.md` in de root voor de standaard stack, repo's en regels; dit is alleen het stappenplan.

Argumenten: de URL van de bestaande site (en eventueel een folder- of branchnaam).

## 1. Intake (kort)
- Bepaal URL, folder (kebab-case, naar klant, bijv. `brandagency`) en branch `<folder>-rebuild`. Vraag alleen door als dit echt niet af te leiden is.
- Kies de stack:
  - **Next.js (App Router)**: formulieren/API, veel SEO-pagina's, dynamische routes of backend.
  - **Vite + React**: pure statische of client-side site.
- Controleer of de folder nog niet bestaat. Werk alleen in die folder.

## 2. Bestaande site analyseren
- Haal pagina's op met WebFetch (of Playwright/Chromium als content via JS komt). Maak een **inventaris**: alle pagina's en URL's (sitemap.xml, menu, footer), secties per pagina, copy, kleuren, fonts, logo's, beeldmateriaal, formulieren, social links, contactgegevens, juridische pagina's, bijzondere interacties (bijv. horizontale scroll).
- Leg vast wat **behouden** moet blijven: merkkleuren, tone of voice, copy, URL-structuur (voor SEO), kenmerkende interacties. Wat verbeterd wordt: structuur, snelheid, mobiele ervaring, animatie, toegankelijkheid.
- Download beelden en fonts die je mag hergebruiken naar `public/` (webp/avif, zinnige bestandsnamen). Verzin geen content: ontbreekt iets, markeer het als placeholder en meld het.
- Maak een korte plan-samenvatting (pagina's, secties, animatieconcept per sectie, gekozen React Bits-componenten) en deel die met de gebruiker voordat je bulk-code schrijft. Bij een duidelijke opdracht mag je direct doorwerken.

## 3. Scaffolden
- Nieuwe folder met eigen `package.json`, `package-lock.json`, `.gitignore`, `README.md`, `tsconfig` (TS waar het kan).
- Dependencies volgens `CLAUDE.md`: React 19, Tailwind v4, `gsap` + `@gsap/react`, `lenis`; fonts via `next/font` of `@fontsource/*`.
- Next.js: lees eerst de docs in `node_modules/next/dist/docs/` (breaking changes).
- Vite: voeg `vercel.json` toe (zie `icm-academy/vercel.json` of `nandan-surinami/vercel.json`).
- Structuur:
  - `lib/content.ts` (of `src/content/`): alle copy, diensten, cases, teksten. Geen content in componenten.
  - `lib/gsap.ts`: plugins eenmalig registreren.
  - `components/providers/SmoothScroll.tsx`: Lenis op `gsap.ticker` (referentie: `amaezin-design/src/components/SmoothScroll.tsx`).
  - `components/reactbits/` of `components/fx/`: aangepaste React Bits-componenten.
  - Next: `app/robots.ts`, `app/sitemap.ts`, `opengraph-image`, `icon`, `not-found`, metadata per pagina.
- Design tokens (kleuren, fonts) als CSS-variabelen in `globals.css` / Tailwind-thema, afgeleid van het merk.

## 4. Bouwen
- Mobile first: ontwerp eerst op 360-390px, daarna tablet/desktop. Geen horizontale pagina-scroll.
- Volg de GSAP-regels uit `CLAUDE.md` en `greensock/gsap-skills`: `useGSAP` + `scope`, `matchMedia` voor responsive en reduced-motion, `quickTo` voor pointer-effecten, ScrollTrigger van boven naar beneden.
- Kies per sectie één duidelijk animatieconcept uit GSAP + React Bits (zie sectie "Nuttige repo's" in `CLAUDE.md`); niet alles overal. Kopieer React Bits-componenten en pas ze aan (comment "Adapted from React Bits… Changes: …").
- Behoud URL's van de oude site (bijv. `/grafisch-vormgever-<stad>`); voeg redirects toe voor wat verandert.
- Beelden via `next/image` (Next) met statische imports en blur placeholders, of geoptimaliseerde webp/avif bij Vite. Alt-teksten, `width`/`height`, lazy loading buiten de eerste viewport.
- Formulieren: server route + Resend met env vars, en een nette fallback (`mailto:`) als de key ontbreekt. Valideer client- én server-side.
- Toegankelijkheid: landmarks, focus-states, focus-trap en Esc in modals, voldoende contrast, `prefers-reduced-motion` met volledig leesbare statische variant.
- Is de rebuild nog niet live: `noindex` via `vercel.json` headers (`X-Robots-Tag`, `Referrer-Policy: no-referrer`) en/of `robots.txt` met `Disallow: /`.

## Performance gedurende het hele traject
Performance is een harde eis, zeker bij veel animatie. Volg de sectie "Performance" in `CLAUDE.md` en let tijdens het bouwen op:
- Stel per pagina een **budget** vast (LCP < 2,5 s, INP < 200 ms, CLS < 0,1, Lighthouse mobiel ≥ 90) en controleer dat na elke grote sectie, niet pas aan het eind.
- Animeer alleen `transform`/`opacity`; geen layout-properties, geen re-renders in animatielussen, één gedeelde ticker (GSAP + Lenis).
- Zware effecten (WebGL, noise, grote blur, video) lui laden, pauzeren buiten beeld, versimpelen op mobiel en uitschakelen bij reduced-motion.
- Splits zware onderdelen (`next/dynamic`/`React.lazy`), importeer alleen gebruikte GSAP-plugins, houd client components klein.
- Optimaliseer beelden en fonts direct bij het ophalen in stap 2 (webp/avif, juiste afmetingen, font-subset), met `priority` alleen voor het LCP-beeld.
- Kost een animatie merkbaar performance, vereenvoudig die dan of laat hem vervallen; leg dat vast in de oplevering.

## 5. Verifiëren
- In de folder: `npm install`, `npm run build` moet slagen; draai lint/typecheck als aanwezig.
- **Performance-check op de productiebuild** (`npm run start`/`preview`, niet dev): Lighthouse mobiel per hoofdpagina, een trace met 4x CPU-throttling en gethrottled netwerk (long tasks, layout shifts, dropped frames tijdens scrollen), en de bundlegrootte per route. Zit een pagina onder het budget, los dat op vóór oplevering; noteer de scores in de samenvatting.
- Draai de site (`npm run dev` of `start`) en controleer met Playwright/Chromium op telefoonbreedte (390px) en desktop: geen console-errors, geen horizontale scroll, menu, formulier en belangrijkste animaties werken, reduced-motion-variant is leesbaar. Maak screenshots van de belangrijkste pagina's.
- Loop de inventaris uit stap 2 na: staat alle content en elke pagina erin? Noteer wat bewust anders is of ontbreekt.
- Voeg eventuele tests toe waar logica zit (zoals content-integriteit in `field-guide`).

## 6. Oplevering
- `README.md` in de folder: link naar de oude site, stack, dev-commando's, structuur (waar staat content/GSAP/React Bits), env vars en **Vercel-instellingen** (Root Directory = de folder, framework preset).
- Commit op branch `<folder>-rebuild` met een duidelijke Nederlandstalige of Engelse boodschap (consistent met de log) en push. Maak **geen PR** tenzij de gebruiker erom vraagt.
- Sluit af met een korte samenvatting: wat is gebouwd, wat is bewust anders, wat ontbreekt of placeholder is, en welke stappen de gebruiker nog moet doen (Vercel-project koppelen, env vars, domein, noindex weghalen bij livegang).
