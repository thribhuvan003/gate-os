import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ circleId: z.string().uuid(), email: z.string().email().max(320) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email." }, { status: 400 });
  const clientResult = await getServerSupabaseClient(); if (!clientResult.value) return NextResponse.json({ message: "Unavailable" }, { status: 503 });
  const { data: authData } = await clientResult.value.auth.getClaims(); const userId = authData?.claims?.sub; if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expires = new Date(); expires.setDate(expires.getDate() + 7);
  const { error } = await clientResult.value.from("circle_invitations").insert({ circle_id: parsed.data.circleId, email: parsed.data.email.toLowerCase(), token_hash: tokenHash, expires_at: expires.toISOString(), created_by: userId });
  if (error) return NextResponse.json({ message: "Only the circle owner can invite members." }, { status: 403 });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  return NextResponse.json({ link: `${origin}/circles/join/${token}` });
}
