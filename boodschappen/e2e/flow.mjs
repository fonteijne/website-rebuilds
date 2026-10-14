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

// Instellingen (admin + familie-eigenaar)
await A.page.click('header button[aria-label="Instellingen"]');
await A.page.waitForSelector('[data-testid=global-switch]');
await A.page.waitForSelector('[data-testid=invite-url]');
await A.page.waitForTimeout(900);
await A.page.screenshot({ path: `${OUT}/04-admin.png` });
const sw = (page, id) => page.getAttribute(`[data-testid=${id}]`, "aria-checked");
ok((await sw(A.page, "global-switch")) === "true", "A: globale registratie staat open bij start");
ok((await sw(A.page, "family-switch")) === "true", "A: familie-registratie staat open bij start");
const inviteUrl = await A.page.inputValue("[data-testid=invite-url]");
ok(/\?join=[a-f0-9]{20}$/.test(inviteUrl), `A: uitnodigingslink ${inviteUrl.replace(/^https?:\/\/[^/]+/, "")}`);
const path = (u) => u.replace(/^https?:\/\/[^/]+/, "");

// B doet mee via de link
const B = await person("B");
await B.page.goto(BASE + path(inviteUrl));
await B.page.waitForSelector("text=Doe mee met");
await B.page.waitForTimeout(3000); await B.page.screenshot({ path: `${OUT}/05-login.png` });
await B.page.fill('input[autocomplete="name"]', "Alex");
await B.page.click("text=Passkey aanmaken");
await B.page.waitForSelector("#new-item", { timeout: 15000 });
ok((await B.page.locator("[data-flip-id^=i-]").count()) === 5, "B: ziet dezelfde lijst als A");
ok(!(await B.page.url()).includes("join="), "B: ?join= is uit de adresbalk gehaald");

// Realtime: B voegt toe, A ziet het
await B.page.fill("#new-item", "Pasta");
await B.page.keyboard.press("Enter");
await A.page.keyboard.press("Escape");
await A.page.waitForSelector("text=Pasta", { timeout: 10000 });
ok(true, "A: ziet item van B binnen polling-interval");

// D start zonder link een eigen familie: geen toegang tot de lijst van A
const D = await person("D");
await D.page.goto(BASE);
await D.page.waitForSelector("text=Welkom terug");
await D.page.click("text=Account maken");
await D.page.waitForSelector("text=Eigen familie starten");
await D.page.fill('input[autocomplete="name"]', "Dana");
await D.page.fill('input[placeholder="Bijv. Familie Jansen"]', "Familie Dana");
await D.page.click("text=Passkey aanmaken");
await D.page.waitForSelector("#new-item", { timeout: 15000 });
ok((await D.page.locator("[data-flip-id^=i-]").count()) === 0, "D: eigen familie begint met een lege lijst");
await D.page.fill("#new-item", "Geheim");
await D.page.keyboard.press("Enter");
await D.page.waitForSelector("text=Geheim");
await A.page.waitForTimeout(4500);
ok((await A.page.locator("text=Geheim").count()) === 0, "A: ziet niets van familie D");
const dItems = await D.page.evaluate(async () => (await (await fetch("/api/items")).json()).items.map((i) => i.text));
ok(!dItems.includes("Pasta") && dItems.includes("Geheim"), "D: API toont alleen eigen items");
await D.page.click('header button[aria-label="Instellingen"]');
await D.page.waitForSelector("[data-testid=invite-url]");
ok((await D.page.locator("[data-testid=global-switch]").count()) === 0, "D: geen globale schakelaar (wel eigen familie-link)");
const dInvite = await D.page.inputValue("[data-testid=invite-url]");
ok(dInvite !== inviteUrl, "D: eigen, andere uitnodigingslink");

// A sluit alleen de registratie van de eigen familie
await A.page.click('header button[aria-label="Instellingen"]');
await A.page.waitForSelector("[data-testid=family-switch]");
await A.page.waitForTimeout(800);
await A.page.click('[data-testid=family-switch]');
await A.page.waitForTimeout(600);
ok((await sw(A.page, "family-switch")) === "false", "A: familie-registratie gesloten");
const E = await person("E");
await E.page.goto(BASE + path(inviteUrl));
await E.page.waitForSelector("text=Welkom terug");
await E.page.waitForSelector("text=De registratie voor");
ok((await E.page.locator("text=Passkey aanmaken").count()) === 0, "E: familie dicht, geen registratieformulier");
const famClosed = await E.page.evaluate(async (inv) => (await fetch("/api/auth/register/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Eve", invite: inv }) })).status, inviteUrl.split("join=")[1]);
ok(famClosed === 403, `E: API weigert familielink als familie dicht is (${famClosed})`);
// De andere familie (D) blijft gewoon open
const dOpen = await E.page.evaluate(async (inv) => (await fetch("/api/auth/register/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Eve", invite: inv }) })).status, dInvite.split("join=")[1]);
ok(dOpen === 200, `E: link van familie D werkt nog (${dOpen})`);

