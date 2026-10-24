# Guardrail Academy · Claude Code security

An interactive learning site about securing Claude Code, built like `icm-academy`: snack-sized cards, quizzes, interactive demos and a "dogfood" capstone that produces real files.

- **Core track (8 modules):** threats, permission rules, permission modes, hooks (PreToolUse & co.), the Bash sandbox, isolated environments (sandbox runtime, dev containers, VMs, cloud sessions), supply chain and workspace trust, secrets and team policy.
- **iOS track (5 modules):** Claude Agent inside Xcode vs Claude Code, the Xcode MCP bridge (`xcrun mcpbridge`), isolation when Xcode only runs on macOS, the sandbox vs the Xcode toolchain, and signing, secrets and shipping. Every topic names explicitly **what stays the same and what is different** (`diff` cards and a filterable comparison table).
- **Policy Builder:** generates `.claude/settings.json`, fail-closed hook scripts (`guard-bash.sh`, `guard-xcode-mcp.sh`, `lint-pbxproj.sh`, `format.sh`), a `SECURITY.md` that explains every rule and, for setup A, `xcode/README.md`. The zip is built in the browser, with the hook scripts set to mode 755.
- **Concept map:** 93 concepts that light up as you finish cards and get quizzes right.

## Stack
Vite · React 19 · TypeScript · Tailwind v4 · GSAP 3 + `@gsap/react` (ScrollTrigger) · Lenis on `gsap.ticker` · React Bits components copied into `src/components/rb/` (ShinyText, SpotlightCard, DotGrid, plus GSAP ports of Magnet and CountUp) · `fflate` for the zip.

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # every concept taught, every tag/src valid, meta.ts card counts correct
npm run build      # typecheck + production build to dist/
npm run preview    # test the production build
```

No environment variables. Progress and the learner's policy live in `localStorage` (`guardrail-academy:v1`); routing is hash-based.

## Structure
- `src/content/meta.ts`: module metadata (title, tagline, minutes, card count). Small, so the landing pages don't load the cards.
- `src/content/01-…08-*.ts`, `i1-…i5-*.ts`: the cards of each module. Imported only by the lazy routes via `src/content/index.ts`.
- `src/content/coverage.ts`: the concept list; `src/content/sources.ts`: where claims come from (docs links, or `secondhand` for community write-ups).
- `src/components/demos/`: interactive demos referenced by `demo` cards.
- `src/components/dogfood.tsx`: the policy forms used in modules and in the Builder.
- `src/lib/generate.ts`: turns the policy into files and the zip.
- `src/lib/gsap.ts`: the only place plugins are registered.

## Content rules
1. Content lives in `src/content`, never inside components. Add a card, then update `count` in `meta.ts` (`npm run check` tells you).
2. Every claim carries a `src`. Mark anything that comes from third-party write-ups, or changes fast, with `verify: true`; it shows a "verify on your setup" chip.
3. Facts were checked against code.claude.com/docs and developer.apple.com in October 2026. Xcode's built-in agent doesn't document hooks, settings.json rules or the sandbox; the site says so instead of guessing.

## Vercel
- Root Directory: `claude-code-security`, framework preset Vite (also set in `vercel.json`).
- `vercel.json` adds `X-Robots-Tag: noindex, nofollow` and `Referrer-Policy: no-referrer` (not public yet; remove the robots header at launch) and an immutable cache for `/assets/*`.

## Performance (production build, Lighthouse mobile)
Performance 90–93, Accessibility 100, Best Practices 100. TBT 140–210 ms, CLS 0, LCP 2.5–2.6 s (just at the 2.5 s target). Main bundle about 130 kB gzip; cards, Builder, demos and the WebGL DotGrid are split into their own chunks. The DotGrid only loads on wide screens with a fine pointer and without reduced motion; phones get a static CSS dot pattern.
