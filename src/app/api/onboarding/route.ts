import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  timezone: z.string().trim().min(1).max(80),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  studyWindow: z.string().regex(/^\d{2}:\d{2}$/),
  themeId: z.enum(["editorial-calm", "focus-tech", "soft-personal", "midnight-paper"]),
  fontPairId: z.string().trim().min(1).max(64),
  accentId: z.string().trim().min(1).max(64),
  density: z.enum(["comfortable", "compact"]),
  motion: z.enum(["full", "subtle", "reduced"]),
  layoutPreset: z.enum(["focus", "balanced", "revision"]),
  currentSubject: z.string().trim().min(1).max(120),
  weeklyCommitment: z.string().trim().min(5).max(300),
});

export async function POST(request: Request) {
  const parsed = onboardingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Check the highlighted onboarding details." }, { status: 400 });

  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) return NextResponse.json({ message: clientResult.error }, { status: 503 });

  const { data: authData } = await clientResult.value.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return NextResponse.json({ message: "Sign in again to continue." }, { status: 401 });

  const value = parsed.data;
  const { error: profileError } = await clientResult.value
    .from("profiles")
    .update({
      display_name: value.displayName,
      timezone: value.timezone,
      preferred_study_window: { start: value.studyWindow, targetDate: value.targetDate, currentSubject: value.currentSubject },
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (profileError) return NextResponse.json({ message: "Could not save your profile." }, { status: 500 });

  const { error: preferencesError } = await clientResult.value.from("workspace_preferences").upsert({
    user_id: userId,
    theme_id: value.themeId,
    font_pair_id: value.fontPairId,
    accent_id: value.accentId,
    density: value.density,
    motion_level: value.motion,
    home_layout_preset: value.layoutPreset,
  });
  if (preferencesError) return NextResponse.json({ message: "Could not save your appearance settings." }, { status: 500 });

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + ((7 - targetDate.getDay()) % 7 || 7));
  const { error: goalError } = await clientResult.value.from("goals").insert({
    user_id: userId,
    period: "weekly",
    target_date: targetDate.toISOString().slice(0, 10),
    title: value.weeklyCommitment,
  });
  if (goalError) return NextResponse.json({ message: "Your profile is safe, but the first commitment did not save." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
