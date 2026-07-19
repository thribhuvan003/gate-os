import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/os/workspace-shell";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    redirect("/login?error=setup");
  }

  const { data } = await clientResult.value.auth.getUser();

  if (!data.user) {
    redirect("/login?error=session");
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}
