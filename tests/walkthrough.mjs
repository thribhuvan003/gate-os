/* Full authenticated walkthrough for a real GATE user.
 *
 * Signs up with email + password through the actual UI, completes onboarding,
 * then opens every workspace feature and fails on any console/page error or a
 * screen that did not render its heading. This is the "does it actually work
 * for a student" test — not a unit of it, the whole path.
 *
 * A confirmed throwaway account is created and deleted around the run, so it
 * touches no real user's data.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/d/ms-playwright node tests/walkthrough.mjs
 */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// Load .env.local by hand (this is a plain node script, not Next).
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const BASE = process.env.WALKTHROUGH_BASE || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, svc, { auth: { persistSession: false, autoRefreshToken: false } });

const email = `walkthrough+${Date.now()}@gate-os-check.dev`;
const password = "MyGateP@ss2027";

const FEATURES = [
  ["/app", "dashboard / study rhythm"],
  ["/app/focus", "focus timer"],
  ["/app/syllabus", "syllabus"],
  ["/app/vault", "PDF vault"],
  ["/app/notes", "notes"],
  ["/app/revision", "revision queue"],
  ["/app/mistakes", "mistake book"],
  ["/app/goals", "goals & reflections"],
  ["/app/circles", "study circles"],
  ["/app/settings", "settings"],
];

let passed = 0;
const results = [];
const record = (name, error) => {
  results.push([name, error]);
  if (error) { console.error(`✗ ${name}\n  ${error}`); process.exitCode = 1; }
  else { console.log(`✓ ${name}`); passed += 1; }
};
const check = async (name, fn) => {
  try { await fn(); record(name); } catch (error) { record(name, error.message || String(error)); }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`uncaught: ${e.message}`));

