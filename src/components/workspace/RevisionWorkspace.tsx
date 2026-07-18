"use client";

import { CalendarClock, Check, Filter, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { RevisionItem } from "./types";

export interface RevisionWorkspaceProps {
  items: RevisionItem[];
  onComplete?: (item: RevisionItem) => void;
  onReschedule?: (item: RevisionItem) => void;
}

export function RevisionWorkspace({ items, onComplete, onReschedule }: RevisionWorkspaceProps) {
  const [filter, setFilter] = useState<"all" | "due" | "topic" | "note" | "mistake">("all");
  const visibleItems = useMemo(() => items.filter((item) => filter === "all" || (filter === "due" ? !item.completed : item.source === filter)), [filter, items]);
  return <section className="workspace-page revision-workspace" aria-labelledby="revision-workspace-title"><header className="workspace-page-header"><div><p className="workspace-eyebrow"><CalendarClock aria-hidden="true" /> Revision queue</p><h1 id="revision-workspace-title">Give important ideas another meeting.</h1><p>Reviews stay deliberate, with the reason you saved them attached.</p></div></header><div className="workspace-filter-bar" aria-label="Filter revision items"><Filter aria-hidden="true" />{(["all", "due", "topic", "note", "mistake"] as const).map((option) => <button className={`workspace-filter-button${filter === option ? " is-selected" : ""}`} key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>{option === "due" ? "Due now" : option[0].toUpperCase() + option.slice(1)}</button>)}</div><ol className="revision-item-list">{visibleItems.map((item) => <li className={item.completed ? "is-complete" : ""} key={item.id}><article><div><span className="workspace-chip">{item.source ?? "topic"}</span><h2>{item.title}</h2><p>{item.subject} · {item.dueLabel}</p></div><div className="workspace-row-actions">{item.completed ? <span className="workspace-complete-label"><Check aria-hidden="true" /> Reviewed</span> : <button className="workspace-primary-button" type="button" onClick={() => onComplete?.(item)}><Check aria-hidden="true" /> Mark reviewed</button>}<button className="workspace-icon-button" type="button" aria-label={`Reschedule ${item.title}`} onClick={() => onReschedule?.(item)}><RotateCcw aria-hidden="true" /></button></div></article></li>)}</ol>{!visibleItems.length ? <p className="workspace-empty-state">Nothing here yet. The topics you want to keep will come back at the right time.</p> : null}</section>;
}
