# The Procrastinator's Field Guide

An interactive learning site for John Perry's essay [*Structured Procrastination*](https://www.structuredprocrastination.com/index.php).
Goal: a reader understands ≥95% of the methodology and can put it into practice — by *using it while learning* (dogfooding).

## How it teaches
- **8 modules / 54 snack cards** (≤60 words each): idea, example, mistake, check, interactive visual, dogfood.
- **Dogfood:** every module ends by having you apply the idea to your own task list (the **Lab**).
- **Coverage map:** the essay is distilled into 20 concepts; cards teach them, checks and a 26-question mastery quiz prove them. 19/20 = 95% = "ready to practise".
- **Playbook:** one-page cheat sheet, 7-day setup, daily/weekly rituals, guardrails, FAQ. Material beyond the essay is labelled *"Beyond the essay / our extension"*.

## Stack
React 19 + Vite, React Router, **GSAP** (ScrollTrigger pin/scrub, SplitText, Flip, matchMedia, quickTo) via `@gsap/react`,
**Lenis** smooth scroll synced to GSAP's ticker, **React Bits** (SpotlightCard, ShinyText, Magnet, ClickSpark vendored in `src/vendor/react-bits`).
Patterns follow `greensock/gsap-skills`. Respects `prefers-reduced-motion`; dark mode; keyboard and screen-reader friendly.

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # content integrity + mastery/classification logic
npm run build    # -> dist/
```
Progress and tasks persist in `localStorage` (no backend). Deploy on Vercel with project root `field-guide` (`vercel.json` included).

## Attribution
Essay © John Perry. Explanations are paraphrased with short quotes; always link back to the original.
React Bits is MIT + Commons Clause (used as part of an app, not redistributed).
