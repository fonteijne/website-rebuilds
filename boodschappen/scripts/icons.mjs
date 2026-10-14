// Rendert het mandje (zelfde vorm als de lege-staat) naar de PNG-iconen die iOS/Android nodig hebben.
import { chromium } from "playwright";
import { readdirSync, writeFileSync } from "node:fs";

const basket = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="100%" height="100%">
  <rect width="96" height="96" fill="#f5efe3"/>
  <g transform="translate(48 50) scale(${pad}) translate(-48 -50)" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M16 42h64l-6.5 34a6 6 0 0 1-5.9 4.9H28.4A6 6 0 0 1 22.5 76z" stroke="#4d6657" stroke-width="5"/>
    <path d="M32 42c0-13 7-22 16-22s16 9 16 22" stroke="#e5533c" stroke-width="6"/>
  </g></svg>`;

const exe = readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium-")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`)[0];
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
const page = await browser.newPage();
const targets = [
  ["app/apple-icon.png", 180, 1.0],
  ["app/icon.png", 512, 1.0],
  ["public/icon-192.png", 192, 1.0],
  ["public/icon-512.png", 512, 1.0],
  ["public/icon-maskable-512.png", 512, 0.8], // extra marge voor Android-maskers
];
for (const [file, size, pad] of targets) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0">${basket(pad)}</body>`);
  await page.screenshot({ path: file });
  console.log(file, size);
}
writeFileSync("public/icon.svg", basket(1.0).replace('width="100%" height="100%"', ""));
await browser.close();
