"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsWorkspace, type WorkspacePreferences } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

type NotificationState = { browserEnabled: boolean; emailSummaryEnabled: boolean; focusNudgesEnabled: boolean; quietHoursStart: string; quietHoursEnd: string };
const preferenceStorageKey = "gate-os-workspace-preferences";

function applyWorkspacePreferences(preferences: WorkspacePreferences) {
  document.documentElement.dataset.theme = preferences.themeId;
  document.documentElement.dataset.accent = preferences.accentId;
  document.documentElement.dataset.density = preferences.density;
  document.documentElement.dataset.motion = preferences.motion;
  document.documentElement.dataset.fontPair = preferences.fontPairId;
}

function urlBase64ToUint8Array(value: string) {
  const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(padded), (character) => character.charCodeAt(0));
}

export function SettingsClient({ initialPreferences, initialNotifications }: { initialPreferences: WorkspacePreferences; initialNotifications: NotificationState }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [preferenceMessage, setPreferenceMessage] = useState("");
  useEffect(() => {
    applyWorkspacePreferences(initialPreferences);
  }, [initialPreferences]);
  async function save(preferences: WorkspacePreferences) {
    applyWorkspacePreferences(preferences);
    window.localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
    setPreferenceMessage("");
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) { setPreferenceMessage("Appearance applied on this device. Sign in to sync it everywhere."); return; }
    const { data } = await setup.value.auth.getUser();
    if (!data.user) { setPreferenceMessage("Appearance applied on this device. Sign in to sync it everywhere."); return; }
    const { error } = await setup.value.from("workspace_preferences").upsert({ user_id: data.user.id, theme_id: preferences.themeId, font_pair_id: preferences.fontPairId, accent_id: preferences.accentId, motion_level: preferences.motion, density: preferences.density, home_layout_preset: preferences.layoutPreset, module_order: preferences.moduleOrder, hidden_modules: preferences.hiddenModules });
    setPreferenceMessage(error ? "Appearance is applied here, but could not sync yet. Try saving again." : "Preferences saved and synced to your workspace.");
  }
  async function clearCache() {
    window.localStorage.removeItem("gate-os-focus-session");
    window.localStorage.removeItem("gate-os-recovered-note");
    if ("caches" in window) for (const key of await caches.keys()) await caches.delete(key);
  }
  async function deleteAccount() {
    const response = await fetch("/api/account", { method: "DELETE" });
    if (response.ok) window.location.assign("/");
    else window.alert("Account deletion could not be completed. Please try again.");
  }
  async function saveNotifications() {
    setNotificationMessage("");
    let pushWarning = "";
    if (notifications.browserEnabled) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setNotifications((value) => ({ ...value, browserEnabled: false })); setNotificationMessage("Browser permission was not granted. In-app reminders remain available."); return; }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (publicKey && "serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
          await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) });
        } catch {
          pushWarning = "Push could not be enabled on this browser, but your other reminder settings were saved.";
        }
      } else if (!publicKey) {
        pushWarning = "Push is not configured for this deployment yet, but your other reminder settings were saved.";
      }
    }
    const response = await fetch("/api/notifications/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notifications) });
    setNotificationMessage(response.ok ? (pushWarning || "Reminder preferences saved.") : "Preferences could not be saved.");
  }
  return <><SettingsWorkspace initialPreferences={initialPreferences} saveMessage={preferenceMessage} onSavePreferences={save} onExport={() => window.open("/api/account/export", "_blank", "noopener,noreferrer")} onClearCache={clearCache} onDeleteAccount={deleteAccount} /><section className="workspace-page !pt-0"><div className="settings-section"><div className="settings-section-heading"><BellRing aria-hidden="true" /><div><h2>Helpful reminders</h2><p>Quiet by default. Hourly nudges only apply during an active focus window.</p></div></div><div className="grid gap-4"><label className="flex min-h-12 items-center justify-between gap-4 border-t border-[var(--line)] py-3"><span><strong className="block">Browser notifications</strong><small className="text-[var(--muted)]">Requires your explicit permission.</small></span><input type="checkbox" checked={notifications.browserEnabled} onChange={(event) => setNotifications((value) => ({ ...value, browserEnabled: event.target.checked }))} /></label><label className="flex min-h-12 items-center justify-between gap-4 border-t border-[var(--line)] py-3"><span><strong className="block">Focus-window nudges</strong><small className="text-[var(--muted)]">Never outside an active study window.</small></span><input type="checkbox" checked={notifications.focusNudgesEnabled} onChange={(event) => setNotifications((value) => ({ ...value, focusNudgesEnabled: event.target.checked }))} /></label><label className="flex min-h-12 items-center justify-between gap-4 border-t border-[var(--line)] py-3"><span><strong className="block">Weekly email summary</strong><small className="text-[var(--muted)]">Enabled after the sender domain is verified.</small></span><input type="checkbox" checked={notifications.emailSummaryEnabled} onChange={(event) => setNotifications((value) => ({ ...value, emailSummaryEnabled: event.target.checked }))} /></label><div className="settings-field-grid"><label>Quiet hours start<input className="text-field" type="time" value={notifications.quietHoursStart} onChange={(event) => setNotifications((value) => ({ ...value, quietHoursStart: event.target.value }))} /></label><label>Quiet hours end<input className="text-field" type="time" value={notifications.quietHoursEnd} onChange={(event) => setNotifications((value) => ({ ...value, quietHoursEnd: event.target.value }))} /></label></div><button className="workspace-secondary-button w-fit" type="button" onClick={saveNotifications}>Save reminders</button>{notificationMessage ? <p role="status" className="text-sm text-[var(--muted)]">{notificationMessage}</p> : null}</div></div></section></>;
}
