# Overzicht

Indexpagina met tegels en previews van alle sites uit deze repo die als eigen Vercel-project draaien.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · `@fontsource-variable/inter` + `@fontsource/jetbrains-mono`.
Bewust zonder GSAP/Lenis: één korte pagina, de animaties (tegels die binnenkomen, hover-zoom) zijn CSS op `transform`/`opacity` en staan uit bij `prefers-reduced-motion`.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build naar dist/
npm run preview    # productiebuild testen
npm run previews   # screenshots opnieuw maken (Playwright/Chromium)
npm run previews -- knmi kookstappen   # alleen deze slugs
```

## Structuur

- `src/content/sites.ts`: de lijst met sites (naam, URL, folder, branch, soort, stack, omschrijving). Nieuwe site gepubliceerd? Voeg hem hier toe en draai `npm run previews`.
- `public/previews/<slug>.webp`: screenshots (960×600) van de productie-URL, gemaakt met `prefers-reduced-motion` zodat intro-animaties al klaar zijn.
- `scripts/previews.mjs`: maakt de screenshots. Gebruikt de vooraf geïnstalleerde `playwright` en zet de PNG in de browser om naar webp, dus zonder extra dependencies.
- Sites met `protected: true` (Vercel-login, zoals `uitleg-modelwissel`) krijgen een placeholder in plaats van een screenshot.

## Vercel

- Nieuw project, **Root Directory** `overzicht`, framework preset **Vite** (`vercel.json` staat erbij).
- `vercel.json` zet `X-Robots-Tag: noindex, nofollow` en `Referrer-Policy: no-referrer`: de lijst bevat rebuilds die nog niet live mogen.
- Geen env vars nodig.
