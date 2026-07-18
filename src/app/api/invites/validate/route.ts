import { NextRequest, NextResponse } from "next/server";

import { checkInviteRateLimit } from "@/lib/auth/rate-limit";
import {
  createSignedInviteCookie,
  inviteCookieName,
  inviteCookieOptions,
  validateInviteWithRpc,
} from "@/lib/auth/invite";
import { loadZod } from "@/lib/supabase/runtime";

export const runtime = "nodejs";

function getRequestIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const rateLimit = checkInviteRateLimit(getRequestIdentifier(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const zodResult = await loadZod();

  if (!zodResult.value) {
    return NextResponse.json({ error: zodResult.error }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your invitation code to continue." }, { status: 400 });
  }

  const schema = zodResult.value.object({
    code: zodResult.value.string().trim().min(6, "Enter your invitation code.").max(96),
  });
  const parsed = schema.safeParse(body) as
    | { success: true; data: { code: string } }
    | { success: false; error: { issues: { message?: string }[] } };

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter a valid invitation code." },
      { status: 400 },
    );
  }

  const inviteResult = await validateInviteWithRpc(parsed.data.code);

  if (!inviteResult.inviteId) {
    return NextResponse.json({ error: inviteResult.error }, { status: 403 });
  }

  const signedCookie = createSignedInviteCookie(inviteResult.inviteId);

  if (!signedCookie.value || !signedCookie.expiresAt) {
    return NextResponse.json({ error: signedCookie.error }, { status: 503 });
  }

  const response = NextResponse.json({ valid: true });
  response.cookies.set(inviteCookieName, signedCookie.value, inviteCookieOptions(signedCookie.expiresAt));
  return response;
}
