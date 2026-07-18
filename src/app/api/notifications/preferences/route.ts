import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ browserEnabled: z.boolean(), emailSummaryEnabled: z.boolean(), focusNudgesEnabled: z.boolean(), quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/), quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const setup = await getServerSupabaseClient(); if (!setup.value) return NextResponse.json({ ok: false }, { status: 503 });
  const { data } = await setup.value.auth.getClaims(); const userId = data?.claims?.sub; if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  const value = parsed.data;
  const { error } = await setup.value.from("notification_preferences").upsert({ user_id: userId, browser_enabled: value.browserEnabled, email_summary_enabled: value.emailSummaryEnabled, focus_nudges_enabled: value.focusNudgesEnabled, quiet_hours_start: value.quietHoursStart, quiet_hours_end: value.quietHoursEnd });
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}