// A heropent de familie en sluit daarna globaal: globaal wint
await A.page.click('[data-testid=family-switch]');
await A.page.waitForTimeout(600);
const famOpenAgain = await E.page.evaluate(async (inv) => (await fetch("/api/auth/register/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Eve", invite: inv }) })).status, inviteUrl.split("join=")[1]);
ok(famOpenAgain === 200, `E: link werkt weer na heropenen (${famOpenAgain})`);
await A.page.click('[data-testid=global-switch]');
await A.page.waitForTimeout(600);
ok((await sw(A.page, "global-switch")) === "false", "A: globale registratie gesloten");
ok((await sw(A.page, "family-switch")) === "true", "A: familie-schakelaar staat nog open");
await A.page.screenshot({ path: `${OUT}/09-global-closed.png` });
const statuses = await E.page.evaluate(
  async ([a, b]) => {
    const call = async (body) => (await fetch("/api/auth/register/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).status;
    return [await call({ name: "Eve", invite: a }), await call({ name: "Eve", invite: b }), await call({ name: "Eve" })];
  },
  [inviteUrl.split("join=")[1], dInvite.split("join=")[1]],
);
ok(statuses.every((x) => x === 403), `E: globaal dicht blokkeert alle links en nieuwe families (${statuses})`);
await E.page.goto(BASE);
await E.page.waitForSelector("text=Welkom terug");
ok((await E.page.locator("text=Account maken").count()) === 0, "E: geen registratie-knop meer");
await E.page.waitForTimeout(2500); await E.page.screenshot({ path: `${OUT}/07-closed.png` });

// B (lid) heeft geen beheer of uitnodiging
await B.page.click('header button[aria-label="Instellingen"]');
await B.page.waitForSelector("text=Leden van");
await B.page.waitForTimeout(700);
ok((await B.page.locator("[role=switch]").count()) === 0 && (await B.page.locator("[data-testid=invite-url]").count()) === 0, "B: geen schakelaars of uitnodigingslink");
await B.page.screenshot({ path: `${OUT}/06-member-sheet.png` });
const bPatch = await B.page.evaluate(async () => (await fetch("/api/family", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationOpen: false }) })).status);
ok(bPatch === 403, `B: lid kan familie-instelling niet wijzigen (${bPatch})`);
const bUsers = await B.page.evaluate(async () => (await fetch("/api/admin/users/" + "x", { method: "DELETE" })).status);
ok(bUsers === 404 || bUsers === 403, `B: lid kan niemand verwijderen (${bUsers})`);

// Eigenaar D mag geen lid van een andere familie verwijderen
const alexId = await A.page.evaluate(async () => (await (await fetch("/api/family")).json()).members.find((m) => m.name === "Alex").id);
const dDel = await D.page.evaluate(async (id) => (await fetch("/api/admin/users/" + id, { method: "DELETE" })).status, alexId);
ok(dDel === 403, `D: eigenaar kan lid van andere familie niet verwijderen (${dDel})`);

// B uitloggen en weer inloggen met passkey
await B.page.click("text=Uitloggen");
await B.page.waitForSelector("text=Welkom terug");
await B.page.click("text=Inloggen met passkey");
await B.page.waitForSelector("#new-item", { timeout: 15000 });
ok(true, "B: opnieuw ingelogd met passkey");

// Niet ingelogd -> API 401
const anon = await E.page.evaluate(async () => (await fetch("/api/items")).status);
ok(anon === 401, `anoniem krijgt 401 (${anon})`);
const nonAdmin = await B.page.evaluate(async () => (await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationOpen: true }) })).status);
ok(nonAdmin === 403, `niet-admin kan globale registratie niet heropenen (${nonAdmin})`);
const dGlobal = await D.page.evaluate(async () => (await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationOpen: true }) })).status);
ok(dGlobal === 403, `familie-eigenaar is geen globale beheerder (${dGlobal})`);

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
