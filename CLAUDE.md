# website-rebuilds

Verzamelrepo waarin we bestaande websites opnieuw opbouwen (rebuild/revamp): zelfde merk en inhoud, maar mobile first, snel en met nette animaties. Eén repo, meerdere onafhankelijke websites.

## Structuur: één website = één folder

- Elke website staat in een **eigen folder in de root** (bijv. `amaezin-design/`, `brandagency/`, `boodschappen/`, `field-guide/`, `icm-academy/`, `nandan-surinami/`).
- Elke folder is een **zelfstandig project** met een eigen `package.json`, `package-lock.json`, `README.md` en (waar nodig) `vercel.json`. Niets delen via de root: geen root-`package.json`, geen gedeelde `node_modules`, geen imports tussen folders.
- Folders heten in kebab-case, naar de klant/het project.
- Nieuwe website? Maak een nieuwe folder, werk op een eigen branch (`<naam>-rebuild`) en voeg een README toe met stack, dev-commando's, structuur en Vercel-instellingen.
- Wijzig nooit een andere website dan waar de opdracht over gaat.
- Per site mag een eigen `CLAUDE.md` of `AGENTS.md` staan (zie `icm-academy/CLAUDE.md`, `boodschappen/AGENTS.md`). Lees die eerst als je in die folder werkt; ze gaan voor op dit bestand.

## Hosting: alles op Vercel

- Elke website is een **eigen Vercel-project** met de **Root Directory** op de folder van die site (bijv. `amaezin-design`).
- Framework preset: Next.js voor Next-sites, Vite voor Vite-sites. Bij Vite-sites staat een `vercel.json` in de folder (`framework`, `buildCommand`, `outputDirectory: dist`, SPA-rewrite naar `/index.html` waar nodig, immutable cache voor `/assets/*`).
- Geheimen (bijv. `RESEND_API_KEY`, Upstash-keys) horen alleen in Vercel env vars, nooit in de repo. Documenteer benodigde env vars in de README van de site, en zorg voor een nette fallback als ze ontbreken.
- Rebuilds die nog niet live mogen zijn: voeg `X-Robots-Tag: noindex, nofollow` en `Referrer-Policy: no-referrer` headers toe via `vercel.json` (zoals in `nandan-surinami`).
- Controleer vóór oplevering dat `npm run build` lokaal slaagt in de folder zelf.

## Standaard stack

Wat we tot nu toe gebruikt hebben en als default aanhouden:

- **Next.js (App Router)** voor sites met server-kant (API routes, forms, auth) of veel SEO-pagina's; **Vite + React** voor pure client-side/statische sites. Beide met **React 19**, **TypeScript** waar het kan.
- **Tailwind CSS v4** (`@tailwindcss/postcss` bij Next, `@tailwindcss/vite` bij Vite).
- **GSAP 3** (alle plugins gratis sinds 3.13: ScrollTrigger, SplitText, Flip, DrawSVG, ...) via `@gsap/react`.
- **Lenis** voor smooth scroll, aangedreven door `gsap.ticker` en gesynchroniseerd met ScrollTrigger. Touch blijft native.
- **React Bits** componenten, gekopieerd (niet als dependency) naar de site, bijv. `src/components/reactbits/` of `components/rb/`.
- Content hoort in een eigen bestand (`lib/content.ts` of `src/content/`), niet verspreid door componenten.
- Fonts via `@fontsource/*` of `next/font`; beelden via `next/image` waar mogelijk.

### Kwaliteitseisen voor elke site
- Mobile first; werkt zonder horizontale scroll op telefoonbreedte.
- `prefers-reduced-motion` wordt overal gerespecteerd (statische, volledig leesbare variant).
- Toetsenbord- en screenreader-vriendelijk (focus-trap in modals, Esc, juiste landmarks en alt-teksten).
- GSAP altijd met `useGSAP` + `scope`, nooit onbegrensde selectors; ScrollTrigger van boven naar beneden aanmaken; `gsap.matchMedia()` voor responsive en reduced-motion.
- Niet blind kopiëren van het oude design: behoud merk, kleuren, copy en URL's (voor SEO), maar bouw het opnieuw op.

