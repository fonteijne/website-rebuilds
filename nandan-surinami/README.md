# H. Nandan Surinami — website rebuild

A full revamp of [nandansurinami.com](https://nandansurinami.com): the same brand, copy, products and
photography, rebuilt as a fast, animated single-page site.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static output in dist/
npm run preview
```

Stack: **Vite + React 19**, **GSAP 3** (all plugins are free since 3.13), **Lenis** smooth scroll and
components from **React Bits**. The GSAP code follows the official
[gsap-skills](https://github.com/greensock/gsap-skills) guidance: `useGSAP` with scoped selectors,
`gsap.matchMedia()` for responsive and reduced-motion branches, `quickTo` for pointer-driven motion,
`ease: "none"` for the horizontal scroll, and top-to-bottom ScrollTrigger creation.

## Page structure

| Section | What happens |
| --- | --- |
| Preloader | Logo with a radiating sunburst, a 000→100 counter and a two-panel wipe (GSAP timeline). Waits for fonts and the page to load, but never longer than 4s. |
| Nav | Hides on scroll down and returns on scroll up, with rolling hover labels, a magnetic CTA (React Bits `Magnet`) and a full-screen mobile menu that opens with a circular clip-path. |
| Hero | "Wordt een Wereldchef" reveals char by char (`SplitText` with masks). Floating masala packs follow the mouse (`quickTo`) and drift on scroll. A `RotatingText` cycles through dishes, a `CircularText` badge spins and the hero photo unfolds from an inset clip-path. |
| Marquee | Two crossing bands that speed up with scroll velocity (`ScrollVelocity`). |
| Hindostaanse Boemboe | A pinned horizontal scroll through the five new boemboes (`containerAnimation` for per-panel parallax). On mobile it becomes a native swipe row. Each panel opens a recipe sheet. |
| Recipe sheet | An accessible modal (focus trap, Esc, scroll lock via Lenis) with the original preparation steps and a `DrawSVG` progress rail. |
| Values | Three `SpotlightCard`s, revealed with `ScrollTrigger.batch`. |
| Assortment | All 16 products. Filtering by Boemboe / Masala's / Besan & mixen animates with **GSAP Flip**, and every product image tilts on hover (`TiltedCard`). |
| Wat eten we vandaag? | A pinned, snapping card deck where each scroll step throws one dish off the stack. On mobile it is a swipe row. |
| Verkrijgbaar bij | A supermarket `LogoLoop` and a "Staat je supermarkt er niet tussen?" card that pre-fills the contact subject. |
| Ons verhaal | A scrubbed headline, a clip-path photo reveal, `ScrollReveal` body copy, `CountUp` stats and a `DrawSVG` underline. |
| Video | A YouTube facade (youtube-nocookie loads only on click) with a magnetic, spinning play button. |
| Contact | Social links and a validated contact form. |
| Footer | A giant "Nyan Switi" that rises letter by letter as you reach the bottom. |

Site-wide: Lenis smooth scrolling runs on GSAP's ticker, and React Bits adds `ClickSpark` (saffron
sparks on click) and a subtle `Noise` grain. Visitors who set `prefers-reduced-motion` skip all of
this and get a static, fully readable page with native scrolling.

## Contact form

The original site used a WordPress form plugin. Set `VITE_CONTACT_ENDPOINT` (see `.env.example`) to any
endpoint that accepts a JSON POST, such as Formspree, Basin or your own API. Until it is set, the form
validates input and then points visitors to social media.

## Notes

- All copy, product data and recipes come from the original site and live in `src/data/content.js`.
- The images are the original site assets, re-encoded to WebP (about 3 MB total, down from roughly
  30 MB of PNG/JPEG). The boemboe box shots were cut out from their white backgrounds.
- The React Bits components in `src/components/reactbits/` were copied from
  [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) (MIT + Commons Clause) with small
  fixes: `ScrollReveal` now cleans up only its own ScrollTriggers (the original killed every
  trigger on the page), and `ClickSpark` draws on a viewport-sized canvas instead of one the height
  of the whole page.
- The Huishoudbeurs pop-up and banner from February 2025 were left out because the event is over.
