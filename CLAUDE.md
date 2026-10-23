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

> Let op: voor "Hairline" is `lucasmarkes/hairline` aangenomen (React-lijnfiguren). Er bestaat ook `howells/hairline` (chartbibliotheek). Controleer en pas aan als een andere bedoeld is.

## Werkwijze

1. Lees eerst de README (en eventuele `CLAUDE.md`/`AGENTS.md`) van de betreffende site.
2. Werk alleen binnen de folder van die site; draai `npm install`, `npm run dev` en `npm run build` **in die folder**.
3. Next.js-versies in deze repo kunnen breaking changes hebben (zie `boodschappen/AGENTS.md`): lees de docs in `node_modules/next/dist/docs/` voordat je Next-code schrijft.
4. Volg de GSAP-patronen uit `greensock/gsap-skills`; kopieer React Bits-componenten naar de site en pas ze aan in plaats van extra animatielibraries toe te voegen.
5. Commit klein en in het Nederlands of Engels, consistent met de bestaande log. Maak geen PR tenzij daarom gevraagd wordt.
