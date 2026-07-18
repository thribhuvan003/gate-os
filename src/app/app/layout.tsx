import { WorkspaceShell } from "@/components/os/workspace-shell";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
