import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { checkInviteRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

/**
 * Email + password sign-up for real GATE aspirants.
 *
 * The account is created already confirmed (`email_confirm: true`) so there is
 * no verification email to wait for or lose — the person types an email and a
 * password and is in. That is a deliberate product choice: it removes the whole
 * class of "I never got the code / the link expired" failures the email-OTP
 * flow suffered from, at the cost of not proving the address. Password reset by
 * email can be layered on later once a mail sender is configured.
 *
 * Creating the user needs the service role, so it happens here on the server;
 * the browser only ever signs in with the public key afterwards.
 */
const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters for your password.")
    .max(72, "Passwords can be at most 72 characters."),
});

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Sign-up is not configured for this deployment yet." }, { status: 503 });
  }

  const limit = checkInviteRateLimit(`signup:${clientIp(request)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid request." }, { status: 400 });
  }

  const parsed = credentials.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const message = error.message.toLowerCase();
    // Supabase phrases the duplicate case a few ways depending on version.
    if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in instead.", code: "exists" },
        { status: 409 },
      );
    }
    if (message.includes("password")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "We could not create your account. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
