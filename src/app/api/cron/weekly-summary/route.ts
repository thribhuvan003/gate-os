import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!url || !serviceKey || !resendKey || !from) return NextResponse.json({ skipped: true, reason: "Email environment is incomplete." });
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: preferences } = await admin.from("notification_preferences").select("user_id").eq("email_summary_enabled", true);
  const now = new Date();
  const periodKey = `${now.getUTCFullYear()}-W${String(Math.ceil((((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000) + new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).getUTCDay() + 1) / 7)).padStart(2, "0")}`;
  const start = new Date(now); start.setUTCDate(start.getUTCDate() - 7);
  let sent = 0;
  for (const preference of preferences ?? []) {
    const { data: existing } = await admin.from("notification_deliveries").select("id").eq("user_id", preference.user_id).eq("kind", "weekly-summary").eq("period_key", periodKey).maybeSingle();
    if (existing) continue;
    const [{ data: userData }, { count: sessions }, { count: goals }] = await Promise.all([
      admin.auth.admin.getUserById(preference.user_id),
      admin.from("study_sessions").select("id", { count: "exact", head: true }).eq("user_id", preference.user_id).eq("status", "completed").gte("ended_at", start.toISOString()),
      admin.from("goals").select("id", { count: "exact", head: true }).eq("user_id", preference.user_id).not("completed_at", "is", null).gte("completed_at", start.toISOString()),
    ]);
    const email = userData.user?.email;
    if (!email) continue;
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [email], subject: "Your GATE OS week, clearly", html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h1>Your preparation week</h1><p>You completed <strong>${sessions ?? 0}</strong> focus sessions and <strong>${goals ?? 0}</strong> commitments.</p><p>Open GATE OS and choose the next meaningful action.</p><p style="color:#667">Change or disable summaries anytime in Settings.</p></div>` }) });
    if (!response.ok) continue;
    const result = await response.json() as { id?: string };
    await admin.from("notification_deliveries").insert({ user_id: preference.user_id, kind: "weekly-summary", period_key: periodKey, provider_id: result.id ?? null });
    sent += 1;
  }
  return NextResponse.json({ sent, periodKey });
}
