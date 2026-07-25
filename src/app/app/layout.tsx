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

  // Seed the saved appearance from the server so a device that has never opened
  // Settings (empty localStorage) still paints in the student's real theme
  // before content shows, and future navigations read it from localStorage.
  const { data: prefs } = await clientResult.value
    .from("workspace_preferences")
    .select("theme_id,accent_id,density,motion_level,font_pair_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const seedTheme = prefs
    ? `try{var d=document.documentElement,s='gate-os-workspace-preferences';var has=false;try{has=!!localStorage.getItem(s)}catch(e){}var p={themeId:${JSON.stringify(prefs.theme_id)},accentId:${JSON.stringify(prefs.accent_id)},density:${JSON.stringify(prefs.density)},motion:${JSON.stringify(prefs.motion_level)},fontPairId:${JSON.stringify(prefs.font_pair_id)}};if(p.themeId)d.dataset.theme=p.themeId;if(p.accentId)d.dataset.accent=p.accentId;if(p.density)d.dataset.density=p.density;if(p.motion)d.dataset.motion=p.motion;if(p.fontPairId)d.dataset.fontPair=p.fontPairId;if(!has){try{localStorage.setItem(s,JSON.stringify(p))}catch(e){}}}catch(e){}`
    : null;

  return (
    <>
      {seedTheme ? <script dangerouslySetInnerHTML={{ __html: seedTheme }} /> : null}
      <WorkspaceShell>{children}</WorkspaceShell>
    </>
  );
}
