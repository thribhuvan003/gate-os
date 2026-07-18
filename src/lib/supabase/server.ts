import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { loadSupabaseSsr, type DynamicSupabaseClient, type RuntimeResult } from "@/lib/supabase/runtime";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function getServerSupabaseClient(): Promise<RuntimeResult<DynamicSupabaseClient>> {
  const configResult = getSupabasePublicConfig();

  if (!configResult.config) {
    return { value: null, error: configResult.error };
  }

  const runtimeResult = await loadSupabaseSsr();

  if (!runtimeResult.value) {
    return { value: null, error: runtimeResult.error };
  }

  const cookieStore = await cookies();
  const client = runtimeResult.value.createServerClient(
    configResult.config.url,
    configResult.config.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              (cookieStore.set as (cookieName: string, cookieValue: string, cookieOptions?: Record<string, unknown>) => void)(
                name,
                value,
                options,
              );
            });
          } catch {}
        },
      },
    },
  );

  return { value: client, error: null };
}
