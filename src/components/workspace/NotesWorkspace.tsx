"use client";

import { FilePlus2, NotebookPen, Save, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { NoteItem } from "./types";

export interface NotesWorkspaceProps {
  notes: NoteItem[];
  subjectOptions?: string[];
  onSave?: (note: NoteItem) => void;
  onCreate?: () => void;
}

export function NotesWorkspace({ notes, subjectOptions = [], onSave, onCreate }: NotesWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? "");
  const [draft, setDraft] = useState<NoteItem | null>(notes[0] ?? null);
  const filteredNotes = useMemo(() => notes.filter((note) => `${note.title} ${note.subject} ${note.content}`.toLowerCase().includes(query.toLowerCase())), [notes, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft((current) => {
        // Never clobber a note the user is actively creating or editing that is
        // not persisted yet. Without this, clicking "New note" on a fresh
        // account created a draft that this effect immediately reset to null —
        // the editor flashed and vanished, so a first note could never be made.
        if (current && current.id.startsWith("draft-") && !notes.some((note) => note.id === current.id)) return current;
        return notes.find((note) => note.id === selectedId) ?? notes[0] ?? null;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [notes, selectedId]);

  const chooseNote = (note: NoteItem) => { setSelectedId(note.id); setDraft(note); };
  const createNote = () => { const note: NoteItem = { id: `draft-${Date.now()}`, title: "Untitled note", subject: subjectOptions[0] ?? "General", updatedLabel: "Unsaved draft", content: "", kind: "topic" }; setSelectedId(note.id); setDraft(note); onCreate?.(); };

  return <section className="workspace-page notes-workspace" aria-labelledby="notes-title"><header className="workspace-page-header"><div><p className="workspace-eyebrow"><NotebookPen aria-hidden="true" /> Notes</p><h1 id="notes-title">Keep the explanation, not just the answer.</h1><p>Use short notes for what you want to retrieve later.</p></div><button className="workspace-primary-button" type="button" onClick={createNote}><FilePlus2 aria-hidden="true" /> New note</button></header><div className="notes-workspace-layout"><aside className="notes-sidebar" aria-label="Notes"><label className="workspace-search-field"><Search aria-hidden="true" /><span className="sr-only">Search notes</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" /></label><div className="notes-list">{filteredNotes.map((note) => <button key={note.id} className={`notes-list-item${note.id === selectedId ? " is-selected" : ""}`} type="button" onClick={() => chooseNote(note)}><strong>{note.title}</strong><span>{note.subject}</span><small>{note.updatedLabel}</small></button>)}</div></aside>{draft ? <form className="notes-editor" onSubmit={(event) => { event.preventDefault(); onSave?.(draft); }}><div className="notes-editor-toolbar"><label><span className="sr-only">Note title</span><input className="notes-title-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><button className="workspace-secondary-button" type="submit"><Save aria-hidden="true" /> Save note</button></div><div className="notes-editor-meta"><label><Tag aria-hidden="true" /><span className="sr-only">Subject</span><select value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}>{[draft.subject, ...subjectOptions.filter((subject) => subject !== draft.subject)].map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label><span>{draft.kind === "daily" ? "Daily note" : "Topic note"} · {draft.updatedLabel}</span></div><label className="sr-only" htmlFor="note-content">Note content</label><textarea id="note-content" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Use Markdown shortcuts, checklists, code blocks, or formulas here." /><p className="workspace-field-help">Markdown shortcuts are preserved. Rich-text editing and formula rendering can be layered on without changing this component interface.</p></form> : <p className="workspace-empty-state">Create a note to begin building your own retrieval system.</p>}</div></section>;
}
