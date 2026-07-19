import { NextRequest, NextResponse } from "next/server";

import {
  consumeInviteWithRpc,
  hasActiveBetaAccess,
  inviteCookieName,
  safeNextPath,
  verifySignedInviteCookie,
} from "@/lib/auth/invite";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function loginRedirect(request: NextRequest, error: string): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  response.cookies.delete(inviteCookieName);
  return response;
}

/**
 * OAuth / magic-link callback.
 *
 * Canonical Supabase SSR v2 flow:
 *   1. exchangeCodeForSession(code) — exchanges the PKCE code for a session.
 *      The SSR client writes the session cookies via the `setAll` adapter
 *      configured in lib/supabase/server.ts (Route Handlers can write cookies,
 *      unlike Server Components).
 *   2. auth.getUser() — performs a fresh network call to the Auth server to
 *      confirm the user. This is the server-side source of truth; never use
 *      getSession() for auth decisions (it reads cookies and can be stale
 *      immediately after exchange).
 *
 * `getClaims()` was intentionally removed — it is the wrong method for a
 * callback route (it is meant for middleware/proxy protection) and is not
 * reliably present across all installed @supabase/supabase-js v2 patch
 * versions, which caused a TypeError that bounced Google users back to the
 * landing page.
 */
export async function GET(request: NextRequest) {
  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    return loginRedirect(request, "setup");
  }

  const supabase = clientResult.value;
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return loginRedirect(request, "callback");
    }
  }

  // Fresh, server-confirmed user. getUser() makes a network call to the Auth
  // server and is the correct way to read identity server-side in v2.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userId = user?.id;
  if (userError || !userId) {
    return loginRedirect(request, "session");
  }

  const invitePayload = verifySignedInviteCookie(request.cookies.get(inviteCookieName)?.value);
  let accessError: string | null = null;

  if (invitePayload) {
    accessError = await consumeInviteWithRpc(invitePayload.inviteId);
  } else {
    const access = await hasActiveBetaAccess();
    accessError = access.active ? null : access.error ?? "This account needs an active beta invitation.";
  }

  if (accessError) {
    await supabase.auth.signOut();
    return loginRedirect(request, "access");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle();

  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));
  const destination = profile?.onboarding_completed_at
    ? nextPath
    : `/onboarding?next=${encodeURIComponent(nextPath)}`;

  // Respect the original host as seen before the load balancer (Vercel sets
  // x-forwarded-host). Falls back to the request origin.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = forwardedHost
    ? `https://${forwardedHost}`
    : new URL(request.url).origin;

  const response = NextResponse.redirect(new URL(destination, origin));
  response.cookies.delete(inviteCookieName);
  return response;
}
