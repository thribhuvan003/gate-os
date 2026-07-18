"use client";

import { useState } from "react";
import { GoalsReflections, type ReflectionItem, type WorkspaceGoal } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function GoalsClient({ initialGoals, initialReflections }: { initialGoals: WorkspaceGoal[]; initialReflections: ReflectionItem[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [reflections, setReflections] = useState(initialReflections);
  async function auth() {
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) return null;
    const { data } = await setup.value.auth.getUser();
    return data.user ? { client: setup.value, userId: data.user.id } : null;
  }
  async function createGoal(goal: Omit<WorkspaceGoal, "id" | "complete">) {
    const connection = await auth(); if (!connection) return;
    const date = new Date(); date.setDate(date.getDate() + (goal.cadence === "weekly" ? 7 : 1));
    const { data, error } = await connection.client.from("goals").insert({ user_id: connection.userId, period: goal.cadence ?? "daily", target_date: date.toISOString().slice(0, 10), title: goal.title }).select("id").single();
    if (!error && data) setGoals((current) => [{ id: data.id, title: goal.title, cadence: goal.cadence, complete: false, dueLabel: goal.cadence === "weekly" ? "This week" : "Tomorrow" }, ...current]);
  }
  async function changeGoal(goal: WorkspaceGoal, complete: boolean) {
    setGoals((current) => current.map((item) => item.id === goal.id ? { ...item, complete } : item));
    const connection = await auth(); if (!connection) return;
    const { error } = await connection.client.from("goals").update({ completed_at: complete ? new Date().toISOString() : null }).eq("id", goal.id);
    if (error) setGoals((current) => current.map((item) => item.id === goal.id ? { ...item, complete: !complete } : item));
  }
  async function saveReflection(reflection: Omit<ReflectionItem, "id" | "createdLabel">) {
    const connection = await auth(); if (!connection) return;
    const { data, error } = await connection.client.from("reflections").insert({ user_id: connection.userId, granularity: reflection.cadence, content: reflection.content }).select("id,occurred_at").single();
    if (!error && data) setReflections((current) => [{ ...reflection, id: data.id, createdLabel: "Just now" }, ...current]);
  }
  return <GoalsReflections goals={goals} reflections={reflections} onGoalCreate={createGoal} onGoalChange={changeGoal} onReflectionSave={saveReflection} />;
}
