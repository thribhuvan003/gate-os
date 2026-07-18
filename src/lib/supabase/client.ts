"use client";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { loadSupabaseSsr, type DynamicSupabaseClient, type RuntimeResult } from "@/lib/supabase/runtime";

let browserClientPromise: Promise<RuntimeResult<DynamicSupabaseClient>> | null = null;

export function getBrowserSupabaseSetupError(): string | null {
  return getSupabasePublicConfig().error;
}

export function getBrowserSupabaseClient(): Promise<RuntimeResult<DynamicSupabaseClient>> {
  if (browserClientPromise) {
    return browserClientPromise;
  }

  browserClientPromise = (async () => {
    const configResult = getSupabasePublicConfig();

    if (!configResult.config) {
      return { value: null, error: configResult.error };
    }

    const runtimeResult = await loadSupabaseSsr();

    if (!runtimeResult.value) {
      return { value: null, error: runtimeResult.error };
    }

    return {
      value: runtimeResult.value.createBrowserClient(
        configResult.config.url,
        configResult.config.publishableKey,
      ),
      error: null,
    };
  })();

  return browserClientPromise;
}
