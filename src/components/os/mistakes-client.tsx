"use client";

import { useState } from "react";
import { MistakeBook, type MistakeItem } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const subjects = ["Mathematics", "Digital Logic", "COA", "Programming & DS", "Algorithms", "TOC", "Compiler Design", "Operating Systems", "Databases", "Computer Networks"];

export function MistakesClient({ initialMistakes }: { initialMistakes: MistakeItem[] }) {
  const [mistakes, setMistakes] = useState(initialMistakes);
  async function create(mistake: Omit<MistakeItem, "id">) {
    const setup = await getBrowserSupabaseClient(); if (!setup.value) return;
    const { data: authData } = await setup.value.auth.getUser(); if (!authData.user) return;
    const review = new Date(); review.setDate(review.getDate() + 1);
    const { data, error } = await setup.value.from("mistakes").insert({ user_id: authData.user.id, concept: mistake.concept, source: mistake.source || null, mistake_reason: mistake.reason || "Conceptual gap", corrected_reasoning: mistake.correction, next_review_on: review.toISOString().slice(0, 10) }).select("id").single();
    if (!error && data) setMistakes((current) => [{ ...mistake, id: data.id }, ...current]);
  }
  return <MistakeBook mistakes={mistakes} subjectOptions={subjects} onCreate={create} />;
}
