"use client";

import { ArrowRight, BookOpenCheck, CalendarDays, CircleCheck, Clock3, Play, Sparkles } from "lucide-react";
import type { DashboardMetric, RevisionItem, WorkspaceGoal } from "./types";

export interface HomeDashboardProps {
  greeting: string;
  greetingDetail: string;
  nextAction?: { title: string; description: string; subject?: string };
  metrics?: DashboardMetric[];
  goals?: WorkspaceGoal[];
  revisionItems?: RevisionItem[];
  syllabusProgress?: { completed: number; total: number; label?: string };
  studyDays?: Array<{ label: string; completed: boolean; minutes?: number }>;
  onStartFocus?: () => void;
  onOpenGoal?: (goalId: string) => void;
  onOpenRevision?: (itemId: string) => void;
  onOpenSyllabus?: () => void;
}

export function HomeDashboard({
  greeting,
  greetingDetail,
  nextAction,
  metrics = [],
  goals = [],
  revisionItems = [],
  syllabusProgress,
  studyDays = [],
  onStartFocus,
  onOpenGoal,
  onOpenRevision,
  onOpenSyllabus,
}: HomeDashboardProps) {
  const progress = syllabusProgress ? Math.round((syllabusProgress.completed / Math.max(syllabusProgress.total, 1)) * 100) : 0;

  return (
    <section className="workspace-page home-dashboard" aria-labelledby="home-title">
      <header className="workspace-page-header home-dashboard-header">
        <div>
          <p className="workspace-eyebrow"><Sparkles aria-hidden="true" /> Your study space</p>
          <h1 id="home-title">{greeting}</h1>
          <p>{greetingDetail}</p>
        </div>
        <button className="workspace-primary-button" type="button" onClick={onStartFocus}>
          <Play aria-hidden="true" /> Start a focus session
        </button>
      </header>

      {nextAction ? (
        <article className="workspace-next-action" aria-labelledby="next-action-title">
          <div>
            <p className="workspace-eyebrow">Next meaningful action</p>
            <h2 id="next-action-title">{nextAction.title}</h2>
            <p>{nextAction.description}</p>
            {nextAction.subject ? <span className="workspace-chip">{nextAction.subject}</span> : null}
          </div>
          <button className="workspace-text-button" type="button" onClick={onStartFocus}>
            Begin <ArrowRight aria-hidden="true" />
          </button>
        </article>
      ) : null}

      {metrics.length ? (
        <section className="workspace-metric-grid" aria-label="Study summary">
          {metrics.map((metric) => (
            <article className="workspace-metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.detail ? <small>{metric.detail}</small> : null}
            </article>
          ))}
        </section>
      ) : null}

      <div className="workspace-dashboard-grid">
        <section className="workspace-panel" aria-labelledby="commitments-title">
          <div className="workspace-panel-header">
            <div>
              <p className="workspace-eyebrow"><CircleCheck aria-hidden="true" /> Commitments</p>
              <h2 id="commitments-title">Today, done with intention</h2>
            </div>
          </div>
          {goals.length ? <ul className="workspace-checklist">{goals.slice(0, 4).map((goal) => <li key={goal.id}><button type="button" className="workspace-list-action" onClick={() => onOpenGoal?.(goal.id)}><span className={`workspace-check-indicator${goal.complete ? " is-complete" : ""}`} aria-hidden="true">{goal.complete ? "✓" : ""}</span><span><strong>{goal.title}</strong>{goal.dueLabel ? <small>{goal.dueLabel}</small> : null}</span></button></li>)}</ul> : <EmptyState message="Set one small commitment to make today count." />}
        </section>

        <section className="workspace-panel" aria-labelledby="revision-title">
          <div className="workspace-panel-header">
            <div>
              <p className="workspace-eyebrow"><CalendarDays aria-hidden="true" /> Revision queue</p>
              <h2 id="revision-title">Keep ideas retrievable</h2>
            </div>
          </div>
          {revisionItems.length ? <ul className="workspace-list">{revisionItems.slice(0, 4).map((item) => <li key={item.id}><button type="button" className="workspace-list-action" onClick={() => onOpenRevision?.(item.id)}><span><strong>{item.title}</strong><small>{item.subject} · {item.dueLabel}</small></span><ArrowRight aria-hidden="true" /></button></li>)}</ul> : <EmptyState message="Add a topic or mistake to create your first review." />}
        </section>
      </div>

      <div className="workspace-dashboard-grid">
        <section className="workspace-panel workspace-syllabus-snapshot" aria-labelledby="syllabus-snapshot-title">
          <div className="workspace-panel-header">
            <div>
              <p className="workspace-eyebrow"><BookOpenCheck aria-hidden="true" /> Syllabus</p>
              <h2 id="syllabus-snapshot-title">{syllabusProgress?.label ?? "GATE CS/IT 2027"}</h2>
            </div>
            <button className="workspace-text-button" type="button" onClick={onOpenSyllabus}>Open tracker <ArrowRight aria-hidden="true" /></button>
          </div>
          {syllabusProgress ? <><div className="workspace-progress-label"><span>{syllabusProgress.completed} of {syllabusProgress.total} topics</span><strong>{progress}%</strong></div><div className="workspace-progress-track" aria-label={`${progress}% syllabus complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div></> : <EmptyState message="Your syllabus progress will appear here." />}
        </section>

        <section className="workspace-panel workspace-rhythm-panel" aria-labelledby="rhythm-title">
          <div className="workspace-panel-header">
            <div>
              <p className="workspace-eyebrow"><Clock3 aria-hidden="true" /> Study rhythm</p>
              <h2 id="rhythm-title">A year built one day at a time</h2>
            </div>
          </div>
          {studyDays.length ? <ol className="workspace-study-rhythm" aria-label="Recent study days">{studyDays.map((day) => <li key={day.label} className={day.completed ? "is-complete" : ""}><span aria-hidden="true" /><small>{day.label}</small><span className="sr-only">{day.label}: {day.completed ? `${day.minutes ?? 0} study minutes` : "no study logged"}</span></li>)}</ol> : <EmptyState message="Your focused days will form a quiet rhythm here." />}
        </section>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="workspace-empty-state">{message}</p>;
}
