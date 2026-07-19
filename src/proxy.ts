import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 "proxy" (the successor to middleware). Runs before every matched
 * route and:
 *   1. Refreshes the Supabase auth session cookie via the SSR client's
 *      getAll/setAll adapter (the canonical @supabase/ssr pattern).
 *   2. Protects /app, /onboarding, /welcome by redirecting unauthenticated
 *      visitors to /login?next=… so the deep-link is preserved.
 *
 * Uses auth.getUser() (canonical v2 server-side source of truth — a fresh
 * network call to the Auth server). Mirrors the original getClaims() usage
 * shape: read `data` then access the id via optional chaining so the union
 * type narrows cleanly under strict mode.
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

  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;

  const protectedPath =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/welcome");

  if (protectedPath && !userId) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
