import { CirclesClient } from "@/components/os/circles-client";
import type { StudyCircle } from "@/components/workspace";
import { toOne } from "@/lib/supabase/relation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function CirclesPage() {
  const clientResult = await getServerSupabaseClient();
  let circles: StudyCircle[] = [];
  if (clientResult.value) {
    const { data } = await clientResult.value.from("circles").select("id,name,description,circle_memberships(user_id,profiles(display_name)),circle_sessions(id,goal,status,ends_at)").order("created_at", { ascending: false });
    circles = (data ?? []).map((row) => {
      const active = row.circle_sessions?.find((session) => session.status === "active");
      return { id: row.id, name: row.name, goal: row.description ?? "Focus together, keep personal work private.", members: (row.circle_memberships ?? []).map((member) => ({ id: member.user_id, name: toOne(member.profiles)?.display_name ?? "Member", status: "offline" as const })), activeSession: active ? { title: active.goal, endsAt: active.ends_at ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(active.ends_at)) : "soon", reactions: 0 } : undefined };
    });
  }
  return <CirclesClient initialCircles={circles} />;
}
