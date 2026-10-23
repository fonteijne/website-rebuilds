# Single Prompt Studio — singlepromptstudio.com

Leadfunnel voor de services van Single Prompt Studio: **“Alles kan met één prompt. Nul iteraties.”**
Geen bestaande site; dit is een nieuwe build. De richting staat in [`vision.md`](./vision.md). Lees die vóór elke wijziging en toets nieuwe features aan de beslisregel onderaan.

**Kleuren:** donker, met GT-blauw `#ABE0E0` (accent) en GT-oranje `#EE7041` (actie). Tokens in `app/globals.css` (`gt-blue`, `gt-orange`/`signal`, `ink`, `paper`); zie ook vision.md, "Merk en vormgeving".

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · GSAP 3 (ScrollTrigger, SplitText, DrawSVG, `@gsap/react`) · Lenis · React Bits (aangepast, in `components/fx`) · Upstash Redis · Resend (via `fetch`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # productiebuild testen
npm run typecheck
```

Lokaal de hele funnel testen zonder accounts: `LEAD_STORE=memory ADMIN_USER=admin ADMIN_PASSWORD=test npm run start`.

## De funnel

1. **Homepage** (`/`): belofte + één groot promptveld met inspiratieknoppen en schrijfhulp “Ik wil … voor … zodat …”.
2. **E-mailstap** (in hetzelfde blok): “Waar mogen we je voorstel naartoe sturen?”, plus een los, niet aangevinkt vakje voor marketing.
3. **`/api/aanvraag`** slaat de aanvraag op en mailt een interne melding en een ontvangstbevestiging (“Dit is jouw prompt. Dit gebeurt er nu.”).
4. **`/bedankt`**: “Je prompt is binnen.”, met een kopie van de prompt (uit `sessionStorage`) en de volgende stappen. `noindex`.
5. **`/beheer`**: intern overzicht van aanvragen met status (nieuw → in beoordeling → voorstel verstuurd → akkoord → opgeleverd / niet passend), funneltellers en opt-ins. Het voorstel zelf gaat voorlopig per mail (de e-mailknop opent je mail met de prompt erin).

Daarnaast staan op de homepage: demo's (gelabeld als **Demo**), “Nul iteraties”, de werkwijze, de vier services (elke kaart vult het promptveld met een startzin), een **voorbeeld**voorstel zonder prijs of termijn, FAQ en een slot-CTA.

## Structuur

- `vision.md`: visie en beslisregel (leidend)
- `lib/content.ts`: alle copy. Geen content in componenten.
- `lib/gsap.ts`: plugins op één plek registreren, plus `MOTION_OK`/`FINE_POINTER` en `whenNear()` (animaties pas opzetten als een sectie in de buurt komt)
- `lib/lead.ts`: gedeelde validatie, statussen, funnel-events
- `lib/store.ts`: Upstash-opslag (en een geheugenvariant voor lokaal testen)
- `lib/mail.ts`: Resend-mails
- `lib/track.ts`: anonieme funneltellers via `sendBeacon` (geen cookies)
- `components/providers/SmoothScroll.tsx`: Lenis op `gsap.ticker`, gesynchroniseerd met ScrollTrigger
- `components/funnel/`: `PromptForm` (stap 1 en 2), `ThanksView`, `PromptButton`
- `components/home/`: secties van de homepage
- `components/fx/`: aangepaste React Bits-componenten (SplitText → `SplitHeading`, ScrollVelocity, SpotlightCard, Magnet) plus `Reveal`. Licentie: MIT + Commons Clause (`components/fx/LICENSE.md`).
- `proxy.ts`: Basic Auth voor `/beheer` en `/api/beheer/*` (Next 16: `proxy` vervangt `middleware`)

## Animatieconcept (per sectie één idee)

| Sectie | Animatie |
|---|---|
| Hero | CSS-intro (geen wachten op JS voor LCP), livrei-boog die inzwaait, getypte voorbeeldprompts in het lege veld, gloed die de muis volgt (`quickTo`) |
| Band | ScrollVelocity met merkzinnen op een blauwe band met oranje randen |
| Demo's | prompt typt zich, pijl tekent zich (DrawSVG), resultaat valt op zijn plek; mobiel een native swipe-rij |
| Nul iteraties | versies worden doorgestreept op scroll, teller loopt van 4 naar 0 |
| Werkwijze | voortgangslijn op scroll (horizontaal op desktop, verticaal op mobiel) |
| Diensten | SpotlightCard op fijne pointers |
| Koppen | SplitText-lijnen met mask |

Bij `prefers-reduced-motion` staat alles statisch in de eindstand en draait Lenis zonder smoothing.

## Env vars (Vercel)

| Variabele | Waarvoor |
|---|---|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` (of `UPSTASH_REDIS_REST_URL` / `_TOKEN`) | Opslag van aanvragen, opt-ins en tellers. Koppel een Upstash Redis-store via Vercel Marketplace. |
| `RESEND_API_KEY` | E-mail versturen |
| `LEAD_FROM_EMAIL` | Afzender, bijv. `Single Prompt Studio <hallo@singlepromptstudio.com>` (domein verifiëren in Resend; anders kan Resend niet naar bezoekers mailen) |
| `LEAD_TO_EMAIL` | Ontvanger van interne meldingen (standaard `hallo@singlepromptstudio.com`) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Toegang tot `/beheer`. Zonder deze vars geeft `/beheer` een 404. |
| `LEAD_STORE=memory` | Alleen lokaal: opslag in geheugen |

Fallbacks: zonder opslag én zonder Resend geeft `/api/aanvraag` een 501 en opent het formulier de mailclient van de bezoeker met de prompt erin. Met maar één van de twee werkt de aanvraag gewoon.

## Vercel

- Root Directory: `single-prompt-studio`. Framework preset: Next.js.
- `vercel.json` zet `X-Robots-Tag: noindex` en `Referrer-Policy: no-referrer`. **Haal die header weg bij livegang**, zodat Google de site indexeert.
- Domein `singlepromptstudio.com` koppelen aan het project.

## Gemeten (productiebuild, lokaal)

- Lighthouse mobiel `/`: Performance 93–95, Accessibility 100, Best Practices 100, SEO 100. TBT ~190 ms, CLS 0,001. Gesimuleerde LCP 2,5–2,9 s; de gemeten LCP is 0,2 s. Het verschil komt door de framework-JS (React/Next ~160 KB gz) die Lighthouse in de simulatie meetelt.
- `/privacy` 98, `/bedankt` 96 (SEO 66 door de bewuste `noindex`).
- Scrolltrace met 4x CPU-throttling en traag netwerk: geen long tasks tijdens scrollen, 1–2% gemiste frames (p95 17 ms), CLS ≈ 0,01.
- Geen horizontale scroll op 390 px, geen console-errors.

## Nog te beslissen of te vullen

Zie “Open besluiten” in `vision.md`. Concreet in de code:
- Prijzen, levertermijnen en reactietermijnen staan nergens op de site (bewust). Vul ze pas in `lib/content.ts` in als ze vastliggen.
- `/privacy` is een concept met placeholders: `[bedrijfsnaam]`, `[KvK-nummer]`, `[Bewaartermijn vaststellen.]`.
- `hallo@singlepromptstudio.com` is aangenomen (`site.email` in `lib/content.ts`).
- Er bestaan nog geen klantcases; demo's blijven als demo gelabeld.
