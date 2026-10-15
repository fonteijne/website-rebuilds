# ICM Academy

An interactive learning site for **Interpretable Context Methodology (ICM)** — *Folder Structure as Agent Architecture* by Jake Van Clief and David McDermott ([arXiv:2603.16021](https://arxiv.org/abs/2603.16021)).

- **8 modules, 80+ snack-bite cards**: concepts, quizzes, interactive demos (token windows, layer explorer, stage-contract builder, pipeline simulator…)
- **Dogfood method**: each module adds a real piece to *your own* ICM workspace; the **Harness Builder** validates it and downloads a ready-to-use folder (CLAUDE.md, CONTEXT.md, stage contracts, `_config/`).
- **Concept Map**: 68 concepts from the paper, lit up as you master them.

## Stack
Vite · React 19 · TypeScript · Tailwind v4 · [GSAP](https://gsap.com) + `@gsap/react` (ScrollTrigger, SplitText) · [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll synced to GSAP's ticker · components from [React Bits](https://github.com/DavidHDev/react-bits) (`SplitText`, `ShinyText`, `SpotlightCard`, `Magnet`, `CountUp`, `DotGrid`).

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
```

State (progress and your workspace) is stored in `localStorage`; routing is hash-based so it deploys as a static site anywhere (Vercel config included).

## Sources and honesty
Paper claims are tagged with section numbers. Material on Jake Van Clief's YouTube folder system comes from third-party summaries and is tagged *secondhand* in the UI; verify it against the original videos.
