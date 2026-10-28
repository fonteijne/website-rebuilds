# BonzaiWork: productiefrontend

De werkapp van BonzaiWork: projecten, chats met AI, routines en instellingen in één app, project first.
Gebouwd volgens het frontend-contract (`openwork/docs/bonzaiwork/frontend-contract.md`, gerenderd op
[bonzaiwork-frontend-contract.vercel.app](https://bonzaiwork-frontend-contract.vercel.app)) en de
ontwerpregels uit `openwork/DESIGN.md`. De map is zelfstandig, zodat hij later als geheel naar
`openwork/apps/bonzaiwork` kan (zie [Naar openwork](#naar-openwork)).

```bash
npm install
npm run dev        # http://localhost:5183 (demo)
npm run build      # typecheck + productiebuild in dist/
npm run preview    # test de productiebuild, niet de dev-server
npm test           # vitest: planning, markdown, v2-engine, prompt-codering, serverfouten
npm run typecheck
```

## Twee backends, één interface

Alle schermen praten met `Backend` (`src/backend/types.ts`). `src/backend/select.ts` kiest er één; beide
zijn een eigen chunk, dus de demo-data komt nooit in de desktop-app en de live-client nooit in de preview.

| Backend | Wanneer | Wat |
| --- | --- | --- |
| **Demo** (`src/backend/demo/`) | Overal waar geen lokale server is, zoals de Vercel-preview | Draait volledig in de browser: Nederlandse mkb-voorbeeldprojecten, streamende antwoorden met stappen, toestemmingen, vragen, mislukte runs, routines met gemiste runs. Staat in `localStorage`. |
| **Live** (`src/backend/live/`) | In de BonzaiWork-desktopshell (Electron-bridge), of in dev met `?server=…&token=…` | De lokale OpenWork-server, de native OpenCode v2-engine per project (`/workspace/:id/opencode2/api/…`, SSE-events) en de BonzaiWork-routes (`/bonzaiwork/keys/…`, `packages/bonzaiwork-litellm`). |

**Demo-schakelaars** (in de URL, vóór de `#`):

- `?demo=leeg`: begint zonder projecten (eerste start, onboarding).
- `?sleutel=gebruiker`: keymodus per gebruiker in plaats van per project (beslissing O1).
- Typ in een chat "budget op" of `#fout` om de foutstaten te zien. De reset staat bij Instellingen.

**Live tegen een lokale server (dev):**

```bash
# in openwork/apps/server, met een of meer projectmappen
OPENWORK_TOKEN=dev-owner OPENWORK_HOST_TOKEN=dev-host OPENWORK_APPROVAL_MODE=auto \
  bun --conditions=development src/cli.ts --workspace ~/BonzaiWork/Offertes --port 8787
# daarna
open "http://localhost:5183/?server=http://127.0.0.1:8787&token=dev-owner&hostToken=dev-host"
```

CORS staat standaard open (`*`). Zonder `hostToken` is de app alleen-lezen. `OPENWORK_APPROVAL_MODE=auto`
doet wat de desktopshell ook doet: zonder die instelling wachten schrijfacties 30 s op goedkeuring en
geeft de server `write_denied`. Voor keys moet de server met de BonzaiWork-hooks draaien
(`OPENWORK_SERVER_HOOKS`, `BONZAIWORK_LITELLM_BASE_URL`, `BONZAIWORK_KEY_MODE`).

### Wat de live backend doet

- **Projecten** zijn OpenWork-workspaces. Kleur, icoon, beschrijving, vastzetten en archiveren horen bij de
  metadata-routes uit contract §7. Bestaan die nog niet (`/bonzaiwork/projects` geeft 404), dan bewaart de
  app ze per apparaat (`meta.ts`). Dat staat ook in de interface (`capabilities.projectMeta`).
- **Chats** gaan via de native v2-engine: sessies, berichtpagina's, prompt (met `steer` tijdens een run),
  stoppen, terugdraaien en herstellen, afsplitsen, model en agent per chat. Events zijn hints: na een run
  haalt de app de historie opnieuw op, en laatkomers van verwijderde of afgesplitste sessies worden genegeerd.
- **Bijlagen** gaan naar de inbox van het project en worden in OpenWorks eigen formaat in de prompt gezet.
- **Toestemmingen en vragen** komen als kaart boven de composer (⏎ toestaan, esc weigeren).
- **Projectinstellingen**: key en modellen, instructies, skills, commando's, connecties (MCP), extra mappen,
  bestanden (alleen-lezen) en activiteit. Globale skills en commando's zijn live alleen-lezen.
- **Serverfouten** worden Nederlands (`http.ts`). De Engelse zin van de server blijft op `detail` en
  verschijnt nooit op het scherm.
- **Routines, verbruik en zoeken in inhoud** hebben de §7-routes nodig. Zonder die routes tonen ze hun
  vergrendelde staat met uitleg (DESIGN.md P4) in plaats van een fout.

Live geverifieerd tegen een echte openwork-server met v2-engine en een LiteLLM-stand-in: projectlijst en
key-status, key koppelen, chat starten, streamen, lees- en schrijfstappen, bestanden in de sidecar,
stoppen, een echte toestemming (Gmail-concept) toestaan en weigeren, vraagformulier, terugdraaien en
herstellen, afsplitsen, groepen, alle instellingssecties, skill toevoegen, connectie toevoegen (opgeslagen
terwijl de tools nog starten), nieuw project in de gedeelde BonzaiWork-map en een bijlage uploaden.

## Stack

- **Vite 6 + React 19 + TypeScript** (strict, geen `any` of `as`, net als in openwork).
- **Tailwind CSS v4** (`@tailwindcss/vite`) met de OpenWork-tokens (Radix sage, licht en donker).
- **Base UI** voor dialogen, menu's, selects, popovers, tooltips, switches en toasts: toegankelijk
  (focus-trap, esc, focus terug naar de trigger) en hetzelfde als in openwork.
- **TanStack Query** voor serverdata, **zustand** voor de runtime per project (chats, streams, wachtrijen).
- **marked + DOMPurify** voor antwoorden van het model (onvertrouwd: alles wordt gesaneerd).
- **lucide-react** iconen, systeemlettertype (geen webfonts).

**Bewust geen GSAP, Lenis of React Bits.** Dit is een werkapp, geen marketingsite. Beweging is kort en
functioneel (CSS-transities op `transform`/`opacity`, 100–200 ms). Lenis zou de eigen scrollcontainers van
chat en lijsten in de weg zitten, net als het vastplakken aan het nieuwste bericht tijdens het streamen. Bij
`prefers-reduced-motion` staan alle transities en de shimmer uit.

## Structuur

```
src/
  main.tsx, app.tsx      opstart, hash-router, lazy pagina's
  copy.ts                alle teksten (Nederlands, DESIGN.md C1–C7)
  styles.css             tokens, thema's, prose, reduced motion
  backend/
    types.ts             domein en Backend-interface (+ Capabilities)
    queries.ts           TanStack Query-hooks
    select.ts            demo of live
    demo/                in-browser backend (seed, antwoorden, planner)
    live/                OpenWork-server, v2-engine, events, meta, desktop-bridge
  components/ui/         Button, Field, Dialog/Sheet, Menu, Select, Tooltip, Toast, …
  features/
    onboarding/          5.1
    projects/            5.2 overzicht, 5.3 nieuw project
    project/, chat/      5.4 chatlijst, chat, composer, kaarten, sidecar
    settings/            5.5 projectinstellingen, 5.7 app-instellingen
    routines/            5.6 overzicht, editor, historie
    shell/               zijbalk/lade, commandopalet (⌘K), UI-state
  lib/                   opmaak (nl-NL), planning (DST), tools in woorden, markdown, idle, lazy modules
```

Routes (hash, zodat dezelfde build ook vanaf `file://` in Electron werkt): `#/`, `#/p/:id`,
`#/p/:id/c/:chat`, `#/p/:id/routines[/:rid]`, `#/p/:id/instellingen[/:sectie]`, `#/routines[/:rid]`,
`#/instellingen`.

## Kwaliteit

**Performance** (productiebuild, Lighthouse 12 mobiel, gesimuleerde 4G en 4x CPU, mediaan van 3 runs):

| Pagina | Performance | Toegankelijkheid | Best practices | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Projecten `#/` | 93 | 100 | 100 | 2,3–2,7 s | 160–310 ms | 0,02 |
| Chat `#/p/…/c/…` | 91 | 100 | 100 | 3,1–3,2 s | 100–160 ms | 0 |

Hoe: alleen de projectlijst zit in de eerste chunk (50 kB gzip, plus React 69 kB). De andere pagina's,
het commandopalet en dialogen laden per route of bij eerste gebruik; de projectpagina wordt al opgehaald
zodra een pointer of focus op een projectlink komt. Base UI zit niet in de eerste lading: menu's en
tooltips worden in rusttijd één voor één echt (tooltips alleen op schermen met hover), dialogen bij het
eerste openen en toasts worden tot dan bewaard. Verder: een statisch skelet in `index.html` (eerste paint
zonder JS), gememoïseerde rijen, een vaste volgorde tot alle samenvattingen binnen zijn (geen
layoutverschuiving) en `Intl`-formatters die één keer worden gemaakt.

Afwijking: de LCP van de chat (3,1 s gesimuleerd) ligt boven de 2,5 s, omdat het eerste antwoord pas na
drie chunks (app, backend, chatpagina) op het scherm staat. In de echte lokale app (geen netwerk) zijn
dat milliseconden; gemeten zonder throttling ligt LCP rond 0,8 s (projecten 0,5 s).

**Toegankelijkheid**: landmarks per pagina, alle iconknoppen met een naam (ook op mobiel), focus-trap en
esc in dialogen en sheets, focus terug naar de trigger, toetsenbord in lijsten en menu's, ⏎/esc op
toestemmingskaarten, slash-menu via `aria-activedescendant`, contrast AA (ook de kleine grijze tekst),
`prefers-reduced-motion`. Mobiel zonder horizontale scroll; de zijbalk wordt een lade, de sidecar een sheet.

## Open beslissingen uit het contract (§8)

| | Zo opgelost | Aan te passen in |
| --- | --- | --- |
| O1 key per gebruiker of project | Beide; de server bepaalt (`keyMode`). Standaard per project: geen key-stap in onboarding, wel een key-sectie per project. | `features/onboarding`, `settings/project-settings.tsx` |
| P1 project = één map | Ja, met "Extra mappen" in de projectinstellingen. | — |
| P2 waar nieuwe projecten komen | Standaardmap (instelbaar bij Instellingen, anders de gedeelde BonzaiWork-map naast bestaande projecten of `~/BonzaiWork`); een bestaande map kan ook (in de desktop-app met de mapkiezer, anders door het pad in te vullen). | `projects/new-project-dialog.tsx`, `live/index.ts` (`defaultFolder`) |
| P3 project verwijderen | Alleen loskoppelen; de map blijft staan, en dat staat in de bevestiging. | `copy.projects.removeBody` |
| R1 gemiste routines | Alleen tonen als "Gemist: de app was gesloten", met "Nu uitvoeren". | `backend/demo/index.ts`, §7.4 op de server |
| R2 routine zonder toestemming | Wacht op de gebruiker; de routine en haar chat staan dan op "wacht op jou". | — |

## Bekende grenzen

- Routines, verbruik per project en zoeken in berichtinhoud wachten op de §7-routes in de OpenWork-server.
  De interface en de demo hebben ze al.
- Globale skills en commando's zijn in de live app alleen-lezen.
- De stand voor uitvoeren ("Uitvoeren"-pill) kan de v2-engine nog niet wisselen; de app zegt dat ook zo.
- Meldingen van het besturingssysteem staan uit tot de desktopshell ze aanbiedt (`capabilities.notifications`).

## Vercel

- Eigen Vercel-project met **Root Directory** `bonzaiwork`, framework preset **Vite**, build `npm run build`,
  output `dist`. Er zijn geen environment variables nodig: de preview draait altijd de demo.
- `vercel.json` zet `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, een strikte CSP (het
  inline themascript staat er met zijn sha256-hash in; wijzig je dat script, werk dan de hash bij),
  `nosniff`, een `Permissions-Policy` en immutable caching voor `/assets/*`.

## Naar openwork

De map gebruikt geen gedeelde code en heeft een eigen fetch-client, zodat overzetten vooral kopiëren is:

1. Vervang `openwork/apps/bonzaiwork/src`, `index.html` en `vite.config.ts` door deze versies. Laat
   `desktop-main/` en `scripts/` (Electron-entry en packaging) staan.
2. Zet de dependencies over in `apps/bonzaiwork/package.json`: `@base-ui/react`, `@tanstack/react-query`,
   `zustand`, `marked`, `dompurify`, `tailwind-merge` (via de pnpm-catalog waar die bestaat). Installeer
   met `pnpm`, niet met npm.
3. Houd de alias `~/` voor eigen code; `@/` blijft vrij voor imports uit OpenWork.
4. `base: "./"` en de hash-router laten dezelfde build vanaf `file://` draaien. De app vindt de server via
   `window.__OPENWORK_ELECTRON__` (`live/desktop.ts`).
5. Bouw daarna de §7-routes in de server. De app detecteert ze zelf (`/bonzaiwork/projects`,
   `/bonzaiwork/routines`) en schakelt routines, verbruik en metadata op de server dan vanzelf in.
