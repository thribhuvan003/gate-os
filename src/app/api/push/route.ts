import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ endpoint: z.string().url(), expirationTime: z.number().nullable().optional(), keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const setup = await getServerSupabaseClient(); if (!setup.value) return NextResponse.json({ ok: false }, { status: 503 });
  const { data } = await setup.value.auth.getClaims(); const userId = data?.claims?.sub; if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  const value = parsed.data;
  const { error } = await setup.value.from("push_subscriptions").upsert({ user_id: userId, endpoint: value.endpoint, p256dh_key: value.keys.p256dh, auth_key: value.keys.auth, expiration_time: value.expirationTime ?? null, user_agent: request.headers.get("user-agent") }, { onConflict: "endpoint" });
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}

