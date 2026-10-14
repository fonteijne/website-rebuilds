import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const OUT = "e2e/out";
mkdirSync(OUT, { recursive: true });
const exe = process.env.CHROME ?? (await import("node:fs")).readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium-")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`)[0];
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });

async function person(name) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`[${name}] PAGEERROR`, e.message));
  page.on("console", (m) => m.type() === "error" && console.log(`[${name}] console.error`, m.text()));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: { protocol: "ctap2", transport: "internal", hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
  });
  return { ctx, page, name };
}
const ok = (c, m) => { console.log(c ? "PASS" : "FAIL", m); if (!c) process.exitCode = 1; };

const A = await person("A");
await A.page.goto(BASE);
await A.page.waitForSelector("text=Eerste keer");
await A.page.screenshot({ path: `${OUT}/01-login-first.png` });
await A.page.fill('input[autocomplete="name"]', "Sam");
await A.page.click("text=Passkey aanmaken");
await A.page.waitForSelector("text=Lijst laden…, text=Je mand is leeg", { timeout: 15000 }).catch(() => {});
await A.page.waitForSelector("#new-item", { timeout: 15000 });
ok(true, "A: eerste account aangemaakt (admin)");

for (const t of ["Melk", "2x Appels", "Brood", "wc-papier", "Kipfilet"]) {
  await A.page.fill("#new-item", t);
  await A.page.keyboard.press("Enter");
  await A.page.waitForTimeout(250);
}
await A.page.waitForTimeout(1200);
await A.page.screenshot({ path: `${OUT}/02-list.png` });
ok((await A.page.locator("[data-flip-id^=i-]").count()) === 5, "A: 5 items op de lijst");

// Afvinken
await A.page.click('button[role=checkbox][aria-label^="Melk"]');
await A.page.waitForTimeout(1200);
ok((await A.page.locator('section[aria-label="In de mand"] [data-flip-id^=i-]').count()) === 1, "A: Melk verschoof naar 'In de mand'");
await A.page.screenshot({ path: `${OUT}/03-checked.png` });

// Instellingen (admin)
await A.page.click('header button[aria-label="Instellingen"]');
await A.page.waitForSelector('[role=switch]');
await A.page.waitForTimeout(900);
await A.page.screenshot({ path: `${OUT}/04-admin.png` });
ok((await A.page.getAttribute("[role=switch]", "aria-checked")) === "true", "A: registratie staat open bij start");

// B registreert terwijl open
const B = await person("B");
await B.page.goto(BASE);
await B.page.waitForSelector("text=Welkom terug");
await B.page.waitForTimeout(3000); await B.page.screenshot({ path: `${OUT}/05-login.png` });
await B.page.click("text=Account maken");
await B.page.fill('input[autocomplete="name"]', "Alex");
await B.page.click("text=Passkey aanmaken");
await B.page.waitForSelector("#new-item", { timeout: 15000 });
ok((await B.page.locator("[data-flip-id^=i-]").count()) === 5, "B: ziet dezelfde lijst");
ok(await B.page.locator("header [aria-label=Instellingen]").isVisible(), "B: ingelogd");

// Realtime: B voegt toe, A ziet het
await B.page.fill("#new-item", "Pasta");
await B.page.keyboard.press("Enter");
await A.page.keyboard.press("Escape");
await A.page.waitForSelector("text=Pasta", { timeout: 10000 });
ok(true, "A: ziet item van B binnen polling-interval");

// A sluit registratie
await A.page.click('header button[aria-label="Instellingen"]').catch(() => {});
await A.page.waitForSelector('[role=switch]');
await A.page.click("[role=switch]");
await A.page.waitForTimeout(600);
ok((await A.page.getAttribute("[role=switch]", "aria-checked")) === "false", "A: registratie gesloten");

// B (niet-admin) heeft geen schakelaar
await B.page.click('header button[aria-label="Instellingen"]');
await B.page.waitForSelector("text=Leden");
await B.page.waitForTimeout(700);
ok((await B.page.locator("[role=switch]").count()) === 0, "B: geen admin-schakelaar");
await B.page.screenshot({ path: `${OUT}/06-member-sheet.png` });

// C kan niet meer registreren
const C = await person("C");
await C.page.goto(BASE);
await C.page.waitForSelector("text=Welkom terug");
ok((await C.page.locator("text=Account maken").count()) === 0, "C: geen registratie-knop meer");
await C.page.waitForTimeout(3000); await C.page.screenshot({ path: `${OUT}/07-closed.png` });
const direct = await C.page.evaluate(async () => (await fetch("/api/auth/register/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Eve" }) })).status);
ok(direct === 403, `C: API weigert registratie (${direct})`);

// B uitloggen en weer inloggen met passkey
await B.page.click("text=Uitloggen");
await B.page.waitForSelector("text=Welkom terug");
await B.page.click("text=Inloggen met passkey");
await B.page.waitForSelector("#new-item", { timeout: 15000 });
ok(true, "B: opnieuw ingelogd met passkey");

// Niet ingelogd -> API 401
const anon = await C.page.evaluate(async () => (await fetch("/api/items")).status);
ok(anon === 401, `anoniem krijgt 401 (${anon})`);
const nonAdmin = await B.page.evaluate(async () => (await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationOpen: true }) })).status);
ok(nonAdmin === 403, `niet-admin kan registratie niet heropenen (${nonAdmin})`);

// swipe-to-delete op A
await A.page.keyboard.press("Escape");
await A.page.waitForTimeout(600);
const row = A.page.locator('[data-flip-id^=i-] .row', { hasText: "Brood" });
const box = await row.boundingBox();
await A.page.mouse.move(box.x + box.width - 30, box.y + box.height / 2);
await A.page.mouse.down();
await A.page.mouse.move(box.x + box.width - 80, box.y + box.height / 2, { steps: 5 });
await A.page.mouse.move(box.x + 30, box.y + box.height / 2, { steps: 8 });
await A.page.mouse.up();
await A.page.waitForTimeout(1200);
ok((await A.page.locator("[data-flip-id^=i-]", { hasText: "Brood" }).count()) === 0, "A: swipe-to-delete werkt");
await A.page.screenshot({ path: `${OUT}/08-after-swipe.png` });

await browser.close();
