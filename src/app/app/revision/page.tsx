import { RevisionClient } from "@/components/os/revision-client";
import type { RevisionItem } from "@/components/workspace";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function RevisionPage() {
  const clientResult = await getServerSupabaseClient();
  let items: RevisionItem[] = [];
  if (clientResult.value) {
    const { data } = await clientResult.value.from("revision_items").select("id,title,source_type,due_on,completed_at,subjects(name)").order("due_on");
    items = (data ?? []).map((row) => ({ id: row.id, title: row.title, subject: row.subjects?.[0]?.name ?? "General", dueLabel: new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(new Date(row.due_on)), completed: Boolean(row.completed_at), source: row.source_type === "manual" || row.source_type === "reflection" ? "topic" : row.source_type as "topic" | "note" | "mistake" }));
  }
  return <RevisionClient initialItems={items} />;
}
