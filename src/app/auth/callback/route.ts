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
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    return loginRedirect(request, "setup");
  }

  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const { error } = await clientResult.value.auth.exchangeCodeForSession(code);

    if (error) {
      return loginRedirect(request, "callback");
    }
  }

  const { data, error } = await clientResult.value.auth.getClaims();

  const userId = data?.claims?.sub;
  if (error || !userId) {
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
    await clientResult.value.auth.signOut();
    return loginRedirect(request, "access");
  }

  const { data: profile } = await clientResult.value
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle();
  const destination = profile?.onboarding_completed_at
    ? safeNextPath(request.nextUrl.searchParams.get("next"))
    : "/onboarding";
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.delete(inviteCookieName);
  return response;
}
