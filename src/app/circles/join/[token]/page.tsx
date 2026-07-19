import { redirect } from "next/navigation";
import { CircleInviteConfirmation } from "@/components/os/circle-invite-confirmation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function JoinCirclePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitationPath = `/circles/join/${encodeURIComponent(token)}`;
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) redirect(`/login?error=setup&next=${encodeURIComponent(invitationPath)}`);
  const { data } = await clientResult.value.auth.getClaims();
  if (!data?.claims?.sub) redirect(`/login?next=${encodeURIComponent(invitationPath)}`);
  return <CircleInviteConfirmation token={token} />;
}
