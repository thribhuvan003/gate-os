import { MistakesClient } from "@/components/os/mistakes-client";
import type { MistakeItem } from "@/components/workspace";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function MistakesPage() {
  const clientResult = await getServerSupabaseClient();
  let mistakes: MistakeItem[] = [];
  if (clientResult.value) {
    const { data } = await clientResult.value.from("mistakes").select("id,concept,source,mistake_reason,corrected_reasoning,next_review_on,subjects(title)").order("created_at", { ascending: false });
    mistakes = (data ?? []).map((row) => ({ id: row.id, concept: row.concept, subject: row.subjects?.[0]?.title ?? "Unsorted", source: row.source ?? "Personal review", reason: row.mistake_reason, correction: row.corrected_reasoning, nextReviewLabel: row.next_review_on ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(row.next_review_on)) : "When ready" }));
  }
  return <MistakesClient initialMistakes={mistakes} />;
}
