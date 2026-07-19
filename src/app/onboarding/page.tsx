import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { safeNextPath } from "@/lib/auth/invite";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Make it yours" };

type OnboardingPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(firstValue(params.next) || null);
  const clientResult = await getServerSupabaseClient();

  if (clientResult.value) {
    // getUser() is the server-side source of truth (fresh network call to the
    // Auth server). Replaces getClaims(), which is not reliably available
    // across @supabase/supabase-js v2 patch versions.
    const { data: userData } = await clientResult.value.auth.getUser();
    const userId = userData.user?.id;

    if (userId) {
      const { data: profile } = await clientResult.value
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.onboarding_completed_at) redirect(nextPath);
    }
  }

  return (
    <main id="main-content" className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <OnboardingFlow nextPath={nextPath} />
    </main>
  );
}
