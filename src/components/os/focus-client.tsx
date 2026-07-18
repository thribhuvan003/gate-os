"use client";

import { FocusTimer } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function FocusClient({ subjects }: { subjects: string[] }) {
  async function complete(session: { elapsedSeconds: number; intention: string }) {
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) return;
    const { data } = await setup.value.auth.getUser();
    if (!data.user) return;
    await setup.value.from("study_sessions").insert({
      user_id: data.user.id,
      intention: session.intention || null,
      status: "completed",
      elapsed_seconds: session.elapsedSeconds,
      ended_at: new Date().toISOString(),
      started_at: new Date(Date.now() - session.elapsedSeconds * 1000).toISOString(),
    });
  }
  return <FocusTimer initialDurationSeconds={50 * 60} subjectOptions={subjects} onComplete={complete} />;
}
