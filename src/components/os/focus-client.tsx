"use client";

import { FocusTimer } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function FocusClient({ subjects }: { subjects: { id: string; name: string }[] }) {
  async function complete(session: { elapsedSeconds: number; subject: string; topic: string; intention: string }) {
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) return;
    const { data } = await setup.value.auth.getUser();
    if (!data.user) return;
    const subjectId = subjects.find((entry) => entry.name === session.subject)?.id ?? null;
    const intention = session.intention || (session.topic ? `Topic: ${session.topic}` : "");
    await setup.value.from("study_sessions").insert({
      user_id: data.user.id,
      subject_id: subjectId,
      intention: intention || null,
      status: "completed",
      elapsed_seconds: session.elapsedSeconds,
      ended_at: new Date().toISOString(),
      started_at: new Date(Date.now() - session.elapsedSeconds * 1000).toISOString(),
    });
  }
  return <FocusTimer initialDurationSeconds={50 * 60} subjectOptions={subjects.map((entry) => entry.name)} onComplete={complete} />;
}
