import { NotesClient } from "@/components/os/notes-client";
import type { NoteItem } from "@/components/workspace";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotesPage() {
  const clientResult = await getServerSupabaseClient();
  let notes: NoteItem[] = [];
  if (clientResult.value) {
    const { data } = await clientResult.value.from("notes").select("id,title,content,kind,updated_at").is("archived_at", null).order("updated_at", { ascending: false });
    notes = (data ?? []).map((item: { id: string; title: string; content: { plainText?: string }; kind: "daily" | "topic" | "freeform"; updated_at: string }) => ({ id: item.id, title: item.title, content: item.content?.plainText ?? "", subject: "General", kind: item.kind === "daily" ? "daily" : "topic", updatedLabel: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(item.updated_at)) }));
  }
  return <NotesClient initialNotes={notes} />;
}