## Nuttige repo's (doelgericht inzetten)

Gebruikt in eerdere sites:

| Repo | Waarvoor | Gebruikt in |
| --- | --- | --- |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | Officiële GSAP-patronen/skills voor AI-agents: `useGSAP`, scoped selectors, `matchMedia`, `quickTo`, cleanup. Leidend bij elke GSAP-code. | brandagency, nandan-surinami, field-guide |
| [greensock/GSAP](https://github.com/greensock/GSAP) | GSAP zelf (plugins gratis). Voor API-details en changelog. | alle sites |
| [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) ([reactbits.dev](https://reactbits.dev)) | Animatiecomponenten om te kopiëren: StaggeredMenu, FlowingMenu, ScrollReveal, ScrollVelocity, SplitText, CountUp, Magnet, Noise, SpotlightCard, ShinyText, ClickSpark, TiltedCard, LogoLoop, Grainient. Licentie MIT + Commons Clause: gebruiken in een app is oké, niet herdistribueren. | alle sites |
| [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | Smooth scroll. Altijd koppelen aan `gsap.ticker`. | alle sites |

Aanvullend, gericht in te zetten:

| Repo | Waarvoor | Wanneer |
| --- | --- | --- |
| [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline) | Isometrische lijnfiguren die op de pointer reageren (React, SVG, shadcn-registry). | Als een site een verfijnde, minimalistische line-art/illustratielaag nodig heeft: hero's, lege staten, feature-visuals. |
| [almanalaysay93-gif/designme](https://github.com/almanalaysay93-gif/designme) | Motion-studio voor Claude Code (agents, stijlbibliotheek, HyperFrames, Remotion, Hairline, motionmaxxing). | Bij het ontwerpen van motion/video of als stijlinspiratie voor een nieuwe site. |
| [MasterKale/SimpleWebAuthn](https://github.com/MasterKale/SimpleWebAuthn) | Passkeys (WebAuthn). | Sites met inloggen zonder wachtwoord (zie `boodschappen`). |
| [upstash/redis-js](https://github.com/upstash/redis-js) | Serverless Redis via Vercel/Upstash. | Eenvoudige opslag zonder eigen database (zie `boodschappen`). |
| [resend](https://resend.com) | Mail versturen vanuit contactformulieren via `/api/contact`. | Elk formulier dat echt moet verzenden (zie `amaezin-design`). |

### Instructies per repo

**greensock/gsap-skills** (leidend voor alle animatiecode)
- Lees de relevante skill vóór je GSAP schrijft (o.a. `gsap-react`, `gsap-scrolltrigger`, `gsap-performance`) en verwijs in comments naar de gebruikte skill, zoals in `amaezin-design/src/lib/gsap.ts`.
- Registreer plugins op één plek per site (`lib/gsap.ts`: `gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, ...)`) en importeer `gsap`, `ScrollTrigger` en `useGSAP` altijd vanaf daar.
- In React altijd `useGSAP` met een `scope` (ref) en `contextSafe` voor event handlers; nooit losse `gsap.to()` in `useEffect` zonder cleanup.
- Responsive en toegankelijk via `gsap.matchMedia()`: aparte takken voor desktop/mobiel en voor `prefers-reduced-motion: reduce`.
- Pointer-gedreven beweging (magneet, volg-cursor) met `gsap.quickTo`, geen React state per `mousemove`.
- Horizontale scroll met `ease: "none"`; ScrollTriggers van boven naar beneden aanmaken; na fonts/beelden/route-wissel `ScrollTrigger.refresh()`.
- Animeer alleen `transform` en `opacity`; vermijd layout-properties.

**greensock/GSAP** (naslag)
- Alle plugins zijn gratis sinds 3.13: importeer ze uit `gsap/<Plugin>` (bijv. `gsap/SplitText`), er is geen club-registry of token nodig.
- Gebruik de repo voor API-details en changelog, niet om GSAP te kopiëren. Houd `gsap` en `@gsap/react` in alle sites op dezelfde minor-versie.
- `SplitText`: maak masks (`mask: "lines"`) voor reveals, herbereken bij resize via `autoSplit`/`onSplit` en revert bij cleanup.

**darkroomengineering/lenis** (smooth scroll)
- Eén `SmoothScroll`-component per site, hoog in de tree (zie `amaezin-design/src/components/SmoothScroll.tsx` als referentie):
  - `autoRaf: false` en Lenis aandrijven via `gsap.ticker.add((t) => lenis.raf(t * 1000))` met `gsap.ticker.lagSmoothing(0)`;
  - `lenis.on("scroll", ScrollTrigger.update)` (of `useLenis(ScrollTrigger.update)` met `lenis/react`);
  - `syncTouch: false`, zodat touch native blijft.
- Reset bij routewissel naar boven (`scrollTo(0, { immediate: true, force: true })`) en refresh ScrollTrigger.
- Modals/menu's: pauzeer met `lenis.stop()` / `lenis.start()` (of `data-lenis-prevent` op scrollbare containers) in plaats van `overflow: hidden` te hacken.
- Bij `prefers-reduced-motion` Lenis niet starten.

**DavidHDev/react-bits** (componenten)
- Kopieer alleen de componenten die je gebruikt naar de site (`src/components/reactbits/` of `components/rb/`); voeg het pakket niet als dependency toe. Kies de variant die past bij de stack (TS + Tailwind of TS + CSS).
- Pas ze aan op onze regels en zet bovenin een comment wat is gewijzigd, zoals in `Magnet.tsx` ("Adapted from React Bits… Changes: …"):
  - waar mogelijk animaties naar GSAP porten in plaats van een extra animatielibrary (`motion` alleen als het niet anders kan);
  - pointer-effecten alleen op `(hover: hover) and (pointer: fine)`;
  - `prefers-reduced-motion` respecteren;
  - `'use client'` in Next.js, en WebGL-componenten (`Grainient`, `Noise`) lui laden en op mobiel zo nodig uitschakelen.
- Licentie: MIT + Commons Clause. Gebruik in een website is oké; de componenten niet los herverkopen of herdistribueren.

**lucasmarkes/hairline** (optioneel, line-art)
- Alleen inzetten als het design een lijn-illustratielaag vraagt. Installeer via de shadcn-registry/README van de repo en gebruik het als decoratief element (`aria-hidden`), nooit als enige drager van informatie.
- Laad het component client-side en lui; schakel de pointer-reactie uit bij `prefers-reduced-motion` en op touch.

**MasterKale/SimpleWebAuthn, upstash/redis-js, Resend** (alleen bij sites met backend)
- Passkeys: `@simplewebauthn/server` in route handlers, `@simplewebauthn/browser` in de client; sessies met `jose`. Zie `boodschappen` voor de werkende opzet.
- Upstash: `Redis.fromEnv()` met env vars uit Vercel; geen keys in de repo.
- Resend: contactformulier via `/api/contact`; zonder `RESEND_API_KEY` terugvallen op `mailto:` (zie `amaezin-design`).

> Let op: voor "Hairline" is `lucasmarkes/hairline` aangenomen (React-lijnfiguren). Er bestaat ook `howells/hairline` (chartbibliotheek). Controleer en pas aan als een andere bedoeld is.

## Werkwijze

1. Lees eerst de README (en eventuele `CLAUDE.md`/`AGENTS.md`) van de betreffende site.
2. Werk alleen binnen de folder van die site; draai `npm install`, `npm run dev` en `npm run build` **in die folder**.
3. Next.js-versies in deze repo kunnen breaking changes hebben (zie `boodschappen/AGENTS.md`): lees de docs in `node_modules/next/dist/docs/` voordat je Next-code schrijft.
4. Volg de GSAP-patronen uit `greensock/gsap-skills`; kopieer React Bits-componenten naar de site en pas ze aan in plaats van extra animatielibraries toe te voegen.
5. Commit klein en in het Nederlands of Engels, consistent met de bestaande log. Maak geen PR tenzij daarom gevraagd wordt.
