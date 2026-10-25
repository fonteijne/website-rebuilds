# Kookstappen

Webapp voor mensen met AD(H)D die willen koken. Je maakt een foto van de bereidingswijze (van een verpakking, receptkaart of kookboek). De app maakt daar een afvinklijst van waarin elke stap precies één handeling is.

- **Foto → stappen**: de foto wordt in de browser verkleind en naar `/api/steps` gestuurd. Die route vraagt een vision-model via [OpenRouter](https://openrouter.ai) om de instructies op te knippen (JSON-schema, `strict`).
- **Eén stap tegelijk** (standaard): grote tekst, één grote knop "Klaar", met eronder alleen een klein voorbeeld van de volgende stap. Met "Vorige" zet je een stap terug.
- **Lijstweergave**: alle stappen met grote vinkvakken. Je kunt in elke volgorde afvinken.
- **Timers**: stappen met een tijd ("bak 5 minuten") krijgen een timerknop. Timers lopen door in een balk onderin, piepen en trillen als de tijd om is, en blijven werken na een herlaadbeurt. Bij stappen waar je tijdens het wachten verder kunt (`parallel`), schuift de app na het starten meteen door naar de volgende stap.
- **Keuzes**: alternatieven zoals "koekenpan / oven / magnetron" worden één keuzestap. Je ziet daarna alleen de stappen van wat je gekozen hebt.
- **Klaarzetten**: als er ingrediënten bekend zijn, begin je met een korte checklist om alles klaar te zetten. Die kun je overslaan.
- **Scherm blijft aan** tijdens het koken (Wake Lock API).
- Recept en voortgang staan in `localStorage`, dus alleen op dit apparaat. Open je de app opnieuw, dan ga je verder waar je was.
- Er zit een **voorbeeld** in (wraps met pulled chicken) dat ook werkt zonder OpenRouter-key.

## Stack

- Next.js 16 (App Router), React 19 en TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Lettertype: Atkinson Hyperlegible via `next/font`, gemaakt voor goede leesbaarheid
- Geen animatielibrary. De enige animaties zijn kleine CSS-overgangen (alleen `transform`/`opacity`), en die staan uit bij `prefers-reduced-motion`. GSAP en Lenis uit de standaardstack zijn bewust weggelaten: deze app heeft geen scroll-animaties nodig, en zo blijft de bundel klein.

## Ontwikkelen

```bash
cd kookstappen
npm install
cp .env.example .env.local   # vul OPENROUTER_API_KEY in
npm run dev                  # http://localhost:3000
npm run build && npm run start
npm run typecheck
```

Op een telefoon in hetzelfde wifi-netwerk: `npm run dev -- -H 0.0.0.0`, en open dan `http://<ip-van-je-laptop>:3000`. De camera opent via het bestandsveld (`capture="environment"`). Daarvoor is geen https nodig.

## Omgevingsvariabelen

| Naam | Verplicht | Uitleg |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | ja | Key van <https://openrouter.ai/keys>. Zonder key toont de app een melding, en werkt alleen het voorbeeld. |
| `OPENROUTER_MODEL` | nee | Standaard `google/gemini-3.8-flash` (snel, goedkoop, leest tekst op foto's goed). Elk OpenRouter-model dat afbeeldingen accepteert werkt, bijv. `anthropic/claude-haiku-5.5` of `openai/gpt-6-luna`. Ondersteunt het model geen `json_schema`, dan probeert de route het automatisch opnieuw zonder. |
| `OPENROUTER_REASONING` | nee | Hoeveel het model "nadenkt": `none`, `low` (standaard), `medium` of `high`. Getest met de wraps-foto: `low` duurt ~16 s en kost ~1 cent, de standaardinstelling van het model ~33 s en ~2 cent, bij vergelijkbare stappen. |
| `ACCESS_CODE` | nee | Aanrader als de site openbaar staat. Wie de app gebruikt, moet dan eenmalig deze code invullen (die wordt lokaal bewaard). Zo gebruikt niet iedereen met de link jouw OpenRouter-tegoed. |
| `SITE_URL` | nee | Wordt als `HTTP-Referer` meegestuurd, zodat de app herkenbaar is in je OpenRouter-dashboard. |
| `OPENROUTER_BASE_URL` | nee | Alleen voor tests of een proxy (standaard `https://openrouter.ai/api/v1`). |

Tip: zet in OpenRouter een kredietlimiet op de key. Eén foto kost met het standaardmodel ongeveer 1 cent (~2000 tokens in, ~2200 uit). OpenRouter reserveert per verzoek tegoed voor `max_tokens` (5000), dus houd minimaal ~3 cent saldo op het account. Anders weigert OpenRouter het verzoek (402) en meldt de app dat het tegoed op is. Het tokengebruik en de kosten per aanroep staan in de serverlogs (`OpenRouter <model>: … in, … uit, $…`).

## Structuur

```
app/
  api/steps/route.ts   POST: foto's/tekst → recept (OpenRouter); GET: status (key aanwezig, code nodig)
  layout.tsx, page.tsx, manifest.ts, icon.svg, apple-icon.png
components/
  App.tsx              schermwissel, opslag, API-aanroep
  Home.tsx             foto maken/kiezen, tekst plakken, recente recepten
  Cook.tsx             koken: klaarzetten, één-stap-weergave, lijst, klaar-scherm
  Timers.tsx           timerbalk met geluid en trillen
  hooks.ts             useNow (één interval), useWakeLock
lib/
  prompt.ts            systeemprompt + JSON-schema (hier stuur je de "één handeling"-regels bij)
  openrouter.ts        OpenRouter-client
  normalize.ts         modeluitvoer valideren en begrenzen
  flow.ts              recept + keuzes → platte afvinklijst
  storage.ts           localStorage
  image.ts             foto verkleinen (max. 1800 px, JPEG) vóór upload
  example.ts           voorbeeldrecept
```

## Vercel

- Project `kookstappen` in team KERS (<https://kookstappen.vercel.app>), gekoppeld aan deze repo met Root Directory `kookstappen` en preset Next.js.
- **Openbaar** (geen Vercel Authentication). Iedereen met de link kan de app gebruiken, en dus ook het OpenRouter-tegoed. De key heeft daarom een limiet van $1. Zet `ACCESS_CODE` als je dat later wilt afschermen.
- Env vars: `OPENROUTER_API_KEY` (sensitive, production + preview). Optioneel: `OPENROUTER_MODEL`, `OPENROUTER_REASONING`, `ACCESS_CODE`.
- Ignored Build Step: `git diff --quiet HEAD^ HEAD -- .`, zodat pushes voor andere sites geen build van deze app starten.
- `vercel.json` stuurt de headers `X-Robots-Tag: noindex, nofollow` en `Referrer-Policy: no-referrer` mee. Het is een persoonlijke tool, geen site om in Google te vinden.
- `/api/steps` heeft `maxDuration = 120`: vision-modellen hebben soms 20 tot 40 seconden nodig, en bij kapotte JSON probeert de route het één keer opnieuw.
- Foto's worden in de browser verkleind tot zo'n 0,5 tot 1 MB per stuk, met maximaal 4 foto's. Zo blijft het verzoek onder de bodylimiet van 4,5 MB voor Vercel Functions.
