"use client";

import { Pause, Play, RotateCcw, Square, TimerReset } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface FocusTimerProps {
  initialDurationSeconds?: number;
  subjectOptions?: string[];
  initialSubject?: string;
  initialTopic?: string;
  onComplete?: (session: { elapsedSeconds: number; subject: string; topic: string; intention: string }) => void;
  onSessionChange?: (session: { status: "idle" | "running" | "paused" | "complete"; elapsedSeconds: number }) => void;
}

const durationOptions = [25, 50, 75, 90];

export function FocusTimer({ initialDurationSeconds = 25 * 60, subjectOptions = [], initialSubject = "", initialTopic = "", onComplete, onSessionChange }: FocusTimerProps) {
  const [durationSeconds, setDurationSeconds] = useState(initialDurationSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "complete">("idle");
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [intention, setIntention] = useState("");
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("gate-os-focus-session");
      if (!saved) return;
      const restored = JSON.parse(saved) as { durationSeconds?: number; elapsedSeconds?: number; subject?: string; topic?: string; intention?: string; status?: string };
      const safeDuration = Math.max(60, Number(restored.durationSeconds) || initialDurationSeconds);
      const safeElapsed = Math.min(safeDuration, Math.max(0, Number(restored.elapsedSeconds) || 0));
      const timer = window.setTimeout(() => {
        setDurationSeconds(safeDuration);
        setElapsedSeconds(safeElapsed);
        accumulatedRef.current = safeElapsed;
        setSubject(restored.subject ?? initialSubject);
        setTopic(restored.topic ?? initialTopic);
        setIntention(restored.intention ?? "");
        if (safeElapsed > 0 && safeElapsed < safeDuration) setStatus("paused");
      }, 0);
      return () => window.clearTimeout(timer);
    } catch {}
  }, [initialDurationSeconds, initialSubject, initialTopic]);

  useEffect(() => {
    if (status === "complete") {
      window.localStorage.removeItem("gate-os-focus-session");
      return;
    }
    window.localStorage.setItem("gate-os-focus-session", JSON.stringify({ durationSeconds, elapsedSeconds, subject, topic, intention, status }));
  }, [durationSeconds, elapsedSeconds, intention, status, subject, topic]);

  const remaining = Math.max(durationSeconds - elapsedSeconds, 0);
  const formattedTime = useMemo(() => `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`, [remaining]);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const startedAt = startedAtRef.current;
      if (!startedAt) return;
      const nextElapsed = Math.min(durationSeconds, accumulatedRef.current + Math.floor((Date.now() - startedAt) / 1000));
      setElapsedSeconds(nextElapsed);
      if (nextElapsed >= durationSeconds) {
        accumulatedRef.current = durationSeconds;
        startedAtRef.current = null;
        setStatus("complete");
      }
    };
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [durationSeconds, status]);

  useEffect(() => {
    onSessionChange?.({ status, elapsedSeconds });
  }, [elapsedSeconds, onSessionChange, status]);

  useEffect(() => {
    if (status === "complete" && !completedRef.current) {
      completedRef.current = true;
      onComplete?.({ elapsedSeconds, subject, topic, intention });
    }
  }, [elapsedSeconds, intention, onComplete, status, subject, topic]);

  const start = () => {
    if (status === "complete") return;
    startedAtRef.current = Date.now();
    setStatus("running");
  };
  const pause = () => {
    if (startedAtRef.current) accumulatedRef.current += Math.floor((Date.now() - startedAtRef.current) / 1000);
    startedAtRef.current = null;
    setElapsedSeconds(Math.min(accumulatedRef.current, durationSeconds));
    setStatus("paused");
  };
  const reset = () => {
    startedAtRef.current = null;
    accumulatedRef.current = 0;
    completedRef.current = false;
    setElapsedSeconds(0);
    setStatus("idle");
  };
  const chooseDuration = (minutes: number) => {
    startedAtRef.current = null;
    accumulatedRef.current = 0;
    completedRef.current = false;
    setDurationSeconds(minutes * 60);
    setElapsedSeconds(0);
    setStatus("idle");
  };

  return (
    <section className="workspace-page focus-timer" aria-labelledby="focus-title">
      <header className="workspace-page-header"><div><p className="workspace-eyebrow"><TimerReset aria-hidden="true" /> Focus</p><h1 id="focus-title">Make the next block matter.</h1><p>Choose a clear target, then stay with it.</p></div></header>
      <div className="focus-timer-layout">
        <section className="focus-timer-display" aria-live="polite" aria-atomic="true">
          <p>{status === "complete" ? "Session complete" : status === "paused" ? "Paused" : status === "running" ? "In focus" : "Ready when you are"}</p>
          <output aria-label={`${remaining} seconds remaining`}>{formattedTime}</output>
          <div className="focus-timer-actions">
            {status === "running" ? <button className="workspace-primary-button" type="button" onClick={pause}><Pause aria-hidden="true" /> Pause</button> : <button className="workspace-primary-button" type="button" onClick={start} disabled={status === "complete"}><Play aria-hidden="true" /> {status === "paused" ? "Resume" : "Begin focus"}</button>}
            <button className="workspace-secondary-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" /> Reset</button>
            {status !== "idle" ? <button className="workspace-text-button" type="button" onClick={reset}><Square aria-hidden="true" /> End session</button> : null}
          </div>
        </section>
        <form className="focus-timer-setup" onSubmit={(event) => { event.preventDefault(); start(); }}>
          <fieldset><legend>Session length</legend><div className="workspace-choice-row">{durationOptions.map((minutes) => <button className={`workspace-choice-button${durationSeconds === minutes * 60 ? " is-selected" : ""}`} type="button" key={minutes} aria-pressed={durationSeconds === minutes * 60} onClick={() => chooseDuration(minutes)}>{minutes} min</button>)}</div></fieldset>
          <label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">Choose a subject</option>{subjectOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label>Topic<input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="For example, deadlocks" /></label>
          <label>What does a good session look like?<textarea value={intention} onChange={(event) => setIntention(event.target.value)} rows={3} placeholder="Solve 10 questions and write down one recurring mistake." /></label>
        </form>
      </div>
    </section>
  );
}
