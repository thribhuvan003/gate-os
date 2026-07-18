"use client";

import { useEffect, useState } from "react";
import { NotesWorkspace, type NoteItem } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const subjects = ["General", "Mathematics", "Algorithms", "Operating Systems", "Databases", "Computer Networks"];

export function NotesClient({ initialNotes }: { initialNotes: NoteItem[] }) {
  const [notes, setNotes] = useState(initialNotes);
  useEffect(() => {
    const recovered = window.localStorage.getItem("gate-os-recovered-note");
    if (!recovered) return;
    try {
      const note = JSON.parse(recovered) as NoteItem;
      const timer = window.setTimeout(() => setNotes((current) => current.some((item) => item.id === note.id) ? current : [note, ...current]), 0);
      return () => window.clearTimeout(timer);
    } catch {}
  }, []);

  async function save(note: NoteItem) {
    const pending = { ...note, updatedLabel: "Saving…" };
    window.localStorage.setItem("gate-os-recovered-note", JSON.stringify(pending));
    setNotes((current) => current.some((item) => item.id === note.id) ? current.map((item) => item.id === note.id ? pending : item) : [pending, ...current]);
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) return;
    const { data: authData } = await setup.value.auth.getUser();
    if (!authData.user) return;
    const payload = { title: note.title, content: { plainText: note.content }, kind: note.kind ?? "topic", note_date: note.kind === "daily" ? new Date().toISOString().slice(0, 10) : null, version: 1 };
    const result = note.id.startsWith("draft-")
      ? await setup.value.from("notes").insert({ ...payload, user_id: authData.user.id }).select("id").single()
      : await setup.value.from("notes").update(payload).eq("id", note.id).select("id").single();
    if (result.error || !result.data) {
      setNotes((current) => current.map((item) => item.id === note.id ? { ...item, updatedLabel: "Recovered draft · sync failed" } : item));
      return;
    }
    const saved = { ...note, id: result.data.id, updatedLabel: "Saved just now" };
    setNotes((current) => [saved, ...current.filter((item) => item.id !== note.id && item.id !== saved.id)]);
    window.localStorage.removeItem("gate-os-recovered-note");
  }

  return <NotesWorkspace notes={notes} subjectOptions={subjects} onSave={save} />;
}
