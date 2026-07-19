"use client";

import { useState } from "react";
import { MistakeBook, type MistakeItem } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function MistakesClient({ initialMistakes, subjects }: { initialMistakes: MistakeItem[]; subjects: { id: string; name: string }[] }) {
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [message, setMessage] = useState("");
  async function create(mistake: Omit<MistakeItem, "id">) {
    setMessage("");
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) { setMessage(setup.error ?? "Sign in again to save this mistake."); return; }
    const { data: authData } = await setup.value.auth.getUser();
    if (!authData.user) { setMessage("Your session expired. Sign in again to save this mistake."); return; }
    const review = new Date(); review.setDate(review.getDate() + 1);
    const subjectId = subjects.find((entry) => entry.name === mistake.subject)?.id ?? null;
    const { data, error } = await setup.value.from("mistakes").insert({ user_id: authData.user.id, subject_id: subjectId, concept: mistake.concept, source: mistake.source || null, mistake_reason: mistake.reason || "Conceptual gap", corrected_reasoning: mistake.correction, next_review_on: review.toISOString().slice(0, 10) }).select("id").single();
    if (!error && data) { setMistakes((current) => [{ ...mistake, id: data.id }, ...current]); return; }
    setMessage("This mistake could not be saved. Keep each field under its length limit and try again.");
  }
  return (
    <>
      <MistakeBook mistakes={mistakes} subjectOptions={subjects.map((entry) => entry.name)} onCreate={create} />
      {message ? <p className="workspace-page !pt-0 text-sm text-[var(--danger)]" role="alert">{message}</p> : null}
    </>
  );
}
