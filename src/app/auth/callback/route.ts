import { NextRequest, NextResponse } from "next/server";

import { safeNextPath } from "@/lib/auth/invite";
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

  const supabase = clientResult.value;
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return loginRedirect(request, "callback");
    }
  }

  const { data, error } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (error || !userId) {
    return loginRedirect(request, "session");
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
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = forwardedHost ? `https://${forwardedHost}` : new URL(request.url).origin;

  return NextResponse.redirect(new URL(destination, origin));
}
