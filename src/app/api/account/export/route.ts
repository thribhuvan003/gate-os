import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const privateTables = ["profiles", "workspace_preferences", "study_sessions", "syllabus_progress", "pdfs", "notes", "pyq_attempts", "goals", "reflections", "revision_items", "mistakes", "notification_preferences"] as const;

export async function GET() {
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) return NextResponse.json({ message: "Unavailable" }, { status: 503 });
  const { data: authData } = await clientResult.value.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const entries = await Promise.all(privateTables.map(async (table) => {
    const query = table === "profiles" || table === "workspace_preferences" || table === "notification_preferences"
      ? clientResult.value!.from(table).select("*")
      : clientResult.value!.from(table).select("*").eq("user_id", userId);
    const { data, error } = await query;
    return [table, error ? { error: error.message } : data] as const;
  }));
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), data: Object.fromEntries(entries) }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="gate-os-export-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "no-store" } });
}
