export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export type SupabaseConfigResult =
  | { config: SupabasePublicConfig; error: null }
  | { config: null; error: string };

const requiredEnvironmentNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function getSupabasePublicConfig(): SupabaseConfigResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !publishableKey) {
    return {
      config: null,
      error: `Authentication is not configured. Add ${requiredEnvironmentNames.join(
        " and ",
      )} to this deployment.`,
    };
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
      return {
        config: null,
        error: "Authentication requires an HTTPS Supabase URL outside local development.",
      };
    }
  } catch {
    return {
      config: null,
      error: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL.",
    };
  }

  return { config: { url, publishableKey }, error: null };
}

export function getInviteCookieSecret(): string | null {
  const secret = process.env.GATE_OS_INVITE_COOKIE_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}
