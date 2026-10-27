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
npm run previews -- --missing          # alleen sites zonder preview
VERCEL_TOKEN=... npm run sync          # nieuwe Vercel-projecten van deze repo toevoegen
```

## Structuur

- `src/content/sites.json`: de lijst met sites (naam, URL, folder, branch, soort, stack, omschrijving); `sites.ts` geeft het type. Naam, omschrijving en soort mag je met de hand verbeteren, de sync laat die staan.
- `scripts/sync.mjs`: haalt via de Vercel-API alle projecten op die aan `fonteijne/website-rebuilds` gekoppeld zijn en een productie-deploy hebben. Nieuwe projecten komen bovenaan, met naam en omschrijving uit de `<title>` en meta description van de live site en soort `Site`. Bij bestaande sites werkt hij alleen url, branch, folder, stack en `protected` bij. Hij verwijdert nooit iets: projecten die niet (meer) gekoppeld zijn, zoals de CLI-deploys `knmi-assistent-demo` en `procrastinators-field-guide`, blijven staan.
- `public/previews/<slug>.webp`: screenshots (960×600) van de productie-URL, gemaakt met `prefers-reduced-motion` zodat intro-animaties al klaar zijn.
- `scripts/previews.mjs`: maakt de screenshots. Gebruikt de vooraf geïnstalleerde `playwright` en zet de PNG in de browser om naar webp, dus zonder extra dependencies.
- Sites met `protected: true` (Vercel-login, zoals `uitleg-modelwissel`) krijgen een placeholder in plaats van een screenshot.

## Automatisch bijwerken

`.github/workflows/overzicht-sync.yml` draait `sync` en daarna `previews --missing`, controleert de build en commit de wijzigingen naar `main`. Hij start:

- na elke geslaagde **productie-deploy** van een site uit deze repo (GitHub-event `deployment_status` van Vercel; deploys van `overzicht` zelf tellen niet mee);
- elke nacht om 04:17 UTC als vangnet;
- met de hand (Actions → "Overzicht bijwerken"), met de optie **refresh** om alle previews opnieuw te maken.

Geen loop: een commit met `GITHUB_TOKEN` start zelf geen workflows. De Vercel-deploys die erop volgen starten de workflow nog één keer, maar die run vindt geen nieuwe sites en maakt alleen ontbrekende previews, dus er valt niets te committen. Bestaande previews worden nooit automatisch ververst (die veranderen bij elke screenshot een beetje en zouden anders steeds een nieuwe commit geven).

Nodig: repository secret `VERCEL_TOKEN` (Vercel → Account Settings → Tokens, scope team KERS). `main` moet directe pushes van `github-actions[bot]` toestaan.

## Vercel

- Nieuw project, **Root Directory** `overzicht`, framework preset **Vite** (`vercel.json` staat erbij).
- `vercel.json` zet `X-Robots-Tag: noindex, nofollow` en `Referrer-Policy: no-referrer`: de lijst bevat rebuilds die nog niet live mogen.
- Geen env vars nodig.
