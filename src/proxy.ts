import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 "proxy" (the successor to middleware). Runs before every matched
 * route and:
 *   1. Refreshes the Supabase auth session cookie via the SSR client's
 *      getAll/setAll adapter (the canonical @supabase/ssr pattern). This is
 *      the ONLY place session cookies can be refreshed — Server Components
 *      cannot write cookies, so without this the /app layout would see a
 *      stale session and bounce valid users to /login.
 *   2. Protects /app, /onboarding, /welcome by redirecting unauthenticated
 *      visitors to /login?next=… so the deep-link is preserved.
 *
 * `auth.getUser()` is used (not getClaims()) because getUser() performs a
 * fresh network call to the Auth server and is the server-side source of
 * truth in @supabase/supabase-js v2. getClaims() is not reliably present
 * across v2 patch versions and caused a TypeError that broke protected
 * routes after Google sign-in.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Fresh, server-confirmed user. getUser() makes a network call to the Auth
  // server — the correct way to verify identity server-side in v2.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPath =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/welcome");

  if (protectedPath && !user?.id) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
