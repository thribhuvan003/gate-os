"use client";

import { BookOpenCheck, ChevronDown, CircleCheck, FileQuestion } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import type { SyllabusSubject, SyllabusTopic } from "./types";

export interface SyllabusBoardProps {
  subjects: SyllabusSubject[];
  selectedSubjectId?: string;
  onTopicChange?: (topic: SyllabusTopic, next: { complete: boolean; pyqReady: boolean }) => void;
  onSubjectChange?: (subjectId: string) => void;
}

export function SyllabusBoard({ subjects, selectedSubjectId, onTopicChange, onSubjectChange }: SyllabusBoardProps) {
  const [localSubjectId, setLocalSubjectId] = useState(selectedSubjectId ?? subjects[0]?.id ?? "");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const subjectId = selectedSubjectId ?? localSubjectId;
  const selectedSubject = subjects.find((subject) => subject.id === subjectId) ?? subjects[0];
  const totals = useMemo(() => {
    const topics = selectedSubject?.sections.flatMap((section) => section.topics) ?? [];
    return { complete: topics.filter((topic) => topic.complete).length, total: topics.length };
  }, [selectedSubject]);

  const selectSubject = (id: string) => {
    if (!selectedSubjectId) setLocalSubjectId(id);
    onSubjectChange?.(id);
  };
  const toggleSection = (id: string) => setExpandedSections((sections) => sections.includes(id) ? sections.filter((sectionId) => sectionId !== id) : [...sections, id]);

  return (
    <section className="workspace-page syllabus-board" aria-labelledby="syllabus-title">
      <header className="workspace-page-header"><div className="min-w-0"><p className="workspace-eyebrow"><BookOpenCheck aria-hidden="true" /> GATE CS/IT 2027 target</p><h1 id="syllabus-title">Know the syllabus. Own the sequence.</h1><p>This versioned GATE 2027 working catalog keeps your progress intact. When the examination authority publishes a final syllabus, GATE OS will add a reviewed version instead of silently changing completed topics.</p></div>{selectedSubject ? <span className="workspace-status-label shrink-0">{totals.complete} / {totals.total} complete</span> : null}</header>
      <div className="syllabus-board-layout">
        <nav className="syllabus-subject-list" aria-label="GATE subjects">{subjects.map((subject) => { const subjectTopics = subject.sections.flatMap((section) => section.topics); const complete = subjectTopics.filter((topic) => topic.complete).length; const isSelected = subject.id === selectedSubject?.id; return <button key={subject.id} className={`syllabus-subject-button${isSelected ? " is-selected" : ""} hover:opacity-80 transition-opacity`} type="button" aria-current={isSelected ? "true" : undefined} onClick={() => selectSubject(subject.id)}><span><strong>{subject.shortLabel ?? subject.title}</strong><small>{complete} / {subjectTopics.length} topics</small></span><span className="syllabus-subject-progress" style={{ "--subject-progress": `${Math.round((complete / Math.max(subjectTopics.length, 1)) * 100)}%` } as CSSProperties & Record<"--subject-progress", string>} aria-hidden="true" /></button>; })}</nav>
        {selectedSubject ? <section className="syllabus-subject-workspace" aria-labelledby="subject-title"><header><div className="min-w-0"><p className="workspace-eyebrow">Subject workspace</p><h2 id="subject-title">{selectedSubject.title}</h2>{selectedSubject.description ? <p>{selectedSubject.description}</p> : null}</div><div className="workspace-progress-summary shrink-0"><strong>{Math.round((totals.complete / Math.max(totals.total, 1)) * 100)}%</strong><span>covered</span></div></header><div className="syllabus-section-list">{selectedSubject.sections.map((section) => { const isOpen = expandedSections.includes(section.id) || selectedSubject.sections.length === 1; const completed = section.topics.filter((topic) => topic.complete).length; const contentId = `section-${section.id}`; return <article className={`syllabus-section${isOpen ? " is-open" : ""}`} key={section.id}><h3><button type="button" className="hover:opacity-70 transition-opacity" aria-expanded={isOpen} aria-controls={contentId} onClick={() => toggleSection(section.id)}><span>{section.title}<small>{completed} / {section.topics.length} topics</small></span><ChevronDown aria-hidden="true" className={isOpen ? "rotate-180 transition-transform duration-200" : "transition-transform duration-200"} /></button></h3>{isOpen ? <ul id={contentId} className="syllabus-topic-list">{section.topics.map((topic) => <li key={topic.id}><label className={`syllabus-topic-control${topic.complete ? " is-complete" : ""} min-w-0`}><input type="checkbox" checked={topic.complete} onChange={(event) => onTopicChange?.(topic, { complete: event.target.checked, pyqReady: topic.pyqReady ?? false })} /><span className="syllabus-topic-check"><CircleCheck aria-hidden="true" className="size-3.5" /></span><span>{topic.title}</span></label><button className={`syllabus-pyq-button${topic.pyqReady ? " is-ready" : ""} inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5`} type="button" aria-pressed={topic.pyqReady ?? false} onClick={() => onTopicChange?.(topic, { complete: topic.complete, pyqReady: !(topic.pyqReady ?? false) })}><FileQuestion aria-hidden="true" className="size-4" /> <span>Practice</span></button></li>)}</ul> : null}</article>; })}</div></section> : <p className="workspace-empty-state">The GATE catalog will appear here once it is available.</p>}
      </div>
    </section>
  );
}
