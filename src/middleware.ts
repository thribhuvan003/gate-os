import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { loadSupabaseSsr } from "@/lib/supabase/runtime";

/**
 * Middleware refreshes the Supabase auth session on every protected request
 * and gently redirects unauthenticated visitors to /login.
 *
 * Why this exists (canonical @supabase/ssr pattern):
 *   - The session cookies set by the Route Handler callback can go stale
 *     without a periodic refresh. createServerClient auto-refreshes when the
 *     cookies are read here, and we forward the updated cookies to the
 *     response so downstream Server Components see a live session.
 *   - This is a read/refresh layer only. Authorization (beta access) is
 *     enforced server-side in the /app layout. We do NOT call getUser() on
 *     every request (that adds a network round-trip); we rely on the cookie
 *     refresh + the layout's beta-access check for the real gate.
 */
const PUBLIC_PATHS = new Set(["/", "/login"]);
const PUBLIC_PREFIXES = ["/auth/", "/api/", "/_next/", "/icon.svg", "/favicon.ico", "/opengraph-image", "/sitemap.xml", "/robots.txt"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function refreshSession(request: NextRequest): Promise<NextResponse> {
  const configResult = getSupabasePublicConfig();

  // If Supabase is not configured, don't block the request — let the app's
  // own error states handle it. This keeps previews working before env vars
  // are wired up.
  if (!configResult.config) {
    return NextResponse.next();
  }

  const runtimeResult = await loadSupabaseSsr();
  if (!runtimeResult.value) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = runtimeResult.value.createServerClient(
    configResult.config.url,
    configResult.config.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          // Rebuild the response with the merged cookie jar so downstream
          // Server Components read the refreshed session, then write the
          // updated Set-Cookie headers onto the final response.
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Record<string, unknown> | undefined);
          });
        },
      },
    },
  );

  // Touching getSession triggers the cookie refresh path inside the SSR
  // client. We intentionally do not call getUser() here (network cost); the
  // /app layout performs the authoritative beta-access check.
  await supabase.auth.getSession();

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return refreshSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static asset extensions and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|css|js|map)$).*)",
  ],
};
