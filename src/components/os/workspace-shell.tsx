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
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === href : pathname.startsWith(href);
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
          <p className="mono-label">Private by default</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Only you can see your notes, files and progress.</p>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="pointer-events-auto border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl">
          <nav
            className="scrollbar-none flex snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50vw-2.65rem)] py-2"
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
                  className={`flex min-w-[5.3rem] snap-center flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-semibold transition ${
                    active ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--muted)]"
                  }`}
                >
                  <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
