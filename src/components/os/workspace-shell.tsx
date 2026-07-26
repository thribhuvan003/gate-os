"use client";

import {
  BookOpenText,
  Brain,
  CircleDot,
  FileText,
  Focus,
  Home,
  NotebookPen,
  Settings,
  ShieldCheck,
  Target,
  Users,
  Send,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

const destinations = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/focus", label: "Focus", icon: Focus },
  { href: "/app/syllabus", label: "Syllabus", icon: BookOpenText },
  { href: "/app/vault", label: "Vault", icon: FileText },
  { href: "/app/notes", label: "Notes", icon: NotebookPen },
  { href: "/app/revision", label: "Revision", icon: Brain },
  { href: "/app/mistakes", label: "Mistakes", icon: CircleDot },
  { href: "/app/goals", label: "Goals", icon: Target },
  { href: "/app/circles", label: "Circles", icon: Users },
  { href: "/app/handoff", label: "Handoff", icon: Send },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;
const preferenceStorageKey = "gate-os-workspace-preferences";

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === href : pathname.startsWith(href);
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mobileRailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const activeItem = mobileRailRef.current?.querySelector<HTMLElement>("a[aria-current='page']");
    activeItem?.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(preferenceStorageKey);
      if (!saved) return;
      const preferences = JSON.parse(saved) as { themeId?: string; accentId?: string; density?: string; motion?: string; fontPairId?: string };
      if (preferences.themeId) document.documentElement.dataset.theme = preferences.themeId;
      if (preferences.accentId) document.documentElement.dataset.accent = preferences.accentId;
      if (preferences.density) document.documentElement.dataset.density = preferences.density;
      if (preferences.motion) document.documentElement.dataset.motion = preferences.motion;
      if (preferences.fontPairId) document.documentElement.dataset.fontPair = preferences.fontPairId;
    } catch {
      window.localStorage.removeItem(preferenceStorageKey);
    }
  }, []);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] p-5 backdrop-blur-xl md:flex md:flex-col">
        <Link href="/app" className="flex items-center gap-3 rounded-2xl p-2 focus-visible:outline focus-visible:outline-2">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--ink)] font-bold text-[var(--background)]">G</span>
          <span>
            <strong className="block tracking-[-0.02em]">GATE OS</strong>
            <small className="text-[var(--muted)]">CS/IT · 2027</small>
          </span>
        </Link>
        <nav className="mt-8 grid gap-1" aria-label="Workspace">
          {destinations.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                style={active ? { color: "var(--paper)" } : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  active ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="mono-label flex items-center gap-2">
            <ShieldCheck aria-hidden="true" size={14} strokeWidth={2} className="text-[var(--accent)]" />
            Private by default
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Only you can see your notes, files and progress.</p>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="pointer-events-auto border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-7 bg-gradient-to-r from-[var(--background)] to-transparent" aria-hidden="true" />
            <nav
              ref={mobileRailRef}
              className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto px-[calc(50vw-2.65rem)] py-2.5"
              aria-label="Workspace"
            >
              {destinations.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    style={active ? { color: "var(--paper)" } : undefined}
                    className={`flex min-w-[5.3rem] snap-center flex-col items-center justify-center gap-1 rounded-2xl px-2.5 py-2 text-[length:var(--text-2xs)] font-semibold transition ${
                      active ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <span className="pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-gradient-to-l from-[var(--background)] to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
