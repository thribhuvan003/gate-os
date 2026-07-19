import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/os/workspace-shell";
import { hasActiveBetaAccess } from "@/lib/auth/invite";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const access = await hasActiveBetaAccess();

  if (!access.active) {
    redirect("/login?error=access");
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}
