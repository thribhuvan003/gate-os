"use client";

import { ArrowUpRight, Check, ClipboardCheck, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { PyqAttempt } from "@/app/app/pyqs/page";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const years = Array.from({ length: 20 }, (_, index) => 2026 - index);
const officialRecent = "https://gate2026.iitg.ac.in/QPs-answer-keys.html";
const officialArchive = "https://gate2026.iitg.ac.in/download.html";

export function PyqDesk({ initialAttempts }: { initialAttempts: PyqAttempt[] }) {
  const [attempts, setAttempts] = useState(initialAttempts);
  const [year, setYear] = useState(2026);
  const [variant, setVariant] = useState("CS-1");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const byKey = useMemo(() => new Map(attempts.map((attempt) => [`${attempt.year}::${attempt.variant}`, attempt])), [attempts]);
  const byYear = useMemo(() => {
    const map = new Map<number, PyqAttempt>();
    for (const attempt of attempts) if (!map.has(attempt.year)) map.set(attempt.year, attempt);
    return map;
  }, [attempts]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const setup = await getBrowserSupabaseClient(); if (!setup.value) { setMessage(setup.error ?? "Sign in again to save this attempt."); return; }
    const { data: authData } = await setup.value.auth.getUser(); if (!authData.user) { setMessage("Your session expired. Sign in again to save this attempt."); return; }
    const numericScore = score ? Math.max(0, Math.min(100, Number(score))) : null;
    const payload = { user_id: authData.user.id, year, paper_variant: variant, status: "attempted", score: numericScore, attempted_on: new Date().toISOString().slice(0, 10), notes: notes || null };
    const existing = byKey.get(`${year}::${variant}`);
    const result = existing
      ? await setup.value.from("pyq_attempts").update(payload).eq("id", existing.id).select("id").single()
      : await setup.value.from("pyq_attempts").insert(payload).select("id").single();
    if (!result.error && result.data) {
      const saved: PyqAttempt = { id: result.data.id, year, variant, status: "attempted", score: numericScore, attemptedOn: new Date().toISOString().slice(0, 10), notes };
      setAttempts((current) => [saved, ...current.filter((item) => !(item.year === year && item.variant === variant))]);
      setNotes(""); setScore("");
      setMessage(`GATE ${year} · ${variant} attempt saved.`);
      return;
    }
    setMessage("This attempt could not be saved. Scores must stay between 0 and 100 — adjust and try again.");
  }

  return <section className="workspace-page" aria-labelledby="pyq-title"><header className="workspace-page-header"><div><p className="workspace-eyebrow"><ClipboardCheck aria-hidden="true" /> Official PYQ desk</p><h1 id="pyq-title">Solve the paper. Keep the lesson.</h1><p>One clean path to official GATE papers and answer keys—then a private record of what the attempt taught you.</p></div><a className="workspace-primary-button" style={{ color: "var(--paper)" }} href={officialRecent} target="_blank" rel="noreferrer">Open official 2026 papers <ArrowUpRight aria-hidden="true" /></a></header><div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><section className="workspace-panel"><div className="workspace-panel-header"><div><p className="workspace-eyebrow">2007–2026</p><h2>Your paper history</h2></div><a className="workspace-secondary-button" href={officialArchive} target="_blank" rel="noreferrer">Official archive <ArrowUpRight size={16} /></a></div><div className="mt-6 grid gap-2 sm:grid-cols-2">{years.map((itemYear) => { const attempt = byYear.get(itemYear); return <button key={itemYear} type="button" onClick={() => { setYear(itemYear); setVariant(attempt?.variant ?? (itemYear === 2026 ? "CS-1" : "CS")); setScore(attempt?.score?.toString() ?? ""); setNotes(attempt?.notes ?? ""); }} className={`group flex min-h-20 items-center justify-between rounded-2xl border p-4 text-left transition duration-200 ${year === itemYear ? "border-[var(--accent)] bg-[var(--soft-accent)]" : "border-[var(--line)] bg-[var(--background)] hover:-translate-y-0.5"}`}><span><strong className="display-type block text-2xl font-normal">GATE {itemYear}</strong><small className="text-[var(--muted)]">{attempt ? `${attempt.variant} · ${attempt.status}` : "Not attempted yet"}</small></span>{attempt ? <span className="grid size-8 place-items-center rounded-full bg-[var(--accent)] text-white"><Check size={16} /></span> : <span className="text-sm text-[var(--muted)]">Open</span>}</button>; })}</div></section><form className="workspace-panel grid content-start gap-4" onSubmit={save}><div><p className="workspace-eyebrow">Attempt record</p><h2 className="mt-2">GATE {year}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Record the attempt after solving it under timed conditions. Add mistakes separately when they deserve another review.</p></div><label className="field-label">Paper variant<select className="select-field" value={variant} onChange={(event) => setVariant(event.target.value)}><option>CS</option><option>CS-1</option><option>CS-2</option></select></label><label className="field-label">Score out of 100<input className="text-field" type="number" min="0" max="100" step="0.01" value={score} onChange={(event) => setScore(event.target.value)} placeholder="Optional" /></label><label className="field-label">What did this paper expose?<textarea className="textarea-field" rows={6} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Time pressure, weak concepts, avoidable errors, and the next revision step." /></label><button className="workspace-primary-button w-fit" type="submit"><Save size={16} /> Save attempt</button>{message ? <p role="status" className="text-sm text-[var(--muted)]">{message}</p> : null}<p className="workspace-field-help">GATE OS links only to the official GATE archive. It does not republish or scrape copyrighted question banks.</p></form></div></section>;
}
