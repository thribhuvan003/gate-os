import { MistakesClient } from "@/components/os/mistakes-client";
import type { MistakeItem } from "@/components/workspace";
import { toOne } from "@/lib/supabase/relation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function MistakesPage() {
  const clientResult = await getServerSupabaseClient();
  let mistakes: MistakeItem[] = [];
  let subjects: { id: string; name: string }[] = [];
  if (clientResult.value) {
    const [{ data }, { data: subjectData }] = await Promise.all([
      clientResult.value.from("mistakes").select("id,concept,source,mistake_reason,corrected_reasoning,next_review_on,subjects(name)").order("created_at", { ascending: false }),
      clientResult.value.from("subjects").select("id,name").order("position"),
    ]);
    mistakes = (data ?? []).map((row) => ({ id: row.id, concept: row.concept, subject: toOne(row.subjects)?.name ?? "Unsorted", source: row.source ?? "Personal review", reason: row.mistake_reason, correction: row.corrected_reasoning, nextReviewLabel: row.next_review_on ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(row.next_review_on)) : "When ready" }));
    subjects = (subjectData ?? []) as { id: string; name: string }[];
  }
  return <MistakesClient initialMistakes={mistakes} subjects={subjects} />;
}
