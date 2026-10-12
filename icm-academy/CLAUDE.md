# ICM Academy

A learning site for Interpretable Context Methodology (arXiv:2603.16021). Vite + React + TypeScript + Tailwind v4, animated with GSAP, smooth-scrolled with Lenis, UI pieces from React Bits (copied into `src/components/rb/`).

## Where things are
- `src/content/` — the curriculum. One numbered file per module (`01-why.ts` … `08-source.ts`); each is a list of snack-bite cards. `coverage.ts` lists every concept the site claims to teach.
- `src/components/demos/` — interactive demos referenced by `demo` cards.
- `src/components/dogfood/` — forms that build the learner's own ICM workspace.
- `src/lib/generate.ts` — turns the learner's workspace into CLAUDE.md / CONTEXT.md / stage contracts and a zip.

## Rules
1. Content lives in `src/content`, never inside components.
2. Every card teaches at most a few `tags`; every concept in `coverage.ts` must be taught by ≥1 card (run the check in README).
3. Paper-derived claims carry a `src` section reference. Anything from Jake Van Clief's videos is tagged `video (secondhand)` unless verified against the original.
4. Animate with GSAP via `useGSAP` + `scope`; never leave selectors unscoped. Lenis is driven by `gsap.ticker`.
