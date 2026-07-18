import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function JoinCirclePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) redirect("/login");
  const { error } = await clientResult.value.rpc("accept_circle_invite", { p_token: token });
  redirect(error ? "/app/circles?invite=invalid" : "/app/circles?invite=joined");
}
