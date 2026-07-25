/* Deep interaction test — actually USE every feature, not just load it.
 *
 * Signs up one throwaway student, then performs each feature's primary action
 * through the real UI (start a focus session, write a note, add a goal and a
 * reflection, log a mistake, create a circle, tick a syllabus topic) and
 * confirms the row landed in the database. Any console error on any page fails
 * the run. This is the "does the button actually do the thing" test.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/d/ms-playwright node tests/interactions.mjs
 */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const BASE = process.env.WALKTHROUGH_BASE || "http://localhost:3000";
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = `interact+${Date.now()}@gate-os-check.dev`;
const password = "MyGateP@ss2027";

let passed = 0;
const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push([name]); passed += 1; console.log(`✓ ${name}`); }
  catch (e) { results.push([name, e]); process.exitCode = 1; console.error(`✗ ${name}\n  ${e.message || e}`); }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`uncaught: ${e.message}`));
const freshErrors = () => { errors.length = 0; };
const assertNoConsole = () => { if (errors.length) throw new Error(`console: ${errors.slice(0, 2).join(" | ")}`); };

const rowCount = async (table, userIdCol, userId, extra = {}) => {
  let q = admin.from(table).select("id", { count: "exact", head: true }).eq(userIdCol, userId);
  for (const [k, v] of Object.entries(extra)) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
};

let userId = null;
try {
  // Sign up + onboard.
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  const createButton = page.getByRole("button", { name: "Create my workspace" });
  for (let i = 0; i < 5; i++) { await page.getByRole("tab", { name: "Create account" }).click(); if (await createButton.isVisible().catch(() => false)) break; await page.waitForTimeout(500); }
  await createButton.waitFor({ state: "visible", timeout: 10000 });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await createButton.click();
  await page.waitForURL(/\/onboarding/, { timeout: 20000 });
  userId = (await admin.auth.admin.listUsers()).data.users.find((u) => u.email === email)?.id ?? null;
  await page.getByLabel("Preferred name").fill("Interaction Tester");
  await page.getByRole("button", { name: /Continue/i }).click(); await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Continue/i }).click(); await page.waitForTimeout(300);
  await page.getByLabel("Weekly commitment").fill("Solve 25 practice problems before Sunday.");
  await page.getByRole("button", { name: /Create my space/i }).click();
  await page.waitForURL(/\/welcome/, { timeout: 20000 });
  await page.getByRole("link", { name: /Enter your space/i }).click();
  await page.waitForURL(/\/app(\b|\/|$)/, { timeout: 20000 });

  // FOCUS — start a session and log it.
  await check("Focus: begin a session and Finish & save records a study session", async () => {
    freshErrors();
    await page.goto(`${BASE}/app/focus`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Begin focus|Resume/i }).click();
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /Finish.*save/i }).click();
    await page.waitForTimeout(1500);
    assertNoConsole();
    if (await rowCount("study_sessions", "user_id", userId) < 1) throw new Error("no study_sessions row saved");
  });

  // NOTES — create and save a note.
  await check("Notes: New note → type → Save note persists a note", async () => {
    freshErrors();
    await page.goto(`${BASE}/app/notes`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /New note/i }).click();
    await page.waitForTimeout(400);
    const title = page.locator(".notes-title-input");
    await title.waitFor({ state: "visible", timeout: 5000 });
    await title.fill("Amortized analysis recap");
    await page.locator("#note-content").fill("Potential method: pay ahead, spend later.");
    await page.getByRole("button", { name: /Save note/i }).click();
    await page.waitForTimeout(1500);
    assertNoConsole();
    if (await rowCount("notes", "user_id", userId) < 1) throw new Error("no notes row saved");
  });

  // GOALS + REFLECTIONS.
  await check("Goals: add a commitment persists a goal", async () => {
    freshErrors();
    await page.goto(`${BASE}/app/goals`, { waitUntil: "networkidle" });
    await page.getByPlaceholder("Add a meaningful commitment").fill("Finish trees chapter");
    await page.getByRole("button", { name: /Add commitment/i }).click();
    await page.waitForTimeout(1200);
    assertNoConsole();
    if (await rowCount("goals", "user_id", userId) < 2) throw new Error("goal not added (onboarding seeds 1, expected 2+)");
  });

  await check("Reflections: write and save a reflection persists it", async () => {
    freshErrors();
    await page.getByPlaceholder(/What clicked/i).fill("Understood the accounting method today.");
    await page.getByRole("button", { name: /Save reflection/i }).click();
    await page.waitForTimeout(1200);
    assertNoConsole();
    if (await rowCount("reflections", "user_id", userId) < 1) throw new Error("no reflections row saved");
  });

  // MISTAKES.
  await check("Mistakes: add a mistake persists it", async () => {
    freshErrors();
    await page.goto(`${BASE}/app/mistakes`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Add a mistake/i }).click();
    await page.waitForTimeout(400);
    await page.getByLabel(/Concept/i).fill("Page replacement");
    const subject = page.getByLabel(/Subject/i);
    if (await subject.count()) await subject.selectOption({ index: 1 }).catch(() => {});
    await page.getByLabel(/Correct reasoning/i).fill("LRU approximates OPT using recency of use.");
    await page.getByRole("button", { name: /Save to mistake book/i }).click();
    await page.waitForTimeout(1500);
    assertNoConsole();
    if (await rowCount("mistakes", "user_id", userId) < 1) throw new Error("no mistakes row saved");
  });

  // CIRCLES.
  await check("Circles: create a circle persists it", async () => {
    freshErrors();
    await page.goto(`${BASE}/app/circles`, { waitUntil: "networkidle" });
    await page.getByLabel(/Circle name/i).fill("Weekend revision");
    await page.getByRole("button", { name: /Create circle/i }).click();
    await page.waitForTimeout(1500);
    assertNoConsole();
    if (await rowCount("circles", "owner_id", userId) < 1) throw new Error("no circles row saved");
  });

  // SYLLABUS.
  await check("Syllabus: ticking a topic persists progress", async () => {
    freshErrors();
    await page.goto(`${BASE}/app/syllabus`, { waitUntil: "networkidle" });
    // A subject auto-selects; its sections start collapsed (progressive
    // disclosure), so expand the first section to reveal topic checkboxes.
    await page.locator(".syllabus-subject-button").first().waitFor({ state: "visible", timeout: 8000 });
    const firstSection = page.locator(".syllabus-section h3 button").first();
    if (await firstSection.count()) { await firstSection.click(); await page.waitForTimeout(300); }
    const firstTopic = page.locator(".syllabus-topic-control input[type='checkbox']").first();
    await firstTopic.waitFor({ state: "visible", timeout: 8000 });
    await firstTopic.check();
    await page.waitForTimeout(1500);
    assertNoConsole();
    if (await rowCount("syllabus_progress", "user_id", userId) < 1) throw new Error("no syllabus_progress row saved");
  });
} catch (error) {
  await check("interaction run", async () => { throw error; });
} finally {
  if (userId) { await admin.auth.admin.deleteUser(userId).catch(() => {}); console.log(`· removed ${email}`); }
  await browser.close();
}

console.log(`\n${passed}/${results.length} interaction checks passed`);
