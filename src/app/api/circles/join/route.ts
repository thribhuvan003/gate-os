import { NextRequest, NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "This request must come from GATE OS." }, { status: 403 });
  }

  const input = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof input?.token === "string" ? input.token.trim() : "";

  if (!token || token.length > 512) {
    return NextResponse.json({ message: "This invitation link is not valid." }, { status: 400 });
  }

  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    return NextResponse.json({ message: clientResult.error }, { status: 503 });
  }

  const { data } = await clientResult.value.auth.getClaims();

  if (!data?.claims?.sub) {
    return NextResponse.json({ message: "Sign in before joining this circle." }, { status: 401 });
  }

  const { error } = await clientResult.value.rpc("accept_circle_invite", { p_token: token });

  if (error) {
    const needsBetaAccess = /beta access/i.test(error.message ?? "");

    return NextResponse.json(
      {
        message: needsBetaAccess
          ? "Your account does not have active beta access yet. Redeem a beta invitation code at sign-in, then open this link again."
          : "This invitation has expired, was already used, or is no longer available.",
      },
      { status: needsBetaAccess ? 403 : 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
