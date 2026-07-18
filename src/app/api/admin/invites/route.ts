import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ label: z.string().trim().min(1).max(120), maxUses: z.number().int().min(1).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ message: "Invalid invitation." }, { status: 400 });
  const setup = await getServerSupabaseClient(); if (!setup.value) return NextResponse.json({ message: "Unavailable" }, { status: 503 });
  const { data } = await setup.value.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : "";
  if (!email || email !== process.env.ADMIN_EMAIL?.toLowerCase()) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ message: "Admin environment is incomplete." }, { status: 503 });
  const code = `GATE-${randomBytes(9).toString("base64url").toUpperCase()}`;
  const hash = createHash("sha256").update(code.toLowerCase()).digest("hex");
  const expires = new Date(); expires.setDate(expires.getDate() + 21);
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await admin.from("invite_codes").insert({ code_hash: hash, label: parsed.data.label, max_uses: parsed.data.maxUses, expires_at: expires.toISOString() });
  if (error) return NextResponse.json({ message: "Could not create invitation." }, { status: 500 });
  return NextResponse.json({ code });
}

