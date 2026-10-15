# Brand Agency — revamp

Volledige rebuild van [brandagency.nl](https://brandagency.nl): zelfde kleuren (#FF0064 / #1F7FFC), Montserrat, dezelfde inhoud en de horizontale scroll — opnieuw opgebouwd, mobile first.

- **Next.js 16** (App Router, alles statisch gegenereerd), **Tailwind 4**
- **GSAP** (ScrollTrigger, SplitText) volgens de officiële gsap-skills-patronen (`useGSAP`, scoped, cleanup)
- **Lenis** smooth scroll, gesynchroniseerd met de GSAP-ticker (touch blijft native)
- **React Bits**: StaggeredMenu, Noise (1-op-1), ScrollVelocity, SplitText, ScrollReveal, CountUp, Magnet (geport naar GSAP, geen extra animatielibrary)
- Beelden via `next/image` (AVIF/WebP, blur placeholders); `prefers-reduced-motion` wordt overal gerespecteerd

```bash
npm install
npm run dev
```

Content staat in `lib/content.ts`. Het contactformulier zet een e-mail klaar (mailto) — koppel later een mailservice (bv. Resend) voor echte verzending.
