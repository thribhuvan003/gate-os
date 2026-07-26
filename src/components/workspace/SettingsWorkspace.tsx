"use client";

import { BellRing, Check, Download, Eye, Gauge, ShieldCheck, Trash2, Type } from "lucide-react";
import { useState } from "react";

export type ThemeId = "editorial-calm" | "focus-tech" | "soft-personal" | "midnight-paper";
export type MotionLevel = "full" | "subtle" | "reduced";
export type Density = "comfortable" | "compact";
export type HomeLayoutPreset = "focus" | "balanced" | "revision";

export interface WorkspacePreferences {
  themeId: ThemeId;
  fontPairId: string;
  accentId: string;
  motion: MotionLevel;
  density: Density;
  layoutPreset: HomeLayoutPreset;
  moduleOrder: string[];
  hiddenModules: string[];
}

export interface SettingsWorkspaceProps {
  initialPreferences: WorkspacePreferences;
  saveMessage?: string;
  onSavePreferences?: (preferences: WorkspacePreferences) => void;
  /** Called on every appearance change for an instant live preview (no network). */
  onPreferenceChange?: (preferences: WorkspacePreferences) => void;
  onExport?: () => void;
  onClearCache?: () => void;
  onDeleteAccount?: () => void;
}

const themes: Array<{ id: ThemeId; label: string; detail: string }> = [
  { id: "editorial-calm", label: "Editorial Calm", detail: "Quiet paper, thoughtful ink." },
  { id: "focus-tech", label: "Focus Tech", detail: "Crisp contrast for deep work." },
  { id: "soft-personal", label: "Soft Personal", detail: "Warm and gently expressive." },
  { id: "midnight-paper", label: "Midnight Paper", detail: "Dark without glare." },
];

export function SettingsWorkspace({ initialPreferences, saveMessage, onSavePreferences, onPreferenceChange, onExport, onClearCache, onDeleteAccount }: SettingsWorkspaceProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Apply appearance the instant it changes (live preview), then let the
  // explicit Save sync it across devices.
  const setPreference = <Key extends keyof WorkspacePreferences>(key: Key, value: WorkspacePreferences[Key]) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    onPreferenceChange?.(next);
  };
  return <section className="workspace-page settings-workspace" aria-labelledby="settings-title"><header className="workspace-page-header"><div><p className="workspace-eyebrow"><Gauge aria-hidden="true" /> Settings</p><h1 id="settings-title">Make the workspace feel like your own.</h1><p>These controls stay curated so your setup remains useful on every screen.</p>{saveMessage ? <p role="status" className="workspace-field-help">{saveMessage}</p> : null}</div><button className="workspace-primary-button" type="button" onClick={() => onSavePreferences?.(preferences)}>Save preferences</button></header><div className="settings-section"><div className="settings-section-heading"><Eye aria-hidden="true" /><div><h2>Appearance</h2><p>Choose a clear visual rhythm for your own study space.</p></div></div><fieldset><legend>Theme</legend><div className="settings-option-grid">{themes.map((theme) => <label className={`settings-theme-option relative items-center transition-colors duration-150 hover:border-[var(--accent)]${preferences.themeId === theme.id ? " is-selected" : ""}`} key={theme.id}><input type="radio" name="theme" className="h-4 w-4 shrink-0 accent-[var(--accent)]" checked={preferences.themeId === theme.id} onChange={() => setPreference("themeId", theme.id)} /><span className="min-w-0"><strong>{theme.label}</strong><small>{theme.detail}</small></span>{preferences.themeId === theme.id ? <Check aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 text-[var(--accent)]" /> : null}</label>)}</div></fieldset><div className="settings-field-grid"><label><span className="flex items-center gap-2"><Type aria-hidden="true" className="h-4 w-4 text-[var(--muted)]" /> Font pairing</span><select value={preferences.fontPairId} onChange={(event) => setPreference("fontPairId", event.target.value)}><option value="editorial">Editorial Serif + Sans</option><option value="modern">Modern Sans + Mono</option><option value="humanist">Humanist Sans + Serif</option></select></label><label>Accent<select value={preferences.accentId} onChange={(event) => setPreference("accentId", event.target.value)}><option value="indigo">Indigo</option><option value="terracotta">Terracotta</option><option value="forest">Forest</option><option value="plum">Plum</option></select></label><label>Density<select value={preferences.density} onChange={(event) => setPreference("density", event.target.value as Density)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label><label>Home layout<select value={preferences.layoutPreset} onChange={(event) => setPreference("layoutPreset", event.target.value as HomeLayoutPreset)}><option value="focus">Focus</option><option value="balanced">Balanced</option><option value="revision">Revision</option></select></label></div><fieldset><legend>Motion</legend><div className="workspace-choice-row">{(["full", "subtle", "reduced"] as const).map((motion) => <button className={`workspace-choice-button${preferences.motion === motion ? " is-selected" : ""}`} key={motion} type="button" aria-pressed={preferences.motion === motion} onClick={() => setPreference("motion", motion)}>{motion[0].toUpperCase() + motion.slice(1)}</button>)}</div><p className="workspace-field-help">Reduced motion should also respect the device preference.</p></fieldset></div><div className="settings-section"><div className="settings-section-heading"><BellRing aria-hidden="true" /><div><h2>Notifications & cache</h2><p>Reminders should support the work, never interrupt it.</p></div></div><div className="workspace-row-actions"><button className="workspace-secondary-button" type="button" onClick={onClearCache}>Clear offline cache</button><button className="workspace-secondary-button" type="button" onClick={onExport}><Download aria-hidden="true" /> Export my data</button></div></div><div className="settings-section settings-danger-zone"><div className="settings-section-heading"><ShieldCheck aria-hidden="true" /><div><h2>Privacy</h2><p>Your personal work belongs to you.</p></div></div>{confirmingDelete ? <div className="workspace-confirmation grid gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4"><p>Deleting your account removes your private workspace and cannot be undone.</p><div className="workspace-row-actions"><button className="workspace-danger-button" type="button" onClick={onDeleteAccount}><Trash2 aria-hidden="true" /> Permanently delete account</button><button className="workspace-secondary-button" type="button" onClick={() => setConfirmingDelete(false)}>Cancel</button></div></div> : <button className="workspace-danger-button" type="button" onClick={() => setConfirmingDelete(true)}><Trash2 aria-hidden="true" /> Delete account</button>}</div></section>;
}
