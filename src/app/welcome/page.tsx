import { redirect } from "next/navigation";
import { WelcomeReveal } from "@/components/onboarding/welcome-reveal";
import { safeNextPath } from "@/lib/auth/invite";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type WelcomePageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(firstValue(params.next) || null);
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) redirect("/login?error=setup");
  const { data } = await clientResult.value.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  const { data: profile } = await clientResult.value.from("profiles").select("display_name,welcome_seen_at").eq("id", userId).single();
  if (profile?.welcome_seen_at) redirect(nextPath);
  return <WelcomeReveal name={profile?.display_name ?? "Aspirant"} nextPath={nextPath} />;
}
