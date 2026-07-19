"use client";

import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "A quiet night";
}

export function InteractivePreview() {
  const [focusStarted, setFocusStarted] = useState(false);
  const [topicComplete, setTopicComplete] = useState(false);
  const [revisionReviewed, setRevisionReviewed] = useState(false);
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const syllabusPercent = topicComplete ? 43 : 42;
  const revisionCount = revisionReviewed ? 2 : 3;

  return (
    <div id="preview" className="relative scroll-mt-6 reveal-up [animation-delay:120ms]">
      <div className="absolute -inset-8 -z-10 rounded-[48px] bg-[var(--accent-soft)] opacity-65 blur-3xl" />
      <div className="surface-card overflow-hidden p-3 shadow-[var(--shadow)] sm:p-4">
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-6 border-b border-[var(--line)] pb-6">
            <div>
              <p className="mono-label text-[var(--muted)]">Interactive preview</p>
              <h2 className="display-type mt-2 text-5xl leading-none">{greeting}, Arjun.</h2>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-bold text-[var(--accent)]">27 day rhythm</span>
          </div>
          <div className="grid gap-4 pt-5 sm:grid-cols-[1.12fr_.88fr]">
            <article className="rounded-[18px] bg-[var(--accent)] p-6 text-white">
              <p className="mono-label text-white/65">Next focus</p>
              <div className="mt-10 flex items-end justify-between gap-4">
                <div>
                  <strong className="display-type text-7xl font-normal">45</strong>
                  <span className="ml-2 text-sm text-white/70">minutes</span>
                </div>
                <span className="rounded-full bg-white/12 p-3"><ArrowRight aria-hidden="true" /></span>
              </div>
              <p className="mt-6 text-sm text-white/75">Data Structures · Trees and heaps</p>
              <button className="mt-5 min-h-11 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/35" type="button" aria-pressed={focusStarted} onClick={() => setFocusStarted((current) => !current)}>
                {focusStarted ? "Preview focus paused" : "Start focus preview"}
              </button>
              <p className="mt-3 text-xs text-white/65" role="status">{focusStarted ? "Your intention is set. In your space, this block continues with a precise timer." : "Try it: this preview changes instantly and does not create an account or save data."}</p>
            </article>
            <div className="grid gap-4">
              <article className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mono-label text-[var(--muted)]">Syllabus</p>
                    <strong className="display-type mt-3 block text-5xl font-normal">{syllabusPercent}%</strong>
                  </div>
                  <button className={`grid size-10 place-items-center rounded-full border transition focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)] ${topicComplete ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]"}`} type="button" aria-label={topicComplete ? "Mark Trees and heaps incomplete in preview" : "Mark Trees and heaps complete in preview"} aria-pressed={topicComplete} onClick={() => setTopicComplete((current) => !current)}>
                    <Check aria-hidden="true" size={18} />
                  </button>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--paper-deep)]"><i className="block h-full rounded-full bg-[var(--accent)] transition-[width] duration-200" style={{ width: `${syllabusPercent}%` }} /></div>
                <p className="mt-3 text-xs text-[var(--muted)]">{topicComplete ? "Trees and heaps checked in this preview." : "Check a topic to see progress update."}</p>
              </article>
              <article className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mono-label text-[var(--muted)]">Revision queue</p>
                    <strong className="mt-3 block text-lg">{revisionCount} ideas worth returning to</strong>
                  </div>
                  <button className="grid size-10 place-items-center rounded-full border border-[var(--line)] text-[var(--accent)] transition hover:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)]" type="button" aria-label={revisionReviewed ? "Restore revision item in preview" : "Mark one revision item reviewed in preview"} aria-pressed={revisionReviewed} onClick={() => setRevisionReviewed((current) => !current)}>
                    <RotateCcw aria-hidden="true" size={17} />
                  </button>
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">{revisionReviewed ? "One item reviewed. Your real queue stays private until you sign in." : "Mark one reviewed to try the queue."}</p>
              </article>
            </div>
          </div>
          <p className="mt-5 text-xs text-[var(--muted)]">This is a private, interactive preview. Your own space begins empty and records only your work.</p>
        </div>
      </div>
    </div>
  );
}