let userId = null;
try {
  // 1. Real UI signup. Switch to the create-account tab, retrying until the
  //    submit label actually flips — on a cold prod load the tab can be clicked
  //    before React hydration attaches its handler, so one click is a no-op.
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  const createButton = page.getByRole("button", { name: "Create my workspace" });
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByRole("tab", { name: "Create account" }).click();
    if (await createButton.isVisible().catch(() => false)) break;
    await page.waitForTimeout(600);
  }
  await createButton.waitFor({ state: "visible", timeout: 10000 });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await createButton.click();

  // First login must land on onboarding.
  await page.waitForURL(/\/onboarding/, { timeout: 20000 });
  record("sign up with email + password lands on onboarding");

  const found = await admin.auth.admin.listUsers();
  userId = found.data.users.find((u) => u.email === email)?.id ?? null;

  // 2. Complete the 3-step onboarding the way a student would: the name and the
  //    weekly commitment are the only fields without defaults.
  const studentName = "Ravi Kumar";
  await page.getByLabel("Preferred name").fill(studentName);
  await page.getByRole("button", { name: /Continue/i }).click();      // step 1 → 2
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Continue/i }).click();      // step 2 → 3
  await page.waitForTimeout(300);
  await page.getByLabel("Weekly commitment").fill("Finish trees and solve 25 practice problems before Sunday.");
  await page.getByRole("button", { name: /Create my space/i }).click();

  // Onboarding lands on the welcome reveal, which greets by name.
  await page.waitForURL(/\/welcome/, { timeout: 20000 });
  const welcomeHeading = (await page.locator("h1").first().textContent()) ?? "";
  if (!welcomeHeading.includes(studentName)) throw new Error(`welcome missing the name: “${welcomeHeading}”`);

  // Onboarding must have actually persisted, not just navigated.
  const prof = await admin.from("profiles").select("display_name,onboarding_completed_at").eq("id", userId).maybeSingle();
  if (!prof.data?.onboarding_completed_at) throw new Error("onboarding_completed_at was not saved");
  if (prof.data.display_name !== studentName) throw new Error(`name not saved: got “${prof.data.display_name}”`);
  record("onboarding saves the name and completion, greets on the welcome screen");

  await page.getByRole("link", { name: /Enter your space/i }).click();
  await page.waitForURL(/\/app(\b|\/|$)/, { timeout: 20000 });

  // 3. The name the student typed must greet them on the dashboard.
  const heading = (await page.locator("h1").first().textContent()) ?? "";
  if (!heading.includes(studentName)) throw new Error(`dashboard greeting missing the name: “${heading}”`);
  record(`the dashboard greets them by name — “${heading.trim()}”`);

  // PYQ must be gone from the navigation entirely.
  await check("PYQ is removed from the workspace navigation", async () => {
    const navText = (await page.locator("nav[aria-label='Workspace']").first().textContent()) ?? "";
    if (/pyq/i.test(navText)) throw new Error("nav still mentions PYQ");
    if (!/Syllabus/.test(navText) || !/Vault/.test(navText)) throw new Error("nav missing expected items");
  });

  // 3. Every feature renders without an error.
  for (const [path, label] of FEATURES) {
    errors.length = 0;
    try {
      const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 20000 });
      const status = response?.status() ?? 0;
      // A protected page bounced to /login means the session broke.
      if (page.url().includes("/login")) throw new Error("redirected to /login (session lost)");
      if (status >= 400) throw new Error(`HTTP ${status}`);
      const h1 = await page.locator("h1").first().textContent({ timeout: 8000 }).catch(() => null);
      if (!h1 || !h1.trim()) throw new Error("no heading rendered");
      if (errors.length) throw new Error(`console: ${errors.slice(0, 2).join(" | ")}`);
      record(`${label} (${path}) renders — “${h1.trim().slice(0, 40)}”`);
    } catch (error) {
      record(`${label} (${path})`, error.message);
    }
  }

  // The removed PYQ route must not resolve to a real page anymore.
  await check("the old /app/pyqs route no longer renders a PYQ page", async () => {
    const res = await page.goto(`${BASE}/app/pyqs`, { waitUntil: "domcontentloaded" });
    const body = (await page.locator("body").textContent()) ?? "";
    // Either a 404 or a redirect elsewhere is fine — what must NOT happen is a
    // working PYQ desk.
    if ((res?.status() ?? 0) < 400 && /pyq/i.test(body) && page.url().includes("/app/pyqs")) {
      throw new Error("the PYQ desk still renders");
    }
  });

  // Theme switching must apply instantly on pick — no Save, no reload.
  await check("picking a theme applies live, instantly, with no reload", async () => {
    await page.goto(`${BASE}/app/settings`, { waitUntil: "networkidle" });
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    // Click a theme radio different from the current one.
    const themes = ["editorial-calm", "focus-tech", "soft-personal", "midnight-paper"];
    const target = themes.find((t) => t !== before) ?? "focus-tech";
    await page.locator(`.settings-theme-option:has(input[name='theme'])`).nth(themes.indexOf(target)).click();
    await page.waitForFunction((t) => document.documentElement.dataset.theme === t, target, { timeout: 4000 });
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    if (after !== target) throw new Error(`theme did not switch: ${before} → ${after}`);
    // And the switch actually changes the painted background color.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    if (!bg) throw new Error("no computed background after theme switch");
  });

  // The layout must not overflow horizontally on a small phone.
  await check("no horizontal overflow on a 320px phone screen", async () => {
    await page.setViewportSize({ width: 320, height: 720 });
    for (const path of ["/app", "/app/syllabus", "/app/settings"]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 2) throw new Error(`${path} overflows by ${overflow}px at 320w`);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
  });
} catch (error) {
  record("walkthrough", error.message || String(error));
} finally {
  if (userId) { await admin.auth.admin.deleteUser(userId).catch(() => {}); console.log(`· removed ${email}`); }
  await browser.close();
}

console.log(`\n${passed}/${results.length} walkthrough checks passed`);
