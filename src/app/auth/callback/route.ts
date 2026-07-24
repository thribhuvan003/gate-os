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

  // Honor the forwarded host, but derive the scheme rather than assuming https:
  // behind a proxy the request URL is http, so hardcoding https produced an
  // https://localhost redirect in local dev (SSL error) and would break any
  // non-TLS reverse proxy. x-forwarded-proto is the source of truth when set.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const requestUrl = new URL(request.url);
  const origin = forwardedHost
    ? `${forwardedProto ?? requestUrl.protocol.replace(":", "")}://${forwardedHost}`
    : requestUrl.origin;

  return NextResponse.redirect(new URL(destination, origin));
}
