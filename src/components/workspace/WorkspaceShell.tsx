"use client";

import { Bell, Menu, PanelLeftClose, Search, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { WorkspaceNavigationItem, WorkspaceView } from "./types";

export interface WorkspaceShellProps {
  activeView: WorkspaceView;
  navigation: WorkspaceNavigationItem[];
  onNavigate: (view: WorkspaceView) => void;
  userName: string;
  userMeta?: string;
  children: ReactNode;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
}

export function WorkspaceShell({
  activeView,
  navigation,
  onNavigate,
  userName,
  userMeta,
  children,
  notificationCount = 0,
  onNotificationsClick,
  onSearchClick,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  const mobileNavigationId = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSidebarOpen(false);
      setIsRailExpanded(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeView]);

  const navigate = (view: WorkspaceView) => {
    onNavigate(view);
  };

  return (
    <div className="workspace-shell" data-active-view={activeView}>
      <a className="workspace-skip-link" href="#workspace-main">
        Skip to workspace content
      </a>
      <header className="workspace-topbar">
        <button
          className="workspace-menu-button"
          type="button"
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isSidebarOpen}
          aria-controls={mobileNavigationId}
          onClick={() => setIsSidebarOpen((open) => !open)}
        >
          {isSidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <div className="workspace-brand" aria-label="GATE OS workspace">
          <span className="workspace-brand-mark" aria-hidden="true">GO</span>
          <span>GATE OS</span>
        </div>
        <div className="workspace-topbar-actions">
          <button className="workspace-icon-button" type="button" onClick={onSearchClick} aria-label="Search workspace">
            <Search aria-hidden="true" />
          </button>
          <button className="workspace-icon-button workspace-notification-button" type="button" onClick={onNotificationsClick} aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}>
            <Bell aria-hidden="true" />
            {notificationCount > 0 ? <span className="workspace-notification-count" aria-hidden="true">{notificationCount}</span> : null}
          </button>
        </div>
      </header>

      <aside className={`workspace-sidebar${isSidebarOpen ? " is-open" : ""}`} aria-label="Workspace navigation" id={mobileNavigationId}>
        <div className="workspace-sidebar-header">
          <div className="workspace-brand">
            <span className="workspace-brand-mark" aria-hidden="true">GO</span>
            <span>GATE OS</span>
          </div>
          <button className="workspace-icon-button" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Collapse navigation">
            <PanelLeftClose aria-hidden="true" />
          </button>
        </div>
        <nav className="workspace-sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeView;
            return (
              <button
                className={`workspace-nav-item${isActive ? " is-active" : ""}`}
                type="button"
                key={item.id}
                aria-current={isActive ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge ? <span className="workspace-nav-badge">{item.badge}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="workspace-account-summary">
          <span className="workspace-avatar" aria-hidden="true">{userName.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{userName}</strong>
            {userMeta ? <span>{userMeta}</span> : null}
          </div>
        </div>
      </aside>
      {isSidebarOpen ? <button className="workspace-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} /> : null}

      <main className="workspace-main" id="workspace-main" tabIndex={-1}>
        {children}
      </main>

      <nav className={`workspace-mobile-rail${isRailExpanded ? " is-expanded" : ""}`} aria-label="Mobile workspace navigation">
        <div className="workspace-mobile-rail-scroll">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeView;
            return (
              <button
                className={`workspace-mobile-rail-item${isActive ? " is-active" : ""}`}
                type="button"
                key={item.id}
                aria-current={isActive ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <button className="workspace-mobile-rail-toggle" type="button" aria-label={isRailExpanded ? "Collapse navigation rail" : "Show all navigation"} aria-expanded={isRailExpanded} onClick={() => setIsRailExpanded((expanded) => !expanded)}>
          <Menu aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
