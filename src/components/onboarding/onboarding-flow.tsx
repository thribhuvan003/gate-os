"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const subjects = ["Engineering Mathematics", "Data Structures", "Algorithms", "Operating Systems", "Databases", "Computer Networks"];
const themes = [
  { id: "editorial-calm", name: "Editorial Calm", colors: ["#f3f0e7", "#244b36", "#1b1f1b"] },
  { id: "focus-tech", name: "Focus Tech", colors: ["#0e100f", "#c7ff4f", "#f0f4ec"] },
  { id: "soft-personal", name: "Soft Personal", colors: ["#eff0f8", "#ee766d", "#17234a"] },
  { id: "midnight-paper", name: "Midnight Paper", colors: ["#141719", "#e7b45b", "#f2ede1"] },
] as const;

export function OnboardingFlow({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    displayName: "",
    timezone: "Asia/Kolkata",
    targetDate: "2027-02-07",
    studyWindow: "19:00",
    themeId: "editorial-calm",
    fontPairId: "editorial",
    accentId: "forest",
    density: "comfortable",
    motion: "full",
    layoutPreset: "balanced",
    currentSubject: "Data Structures",
    weeklyCommitment: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function next() {
    setError("");
    if (step === 1 && form.displayName.trim().length < 2) return setError("Tell us what you would like your space to call you.");
    setStep((current) => Math.min(3, current + 1));
  }

  async function finish(event: FormEvent) {
    event.preventDefault();
    if (form.weeklyCommitment.trim().length < 5) return setError("Write one specific commitment for this week.");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "Could not save your space.");
      router.push(`/welcome?next=${encodeURIComponent(nextPath)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your space.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1460px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] lg:grid-cols-[.72fr_1.28fr]">
      <aside className="relative hidden overflow-hidden bg-[var(--accent)] p-10 text-[var(--on-accent)] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_22%),linear-gradient(125deg,transparent_35%,white_35%,white_35.2%,transparent_35.2%)]" />
        <p className="mono-label relative text-[var(--on-accent)]/70">GATE OS · First entry</p>
        <div className="relative">
          <p className="display-type text-7xl leading-[.84]">A serious space can still feel entirely yours.</p>
          <p className="mt-7 max-w-md text-[var(--on-accent)]/70">Three quiet decisions. Then the workspace gets out of the way and helps you prepare.</p>
        </div>
        <p className="relative text-sm text-[var(--on-accent)]/60">Private by default · Built for GATE CS &amp; IT 2027</p>
      </aside>

      <form className="flex flex-col p-5 sm:p-9 lg:min-h-[760px] lg:p-14" onSubmit={finish}>
        <div className="flex items-center justify-between gap-4">
          <span className="mono-label text-[var(--muted)]">Step {step} of 3</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((index) => <i key={index} className={`h-1.5 w-8 rounded-full transition-colors duration-300 sm:w-10 ${step >= index ? "bg-[var(--accent)]" : "bg-[var(--paper-deep)]"}`} />)}
          </div>
        </div>

        <div className="flex-1 pb-8 pt-8 sm:pt-10 lg:pt-12">
          {step === 1 && <section className="w-full reveal-up" aria-labelledby="identity-title">
            <p className="mono-label text-[var(--accent)]">Identity and target</p>
            <h1 id="identity-title" className="display-type mt-3 text-[length:var(--text-4xl)] leading-[.9] break-words">What should this space call you?</h1>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">Preferred name<input className="text-field" value={form.displayName} onChange={(event) => update("displayName", event.target.value)} autoFocus autoComplete="name" /></label>
              <label className="field-label">Target date<input className="text-field" type="date" value={form.targetDate} onChange={(event) => update("targetDate", event.target.value)} /></label>
              <label className="field-label">Preferred study start<input className="text-field" type="time" value={form.studyWindow} onChange={(event) => update("studyWindow", event.target.value)} /></label>
            </div>
          </section>}

          {step === 2 && <section className="w-full reveal-up" aria-labelledby="theme-title">
            <p className="mono-label text-[var(--accent)]">Make it yours</p>
            <h1 id="theme-title" className="display-type mt-3 text-[length:var(--text-4xl)] leading-[.9] break-words">Choose the room you want to return to.</h1>
            <fieldset className="mt-10 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Theme</legend>
              {themes.map((theme) => { const selected = form.themeId === theme.id; return <label className="surface-card flex min-h-28 cursor-pointer items-center justify-between gap-4 p-5 transition-colors duration-200" style={selected ? { borderColor: "var(--accent)", background: "var(--accent-soft)" } : undefined} key={theme.id}>
                <span><strong className="block">{theme.name}</strong><span className="mt-2 flex gap-1.5">{theme.colors.map((color) => <i className="size-5 rounded-full border border-black/10" style={{ background: color }} key={color} />)}</span></span>
                <input className="size-5 accent-[var(--accent)]" type="radio" name="theme" value={theme.id} checked={selected} onChange={() => update("themeId", theme.id)} />
              </label>; })}
            </fieldset>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="field-label">Density<select className="select-field" value={form.density} onChange={(event) => update("density", event.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
              <label className="field-label">Motion<select className="select-field" value={form.motion} onChange={(event) => update("motion", event.target.value)}><option value="full">Full</option><option value="subtle">Subtle</option><option value="reduced">Reduced</option></select></label>
              <label className="field-label">Home rhythm<select className="select-field" value={form.layoutPreset} onChange={(event) => update("layoutPreset", event.target.value)}><option value="balanced">Balanced</option><option value="focus">Focus</option><option value="revision">Revision</option></select></label>
            </div>
          </section>}

          {step === 3 && <section className="w-full reveal-up" aria-labelledby="commitment-title">
            <p className="mono-label text-[var(--accent)]">Begin deliberately</p>
            <h1 id="commitment-title" className="display-type mt-3 text-[length:var(--text-4xl)] leading-[.9] break-words">Give this week one clear promise.</h1>
            <div className="mt-10 grid gap-5">
              <label className="field-label">Current subject<select className="select-field" value={form.currentSubject} onChange={(event) => update("currentSubject", event.target.value)}>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
              <label className="field-label">Weekly commitment<textarea className="textarea-field" value={form.weeklyCommitment} onChange={(event) => update("weeklyCommitment", event.target.value)} placeholder="Example: Finish trees and solve 25 practice problems before Sunday." /></label>
            </div>
          </section>}
        </div>

        <p className="status-message mb-4" role="alert" data-error="true">{error}</p>
        <div className="flex items-center justify-between gap-3">
          <button className="secondary-button disabled:pointer-events-none disabled:opacity-40" type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1}><ArrowLeft aria-hidden="true" size={18} /> Back</button>
          {step < 3 ? <button className="primary-button" type="button" onClick={next}>Continue <ArrowRight aria-hidden="true" size={18} /></button> : <button className="primary-button" type="submit" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" size={18} />} Create my space</button>}
        </div>
      </form>
    </div>
  );
}
