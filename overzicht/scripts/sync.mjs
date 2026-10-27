// Werkt src/content/sites.json bij met de Vercel-projecten die aan deze repo gekoppeld zijn.
// - Nieuw project met een productie-deploy: toegevoegd (bovenaan), naam en omschrijving uit
//   de <title> en meta description van de live site.
// - Bestaand project: alleen url, branch, folder, stack en `protected` worden bijgewerkt;
//   handmatig verbeterde naam, omschrijving en soort blijven staan.
// - Project verdwenen of niet aan de repo gekoppeld (bijv. CLI-deploys): blijft staan, met
//   een melding. Verwijderen gaat met de hand.
// Env: VERCEL_TOKEN (verplicht), VERCEL_TEAM_ID, GITHUB_REPOSITORY (owner/repo).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../src/content/sites.json', import.meta.url));
const token = process.env.VERCEL_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID || 'team_zgVgEp9QkRosV5bnc2Is9Mxz';
const repo = process.env.GITHUB_REPOSITORY || 'fonteijne/website-rebuilds';
const self = 'overzicht';

if (!token) {
  console.error('VERCEL_TOKEN ontbreekt');
  process.exit(1);
}

async function vercel(path) {
  const url = new URL(`https://api.vercel.com${path}`);
  url.searchParams.set('teamId', teamId);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function linkedProjects() {
  const all = [];
  let from;
  do {
    const q = new URLSearchParams({ repoUrl: `https://github.com/${repo}`, limit: '100' });
    if (from) q.set('from', String(from));
    const { projects, pagination } = await vercel(`/v10/projects?${q}`);
    all.push(...projects);
    from = pagination?.next;
  } while (from);
  return all;
}

// Liefst een eigen domein, anders de kortste *.vercel.app zonder branch- of team-suffix.
function productionUrl(project) {
  const aliases = project.targets?.production?.alias ?? [];
  if (!aliases.length) return null;
  const custom = aliases.find((a) => !a.endsWith('.vercel.app'));
  const clean = aliases
    .filter((a) => !a.includes('-git-'))
    .sort((a, b) => a.length - b.length);
  return `https://${custom ?? clean[0] ?? aliases[0]}`;
}

const stacks = { nextjs: 'Next.js', vite: 'Vite' };

async function inspect(url) {
  try {
    const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const location = res.headers.get('location') ?? '';
    if (res.status === 401 || res.status === 403 || location.includes('vercel.com')) {
      return { protected: true };
    }
    if (!res.ok) return {};
    const html = await res.text();
    const meta = (name) =>
      html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)`, 'i'))?.[1] ??
      html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i'))?.[1];
    const title = html.match(/<title[^>]*>([^<]*)/i)?.[1]?.trim();
    return { protected: false, title: decode(title), description: decode(meta('description') ?? meta('og:description')) };
  } catch (err) {
    // Onbekend: laat `protected` zoals het was, anders flapt de lijst bij een time-out.
    console.warn(`  kon ${url} niet ophalen: ${err.message}`);
    return {};
  }
}

function decode(s) {
  return s
    ?.replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

const sites = JSON.parse(await readFile(file, 'utf8'));
const before = JSON.stringify(sites);
const projects = (await linkedProjects()).filter((p) => p.name !== self && p.rootDirectory !== self);
const added = [];

for (const project of projects) {
  const url = productionUrl(project);
  if (!url) continue; // nog niet gepubliceerd
  const info = await inspect(url);
  const existing = sites.find((s) => s.vercelProject === project.name);
  const fields = {
    url,
    folder: project.rootDirectory || project.name,
    branch: project.targets.production.meta?.githubCommitRef || project.link?.productionBranch || 'main',
    stack: stacks[project.framework] ?? 'HTML',
    protected: (info.protected ?? existing?.protected) || undefined,
  };
  if (existing) {
    Object.assign(existing, fields);
    if (!fields.protected) delete existing.protected;
    continue;
  }
  const name = info.title?.split(/\s+[—|·–-]\s+/)[0] || project.name;
  added.push({
    slug: project.name,
    vercelProject: project.name,
    name,
    ...fields,
    kind: 'Site',
    description: info.description || info.title || '',
  });
  console.log(`+ ${project.name} (${url})`);
}

sites.unshift(...added);
for (const s of sites) {
  if (!projects.some((p) => p.name === s.vercelProject)) {
    console.log(`  ${s.vercelProject} is niet (meer) aan ${repo} gekoppeld; blijft staan`);
  }
}

if (JSON.stringify(sites) !== before) {
  await writeFile(file, JSON.stringify(sites, null, 2) + '\n');
  console.log(`sites.json bijgewerkt (${added.length} nieuw)`);
} else {
  console.log('geen wijzigingen');
}
