// Alle sites uit deze repo die als eigen Vercel-project draaien (team KERS).
// De lijst staat in sites.json. `npm run sync` (en de GitHub Action
// .github/workflows/overzicht-sync.yml) voegt nieuwe Vercel-projecten van deze repo
// automatisch toe. Naam, omschrijving en soort mag je daarna gewoon met de hand verbeteren:
// de sync past bij bestaande sites alleen url, branch, folder, stack en `protected` aan.
import data from './sites.json';

export type Site = {
  slug: string;
  /** Naam van het Vercel-project; daarop matcht de sync. */
  vercelProject: string;
  name: string;
  url: string;
  folder: string;
  branch: string;
  kind: string;
  stack: string;
  description: string;
  /** Afgeschermd met Vercel-login: geen publieke preview mogelijk. */
  protected?: boolean;
};

export const sites: Site[] = data;
