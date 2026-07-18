import { redirect } from "next/navigation";
import { WelcomeReveal } from "@/components/onboarding/welcome-reveal";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) redirect("/login?error=setup");
  const { data } = await clientResult.value.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  const { data: profile } = await clientResult.value.from("profiles").select("display_name,welcome_seen_at").eq("id", userId).single();
  if (profile?.welcome_seen_at) redirect("/app");
  return <WelcomeReveal name={profile?.display_name ?? "Aspirant"} />;
}
