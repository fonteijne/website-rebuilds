// Alle sites uit deze repo die als eigen Vercel-project draaien (team KERS).
// Nieuwe site gepubliceerd? Voeg hem hier toe en draai `npm run previews`.

export type Site = {
  slug: string;
  name: string;
  url: string;
  folder: string;
  branch: string;
  kind: "Rebuild" | "Leersite" | "App" | "Demo" | "Nieuwe site";
  stack: string;
  description: string;
  /** Afgeschermd met Vercel-login: geen publieke preview mogelijk. */
  protected?: boolean;
};

export const sites: Site[] = [
  {
    slug: "amaezin-design",
    name: "Amaezin Design",
    url: "https://amaezin-design.vercel.app",
    folder: "amaezin-design",
    branch: "main",
    kind: "Rebuild",
    stack: "Next.js",
    description: "Grafisch ontwerp, huisstijl en DTP. Rebuild van amaezindesign.nl met lokale SEO-pagina's en contactformulier.",
  },
  {
    slug: "brandagency",
    name: "Brand Agency",
    url: "https://brandagency.vercel.app",
    folder: "brandagency",
    branch: "main",
    kind: "Rebuild",
    stack: "Next.js",
    description: "Brand, shopper en retail activation. Revamp van brandagency.nl met dezelfde kleuren en horizontale scroll.",
  },
  {
    slug: "nandan-surinami",
    name: "H. Nandan Surinami",
    url: "https://x-b2dfdff0b23f.vercel.app",
    folder: "nandan-surinami",
    branch: "main",
    kind: "Rebuild",
    stack: "Vite",
    description: "Authentic made simple. Revamp van nandansurinami.com: zelfde merk, producten en copy.",
  },
  {
    slug: "boodschappen",
    name: "Boodschappen",
    url: "https://boodschappen-six.vercel.app",
    folder: "boodschappen",
    branch: "main",
    kind: "App",
    stack: "Next.js",
    description: "Gedeelde boodschappenlijst voor twee, met inloggen via passkeys.",
  },
  {
    slug: "icm-academy",
    name: "ICM Academy",
    url: "https://icm-academy.vercel.app",
    folder: "icm-academy",
    branch: "main",
    kind: "Leersite",
    stack: "Vite",
    description: "Interactief leren over Interpretable Context Methodology: folderstructuur als agent-architectuur.",
  },
  {
    slug: "field-guide",
    name: "The Procrastinator's Field Guide",
    url: "https://procrastinators-field-guide.vercel.app",
    folder: "field-guide",
    branch: "main",
    kind: "Leersite",
    stack: "Vite",
    description: "Interactieve gids bij John Perry's essay Structured Procrastination.",
  },
  {
    slug: "knmi",
    name: "KNMI Assistent",
    url: "https://knmi-assistent-demo.vercel.app",
    folder: "knmi",
    branch: "main",
    kind: "Demo",
    stack: "HTML",
    description: "Demo van een AI-zoekfunctie die werkt als agent, in de huisstijl van knmi.nl.",
  },
  {
    slug: "uitleg-modelwissel",
    name: "Uitleg modelwissel",
    url: "https://uitleg-modelwissel-kers.vercel.app",
    folder: "uitleg-modelwissel",
    branch: "main",
    kind: "Leersite",
    stack: "Next.js",
    description: "Waarom je plant met een zwaar model en uitvoert in een nieuwe sessie met een lichter model.",
    protected: true,
  },
  {
    slug: "kookstappen",
    name: "Kookstappen",
    url: "https://kookstappen.vercel.app",
    folder: "kookstappen",
    branch: "kookstappen-app",
    kind: "App",
    stack: "Next.js",
    description: "Maak een foto van een recept en kook stap voor stap, met timers. Gemaakt voor mensen met AD(H)D.",
  },
  {
    slug: "claude-code-security",
    name: "Guardrail Academy",
    url: "https://claude-code-security-two.vercel.app",
    folder: "claude-code-security",
    branch: "claude-code-security-rebuild",
    kind: "Leersite",
    stack: "Vite",
    description: "Claude Code veilig inzetten: permissies, hooks, sandboxing, offline modellen en een policy builder.",
  },
  {
    slug: "single-prompt-studio",
    name: "Single Prompt Studio",
    url: "https://single-prompt-studio.vercel.app",
    folder: "single-prompt-studio",
    branch: "single-prompt-studio-rebuild",
    kind: "Nieuwe site",
    stack: "Next.js",
    description: "Alles kan met één prompt. Nul iteraties. Leadfunnel voor de services van de studio.",
  },
];
