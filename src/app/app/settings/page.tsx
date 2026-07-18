import { SettingsClient } from "@/components/os/settings-client";
import type { WorkspacePreferences } from "@/components/workspace";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const fallback: WorkspacePreferences = { themeId: "editorial-calm", fontPairId: "editorial", accentId: "forest", motion: "subtle", density: "comfortable", layoutPreset: "balanced", moduleOrder: [], hiddenModules: [] };
  const clientResult = await getServerSupabaseClient();
  let preferences = fallback;
  let notifications = { browserEnabled: false, emailSummaryEnabled: false, focusNudgesEnabled: false, quietHoursStart: "22:00", quietHoursEnd: "07:00" };
  if (clientResult.value) {
    const [{ data }, { data: notificationData }] = await Promise.all([
      clientResult.value.from("workspace_preferences").select("theme_id,font_pair_id,accent_id,motion_level,density,home_layout_preset,module_order,hidden_modules").maybeSingle(),
      clientResult.value.from("notification_preferences").select("browser_enabled,email_summary_enabled,focus_nudges_enabled,quiet_hours_start,quiet_hours_end").maybeSingle(),
    ]);
    if (data) preferences = { themeId: data.theme_id, fontPairId: data.font_pair_id, accentId: data.accent_id, motion: data.motion_level, density: data.density, layoutPreset: data.home_layout_preset, moduleOrder: data.module_order, hiddenModules: data.hidden_modules } as WorkspacePreferences;
    if (notificationData) notifications = { browserEnabled: notificationData.browser_enabled, emailSummaryEnabled: notificationData.email_summary_enabled, focusNudgesEnabled: notificationData.focus_nudges_enabled, quietHoursStart: notificationData.quiet_hours_start?.slice(0, 5) ?? "22:00", quietHoursEnd: notificationData.quiet_hours_end?.slice(0, 5) ?? "07:00" };
  }
  return <SettingsClient initialPreferences={preferences} initialNotifications={notifications} />;
}
