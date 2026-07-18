import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) return NextResponse.json({ ok: false }, { status: 503 });
  const { data } = await clientResult.value.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  const { error } = await clientResult.value.from("profiles").update({ welcome_seen_at: new Date().toISOString() }).eq("id", userId);
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}
