/* Cross-device data guarantee.
 *
 * The promise: a student signs in on any device and sees everything they saved
 * — notes, reflections, goals, PDFs — and no one else ever sees it. That rests
 * entirely on two things being true against the live database: their own
 * authenticated session can read back what it wrote, and Row Level Security
 * hides it from every other user.
 *
 * This writes as the user through their RLS-scoped session (never the service
 * role), reads it back through a SECOND independent session for the same user
 * (that is the "other device"), and then proves a different user is blind to it.
 *
 * Two throwaway accounts, created and deleted around the run.
 *
 *   node --env-file=.env.local tests/cross-device.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, svc, { auth: { persistSession: false, autoRefreshToken: false } });

let passed = 0;
const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push([name]); passed += 1; console.log(`✓ ${name}`); }
  catch (e) { results.push([name, e]); process.exitCode = 1; console.error(`✗ ${name}\n  ${e.message}`); }
};

// A fresh signed-in client = a fresh device. Nothing is shared between them.
async function device(email, password) {
  const c = createClient(url, pub, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed: ${error.message}`);
  return c;
}

const password = "MyGateP@ss2027";
const alice = `alice+${Date.now()}@gate-os-check.dev`;
const bob = `bob+${Date.now()}@gate-os-check.dev`;
let aliceId, bobId;

try {
  aliceId = (await admin.auth.admin.createUser({ email: alice, password, email_confirm: true })).data.user.id;
  bobId = (await admin.auth.admin.createUser({ email: bob, password, email_confirm: true })).data.user.id;

  // Alice writes on "device A".
  const deviceA = await device(alice, password);
  const noteTitle = `Amortized analysis ${Date.now()}`;
  const reflectionText = `Understood potential method today ${Date.now()}`;
  const goalTitle = `Finish DS trees ${Date.now()}`;

  await check("a signed-in student can save a note, reflection, and goal", async () => {
    const n = await deviceA.from("notes").insert({ user_id: aliceId, kind: "freeform", title: noteTitle }).select("id").single();
    if (n.error) throw new Error(`note: ${n.error.message}`);
    const r = await deviceA.from("reflections").insert({ user_id: aliceId, granularity: "daily", content: reflectionText }).select("id").single();
    if (r.error) throw new Error(`reflection: ${r.error.message}`);
    const g = await deviceA.from("goals").insert({ user_id: aliceId, period: "weekly", target_date: "2027-02-07", title: goalTitle }).select("id").single();
    if (g.error) throw new Error(`goal: ${g.error.message}`);
  });

  await check("the same account on another device sees all of it", async () => {
    const deviceB = await device(alice, password); // fresh session = second device
    const notes = await deviceB.from("notes").select("title").eq("title", noteTitle);
    if (notes.error) throw new Error(notes.error.message);
    if (!notes.data.some((row) => row.title === noteTitle)) throw new Error("note not visible on device B");
    const refs = await deviceB.from("reflections").select("content").eq("content", reflectionText);
    if (!refs.data?.some((row) => row.content === reflectionText)) throw new Error("reflection not visible on device B");
    const goals = await deviceB.from("goals").select("title").eq("title", goalTitle);
    if (!goals.data?.some((row) => row.title === goalTitle)) throw new Error("goal not visible on device B");
  });

  await check("onboarding data (name, weekly goal) is there on a fresh login too", async () => {
    // Simulate onboarding having run for Alice by setting her display name.
    await admin.from("profiles").update({ display_name: "Alice Aspirant" }).eq("id", aliceId);
    const deviceC = await device(alice, password);
    const prof = await deviceC.from("profiles").select("display_name").eq("id", aliceId).maybeSingle();
    if (prof.data?.display_name !== "Alice Aspirant") throw new Error(`name not readable on fresh device: ${prof.data?.display_name}`);
  });

  await check("a different student is completely blind to Alice's data (RLS)", async () => {
    const bobDevice = await device(bob, password);
    const notes = await bobDevice.from("notes").select("title").eq("title", noteTitle);
    if (notes.data?.length) throw new Error("LEAK: Bob can read Alice's note");
    const refs = await bobDevice.from("reflections").select("content").eq("content", reflectionText);
    if (refs.data?.length) throw new Error("LEAK: Bob can read Alice's reflection");
    const goals = await bobDevice.from("goals").select("title").eq("title", goalTitle);
    if (goals.data?.length) throw new Error("LEAK: Bob can read Alice's goal");
    // And Bob's own workspace is simply empty, not erroring.
    const own = await bobDevice.from("notes").select("id");
    if (own.error) throw new Error(`Bob cannot read his own notes: ${own.error.message}`);
  });

  await check("a student cannot forge a row as someone else (RLS write guard)", async () => {
    const bobDevice = await device(bob, password);
    const forged = await bobDevice.from("notes").insert({ user_id: aliceId, kind: "freeform", title: "forged" }).select("id").single();
    if (!forged.error) throw new Error("LEAK: Bob wrote a note under Alice's user_id");
  });

  // The PDF vault rides on Storage RLS, a separate policy set from the tables.
  const pdfPath = `${aliceId}/${Date.now()}-amortized.pdf`;
  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

  await check("a student can upload a PDF and open it again from another device", async () => {
    const deviceA = await device(alice, password);
    const up = await deviceA.storage.from("private-notes").upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: false });
    if (up.error) throw new Error(`upload: ${up.error.message}`);

    const deviceB = await device(alice, password); // other device
    const signed = await deviceB.storage.from("private-notes").createSignedUrl(pdfPath, 120);
    if (signed.error) throw new Error(`signed url: ${signed.error.message}`);
    const got = await fetch(signed.data.signedUrl);
    if (!got.ok) throw new Error(`download HTTP ${got.status}`);
    const bytes = Buffer.from(await got.arrayBuffer());
    if (bytes.length !== pdfBytes.length) throw new Error(`size mismatch ${bytes.length} vs ${pdfBytes.length}`);
    if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("not a PDF");
  });

  await check("another student cannot read or overwrite that PDF (Storage RLS)", async () => {
    const bobDevice = await device(bob, password);
    const read = await bobDevice.storage.from("private-notes").createSignedUrl(pdfPath, 120);
    if (!read.error) throw new Error("LEAK: Bob signed a URL for Alice's PDF");
    const write = await bobDevice.storage.from("private-notes").upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (!write.error) throw new Error("LEAK: Bob overwrote a file under Alice's prefix");
  });
} finally {
  if (aliceId) await admin.auth.admin.deleteUser(aliceId).catch(() => {});
  if (bobId) await admin.auth.admin.deleteUser(bobId).catch(() => {});
  console.log("· test accounts removed");
}

console.log(`\n${passed}/${results.length} cross-device checks passed`);
