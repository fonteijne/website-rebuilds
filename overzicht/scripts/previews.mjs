// Maakt previews van alle publieke sites: public/previews/<slug>.webp (960x600).
// Gebruik: npm run previews              (alle sites)
//          npm run previews -- knmi      (alleen de genoemde slugs)
//          npm run previews -- --missing (alleen sites zonder preview)
// Screenshots met prefers-reduced-motion, zodat intro-animaties al klaar zijn.
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sites from "../src/content/sites.json" with { type: "json" };

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const outDir = fileURLToPath(new URL("../public/previews/", import.meta.url));
const args = process.argv.slice(2);
const missing = args.includes("--missing");
const only = args.filter((a) => !a.startsWith("--"));
const todo = sites.filter(
  (s) =>
    !s.protected &&
    (!only.length || only.includes(s.slug)) &&
    (!missing || !existsSync(`${outDir}${s.slug}.webp`)),
);
if (!todo.length) {
  console.log("geen previews te maken");
  process.exit(0);
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
  locale: "nl-NL",
});

// Comprimeert de PNG naar webp in de browser zelf: geen extra dependency nodig.
const encoder = await context.newPage();
async function toWebp(png) {
  return encoder.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 600;
    canvas.getContext("2d").drawImage(img, 0, 0, 960, 600);
    return canvas.toDataURL("image/webp", 0.78).split(",")[1];
  }, png.toString("base64"));
}

for (const site of todo) {
  const page = await context.newPage();
  try {
    await page.goto(site.url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2500);
    const png = await page.screenshot({ type: "png" });
    await writeFile(`${outDir}${site.slug}.webp`, Buffer.from(await toWebp(png), "base64"));
    console.log(`✓ ${site.slug}`);
  } catch (err) {
    console.error(`✗ ${site.slug}: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await page.close();
  }
}

await browser.close();
