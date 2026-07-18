import { GoalsClient } from "@/components/os/goals-client";
import type { ReflectionItem, WorkspaceGoal } from "@/components/workspace";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function GoalsPage() {
  const clientResult = await getServerSupabaseClient();
  let goals: WorkspaceGoal[] = [];
  let reflections: ReflectionItem[] = [];
  if (clientResult.value) {
    const [{ data: goalRows }, { data: reflectionRows }] = await Promise.all([
      clientResult.value.from("goals").select("id,title,period,target_date,completed_at").order("created_at", { ascending: false }),
      clientResult.value.from("reflections").select("id,content,granularity,occurred_at").order("occurred_at", { ascending: false }).limit(40),
    ]);
    goals = (goalRows ?? []).map((row: { id: string; title: string; period: "daily" | "weekly"; target_date: string; completed_at: string | null }) => ({ id: row.id, title: row.title, cadence: row.period, complete: Boolean(row.completed_at), dueLabel: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(row.target_date)) }));
    reflections = (reflectionRows ?? []).map((row: { id: string; content: string; granularity: "hourly" | "daily"; occurred_at: string }) => ({ id: row.id, title: row.granularity === "daily" ? "Daily reflection" : "Focus reflection", content: row.content, cadence: row.granularity, createdLabel: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(row.occurred_at)) }));
  }
  return <GoalsClient initialGoals={goals} initialReflections={reflections} />;
}
