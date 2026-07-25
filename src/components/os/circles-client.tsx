"use client";

import { FormEvent, useState } from "react";
import { StudyCircles, type StudyCircle } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function CirclesClient({ initialCircles }: { initialCircles: StudyCircle[] }) {
  const [circles, setCircles] = useState(initialCircles);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [creating, setCreating] = useState(false);
  async function create(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || creating) return;
    setCreating(true);
    try {
      const setup = await getBrowserSupabaseClient(); if (!setup.value) return;
      const { data: authData } = await setup.value.auth.getUser(); if (!authData.user) return;
      // Insert without RETURNING. The circles SELECT policy also allows active
      // members, and the owner's membership is added by an after-insert trigger
      // that has not committed while a RETURNING clause is evaluated — so a
      // .select() chained onto the insert fails RLS. Insert, then read the new
      // row back in a separate query (which does pass, as owner).
      const { error } = await setup.value.from("circles").insert({ owner_id: authData.user.id, name: trimmedName, description: goal.trim() || null });
      if (error) { window.alert("Could not create the circle. Please try again."); return; }
      const { data } = await setup.value
        .from("circles")
        .select("id,name,description")
        .eq("owner_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setCircles((current) => [{ id: data.id, name: data.name, goal: data.description ?? "Focus together.", members: [{ id: authData.user!.id, name: "You", status: "offline" }] }, ...current]);
        setName(""); setGoal("");
      }
    } finally {
      setCreating(false);
    }
  }
  async function invite(circle: StudyCircle, email: string) {
    const response = await fetch("/api/circles/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ circleId: circle.id, email }) });
    const result = await response.json() as { link?: string; message?: string };
    if (!response.ok || !result.link) return window.alert(result.message ?? "Invite could not be created.");
    await navigator.clipboard.writeText(result.link);
    window.alert("Private invitation link copied. It expires in seven days.");
  }
  return <><StudyCircles circles={circles} onInvite={invite} /><form className="workspace-composer mx-4 mb-28 md:mx-auto md:max-w-xl" onSubmit={create}><div className="workspace-composer-header"><h2>{circles.length ? "Create another circle" : "Create your first private circle"}</h2></div><label>Circle name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekend revision" /></label><label>Shared purpose<textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Revise OS and DBMS together" /></label><button className="workspace-primary-button" type="submit" disabled={creating}>{creating ? "Creating…" : "Create circle"}</button></form></>;
}
